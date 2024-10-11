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
    <div v-for="(row, index) in rows" :key="index" class="grid-row">
      <select v-model="row.selectedSubject">
        <option value=""></option>
        <option :value="matiere.code" v-for="matiere in matieresStore.matieres" :key="matiere.code">
          {{ matiere.code }}
        </option>
      </select>
      <select v-model="row.selectedProfessor">
        <option value=""></option>
        <option :value="professor.initiales" v-for="professor in professorsStore.professors" :key="professor.initiales">
          {{ professor.initiales }}
        </option>
      </select>
      <input type="number" v-model="row.cmNb" />
      <input type="number" v-model="row.tdNb" />
      <input type="text" v-model="row.tdGroups" />
      <input type="number" v-model="row.tpNb" />
      <input type="text" v-model="row.tpGroups" />
      <div>
        <span v-if="isOkRow(row)" class="badge bg-success">OK</span>
        <span v-else class="badge bg-danger">KO</span>

      </div>
      <div v-for="week in 5" :key="week">
        <input type="text" v-model="row.weekSessions[week]" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProfessorsStore } from '@/stores/professors'
import { useMatieresStore } from '@/stores/matieres'

const professorsStore = useProfessorsStore()
const matieresStore = useMatieresStore()

onMounted(async () => {
  try {
    // Load data
    await professorsStore.fetchProfessors()
    await matieresStore.fetchMatieres()
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

const isOkRow = (row) => {
  // vérifier si sur les semaines, il y a l'ensemble des séances de CM, TD et TP de planifiées

  // calcul du nombre de sessions de chaque type
  const cmSessions = row.weekSessions.filter(session => session.includes('CM')).length
  const tdSessions = row.weekSessions.filter(session => session.includes('TD')).length
  const tpSessions = row.weekSessions.filter(session => session.includes('TP')).length

  // vérification
  return cmSessions == row.cmNb && tdSessions == row.tdNb && tpSessions == row.tpNb
}

const rows = ref(Array.from({ length: 5 }, () => ({
  selectedSubject: '',
  selectedProfessor: '',
  cmNb: 0,
  cmGroups: 'all',
  tdNb: 0,
  tdGroups: 'AB,CD,EF,GH',
  tpNb: 0,
  tpGroups: 'A,B,C,D,E,F,G,H',
  weekSessions: Array(5).fill(''),
  get totalHours() {
    return this.cmHours + this.tdHours + this.tpHours
  }
})))

const sumColumn = (type) => {
  return rows.value.reduce((sum, row) => sum + row[`${type}Hours`] * row[`${type}Nb`], 0)
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
