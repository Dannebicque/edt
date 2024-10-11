<!-- src/views/MatieresView.vue -->
<template>
  <div>
    <h1>Liste des Matieres</h1>
    <button @click="showAddForm = true">Ajouter une matière</button>
    <div v-if="showAddForm">
      <h2>Ajouter une matière</h2>
      <form @submit.prevent="addMatiere">
        <input v-model="newMatiere.code" placeholder="Code" required />
        <input v-model="newMatiere.nbCm" placeholder="Nom" required />
        <input v-model="newMatiere.nbTd" placeholder="Prénom" required />
        <input v-model="newMatiere.nbTp" placeholder="192" required />
        <input v-model="newMatiere.nbPtut" placeholder="192" required />
        <input v-model="newMatiere.couleur" placeholder="192" required />
        <button type="submit">Ajouter</button>
        <button @click="showAddForm = false">Annuler</button>
      </form>
    </div>
    <ul>
      <li v-for="matiere in store.matieres" :key="matiere.initiales">
        <span>{{ matiere.code }} - {{ matiere.prenom }}</span>
        <button @click="editMatiere(matiere)">Modifier</button>
        <button @click="deleteMatiere(matiere.id)">Supprimer</button>
      </li>
    </ul>
    <div v-if="showEditForm">
      <h2>Modifier la matière</h2>
      <form @submit.prevent="updateMatiere">
        <input v-model="currentMatiere.code" placeholder="Code" required />
        <input v-model="currentMatiere.nbCm" placeholder="Nom" required />
        <input v-model="currentMatiere.nbTd" placeholder="Prénom" required />
        <input v-model="currentMatiere.nbTp" placeholder="Prénom" required />
        <input v-model="currentMatiere.nbPtut" placeholder="Prénom" required />
        <input v-model="currentMatiere.couleur" placeholder="Prénom" required />
        <button type="submit">Modifier</button>
        <button @click="showEditForm = false">Annuler</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMatieresStore } from '@/stores/matieres'

const store = useMatieresStore()
const showAddForm = ref(false)
const showEditForm = ref(false)
const newMatiere = ref({ code: '', nbCm: 0, nbTd: 0, nbTp: 0, nbPtut: 192, couleur: '' })
const currentMatiere = ref(null)

onMounted(() => {
  store.fetchMatieres()
})

const addMatiere = async () => {
  await store.addMatiere(newMatiere.value)
  newMatiere.value = { initiales: '', nom: '', prenom: '', vacataire: false, contraintes: [], service: 192 }
  showAddForm.value = false
}

const deleteMatiere = async (id) => {
  await store.deleteMatiere(id)
}

const editMatiere = (matiere) => {
  currentMatiere.value = { ...matiere }
  showEditForm.value = true
}

const updateMatiere = async () => {
  await store.updateMatiere(currentMatiere.value)
  currentMatiere.value = null
  showEditForm.value = false
}

const matieres = computed(() => store.matieres)
</script>

<style scoped>
/* Add your styles here */
</style>
