<script setup>
import { onMounted, ref, watch } from 'vue'
import { useWeeksStore } from '@/stores/weeks.js'

const props = defineProps({
  currentWeek: {
    type: Number,
    required: true
  }
})

const weeksStore = useWeeksStore()
const weeks = ref([])
const selectedWeek = ref(1)

onMounted(() => {
  fetchWeeks()
})

const fetchWeeks = async () => {
  try {
    await weeksStore.fetchWeeks()
    weeks.value = weeksStore.weeks
  } catch (error) {
    console.error('Error fetching weeks:', error)
  }
}

const emit = defineEmits(['update:selectedWeek'])

const loadWeek = () => {
  emit('update:selectedWeek', selectedWeek.value)
}

watch(() => props.currentWeek, (newWeek) => {
  selectedWeek.value = newWeek
})
</script>

<template>
  <label for="week-select">Choisir une semaine :</label>
  <select class="form-select d-block" v-model="selectedWeek" @change="loadWeek">
    <option v-for="n in weeks" :key="n.week" :value="n.week">
      Semaine {{ n.week }} ({{ n.jours['Lundi'] }})
    </option>
  </select>
</template>

<style scoped></style>
