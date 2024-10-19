// src/stores/matieres.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWeeksStore = defineStore('weeks', () => {
  const weeks = ref([])
  const baseUrl = import.meta.env.VITE_BASE_URL

  const fetchWeeks = async () => {
    try {
      const response = await fetch(baseUrl + '/get-all-semaines').then((res) => res.json())
      weeks.value = response
    } catch (error) {
      console.error('Error fetching weeks:', error)
    }
  }

  return {
    weeks,
    fetchWeeks,
  }
})
