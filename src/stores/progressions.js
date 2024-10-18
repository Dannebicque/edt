// src/stores/progressions.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProgressionsStore = defineStore('progressions', () => {
  const progressions = ref([])
  const baseUrl = import.meta.env.VITE_BASE_URL

  const fetchProgressions = async () => {
    try {
      const response = await fetch(baseUrl + '/api/progressions').then((res) => res.json())
      console.log(response)
      progressions.value = response['member']
    } catch (error) {
      console.error('Error fetching progressions:', error)
    }
  }

  const addProgression = async (progression) => {
    try {
      const response = await fetch(baseUrl + '/api/progressions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json'
        },
        body: JSON.stringify(progression)
      }).then((res) => res.json()).
        then((data) => {
          console.log(data)
          return data
        })
      console.log('-'+response)
      progressions.value.push(response)
    } catch (error) {
      console.error('Error adding progression:', error)
    }
  }

  const deleteProgression = async (id) => {
    try {
      await fetch(baseUrl + `/api/progressions/${id}`, {
        method: 'DELETE'
      })
      console.log('id:'+id)
      console.log(progressions.value)
      progressions.value = progressions.value.filter((prof) => prof.id !== id)
    } catch (error) {
      console.error('Error deleting progression:', error)
    }
  }

  const generateSlots = async () => {
    try {
      await fetch(baseUrl + `/genere-all-creneaux`, {method: 'GET'})
    } catch (error) {
      console.error('Error deleting progression:', error)
    }
  }

  const updateProgression = async (progression) => {
    try {
      //retirer la clé "id" pour que l'api accepte la requête
      const id = progression.id
      delete progression.id

      const response = await fetch(baseUrl + `/api/progressions/${id}`, {
        method: 'PATCH',
        headers: {
          accept: 'application/ld+json',
          'Content-Type': 'application/merge-patch+json'
        },
        body: JSON.stringify(progression)
      }).then((res) => res.json())

      progression.id = id

      const index = progressions.value.findIndex((prof) => prof.id === id)
      if (index !== -1) {
        progressions.value[index] = response
      }
    } catch (error) {
      console.error('Error updating progression:', error)
    }
  }

  return {
    progressions,
    fetchProgressions,
    addProgression,
    deleteProgression,
    updateProgression,
    generateSlots
  }
})
