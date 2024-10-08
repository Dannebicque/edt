<template>
  <div>
    <div class="navigation-buttons mb-3">
      <button @click="previousWeek" class="btn btn-primary">Previous Week</button>
      <button @click="nextWeek" class="btn btn-primary ms-2">Next Week</button>
    </div>
    <div class="container calendar">
      <div class="row calendar-header">
        <div class="col-1 time-header"></div>
        <div v-for="group in groups" :key="group" class="col group-header">
          {{ group }}
        </div>
      </div>
      <div v-for="(day, dayIndex) in weekData.days" :key="dayIndex" class="day-section">
        <div class="row day-header">
          <div class="col-12 text-center fw-bold bg-light p-2">
            {{ getDayName(day.date) }} - {{ formatDate(day.date) }}
          </div>
        </div>
        <div v-for="(time, timeIndex) in timeSlots" :key="timeIndex" class="row time-row align-items-center">
          <div class="col-1 time-slot text-center border-end">{{ time }}</div>
          <div v-for="group in groups" :key="group" class="col day-slot text-center border" :class="{ 'bg-danger': isSlotBlocked(day, time) }">
            <!-- Content for each group and time slot -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const currentWeek = ref(1);
const weekData = ref({ days: [] });
const groups = ref(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
const timeSlots = ref(['08:00', '09:30', '11:00', '14:00', '15:30', '17:00']);

const fetchWeekData = async (weekNumber) => {
  console.log(`Fetching data for week number: ${weekNumber}`);
  try {
    const response = await axios.get(`/data/semaine_${weekNumber}.json`);
    weekData.value = response.data;
  } catch (error) {
    console.error('Error fetching week data:', error);
  }
};

const nextWeek = () => {
  console.log('Next week button clicked');
  if (currentWeek.value < 30) {
    currentWeek.value++;
    fetchWeekData(currentWeek.value);
  } else {
    console.log('Reached maximum week limit');
  }
};

const previousWeek = () => {
  console.log('Previous week button clicked');
  if (currentWeek.value > 1) {
    currentWeek.value--;
    console.log(`Current week updated to: ${currentWeek.value}`);
    fetchWeekData(currentWeek.value);
  } else {
    console.log('Reached minimum week limit');
  }
};

const isSlotBlocked = (day, time) => {
  const blocked = day.blockedSlots?.includes(time);
  console.log(`Checking if slot is blocked for day: ${day.date}, time: ${time} - Blocked: ${blocked}`);
  return blocked;
};

const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { weekday: 'long' });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

onMounted(() => {
  console.log('Component mounted, fetching initial week data');
  fetchWeekData(currentWeek.value);
});
</script>

<style scoped>
.navigation-buttons {
  margin-bottom: 20px;
}
.calendar-header {
  margin-bottom: 10px;
}
.day-header {
  margin-top: 20px;
}
.time-slot {
  padding: 10px;
  text-align: center;
  border-right: 1px solid #ddd;
}
.day-slot {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}
.bg-danger {
  background-color: #ffc0c0 !important;
}
</style>
