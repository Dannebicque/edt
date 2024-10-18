<template>
  <div class="row">
    <div class="col-2">
      <label for="semesterFilter">Semestre</label><br>
      <InputText id="semesterFilter" v-model="semesterFilter" placeholder="Filtrer par semestre" />
    </div>
    <div class="col-2">
      <label for="parcoursFilter">Parcours</label><br>
      <InputText id="parcoursFilter" v-model="parcoursFilter" placeholder="Filtrer par parcours" />
    </div>
    <div class="col-2">
      <label for="professorFilter">Professeur</label><br>
      <InputText id="professorFilter" v-model="professorFilter" placeholder="Filtrer par professeur" />
    </div>
    <div class="col-2">
      <label for="subjectFilter">Matière</label><br>
      <InputText id="subjectFilter" v-model="subjectFilter" placeholder="Filtrer par matière" />
    </div>
    <div class="col-3">
      <label for="searchFilter">Recherche</label><br>
      <InputText id="searchFilter" v-model="searchFilter" placeholder="Recherche libre" />
    </div>
    <div class="col-1">
      <Button label="Annuler" icon="pi pi-times" @click="clearFilters" />
    </div>
  </div>
  <div class="grid-container">
    <!-- Header Row with Filters -->
    <div class="grid-header">
      <div>&nbsp;</div>
      <div>Matière</div>
      <div>Professeur</div>
      <div>nb CM</div>
      <div>nb TD</div>
      <div>gr TD</div>
      <div>nb TP</div>
      <div>gr TP</div>
      <div>Etat</div>
      <div v-for="week in 5" :key="week">Semaine {{ week }}</div>
    </div>

    <!-- Data Rows -->
    <div v-for="(row, index) in filteredProgressions" :key="index" class="grid-row">
      <button @click="confirmDelete(row.id)">Delete</button>
      <select v-model="row.matiere" @change="updateProgression(row)">
        <option value=""></option>
        <option :value="matiere['@id']" v-for="matiere in matieresStore.matieres" :key="matiere.code">
          {{ matiere.code }}
        </option>
      </select>
      <select v-model="row.professeur" @change="updateProgression(row)">
        <option value=""></option>
        <option :value="professor.initiales" v-for="professor in professorsStore.professors" :key="professor.initiales">
          {{ professor.initiales }}
        </option>
      </select>
      <input type="number" v-model.lazy="row.nbCm" @change="updateProgression(row)" />
      <input type="number" v-model.lazy="row.nbTd" @change="updateProgression(row)" />
      <input type="text" v-model.lazy="row.grTd" @change="updateProgression(row)" />
      <input type="number" v-model.lazy="row.nbTp" @change="updateProgression(row)" />
      <input type="text" v-model.lazy="row.grTp" @change="updateProgression(row)" />
      <div>
        <span v-if="isOkRow(row)" class="badge bg-success">OK</span>
        <span v-else class="badge bg-danger">KO</span>
      </div>
      <div v-for="week in 5" :key="week">
        <input type="text" v-model.lazy="row.progression[week]"
               @input="toUpperCase(row, week)"
               @change="updateProgression(row)" />
      </div>
    </div>

    <!-- Footer Row with Sums -->
    <div class="grid-footer">
      <div></div>
      <div></div>
      <div>Total</div>
      <div>{{ sumColumn('Cm') }}</div>
      <div>{{ sumColumn('Td') }}</div>
      <div></div>
      <div>{{ sumColumn('Tp') }}</div>
      <div></div>
      <div></div>

      <div v-for="week in 5" :key="week"></div>
    </div>
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
import InputText   from 'primevue/inputtext'
import Button      from 'primevue/button'

const professorsStore = useProfessorsStore()
const matieresStore = useMatieresStore()
const progressionsStore = useProgressionsStore()

const progressions = ref([])
const semesterFilter = ref('')
const parcoursFilter = ref('')
const searchFilter = ref('')
const professorFilter = ref('')
const subjectFilter = ref('')

onMounted(async () => {
  try {
    // Load data
    await professorsStore.fetchProfessors()
    await matieresStore.fetchMatieres()
    await progressionsStore.fetchProgressions()
    console.log(matieresStore.matieres)

    progressions.value = progressionsStore.progressions
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

const addRow = async () => {
  //ajout dans l'API et récupération de l'id puis ajout dans le store
  const newId = await progressionsStore.addProgression({ matiere: '', professeur: '', nbCm: 0, nbTd: 0, grTd: '', nbTp: 0, grTp: '', progression: Array(5).fill('') })

  console.log(newId)
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
  let cmSessions = 0;
  let tdSessions = 0;
  let tpSessions = 0;

  // Iterate over each session in the progression array
  row.progression.forEach(session => {
    if (session) {
      session.split(' ').forEach(type => {
        if (type.includes('CM')) cmSessions++
        if (type.includes('TD')) tdSessions++
        if (type.includes('TP')) tpSessions++
      })
    }
  });

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
    progressions.value = await progressionsStore.deleteProgression(id).then(() => progressionsStore.progressions)
  }
}

const clearFilters = () => {
  semesterFilter.value = ''
  parcoursFilter.value = ''
  professorFilter.value = ''
  subjectFilter.value = ''
  searchFilter.value = ''
}

const filteredProgressions = computed(() => {
  return progressions.value.filter(row => {
    const matchesSemester = semesterFilter.value === '' || row.semester.includes(semesterFilter.value)
    const matchesParcours = parcoursFilter.value === '' || row.parcours.includes(parcoursFilter.value)
    const matchesProfessor = professorFilter.value === '' || row.professeur.includes(professorFilter.value)
    const matchesSubject = subjectFilter.value === '' || row.matiere.includes(subjectFilter.value)
    const matchesSearch = searchFilter.value === '' || Object.values(row).some(value => value.toString().includes(searchFilter.value))
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
.grid-container {
  display: grid;
  grid-template-columns: repeat(9, 1fr) repeat(5, 1fr);
  gap: 0;
}

.grid-header, .grid-filters, .grid-row, .grid-footer {
  display: contents;
}

.grid-header > div, .grid-filters > div, .grid-row > div, .grid-footer > div {
  border: 1px solid #ccc;
  padding: 1px;
  text-align: center;
}
</style>
