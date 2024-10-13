<script setup>
import { ref, onMounted, watch } from 'vue'
import { useProfessorsStore } from '@/stores/professors'

const selectedProfessor = ref('')
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const timeSlots = ref(['8h00', '9h30', '11h00', '12h30', '14h00', '15h30', '17h00'])
const constraints = ref({})

const professorsStore = useProfessorsStore()

const availableCount = ref(0)
const mandatoryCount = ref(0)
const optionalCount = ref(0)

onMounted(() => {
  professorsStore.fetchProfessors()
})

const updateCounts = () => {
  availableCount.value = 0
  mandatoryCount.value = 0
  optionalCount.value = 0

  Object.values(constraints.value).forEach((value) => {
    if (value === 'mandatory') {
      mandatoryCount.value++
    } else if (value === 'optional') {
      optionalCount.value++
    } else {
      availableCount.value++
    }
  })

  availableCount.value =
    days.length * timeSlots.value.length - mandatoryCount.value - optionalCount.value
}

const toggleConstraint = (day, time) => {
  const key = `${day}_${time}`
  if (!constraints.value[key]) {
    constraints.value[key] = 'mandatory'
  } else if (constraints.value[key] === 'mandatory') {
    constraints.value[key] = 'optional'
  } else {
    delete constraints.value[key]
  }
  updateCounts()
}

const fetchConstraints = async (professorId) => {
  try {
    constraints.value = {}
    const response = await fetch('/constraints.json')
    const data = await response.json()
    const professorConstraints = (await data[professorId]) || {}

    console.log('constraints:', professorConstraints)
    // parcourir le tableau pour le formatter comme celui attendu par constraints.value
    Object.entries(professorConstraints).forEach(([key, constraint]) => {
      professorConstraints[key].forEach((constr) => {
        constraints.value[`${constr.day}_${constr.time}`] = key
      })
    })

    updateCounts()
  } catch (error) {
    console.error('Error fetching constraints:', error)
  }
}

watch(selectedProfessor, (newProfessor) => {
  if (newProfessor) {
    fetchConstraints(newProfessor)
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

    <div class="counters">
      <p>Créneaux disponibles: {{ availableCount }}</p>
      <p>Indisponible strict: {{ mandatoryCount }}</p>
      <p>Indisponible facultatif: {{ optionalCount }}</p>
    </div>

    <div class="grid-container">
      <div class="grid-header"></div>
      <div v-for="day in days" :key="day" class="grid-header">{{ day }}</div>
      <div v-for="time in timeSlots" :key="time" class="grid-row">
        <div class="grid-time">{{ time }}</div>
        <div
          v-for="day in days"
          :key="day"
          :class="['grid-cell', constraints[`${day}_${time}`]]"
          @click="toggleConstraint(day, time)"
        >
          <span v-if="constraints[`${day}_${time}`] === 'mandatory'">Indispo. strict</span>
          <span v-if="constraints[`${day}_${time}`] === 'optional'">Indispo. facultatif</span>
        </div>
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
</style>
