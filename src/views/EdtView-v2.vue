<template>
  <div class="container">
    <div class="row">
      <!-- Colonne de gauche avec la grille -->
      <div class="col-md-8">
        <div class="grid">
          <div v-for="(day, dayIndex) in grid" :key="dayIndex">
            <h5>Jour {{ dayIndex + 1 }}</h5>
            <div class="day-separator"></div>

            <div class="row">
              <div class="col-md-1 text-center font-weight-bold"></div>
              <div v-for="group in groups" :key="group" class="col-md-1 text-center font-weight-bold">
                Groupe {{ String.fromCharCode(64 + group) }}
              </div>
            </div>

            <div v-for="(line, lineIndex) in day" :key="lineIndex" class="row">
              <div class="col-md-1 border p-2 text-center">{{ timeSlots[lineIndex] }}</div>
              <div v-for="group in groups" :key="group" class="col-md-1 border p-2" @drop.prevent="onDrop(dayIndex, lineIndex, group)" @dragover.prevent>
                <div v-if="grid[dayIndex][lineIndex][group]" class="course-cell">
                  <span :style="{ backgroundColor: grid[dayIndex][lineIndex][group].color }" class="p-1 text-white">
                    {{ grid[dayIndex][lineIndex][group].name }}<br />
                    <small>Prof : {{ grid[dayIndex][lineIndex][group].assignedProfessor }}</small><br />
                    <small>Salle : {{ grid[dayIndex][lineIndex][group].assignedRoom }}</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne de droite avec la liste des cours -->
      <div class="col-md-4">
        <h5>Liste des Cours</h5>
        <div class="list-group">
          <div v-for="course in availableCourses" :key="course.id" class="list-group-item" draggable="true" @dragstart="onDragStart(course)" :style="{ backgroundColor: course.color, cursor: 'move' }">
            {{ course.name }} (Groupe {{ course.group }})
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Liste des groupes possibles
const groups = [1, 2, 3, 4, 5, 6]; // Groupes de 1 à 6
const timeSlots = ["8h00", "9h30", "11h", "14h", "15h30", "17h"]; // Heures des cours

// Professeurs assignés
const professors = {
  "Mathématiques": ["Prof A", "Prof B"],
  "Histoire": ["Prof C"],
  "Anglais": ["Prof D", "Prof E", "Prof F"],
  "Physique": ["Prof G"],
  "Chimie": ["Prof H"],
  "Autres": ["Prof I", "Prof J"],
};

// Cours disponibles à placer
const availableCourses = ref([
  { id: 1, name: "Mathématiques", color: "blue", group: 1 },
  { id: 2, name: "Mathématiques", color: "blue", group: 2 },
  { id: 3, name: "Mathématiques", color: "blue", group: 3 },
  { id: 4, name: "Mathématiques", color: "blue", group: 4 },
  { id: 5, name: "Mathématiques", color: "blue", group: 5 },
  { id: 6, name: "Mathématiques", color: "blue", group: 6 },
  { id: 7, name: "Histoire", color: "green", group: "AB" }, // Groupe A et B
  { id: 8, name: "Histoire", color: "green", group: "CD" }, // Groupe C et D
  { id: 9, name: "Histoire", color: "green", group: "EF" }, // Groupe E et F
  { id: 10, name: "Anglais", color: "orange", group: "AB" },
  { id: 11, name: "Anglais", color: "orange", group: "CD" },
  { id: 12, name: "Anglais", color: "orange", group: "EF" },
  { id: 13, name: "Physique", color: "purple", group: 1 },
  { id: 14, name: "Physique", color: "purple", group: 2 },
  { id: 15, name: "Physique", color: "purple", group: 3 },
  { id: 16, name: "Physique", color: "purple", group: 4 },
  { id: 17, name: "Physique", color: "purple", group: 5 },
  { id: 18, name: "Physique", color: "purple", group: 6 },
  { id: 19, name: "Chimie", color: "red", group: 1 },
  { id: 20, name: "Chimie", color: "red", group: 2 },
  { id: 21, name: "Chimie", color: "red", group: 3 },
  { id: 22, name: "Chimie", color: "red", group: 4 },
  { id: 23, name: "Chimie", color: "red", group: 5 },
  { id: 24, name: "Chimie", color: "red", group: 6 },
  { id: 25, name: "Autres", color: "yellow", group: 1 },
  { id: 26, name: "Autres", color: "yellow", group: 2 },
  { id: 27, name: "Autres", color: "yellow", group: 3 },
  { id: 28, name: "Autres", color: "yellow", group: 4 },
  { id: 29, name: "Autres", color: "yellow", group: 5 },
  { id: 30, name: "Autres", color: "yellow", group: 6 },
]);

// Initialisation de la grille
const grid = ref(Array(3).fill().map(() =>
  Array(6).fill().map(() =>
    ({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null })
  )
));

const currentDraggedCourse = ref(null);

// Fonction pour gérer le début du drag
const onDragStart = (course) => {
  currentDraggedCourse.value = course;
};

// Fonction pour vérifier les conflits de professeurs
const isProfessorAvailable = (dayIndex, lineIndex, group, professor) => {
  for (let i = 1; i <= 6; i++) {
    const cell = grid.value[dayIndex][lineIndex][i];
    if (cell && cell.assignedProfessor === professor) {
      return false;
    }
  }
  return true;
};

// Fonction pour gérer le drop
const onDrop = (dayIndex, lineIndex, group) => {
  const draggedCourse = currentDraggedCourse.value;

  if (!draggedCourse) return;

  // Vérifie si c'est un cours d'Histoire ou d'Anglais
  if (draggedCourse.name === "Histoire" || draggedCourse.name === "Anglais") {
    const groupsToAssign = draggedCourse.group;

    // Vérifie que les groupes sont valides
    if (groupsToAssign === "AB") {
      const professor = professors[draggedCourse.name][0]; // Prend le premier professeur
      if (isProfessorAvailable(dayIndex, lineIndex, 1, professor) && isProfessorAvailable(dayIndex, lineIndex, 2, professor)) {
        grid.value[dayIndex][lineIndex][1] = { ...draggedCourse, assignedProfessor: professor };
        grid.value[dayIndex][lineIndex][2] = { ...draggedCourse, assignedProfessor: professor };
        availableCourses.value = availableCourses.value.filter(course => course.id !== draggedCourse.id);
      }
    } else if (groupsToAssign === "CD") {
      const professor = professors[draggedCourse.name][0];
      if (isProfessorAvailable(dayIndex, lineIndex, 3, professor) && isProfessorAvailable(dayIndex, lineIndex, 4, professor)) {
        grid.value[dayIndex][lineIndex][3] = { ...draggedCourse, assignedProfessor: professor };
        grid.value[dayIndex][lineIndex][4] = { ...draggedCourse, assignedProfessor: professor };
        availableCourses.value = availableCourses.value.filter(course => course.id !== draggedCourse.id);
      }
    } else if (groupsToAssign === "EF") {
      const professor = professors[draggedCourse.name][0];
      if (isProfessorAvailable(dayIndex, lineIndex, 5, professor) && isProfessorAvailable(dayIndex, lineIndex, 6, professor)) {
        grid.value[dayIndex][lineIndex][5] = { ...draggedCourse, assignedProfessor: professor };
        grid.value[dayIndex][lineIndex][6] = { ...draggedCourse, assignedProfessor: professor };
        availableCourses.value = availableCourses.value.filter(course => course.id !== draggedCourse.id);
      }
    }
  } else {
    const professor = professors[draggedCourse.name][0]; // Prend le premier professeur
    if (isProfessorAvailable(dayIndex, lineIndex, group, professor)) {
      grid.value[dayIndex][lineIndex][group] = { ...draggedCourse, assignedProfessor: professor };
      availableCourses.value = availableCourses.value.filter(course => course.id !== draggedCourse.id);
    }
  }
};
</script>
