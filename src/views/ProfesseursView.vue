<!-- src/views/ProfesseursView.vue -->
<template>
  <div>
    <h1>Liste des Professeurs</h1>
    <button @click="showAddForm = true">Ajouter un Professeur</button>
    <div v-if="showAddForm">
      <h2>Ajouter un Professeur</h2>
      <form @submit.prevent="addProfessor">
        <input v-model="newProfessor.initiales" placeholder="Initiales" required />
        <input v-model="newProfessor.nom" placeholder="Nom" required />
        <input v-model="newProfessor.prenom" placeholder="Prénom" required />
        <input v-model="newProfessor.service" placeholder="192" required />
        <input v-model="newProfessor.vacataire" type="checkbox" /> Vacataire
        <button type="submit">Ajouter</button>
        <button @click="showAddForm = false">Annuler</button>
      </form>
    </div>

    <DataTable
      :value="store.professors"
      v-model:editingRows="currentProfessor"
      editMode="row" dataKey="id" @row-edit-save="updateProfessor"
      sortField="initiales"
      tableStyle="min-width: 50rem"
      paginator :rows="20">
      <Column field="initiales" header="Initiales" sortable>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" fluid />
        </template>
      </Column>
      <Column field="nom" header="Nom" sortable>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" fluid />
        </template>
      </Column>
      <Column field="prenom" header="Prénom" sortable>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" fluid />
        </template>
      </Column>
      <Column field="service" header="Service" sortable>
        <template #editor="{ data, field }">
          <InputNumber v-model="data[field]" fluid />
        </template>
      </Column>
      <Column field="vacataire" header="Vacataire" sortable>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" fluid />
        </template>
        <template #body="slotProps">
          <Tag :value="slotProps.data.vacataire" :severity="getBoolean(slotProps.data.vacataire)" />
        </template>
      </Column>
      <Column :rowEditor="true" outlined rounded severity="warning" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
      <Column :exportable="false" style="min-width: 12rem">
        <template #body="slotProps">
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteProfessor(slotProps.data.id)" />
        </template>
      </Column>
    </DataTable>

<!--    <ul>-->
<!--      <li v-for="professor in store.professors" :key="professor.initiales">-->
<!--        <span>{{ professor.initiales }} - {{ professor.nom }} {{ professor.prenom }}</span>-->
<!--        <button @click="editProfessor(professor)">Modifier</button>-->
<!--        <button @click="deleteProfessor(professor.id)">Supprimer</button>-->
<!--      </li>-->
<!--    </ul>-->
<!--    <div v-if="showEditForm">-->
<!--      <h2>Modifier le Professeur</h2>-->
<!--      <form @submit.prevent="updateProfessor">-->
<!--        <input v-model="currentProfessor.initiales" placeholder="Initiales" required />-->
<!--        <input v-model="currentProfessor.nom" placeholder="Nom" required />-->
<!--        <input v-model="currentProfessor.prenom" placeholder="Prénom" required />-->
<!--        <input v-model="currentProfessor.vacataire" type="checkbox" /> Vacataire-->
<!--        <textarea v-model="currentProfessor.contraintes" placeholder="Contraintes"></textarea>-->
<!--        <button type="submit">Modifier</button>-->
<!--        <button @click="showEditForm = false">Annuler</button>-->
<!--      </form>-->
<!--    </div>-->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProfessorsStore } from '@/stores/professors'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

const store = useProfessorsStore()
const showAddForm = ref(false)
const showEditForm = ref(false)
const newProfessor = ref({ initiales: '', nom: '', prenom: '', vacataire: false, service: 192, contraintes: [] })
const currentProfessor = ref(null)

onMounted(() => {
  store.fetchProfessors()
})

const addProfessor = async () => {
  await store.addProfessor(newProfessor.value)
  newProfessor.value = { initiales: '', nom: '', prenom: '', vacataire: false, contraintes: [], service: 192 }
  showAddForm.value = false
}

const deleteProfessor = async (id) => {
  await store.deleteProfessor(id)
}

const editProfessor = (professor) => {
  currentProfessor.value = { ...professor }
  showEditForm.value = true
}

const updateProfessor = async () => {
  await store.updateProfessor(currentProfessor.value)
  currentProfessor.value = null
  showEditForm.value = false
}

const getBoolean = (value) => {
  console.log(value)
  switch (value) {
    case true:
      return 'success';
    case false:
      return 'danger';

    default:
      return null;
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
