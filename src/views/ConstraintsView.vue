<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useProfessorsStore } from '@/stores/professors'
import axios from 'axios'

const selectedProfessor = ref('')
const selectedWeek = ref('')
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const timeSlots = ref(['8h00', '9h30', '11h00', '12h30', '14h00', '15h30', '17h00'])
const constraints = ref({})
const weeks = ref([]) // This will hold the available weeks
const showConfigPanel = ref(false)
const selectedCell = ref('') // Track the selected cell
const configDetails = ref({
  day: '',
  time: '',
  week: '',
  weeks: [],
  type: 'mandatory',
  duration: 'slot'
})

const professorsStore = useProfessorsStore()
const isSelectionValid = computed(() => selectedProfessor.value && selectedWeek.value)

const availableCount = ref(0)
const mandatoryCount = ref(0)
const optionalCount = ref(0)
const baseUrl = import.meta.env.VITE_BASE_URL

onMounted(() => {
  professorsStore.fetchProfessors()
  fetchWeeks()
})

const fetchWeeks = async () => {
  try {
    const data = await fetch(baseUrl + '/get-all-semaines').then((res) => res.json())
    weeks.value = data
    console.log(weeks.value)
  } catch (error) {
    console.error('Error fetching weeks:', error)
  }
}

const updateCounts = () => {
  availableCount.value = 0
  mandatoryCount.value = 0
  optionalCount.value = 0

  Object.values(constraints.value).forEach((value) => {
    if (value.type === 'mandatory') {
      mandatoryCount.value++
    } else if (value.type === 'optional') {
      optionalCount.value++
    } else {
      availableCount.value++
    }
  })

  availableCount.value =
    days.length * timeSlots.value.length - mandatoryCount.value - optionalCount.value
}

const toggleConstraint = (day, time) => {
  configDetails.value.day = day
  configDetails.value.time = time
  configDetails.value.week = selectedWeek.value
  configDetails.value.weeks = []
  selectedCell.value = `${day}_${time}` // Set the selected cell
  console.log(selectedCell.value)
  showConfigPanel.value = true
}

const saveConstraint = () => {
  const key = `${configDetails.value.day}_${configDetails.value.time}`
  constraints.value[key] = {
    type: configDetails.value.type,
    duration: configDetails.value.duration,
    week: configDetails.value.week,
    weeks: configDetails.value.weeks
  }



  console.log(constraints.value[key])
  showConfigPanel.value = false
  updateCounts()
}

const fetchConstraints = async (professorId, week) => {
  try {
    constraints.value = {}
    const response = await axios.get(`/api/constraints?professor=${professorId}&week=${week}`)
    const data = response.data

    Object.entries(data).forEach(([key, value]) => {
      constraints.value[key] = value
    })

    updateCounts()
  } catch (error) {
    console.error('Error fetching constraints:', error)
  }
}

const toggleAllWeeks = () => {
  console.log(weeks.value)
  if (configDetails.value.weeks.length === Object.values(weeks.value).length) {
    configDetails.value.weeks = []
  } else {
    configDetails.value.weeks = Object.values(weeks.value).map(week => week.week)
  }
}

watch([selectedProfessor, selectedWeek], ([newProfessor, newWeek]) => {
  if (newProfessor && newWeek) {
    fetchConstraints(newProfessor, newWeek)
  } else {
    constraints.value = {}
    updateCounts()
  }
})

onMounted(() => {
  updateCounts()
})
</script>

<template>
  <div>
    <label for="professor-select">Choisir un professeur :</label>
    <select v-model="selectedProfessor">
      <option value="">Professeur</option>
      <option
        :value="professor.initiales"
        v-for="professor in professorsStore.professors"
        :key="professor.initiales"
      >
        {{ professor.initiales }}
      </option>
    </select>

    <label for="week-select">Choisir une semaine :</label>
    <select class="form-select d-block" v-model="selectedWeek" @change="loadWeek">
      <option v-for="n in weeks" :key="n.week" :value="n">Semaine {{ n.week }} ({{n.jours['Lundi']}}) </option>
    </select>

    <div v-if="!isSelectionValid" class="warning">
      <p>Veuillez sélectionner un professeur et une semaine pour afficher la grille.</p>
    </div>

    <div v-else>
      <div class="counters">
        <p>Créneaux disponibles: {{ availableCount }}</p>
        <p>Indisponible strict: {{ mandatoryCount }}</p>
        <p>Indisponible facultatif: {{ optionalCount }}</p>
      </div>

      <div class="grid-container">
        <div class="grid-header"></div>
        <div v-for="day in days" :key="day" class="grid-header">{{ day }} {{ selectedWeek.jours[day] }}</div>
        <div v-for="time in timeSlots" :key="time" class="grid-row">
          <div class="grid-time">{{ time }}</div>
          <div
            v-for="day in days"
            :key="day"
            :class="[
              'grid-cell',
              constraints[`${day}_${time}`]?.type,
              { selected: selectedCell === `${day}_${time}` }
            ]"
            @click="toggleConstraint(day, time)"
          >
            <span v-if="constraints[`${day}_${time}`]?.type === 'mandatory'">Indispo. strict</span>
            <span v-if="constraints[`${day}_${time}`]?.type === 'optional'"
              >Indispo. facultatif</span
            >
          </div>
        </div>
      </div>

      <div v-if="showConfigPanel" class="config-panel">
        <h3>Configurer la contrainte</h3>
        <p>Semaine courante: {{ configDetails.week.week }}</p>
        <button @click="toggleAllWeeks">Cocher/Décocher toutes les semaines</button>

        <div class="row">
          Semaines :
          <div v-for="week in weeks" :key="week.week" class="col-3">
            <input
              type="checkbox"
              :id="`week-${week.week}`"
              :value="week.week"
              v-model="configDetails.weeks"
            />
            <label :for="`week-${week.week}`">Semaine {{ week.week }}</label>
          </div>
        </div>
        <p>Jour: {{ configDetails.day }}</p>
        <p>Créneau: {{ configDetails.time }}</p>
        <label for="type-select">Type:</label>
        <select v-model="configDetails.type">
          <option value="mandatory">Obligatoire</option>
          <option value="optional">Facultatif</option>
        </select>
        <label for="duration-select">Durée:</label>
        <select v-model="configDetails.duration">
          <option value="slot">Créneau ({{ configDetails.time }})</option>
          <option value="half-day">Demi-journée (matin)</option>
          <option value="half-day">Demi-journée (après-midi)</option>
          <option value="full-day">Journée entière</option>
        </select>
        <button @click="saveConstraint">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  gap: 0;
  width: 100%;
  border: 1px solid #000;
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
  background-color: #e19797;
  text-align: center;
  font-weight: bold;
  border: 1px solid #000;
  grid-column: span 1;
}

.grid-row {
  display: contents;
}

.grid-cell {
  text-align: center;
  padding: 3px;
  border: 1px solid #000;
  cursor: pointer;
  height: 30px;
}

.grid-cell.mandatory {
  background-color: #ffcccc; /* Rouge pour les contraintes obligatoires */
}

.grid-cell.optional {
  background-color: #ffffcc; /* Jaune pour les contraintes facultatives */
}

.grid-cell.selected {
  border: 2px solid #0000ff; /* Blue border for selected cell */
}

.config-panel {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #000;
  background-color: #f9f9f9;
}

.warning {
  color: red;
  font-weight: bold;
}
</style>
