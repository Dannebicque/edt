// src/stores/matieres.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMatieresStore = defineStore('matieres', () => {
  const matieres = ref([])
  const baseUrl = import.meta.env.VITE_BASE_URL

  const fetchMatieres = async () => {
    try {
      const response = await fetch(baseUrl + '/matieres')
      matieres.value = await response.json()
    } catch (error) {
      console.error('Error fetching matieres:', error)
    }
  }

  return {
    matieres,
    fetchMatieres
  }
})
