<template>
  <div class="row">
    <div class="col-12">
      <h1>Emploi du temps semaine xxx</h1>
    </div>
    <div class="col-3 d-grid">
      <button class="btn btn-primary d-block">Semaine précédente</button>
    </div>
    <div class="col-3 d-grid">
      <select class="form-select d-block">
        <option value="1">Semaine 1</option>
        <option value="2">Semaine 2</option>
        <option value="3">Semaine 3</option>
        <option value="4">Semaine 4</option>
      </select>
    </div>
    <div class="col-3 d-grid">
      <button class="btn btn-primary d-block">Semaine suivante</button>
    </div>
    <div class="col-3">Liste des Cours</div>

    <div class="col-9">
      <div class="grid-container" v-for="day in days" :key="day">
        <div class="grid-day">{{ day }}</div>
        <!-- Header Row: Semesters -->
        <div class="grid-header grid-time">Heure</div>
        <div
          v-for="(groups, semestre) in groupData"
          :key="semestre"
          class="grid-header"
          :style="{ gridColumn: `span ${groups.length}` }"
        >
          {{ semestre }}
        </div>

        <!-- Second Row: Group Headers -->
        <div class="grid-time"></div>
        <template v-for="(groups, semestre) in groupData" :key="'group-' + semestre">
          <div v-for="groupNumber in groups" :key="semestre + groupNumber" class="grid-header">
            {{ String.fromCharCode(64 + groupNumber) }}
          </div>
        </template>

        <!-- Time Slots and Group Cells -->
        <template v-for="time in timeSlots" :key="time">
          <div class="grid-time">{{ time }}</div>
          <template v-for="(groups, semestre) in groupData" :key="'time-' + semestre">
            <div
              v-for="groupNumber in groups"
              :key="time + semestre + groupNumber"
              class="grid-cell"
              :style="{backgroundColor:placedCourses[`${time}_${semestre}_${groupNumber}`] ? placedCourses[`${time}_${semestre}_${groupNumber}`].color : ''}"
              @drop="onDrop($event, time, semestre, groupNumber)"
              @dragover.prevent
              :data-key="time + semestre + groupNumber"
            >
              <span v-if="placedCourses[`${time}_${semestre}_${groupNumber}`]">
                {{ placedCourses[`${time}_${semestre}_${groupNumber}`].name }} ||
                {{ placedCourses[`${time}_${semestre}_${groupNumber}`].professor }}---
                <button
                  class="remove-btn"
                  @click="
                    removeCourse(
                      time,
                      semestre,
                      groupNumber,
                      placedCourses[`${time}_${semestre}_${groupNumber}`].groupCount
                    )
                  "
                >
                  x
                </button>
              </span>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div class="col-3">
      <div class="row">
        <div class="col-6">
          <select>
            <option value="1">Semestre 1</option>
            <option value="3">Semestre 3</option>
            <option value="5">Semestre 5</option>
          </select>
        </div>
        <div class="col-6">
          <select>
            <option value="DAN">DAN</option>
            <option value="DAN">DAN</option>
            <option value="DAN">DAN</option>
            <option value="DAN">DAN</option>
            <option value="DAN">DAN</option>
          </select>
        </div>
        <div class="col-6">
          <select>
            <option value="WR101">WR101</option>
            <option value="WR101">WR101</option>
            <option value="WR101">WR101</option>
            <option value="WR101">WR101</option>
          </select>
        </div>
        <div class="col-6">
          <select multiple>
            <option value="1">Groupe 1 / S1</option>
            <option value="2">Groupe 2 / S1</option>
            <option value="3">Groupe 3 / S1</option>
            <option value="4">Groupe 4 / S1</option>
            <option value="5">Groupe 5 / S1</option>
            <option value="6">Groupe 6 / S1</option>
            <option value="7">Groupe 7 / S1</option>
            <option value="8">Groupe 8 / S1</option>
            <option value="9">Groupe 1 / S3</option>
            <option value="10">Groupe 2 / S3</option>
            <option value="11">Groupe 3 / S3</option>
            <option value="12">Groupe 4 / S3</option>
            <option value="13">Groupe 5 / S3</option>
            <option value="14">Groupe 6 / S3</option>
            <option value="15">Groupe 7 / S3</option>
            <option value="16">Groupe 8 / S3</option>
            <option value="17">Groupe 1 / S5</option>
            <option value="18">Groupe 2 / S5</option>
            <option value="19">Groupe 3 / S5</option>
            <option value="20">Groupe 4 / S5</option>
            <option value="21">Groupe 5 / S5</option>
            <option value="22">Groupe 6 / S5</option>
            <option value="23">Groupe 7 / S5</option>
            <option value="24">Groupe 8 / S5</option>
          </select>
        </div>
        <div class="col-6">
          <button>Appliquer</button>
        </div>
        <div class="col-6">
          <button>Reset</button>
        </div>
      </div>
      <div class="list-group">
        <div
          v-for="course in availableCourses"
          :key="course.id"
          class="list-group-item"
          draggable="true"
          @dragstart="onDragStart($event, course)"
          :style="{ backgroundColor: course.color, cursor: 'move' }"
        >
          {{ course.name }} || {{ course.professor }} || {{ course.group }} || Groupe
          {{ course.groupIndex }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const groupData = ref({
  s1: [1, 2, 3, 4, 5, 6, 7, 8],
  s3: [1, 2, 3, 4, 5, 6, 7, 8],
  s5: [1, 2, 3, 4, 5, 6, 7, 8]
})

const timeSlots = ref(['8h00', '9h30', '11h00', '14h00', '15h30', '17h00'])
const days = ref(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'])

const availableCourses = ref([
  {
    id: 1,
    name: 'Mathématiques',
    professor: 'M. Dupont',
    group: 's1',
    groupIndex: 1,
    groupCount: 1,
    color: '#cce5ff'
  },
  {
    id: 2,
    name: 'Histoire',
    professor: 'Mme Durand',
    group: 's3',
    groupIndex: 3,
    groupCount: 2,
    color: '#d4edda'
  },
  {
    id: 3,
    name: 'Anglais',
    professor: 'M. Smith',
    group: 's5',
    groupIndex: 1,
    groupCount: 8,
    color: '#f8d7da'
  },
  {
    id: 4,
    name: 'Sciences',
    professor: 'Mme Leroy',
    group: 's1',
    groupIndex: 5,
    groupCount: 2,
    color: '#ffcccc'
  },
  {
    id: 5,
    name: 'Philosophie',
    professor: 'M. Rousseau',
    group: 's3',
    groupIndex: 1,
    groupCount: 4,
    color: '#ccffcc'
  }
])

const placedCourses = ref({})

const onDragStart = (event, course) => {
  event.dataTransfer.setData('courseId', course.id)
}

const onDrop = (event, time, semestre, groupNumber) => {
  const courseId = event.dataTransfer.getData('courseId')
  const courseIndex = availableCourses.value.findIndex((c) => c.id == courseId)
  const course = availableCourses.value[courseIndex]

  if (course && course.group === semestre && course.groupIndex === groupNumber) {
    const startGroup = groupNumber
    const groupSpan = course.groupCount

    if (groupNumber <= groupData.value[semestre].length - groupSpan + 1) {
      // Place the course in all necessary cells
      const cellSelector = `[data-key="${time + semestre + groupNumber}"]`
      const cell = document.querySelector(cellSelector)
      if (cell) {
        cell.style.gridColumn = `span ${groupSpan}`
        //cell.innerHTML = `${course.name} || ${course.professor}`
        // Remove the extra cells that are merged
        for (let i = 1; i < groupSpan; i++) {
          const extraCellSelector = `[data-key="${time + semestre + (groupNumber + i)}"]`
          const extraCell = document.querySelector(extraCellSelector)
          if (extraCell) {
            extraCell.remove()
          }
        }
      }
      placedCourses.value[`${time}_${semestre}_${groupNumber}`] = course
      availableCourses.value.splice(courseIndex, 1)
    }
  }
}

const removeCourse = (time, semestre, groupNumber, groupSpan) => {
  const courseKey = `${time}_${semestre}_${groupNumber}`
  const course = placedCourses.value[courseKey]

  if (course) {
    availableCourses.value.push(course)
    // Remove the course from all associated cells and add empty cells back
    for (let i = 0; i < groupSpan; i++) {
      delete placedCourses.value[`${time}_${semestre}_${groupNumber + i}`]
    }
  }
}
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 100px repeat(24, 1fr);
  gap: 1px;
  width: 100%;
  border: 1px solid #000;
}

.grid-day {
  grid-column: span 25;
  background-color: #e19797;
  text-align: center;
  font-weight: bold;
}

.grid-header {
  background-color: #f2f2f2;
  text-align: center;
  padding: 8px;
  font-weight: bold;
  border: 1px solid #000;
  grid-column: span 1;
}

.grid-time {
  text-align: center;
  padding: 8px;
  background-color: #f9f9f9;
  border: 1px solid #000;
  grid-column: span 1;
}

.grid-cell {
  padding: 8px;
  border: 1px solid #000;
  background-color: #fff;
  grid-column: span 1;
}

.remove-btn {
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 16px;
  margin-left: 8px;
}
</style>
