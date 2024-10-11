// src/stores/professors.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProfessorsStore = defineStore('professors', () => {
  const professors = ref([])
  const baseUrl = import.meta.env.VITE_BASE_URL

    const fetchProfessors = async () => {
      try {
        const response = await fetch(baseUrl + '/api/professeurs').then((res) => res.json())
        console.log(response)
        professors.value = response['member']
      } catch (error) {
        console.error('Error fetching professors:', error)
      }
    }


  const addProfessor = async (professor) => {
    try {
      const response = await fetch(baseUrl + '/api/professeurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json'
        },
        body: JSON.stringify(professor)
      }).then((res) => res.json())
console.log(response)
      professors.value.push(response.data)
    } catch (error) {
      console.error('Error adding professor:', error)
    }
  }

  const deleteProfessor = async (id) => {
    try {
      await fetch(baseUrl + `/api/professeurs/${id}`, {
        method: 'DELETE'
      })
      professors.value = professors.value.filter((prof) => prof.id !== id)
    } catch (error) {
      console.error('Error deleting professor:', error)
    }
  }

  const updateProfessor = async (professor) => {
    try {
      const response = await fetch(`/api/professeurs/${professor.id}`, professor)
      const index = professors.value.findIndex((prof) => prof.id === professor.id)
      if (index !== -1) {
        professors.value[index] = response.data
      }
    } catch (error) {
      console.error('Error updating professor:', error)
    }
  }

  return {
    professors,
    fetchProfessors,
    addProfessor,
    deleteProfessor,
    updateProfessor
  }
})
