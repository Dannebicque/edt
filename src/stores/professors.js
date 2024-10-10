// src/stores/professors.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProfessorsStore = defineStore('professors', () => {
  const professors = ref([])
  const baseUrl = import.meta.env.VITE_BASE_URL

  const fetchProfessors = async () => {
    try {
      const response = await fetch(baseUrl + '/professors')
      professors.value = await response.json()
    } catch (error) {
      console.error('Error fetching professors:', error)
    }
  }

  return {
    professors,
    fetchProfessors
  }
})
