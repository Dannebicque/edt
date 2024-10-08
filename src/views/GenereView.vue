<template>
  <div>
    <div class="mb-3">
      <label for="startDate" class="form-label">Date du lundi de la première semaine :</label>
      <input type="date" id="startDate" v-model="startDate" class="form-control" @change="updateHolidays" />
    </div>
    <div class="mb-3">
      <label for="holidays" class="form-label">Modifier les jours fériés :</label>
      <div v-for="(holiday, index) in holidays" :key="index" class="mb-2">
        <input type="date" v-model="holidays[index]" class="form-control" />
      </div>
    </div>
    <button @click="generateWeeks" class="btn btn-primary">Générer les fichiers JSON</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const startDate = ref('2023-09-04');
const holidays = ref([]);

const updateHolidays = () => {
  const year = new Date(startDate.value).getFullYear();
  holidays.value = [
    `${year}-11-01`, // Toussaint
    `${year}-11-11`, // Armistice 1918
    `${year}-12-25`, // Noël
    `${year + 1}-01-01`, // Jour de l'an
    `${year + 1}-04-01`, // Lundi de Pâques (modifiable)
    `${year + 1}-05-01`, // Fête du Travail
    `${year + 1}-05-08`, // Victoire 1945
    `${year + 1}-05-09`, // Ascension (modifiable)
    `${year + 1}-05-20`, // Lundi de Pentecôte (modifiable)
    `${year + 1}-06-14`  // Fête nationale (proche de fin juin)
  ];
};

updateHolidays();

const generateWeeks = () => {
  let currentDate = new Date(startDate.value);
  const endYear = currentDate.getFullYear() + 1;
  const end = new Date(`${endYear}-06-30`);
  let weekNumber = 1;

  while (currentDate <= end) {
    const week = { days: [] };

    for (let i = 0; i < 5; i++) { // Monday to Friday
      const dateString = currentDate.toISOString().split('T')[0];
      const isHoliday = holidays.value.includes(dateString);

      week.days.push({
        date: dateString,
        blockedSlots: isHoliday ? ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'] : [],
        holidays: isHoliday
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setTimeout(() => downloadWeekJson(week, weekNumber), weekNumber * 100); // Adding a small delay to ensure downloads
    console.log(`Week ${weekNumber} generated`);
    weekNumber++;
  }
};

const downloadWeekJson = (week, weekNumber) => {
  const blob = new Blob([JSON.stringify(week, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `semaine_${weekNumber}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.mb-3 {
  margin-bottom: 20px;
}
</style>
