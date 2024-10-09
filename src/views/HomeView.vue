<template>
  <div class="row">
    <div class="col-12">
      <h1>Emploi du temps semaine xxx</h1>
      <button @click="assignRoomsAutomatically">Assign Rooms Automatically</button>
    </div>
    <div class="col-3 d-grid">
      <button class="btn btn-primary d-block" @click="loadPreviousWeek">Semaine précédente</button>
    </div>
    <div class="col-3 d-grid">
      <select class="form-select d-block" v-model="currentWeek" @change="loadWeek">
        <option value="1">Semaine 1</option>
        <option value="2">Semaine 2</option>
        <option value="3">Semaine 3</option>
        <option value="4">Semaine 4</option>
      </select>
    </div>
    <div class="col-3 d-grid" @click="loadNextWeek">
      <button class="btn btn-primary d-block">Semaine suivante</button>
    </div>
    <div class="col-3">Liste des Cours</div>

    <div class="col-9">
      <div class="grid-container" v-for="day in days" :key="day.day">
        <div class="grid-day">{{ day.day }} {{ day.date }}</div>
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
              :style="{
                backgroundColor: placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`]
                  ? placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`].color
                  : ''
              }"
              @drop="onDrop($event, day.day, time, semestre, groupNumber)"
              @dragover.prevent
              :data-key="day.day + '_' + time + '_' + semestre + '_' + groupNumber"
            >
              <span v-if="placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`]">
                {{ placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`].name }} ||
                {{ placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`].professor }} ||
                {{ placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`].room }}

                <button
                  v-if="
                    placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`].name !==
                    'Blocked'
                  "
                  class="remove-btn"
                  @click="
                    removeCourse(
                      day.day,
                      time,
                      semestre,
                      groupNumber,
                      placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`].groupCount
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
          <select v-model="selectedSemester">
            <option value="">Semestre</option>
            <option value="s1">Semestre 1</option>
            <option value="s3">Semestre 3</option>
            <option value="s5">Semestre 5</option>
          </select>
        </div>
        <div class="col-6">
          <select v-model="selectedProfessor">
            <option value="">Professeur</option>
            <option value="M. Dupont">M. Dupont</option>
            <option value="Mme Durand">Mme Durand</option>
            <option value="M. Smith">M. Smith</option>
            <option value="Mme Leroy">Mme Leroy</option>
            <option value="M. Rousseau">M. Rousseau</option>
          </select>
        </div>
        <div class="col-6">
          <select v-model="selectedCourse">
            <option value="">Cours</option>
            <option value="Mathématiques">Mathématiques</option>
            <option value="Histoire">Histoire</option>
            <option value="Anglais">Anglais</option>
            <option value="Sciences">Sciences</option>
            <option value="Philosophie">Philosophie</option>
          </select>
        </div>
        <div class="col-6">
          <select v-model="selectedGroup">
            <option value="">Groupe</option>
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
        <div class="col-6"></div>
        <div class="col-6">
          <button @click="resetFilters">Reset</button>
        </div>
      </div>
      <div class="list-group">
        <div
          v-for="course in filteredCourses"
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
import { onMounted, ref, computed } from 'vue'

const groupData = ref({
  s1: [1, 2, 3, 4, 5, 6, 7, 8],
  s3: [1, 2, 3, 4, 5, 6, 7, 8],
  s5: [1, 2, 3, 4, 5, 6, 7, 8]
})

const timeSlots = ref(['8h00', '9h30', '11h00', '14h00', '15h30', '17h00'])
const days = ref()

const selectedSemester = ref('')
const selectedProfessor = ref('')
const selectedCourse = ref('')
const selectedGroup = ref('')
const availableCourses = ref([])
const restrictedSlots = ref([])
const currentWeek = ref(1)

onMounted(async () => {
  try {
    //charge le calendrier de la semaine
    const data = await fetch('/data/semaine_' + currentWeek.value + '.json').then((res) =>
      res.json()
    )
    restrictedSlots.value = data.restrictedSlots
    days.value = data.days
    applyRestrictions()

    //charge les cours disponibles
    availableCourses.value = await fetch('/data/courses.json').then((res) => res.json())
  } catch (error) {
    console.error('Error loading JSON:', error)
  }
})

const placedCourses = ref({})

const filteredCourses = computed(() => {
  return availableCourses.value.filter((course) => {
    return (
      (selectedSemester.value === '' || course.group === selectedSemester.value) &&
      (selectedProfessor.value === '' || course.professor === selectedProfessor.value) &&
      (selectedCourse.value === '' || course.name === selectedCourse.value) &&
      (selectedGroup.value === '' || course.groupIndex === parseInt(selectedGroup.value))
    )
  })
})

const resetFilters = () => {
  selectedSemester.value = ''
  selectedProfessor.value = ''
  selectedCourse.value = ''
  selectedGroup.value = ''
}

const loadWeek = async () => {
  try {
    const data = await fetch(`/data/semaine_${currentWeek.value}.json`).then((res) => res.json())
    restrictedSlots.value = data.restrictedSlots
    days.value = data.days
    placedCourses.value = {}
    applyRestrictions()
  } catch (error) {
    console.error('Error loading JSON:', error)
  }
}

const loadPreviousWeek = () => {
  if (currentWeek.value > 1) {
    currentWeek.value -= 1
    loadWeek()
  }
}

const loadNextWeek = () => {
  currentWeek.value += 1
  loadWeek()
}

const onDragStart = (event, course) => {
  event.dataTransfer.setData('courseId', course.id)
  highlightValidCells(course)
  event.target.addEventListener('dragend', clearHighlight, { once: true })
}

const onDrop = (event, day, time, semestre, groupNumber) => {
  const courseId = event.dataTransfer.getData('courseId')
  const courseIndex = availableCourses.value.findIndex((c) => c.id == courseId)
  const course = availableCourses.value[courseIndex]

  if (course && course.group === semestre && course.groupIndex === groupNumber) {
    const groupSpan = course.groupCount

    if (groupNumber <= groupData.value[semestre].length - groupSpan + 1) {
      // Place the course in all necessary cells
      const cellSelector = `[data-key="${day}_${time}_${semestre}_${groupNumber}"]`
      const cell = document.querySelector(cellSelector)
      if (cell) {
        cell.style.gridColumn = `span ${groupSpan}`
        // Remove the extra cells that are merged
        for (let i = 1; i < groupSpan; i++) {
          const extraCellSelector = `[data-key="${day}_${time}_${semestre}_${groupNumber + i}"]`
          const extraCell = document.querySelector(extraCellSelector)
          if (extraCell) {
            extraCell.remove()
          }
        }
      }
      course.time = time
      course.day = day
      placedCourses.value[`${day}_${time}_${semestre}_${groupNumber}`] = course
      availableCourses.value.splice(courseIndex, 1)
    }
  }
  // clearHighlight()
}

const removeCourse = (day, time, semestre, groupNumber, groupSpan) => {
  const courseKey = `${day}_${time}_${semestre}_${groupNumber}`
  const course = placedCourses.value[courseKey]
  const currentCell = document.querySelector(`[data-key="${courseKey}"]`)

  if (course) {
    course.time = null
    course.day = null
    availableCourses.value.push(course)
    currentCell.style = ''

    // Remove the course from all associated cells and add empty cells back
    for (let i = 0; i < groupSpan; i++) {
      delete placedCourses.value[`${day}_${time}_${semestre}_${groupNumber + i}`]
    }
    // Recreate the missing cells
    for (let i = 1; i < groupSpan; i++) {
      const cellKey = `${day}_${time}_${semestre}_${groupNumber + i}`
      const cell = currentCell.cloneNode(false)
      cell.setAttribute('data-key', cellKey)
      const parent = currentCell.parentNode
      parent.insertBefore(cell, currentCell.nextSibling)
    }
  }
}

const applyRestrictions = () => {
  restrictedSlots.value.forEach((slot) => {
    const { type, slot: timeSlot, semester, days, groups, period } = slot

    days.forEach((day) => {
      if (type === 'generic') {
        // dans ce cas tous les semestres, tous les groupes
        Object.keys(groupData.value).forEach((semester) => {
          groupData.value[semester].forEach((groupNumber) => {
            blockSlot(day, timeSlot, semester, groupNumber)
          })
        })
      } else if (type === 'semester') {
        // dans ce cas tous les groupes d'un semestre
        groupData.value[semester].forEach((groupNumber) => {
          blockSlot(day, timeSlot, semester, groupNumber)
        })
      } else if (type === 'group') {
        groups.forEach((groupNumber) => {
          blockSlot(day, timeSlot, semester, groupNumber)
        })
      } else if (type === 'half-day' || type === 'full-day') {
        const times =
          type === 'half-day'
            ? period === 'morning'
              ? ['8h00', '9h30', '11h00']
              : ['14h00', '15h30', '17h00']
            : ['8h00', '9h30', '11h00', '14h00', '15h30', '17h00']
        times.forEach((time) => {
          groupData.value[semester].forEach((groupNumber) => {
            blockSlot(day, time, semester, groupNumber)
          })
        })
      }
    })
  })
}

const blockSlot = (day, time, semester, groupNumber) => {
  const cellKey = `${day}_${time}_${semester}_${groupNumber}`
  placedCourses.value[cellKey] = { name: 'Blocked', color: '#ffcccc' }
}

const isProfessorAvailable = (professor, day, time) => {
  return !Object.values(placedCourses.value).some(
    (course) => course.professor === professor && course.time === time && course.day === day
  )
}
const highlightValidCells = (course) => {
  const { group, groupIndex, groupCount, professor } = course
  days.value.forEach((day) => {
    timeSlots.value.forEach((time) => {
      if (isProfessorAvailable(professor, day.day, time)) {
        for (let i = 0; i < groupCount; i++) {
          const cellKey = `${day.day}_${time}_${group}_${groupIndex + i}`
          const cell = document.querySelector(`[data-key="${cellKey}"]`)
          if (cell && !placedCourses.value[cellKey]) {
            cell.classList.add('highlight')
          }
        }
      }
    })
  })
}

const clearHighlight = () => {
  const highlightedCells = document.querySelectorAll('.highlight')
  highlightedCells.forEach((cell) => {
    cell.classList.remove('highlight')
  })
}

const assignRoomsAutomatically = () => {
  const rooms = ['Room A', 'Room B', 'Room C', 'Room D'] // Example room list
  const assignedRooms = {} // Map to track assigned rooms for each time slot

  Object.keys(placedCourses.value).forEach((key) => {
    const course = placedCourses.value[key]
    if (course && !course.room) {
      const timeSlot = `${course.day}_${course.time}`
      if (!assignedRooms[timeSlot]) {
        assignedRooms[timeSlot] = new Set()
      }

      // Find an available room
      let roomAssigned = false
      for (let room of rooms) {
        if (!assignedRooms[timeSlot].has(room)) {
          course.room = room
          assignedRooms[timeSlot].add(room)
          roomAssigned = true
          break
        }
      }

      // If no room is available, you can handle it as needed (e.g., log an error)
      if (!roomAssigned) {
        console.error(`No available room for course ${course.name} at ${timeSlot}`)
      }
    }
  })
}
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 100px repeat(24, 1fr);
  gap: 0;
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

.grid-cell.highlight {
  background-color: #d1e7dd;
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
