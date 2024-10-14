<template>
  <div class="row">
    <!-- filtre par semestre ou pas parcours + recherche libre -->
    <div class="col-4">
      <input type="text" placeholder="Filtrer par semestre" />
    </div>
    <div class="col-4">
      <input type="text" placeholder="Filtrer par parcours" />
    </div>
    <div class="col-4">
      <input type="text" placeholder="Recherche libre" />
    </div>
  </div>
  <div class="grid-container">
    <!-- Header Row with Filters -->
    <div class="grid-header">
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

    <!-- Filter Row -->
    <div class="grid-filters">
      <input type="text" placeholder="Filtrer matière" />
      <input type="text" placeholder="Filtrer professeur" />
      <input type="number" placeholder="Nb CM" />
      <input type="number" placeholder="Nb TD" />
      <input type="number" placeholder="Gr. TD" />
      <input type="number" placeholder="Nb TP" />
      <input type="number" placeholder="Gr. TP" />
      <input type="number" placeholder="etat" />
      <div v-for="week in 5" :key="week">
        <input type="text" placeholder="Filtrer semaine" />
      </div>
    </div>

    <!-- Data Rows -->
    <div v-for="(row, index) in progressions" :key="index" class="grid-row">
      <select v-model="row.matiere" @change="updateProgression(row)">
        <option value=""></option>
        <option :value="matiere.code" v-for="matiere in matieresStore.matieres" :key="matiere.code">
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
      <div>Total</div>
      <div>{{ sumColumn('cm') }}</div>
      <div></div>
      <div>{{ sumColumn('td') }}</div>
      <div></div>
      <div>{{ sumColumn('tp') }}</div>
      <div></div>
      <div>etat</div>
      <div v-for="week in 5" :key="week"></div>
    </div>
    <button @click="addRow">Ajouter une ligne</button>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProfessorsStore } from '@/stores/professors'
import { useMatieresStore } from '@/stores/matieres'
import { useProgressionsStore } from '@/stores/progressions'

const professorsStore = useProfessorsStore()
const matieresStore = useMatieresStore()
const progressionsStore = useProgressionsStore()

const progressions = ref([])

onMounted(async () => {
  try {
    // Load data
    await professorsStore.fetchProfessors()
    await matieresStore.fetchMatieres()
    await progressionsStore.fetchProgressions()

    progressions.value = progressionsStore.progressions
    console.log(progressions.value)
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

const addRow = () => {
  //ajout dans l'API et récupération de l'id puis ajout dans le store
  const newId = progressionsStore.addProgression({ matiere: '', professeur: '', nbCm: 0, nbTd: 0, grTd: '', nbTp: 0, grTp: '', progression: Array(5).fill('') })

  console.log(newId)
}

const updateProgression = async (row) => {
  console.log(row)
  try {
    await progressionsStore.updateProgression(row)
  } catch (error) {
    console.error('Error updating progression:', error)
  }
}

const isOkRow = (row) => {
  // vérifier si sur les semaines, il y a l'ensemble des séances de CM, TD et TP de planifiées
console.log(row)
  // calcul du nombre de sessions de chaque type
  const cmSessions = row.progression.filter(session => (session !== null && session.includes('CM'))).length
  const tdSessions = row.progression.filter(session => (session !== null && session.includes('TD'))).length
  const tpSessions = row.progression.filter(session => (session !== null && session.includes('TP'))).length

  // vérification
  return cmSessions == row.nbCm && tdSessions == row.nbTd && tpSessions == row.nbTp
}

const sumColumn = (type) => {
  return progressions.value.reduce((sum, row) => sum + row[`${type}Hours`] * row[`${type}Nb`], 0)
}

const toUpperCase = (row, week) => {
  row.progression[week] = row.progression[week].trim().toUpperCase()
}
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(8, 1fr) repeat(5, 1fr);
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
