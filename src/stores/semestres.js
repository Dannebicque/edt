// src/stores/semestres.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSemestresStore = defineStore('semestres', () => {
  const semestres = ref([])
  const baseUrl = import.meta.env.VITE_BASE_URL

  const fetchSemestres = async () => {
    try {
      const response = await fetch(baseUrl + '/api/semestres')
      const reponse = await response.json()
      semestres.value = reponse['member']
    } catch (error) {
      console.error('Error fetching semestres:', error)
    }
  }

  return {
    semestres,
    fetchSemestres
  }
})
