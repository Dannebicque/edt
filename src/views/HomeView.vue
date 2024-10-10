<template>
  <div class="row">
    <div class="col-12">
      <h1>Emploi du temps semaine xxx</h1>
    </div>
    <div class="col-6">
      <button @click="assignRoomsAutomatically">Assign Rooms Automatically</button>
    </div>
    <div class="col-6">
      <label>
        <input type="radio" value="course" v-model="selectedHighlightType" />
        Par matière
      </label>
      <label>
        <input type="radio" value="professor" v-model="selectedHighlightType" />
        Par professeur
      </label>
    </div>
    <div class="col-3 d-grid">
      <button class="btn btn-primary d-block" @click="loadPreviousWeek">Semaine précédente</button>
    </div>
    <div class="col-3 d-grid">
      <select class="form-select d-block" v-model="currentWeek" @change="loadWeek">
        <option v-for="n in 42" :key="n" :value="n">Semaine {{ n }}</option>
      </select>
    </div>
    <div class="col-3 d-grid" @click="loadNextWeek">
      <button class="btn btn-primary d-block">Semaine suivante</button>
    </div>
    <div class="col-3">Liste des Cours</div>

    <div class="col-9">
      <div class="grid-container" v-for="day in days" :key="day.day">
        <div class="grid-day">{{ day.day }} {{ day.dateFr }}</div>
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
              @mouseover="highlightSameCourses(day.day, time, semestre, groupNumber)"
              @mouseout="clearSameCoursesHighlight(day.day, time, semestre, groupNumber)"
              @dragover.prevent
              :data-key="day.day + '_' + time + '_' + semestre + '_' + groupNumber"
            >
              <span v-if="placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`]">

                <span v-html="displayCourse(placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`])"></span>
                <button
                  v-if="
                    placedCourses[`${day.day}_${time}_${semestre}_${groupNumber}`].blocked === false
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
            <option :value="professor.initiales" v-for="professor in professorsStore.professors" :key="professor.initiales">{{ professor.initiales }}</option>
          </select>
        </div>
        <div class="col-6">
          <select v-model="selectedCourse">
            <option value="">Cours</option>
            <option :value="matiere.code" v-for="matiere in matieresStore.matieres" :key="matiere.code">{{ matiere.code }}</option>
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
<!--      <div class="list-group">-->
<!--        <div-->
<!--          v-for="course in filteredCourses"-->
<!--          :key="course.id"-->
<!--          class="list-group-item"-->
<!--          draggable="true"-->
<!--          @dragstart="onDragStart($event, course)"-->
<!--          :style="{ backgroundColor: course.color, cursor: 'move' }"-->

<!--        >-->
<!--          <span v-html="displayCourseListe(course)" class="course-available"></span>-->
<!--        </div>-->
<!--      </div>-->
      <div class="list-group grid-container-available">
        <div
          v-for="course in filteredCourses"
          :key="course.id"
          class="list-group-item grid-item-available"
          :style="{ gridColumn: `span ${course.groupCount}`, backgroundColor: course.color, cursor: 'move' }"
          draggable="true"
          @dragstart="onDragStart($event, course)"
        >
          <span v-html="displayCourseListe(course)" class="course-available"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'

const baseUrl = import.meta.env.VITE_BASE_URL

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
const selectedHighlightType = ref('course') // 'course' or 'professor'
import { useProfessorsStore } from '@/stores/professors'
import { useMatieresStore } from '@/stores/matieres'

const professorsStore = useProfessorsStore()
const matieresStore = useMatieresStore()

onMounted(async () => {
  try {
    //charge le calendrier de la semaine
    _getSemaines(currentWeek.value)

    //charge les cours disponibles
    availableCourses.value = await fetch('/data/courses.json').then((res) => res.json())

    professorsStore.fetchProfessors()
    matieresStore.fetchMatieres()
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

const displayCourse = (course) => {
  if (course.blocked === true) {
    return course.name
  }
  return `${course.name} <br> ${course.professor} <br> ${course.room}`
}

const displayCourseListe = (course) => {
  let groupe = ''
  if (course.groupCount === 1) {
    groupe = 'TP ' + String.fromCharCode(64 + course.groupIndex)
  } else if (course.groupCount === 2) {
    groupe = 'TD ' + String.fromCharCode(64 + course.groupIndex) + String.fromCharCode(65 + course.groupIndex)
  } else {
    groupe = 'CM'
  }

  return `${course.name} <br> ${course.professor} <br> ${course.group} <br> ${groupe}`
}

const resetFilters = () => {
  selectedSemester.value = ''
  selectedProfessor.value = ''
  selectedCourse.value = ''
  selectedGroup.value = ''
}

const _getSemaines = async(numSemaine) => {
  const data = await fetch(baseUrl + '/get-semaine/' + numSemaine).then((res) => res.json())
  restrictedSlots.value = data.restrictedSlots
  days.value = data.days
  placedCourses.value = {}
  applyRestrictions()
}

const loadWeek = async () => {
  try {
    _getSemaines(currentWeek.value)
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
        cell.style.width = `${50 * groupSpan}px`
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
      course.blocked = false
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
    currentCell.classList.remove('highlight-same-course')

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
    const { type, slot: timeSlot, semester, days, groups, period, motif } = slot

    days.forEach((day) => {

      if (type === 'generic') {
        // dans ce cas tous les semestres, tous les groupes
        Object.keys(groupData.value).forEach((semester) => {
          groupData.value[semester].forEach((groupNumber) => {
            blockSlot(day, timeSlot, semester, groupNumber, motif)
          })
        })
      } else if (type === 'semester') {
        // dans ce cas tous les groupes d'un semestre
        groupData.value[semester].forEach((groupNumber) => {
          blockSlot(day, timeSlot, semester, groupNumber, motif)
        })
      } else if (type === 'group') {
        groups.forEach((groupNumber) => {
          blockSlot(day, timeSlot, semester, groupNumber, motif)
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
            blockSlot(day, time, semester, groupNumber, motif)
          })
        })
      }
    })
  })
}

const blockSlot = (day, time, semester, groupNumber, motif = null) => {
  const cellKey = `${day}_${time}_${semester}_${groupNumber}`
  placedCourses.value[cellKey] = { name: motif ?? 'blocked', color: '#ffcccc', blocked: true }
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

const highlightSameCourses = (day, time, semestre, groupNumber) => {
  const courseKey = `${day}_${time}_${semestre}_${groupNumber}`
  const course = placedCourses.value[courseKey]

  if (course) {
    const highlightValue = selectedHighlightType.value === 'course' ? course.name : course.professor
    Object.keys(placedCourses.value).forEach((key) => {
      if (
        (selectedHighlightType.value === 'course' && placedCourses.value[key].name === highlightValue) ||
        (selectedHighlightType.value === 'professor' && placedCourses.value[key].professor === highlightValue)
      ) {
        const cell = document.querySelector(`[data-key="${key}"]`)
        if (cell) {
          cell.classList.add('highlight-same-course')
        }
      }
    })
  }
}

const clearSameCoursesHighlight = (day, time, semestre, groupNumber) => {
  const courseKey = `${day}_${time}_${semestre}_${groupNumber}`
  const course = placedCourses.value[courseKey]

  if (course) {
    const highlightValue = selectedHighlightType.value === 'course' ? course.name : course.professor
    Object.keys(placedCourses.value).forEach((key) => {
      if (
        (selectedHighlightType.value === 'course' && placedCourses.value[key].name === highlightValue) ||
        (selectedHighlightType.value === 'professor' && placedCourses.value[key].professor === highlightValue)
      ) {
        const cell = document.querySelector(`[data-key="${key}"]`)
        if (cell) {
          cell.classList.remove('highlight-same-course')
        }
      }
    })
  }
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
  text-align: center;
  font-size: 9px;
  width: 50px;
  padding: 2px;
  border: 1px solid #000;
  background-color: #fff;
  grid-column: span 1;
}

.grid-cell.highlight {
  background-color: #d1e7dd;
}

.grid-cell.highlight-same-course {
  background-color: #ffeb3b !important; /* Highlight color */
}

.course-available {
  display: block;
  padding: 8px;
}

.grid-container-available {
  display: grid;
  grid-template-columns: repeat(8, 1fr); /* Ajustez le nombre de colonnes selon vos besoins */
  gap: 3px;
}

.grid-item-available {
  padding: 2px;
  font-size: 9px;
  border: 1px solid #000;
  background-color: #fff;
  text-align: center;
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
