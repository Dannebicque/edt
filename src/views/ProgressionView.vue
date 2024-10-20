<template>
  <div class="row">
    <div class="col-2">
      <label for="semesterFilter">Semestre</label><br />
      <!--      <InputText id="semesterFilter" v-model="semesterFilter" placeholder="Filtrer par semestre" />-->
      <select v-model="semesterFilter" @change="updateProgression(row)">
        <option value=""></option>
        <option
          :value="semestre['@id']"
          v-for="semestre in semestresStore.semestres"
          :key="semestre.id"
        >
          {{ semestre.nom }}
        </option>
      </select>
    </div>
    <div class="col-2">
      <label for="parcoursFilter">Parcours</label><br />
      <InputText id="parcoursFilter" v-model="parcoursFilter" placeholder="Filtrer par parcours" />
    </div>
    <div class="col-2">
      <label for="professorFilter">Professeur</label><br />
      <InputText
        id="professorFilter"
        v-model="professorFilter"
        placeholder="Filtrer par professeur"
      />
    </div>
    <div class="col-2">
      <label for="subjectFilter">Matière</label><br />
      <InputText id="subjectFilter" v-model="subjectFilter" placeholder="Filtrer par matière" />
    </div>
    <div class="col-3">
      <label for="searchFilter">Recherche</label><br />
      <InputText id="searchFilter" v-model="searchFilter" placeholder="Recherche libre" />
    </div>
    <div class="col-1">
      <Button label="Annuler" icon="pi pi-times" @click="clearFilters" />
    </div>
  </div>
  <div class="table-container">
    <!-- Header Row with Filters -->
    <table>
      <thead>
        <tr>
          <th class="fixed-column" style="width:100px !important;">&nbsp;</th>
          <th
            class="fixed-column filterable-column"
            @click="sortByColumn('semestre')"
            :class="{
              'sort-active': sortColumn === 'semestre',
              'sort-asc': sortColumn === 'semestre' && sortOrder === 'asc',
              'sort-desc': sortColumn === 'semestre' && sortOrder === 'desc'
            }"
          >
            Semestre
          </th>
          <th
            class="fixed-column filterable-column"
            @click="sortByColumn('matiere')"
            :class="{
              'sort-active': sortColumn === 'matiere',
              'sort-asc': sortColumn === 'matiere' && sortOrder === 'asc',
              'sort-desc': sortColumn === 'matiere' && sortOrder === 'desc'
            }"
          >
            Matière
          </th>
          <th
            class="fixed-column filterable-column"
            @click="sortByColumn('professeur')"
            :class="{
              'sort-active': sortColumn === 'professeur',
              'sort-asc': sortColumn === 'professeur' && sortOrder === 'asc',
              'sort-desc': sortColumn === 'professeur' && sortOrder === 'desc'
            }"
          >
            Professeur
          </th>
          <th class="fixed-column" style="width: 100px">nb CM</th>
          <th class="fixed-column" style="width: 100px">nb TD</th>
          <th class="fixed-column">gr TD</th>
          <th class="fixed-column" style="width: 100px">nb TP</th>
          <th class="fixed-column">gr TP</th>
          <th class="fixed-column">Etat</th>
          <th v-for="week in weeks" :key="week.week">
            Semaine {{ week.week }}<br />
            {{ week.jours['Lundi'] }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, index) in filteredProgressions" :key="index">
          <td class="fixed-column">
            <ButtonGroup>
              <Button
                icon="pi pi-times"
                severity="danger"
                size="small"
                aria-label="Supprimer"
                @click="confirmDelete(row.id)"
              />
              <Button
                icon="pi pi-copy"
                @click="duplicateRow(row)"
                size="small"
                severity="warn"
                aria-label="Dupliquer"
              />
            </ButtonGroup>
          </td>
          <td class="fixed-column">
            <select v-model="row.semestre" @change="updateProgression(row)">
              <option value=""></option>
              <option
                :value="semestre['@id']"
                v-for="semestre in semestresStore.semestres"
                :key="semestre.id"
              >
                {{ semestre.nom }}
              </option>
            </select>
          </td>
          <td class="fixed-column">
            <select
              v-model="row.matiere"
              :disabled="!row.semestre"
              @change="updateProgression(row)"
            >
              <option value=""></option>
              <option
                :value="matiere['@id']"
                v-for="matiere in filteredMatieres(row.semestre)"
                :key="matiere.code"
              >
                {{ matiere.code }}
              </option>
            </select>
          </td>
          <td class="fixed-column">
            <select v-model="row.professeur" @change="updateProgression(row)">
              <option value=""></option>
              <option
                :value="professor.initiales"
                v-for="professor in professorsStore.professors"
                :key="professor.initiales"
              >
                {{ professor.initiales }}
              </option>
            </select>
          </td>
          <td class="fixed-column" style="width: 100px">
            <input type="number" v-model.lazy="row.nbCm" @change="updateProgression(row)" />
          </td>
          <td class="fixed-column" style="width: 100px">
            <input type="number" v-model.lazy="row.nbTd" @change="updateProgression(row)" />
          </td>
          <td class="fixed-column">
            <input type="text" v-model.lazy="row.grTd" @change="updateProgression(row)" />
          </td>
          <td class="fixed-column" style="width: 100px">
            <input type="number" v-model.lazy="row.nbTp" @change="updateProgression(row)" />
          </td>
          <td class="fixed-column">
            <input type="text" v-model.lazy="row.grTp" @change="updateProgression(row)" />
          </td>
          <td class="fixed-column">
            <span v-if="isOkRow(row)" class="badge bg-success">OK</span>
            <span v-else class="badge bg-danger">KO</span>
          </td>
          <td
            v-for="week in weeks"
            :key="week.week"
            :class="{ 'restricted-cell': isWeekRestricted(row.semestre, week) }"
          >
            <input
              type="text"
              v-model.lazy="row.progression[week.week]"
              v-if="!isWeekRestricted(row.semestre, week)"
              @input="toUpperCase(row, week.week)"
              @change="updateProgression(row)"
            />
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td class="fixed-column"></td>
          <td class="fixed-column"></td>
          <td class="fixed-column"></td>
          <td class="fixed-column">Total</td>
          <td class="fixed-column">{{ sumColumn('Cm') }}</td>
          <td class="fixed-column">{{ sumColumn('Td') }}</td>
          <td class="fixed-column"></td>
          <td class="fixed-column">{{ sumColumn('Tp') }}</td>
          <td class="fixed-column"></td>
          <td class="fixed-column"></td>
          <td v-for="week in weeks" :key="week.week"></td>
        </tr>
      </tfoot>
    </table>
    <button @click="addRow">Ajouter une ligne</button>
  </div>
  <div class="row">
    <Button label="Générer les créneaux" icon="pi pi-check" @click="generateSlots" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProfessorsStore } from '@/stores/professors'
import { useMatieresStore } from '@/stores/matieres'
import { useProgressionsStore } from '@/stores/progressions'
import { useSemestresStore } from '@/stores/semestres.js'
import { useWeeksStore } from '@/stores/weeks'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ButtonGroup from 'primevue/buttongroup'

const professorsStore = useProfessorsStore()
const matieresStore = useMatieresStore()
const progressionsStore = useProgressionsStore()
const weeksStore = useWeeksStore()
const semestresStore = useSemestresStore()

const progressions = ref([])
const weeks = ref([])
const semesterFilter = ref('')
const parcoursFilter = ref('')
const searchFilter = ref('')
const professorFilter = ref('')
const subjectFilter = ref('')

const sortColumn = ref('matiere')
const sortOrder = ref('asc')

onMounted(async () => {
  try {
    // Load data
    await professorsStore.fetchProfessors()
    await matieresStore.fetchMatieres()
    await progressionsStore.fetchProgressions()
    await weeksStore.fetchWeeks()
    await semestresStore.fetchSemestres()

    weeks.value = weeksStore.weeks
    progressions.value = progressionsStore.progressions
    sortProgressions() // Apply default sort

  } catch (error) {
    console.error('Error loading data:', error)
  }
})

const sortByColumn = (column) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
  sortProgressions()
}

const sortProgressions = () => {
  console.log(progressions.value)
  console.log('sortProgressions', sortColumn.value, sortOrder.value)
  progressions.value.sort((a, b) => {
    let result = 0
    if (a[sortColumn.value] < b[sortColumn.value]) {
      result = -1
    } else if (a[sortColumn.value] > b[sortColumn.value]) {
      result = 1
    }
    return sortOrder.value === 'asc' ? result : -result
  })
}

const duplicateRow = async (row) => {
  try {
    // Create a copy of the row
    const newRow = { ...row, id: undefined }
    //supprimer les clés @id et @type
    delete newRow['@id']
    delete newRow['@type']

    // Call the API to add the new row
    const newId = await progressionsStore.addProgression(newRow)

    // Add the new row to the local state
    progressions.value.push({ ...newRow, id: newId })
  } catch (error) {
    console.error('Error duplicating row:', error)
  }
}

const isWeekRestricted = (semestre, week) => {
  // semestre est une IRI, récupérer l'objet depuis semestresStores.semestres
  semestre = semestresStore.semestres.find((s) => s['@id'] === semestre)

  let restrictedSlots = {}
  restrictedSlots = week.restrictedSlots

  if (!semestre || !restrictedSlots[semestre.nom]) return false
  return true
}

const addRow = async () => {
  //ajout dans l'API et récupération de l'id puis ajout dans le store
  const newId = await progressionsStore.addProgression({
    professeur: '',
    nbCm: 0,
    nbTd: 0,
    grTd: '',
    nbTp: 0,
    grTp: '',
    progression: Array(5).fill('')
  })
}

const updateProgression = async (row) => {
  try {
    await progressionsStore.updateProgression(row)
  } catch (error) {
    console.error('Error updating progression:', error)
  }
}

const isOkRow = (row) => {
  if (!row.progression) return false
  if (row.nbCm == 0 && row.nbTd == 0 && row.nbTp == 0) return false

  // vérifier si sur les semaines, il y a l'ensemble des séances de CM, TD et TP de planifiées
  let cmSessions = 0
  let tdSessions = 0
  let tpSessions = 0

  // Iterate over each session in the progression array
  row.progression.forEach((session) => {
    if (session) {
      session.split(' ').forEach((type) => {
        if (type.includes('CM')) cmSessions++
        if (type.includes('TD')) tdSessions++
        if (type.includes('TP')) tpSessions++
      })
    }
  })

  // vérification
  return cmSessions == row.nbCm && tdSessions == row.nbTd && tpSessions == row.nbTp
}

const sumColumn = (type) => {
  return progressions.value.reduce((sum, row) => sum + row[`nb${type}`], 0)
}

const toUpperCase = (row, week) => {
  row.progression[week] = row.progression[week].trim().toUpperCase()
}

const confirmDelete = async (id) => {
  if (confirm('Vous êtes sûr de vouloir supprimer cette progression ?')) {
    progressions.value = await progressionsStore
      .deleteProgression(id)
      .then(() => progressionsStore.progressions)
  }
}

const clearFilters = () => {
  semesterFilter.value = ''
  parcoursFilter.value = ''
  professorFilter.value = ''
  subjectFilter.value = ''
  searchFilter.value = ''
}

const filteredMatieres = (semestre) => {
  if (!semestre) return []
  return matieresStore.matieres.filter((matiere) => matiere.semestre === semestre)
}

const filteredProgressions = computed(() => {
  return progressions.value.filter((row) => {
    const matchesSemester =
      semesterFilter.value === '' || row.semestre.includes(semesterFilter.value)
    const matchesParcours =
      parcoursFilter.value === '' || row.parcours.includes(parcoursFilter.value)
    const matchesProfessor =
      professorFilter.value === '' || row.professeur.includes(professorFilter.value)
    const matchesSubject = subjectFilter.value === '' || row.matiere.includes(subjectFilter.value)
    const matchesSearch =
      searchFilter.value === '' ||
      Object.values(row).some((value) => value.toString().includes(searchFilter.value))
    return matchesSemester && matchesParcours && matchesProfessor && matchesSubject && matchesSearch
  })
})

const generateSlots = async () => {
  if (confirm('Vous êtes sûr de vouloir générer les créneaux ?')) {
    try {
      await progressionsStore.generateSlots()
      alert('Les créneaux ont été générés avec succès.')
    } catch (error) {
      console.error('Error generating slots:', error)
      alert('Une erreur est survenue lors de la génération des créneaux.')
    }
  }
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ccc;
  padding: 1px;
  text-align: center;
}

.fixed-column {
  width: 100px;
  background: white;
}

.restricted-cell {
  background-color: #ffcccc; /* Light red color for restricted cells */
}

.filterable-column {
  background-color: #e0f7fa; /* Light blue color for filterable columns */
}

.sort-active {
  font-weight: bold;
}

.sort-asc::after {
  content: ' ▲';
}

.sort-desc::after {
  content: ' ▼';
}
</style>
