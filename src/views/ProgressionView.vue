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
      <div>CM</div>
      <div>CM</div>
      <div>CM</div>
      <div>TD</div>
      <div>TD</div>
      <div>TD</div>
      <div>TP</div>
      <div>TP</div>
      <div>TP</div>
      <div>Total Heures</div>
      <div>Etat</div>
      <div v-for="week in 5" :key="week">Semaine {{ week }}</div>
    </div>

    <!-- Filter Row -->
    <div class="grid-filters">
      <input type="text" placeholder="Filtrer matière" />
      <input type="text" placeholder="Filtrer professeur" />
      <input type="number" placeholder="Filtrer CM" />
      <input type="number" placeholder="Filtrer CM" />
      <input type="number" placeholder="Filtrer CM" />
      <input type="number" placeholder="Filtrer TD" />
      <input type="number" placeholder="Filtrer TD" />
      <input type="number" placeholder="Filtrer TD" />
      <input type="number" placeholder="Filtrer TP" />
      <input type="number" placeholder="Filtrer TP" />
      <input type="number" placeholder="Filtrer TP" />
      <input type="number" placeholder="Filtrer total heures" />
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
      <input type="number" v-model="row.cmHours" />
      <input type="number" v-model="row.cmHours" />
      <input type="number" v-model="row.cmHours" />
      <input type="number" v-model="row.tdHours" />
      <input type="number" v-model="row.tdHours" />
      <input type="number" v-model="row.tdHours" />
      <input type="number" v-model="row.tpHours" />
      <input type="number" v-model="row.tpHours" />
      <input type="number" v-model="row.tpHours" />
      <div>{{ row.totalHours }}</div>
      <div>OK</div>
      <div v-for="week in 5" :key="week">
        <input type="text" v-model="row.weekSessions[week]" />
      </div>
    </div>

    <!-- Footer Row with Sums -->
    <div class="grid-footer">
      <div>Total</div>
      <div></div>
      <div>{{ sumColumn('cm') }}</div>
      <div></div>
      <div></div>
      <div>{{ sumColumn('td') }}</div>
      <div></div>
      <div></div>
      <div>{{ sumColumn('tp') }}</div>
      <div></div>
      <div></div>
      <div>{{ sumColumn('total') }}</div>
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

const rows = ref(Array.from({ length: 5 }, () => ({
  selectedSubject: '',
  selectedProfessor: '',
  cmHours: 0,
  tdHours: 0,
  tpHours: 0,
  weekSessions: Array(5).fill(''),
  get totalHours() {
    return this.cmHours + this.tdHours + this.tpHours
  }
})))

const sumColumn = (type) => {
  return rows.value.reduce((sum, row) => sum + row[`${type}Hours`], 0)
}
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(13, 1fr) repeat(5, 1fr);
  gap: 10px;
}

.grid-header, .grid-filters, .grid-row, .grid-footer {
  display: contents;
}

.grid-header > div, .grid-filters > div, .grid-row > div, .grid-footer > div {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}
</style>
