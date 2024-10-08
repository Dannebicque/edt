<template>
  <div class="container">
    <div class="row">
      <!-- Colonne de gauche avec la grille -->
      <div class="col-md-8">
        <button class="btn btn-primary mb-3" @click="assignRooms">
          Affecter les Salles
        </button>
        <div class="grid">
          <!-- Boucle sur les jours -->
          <div v-for="(day, dayIndex) in grid" :key="dayIndex">
            <h5>Jour {{ dayIndex + 1 }}</h5>
            <!-- Séparation des jours avec une bordure -->
            <div class="day-separator"></div>

            <!-- En-tête avec les noms des groupes -->
            <div class="row">
              <div class="col-md-1 text-center font-weight-bold"></div>
              <div
                v-for="group in groups"
                :key="group"
                class="col-md-1 text-center font-weight-bold"
              >
                Groupe {{ String.fromCharCode(64 + group) }} <!-- Affiche A, B, C... -->
              </div>
            </div>

            <!-- Boucle sur les 6 lignes pour le jour -->
            <div v-for="(line, lineIndex) in day" :key="lineIndex" class="row">
              <!-- Colonne distincte pour les heures de cours -->
              <div class="col-md-1 border p-2 text-center">
                {{ timeSlots[lineIndex] }}
              </div>

              <!-- Boucle sur les groupes (colonnes) -->
              <div
                v-for="group in groups"
                :key="group"
                class="col-md-1 border p-2"
                :class="{ 'droppable': true, 'available-slot': isDragging && isSlotHighlighted(dayIndex, lineIndex) }"
                @drop.prevent="onDrop(dayIndex, lineIndex, group)"
                @dragover.prevent
              >
                <div v-if="grid[dayIndex][lineIndex][group]" class="course-cell">
                  <span
                    :style="{ backgroundColor: grid[dayIndex][lineIndex][group].color }"
                    class="p-1 text-white"
                  >
                    {{ grid[dayIndex][lineIndex][group].label }}<br />
                    <small>Prof : {{ grid[dayIndex][lineIndex][group].professor }}</small>
                    <br />
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
          <div
            v-for="course in availableCourses"
            :key="course.id"
            class="list-group-item"
            draggable="true"
            @dragstart="onDragStart(course)"
            :style="{ backgroundColor: course.color, cursor: 'move' }"
          >
            {{ course.label }} (Groupe {{ String.fromCharCode(64 + course.group) }}) || {{ course.professor }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

// Liste des groupes possibles
const groups = [1, 2, 3, 4, 5, 6]
const timeSlots = ["8h00", "9h30", "11h00", "14h00", "15h30", "17h00"];
const availableSlots = ref([])
const isDragging = ref(false)


// Génération des créneaux avec groupes et professeurs
const getCourseSlots = async () => {
  return await fetch('/data/courses.json').then((res) => res.json())
}
const availableCourses = ref() // Cours disponibles pour le drag
onMounted(async () => {
  availableCourses.value = await getCourseSlots()
  console.log(availableCourses.value)
})

// Grille 3 jours x 6 lignes par jour x 6 groupes
const grid = ref(
  Array.from({ length: 3 }, () =>
    Array.from({ length: 6 }, () => groups.reduce((acc, group) => ({ ...acc, [group]: null }), {}))
  )
)

const draggedCourse = ref(null)

// Méthode pour démarrer le drag d'un cours
const onDragStart = (course) => {
  isDragging.value = true;
  highlightAvailableSlots(course);
  draggedCourse.value = course // Stocke le cours en train d'être déplacé
}

const  isSlotHighlighted = (dayIndex, slotIndex) => {
  return availableSlots.value.some(
    (slot) => slot.dayIndex === dayIndex && slot.slotIndex === slotIndex
  );
}

// Méthode pour vérifier la disponibilité des professeurs sur le créneau
const isProfessorAvailable = (professor, dayIndex, lineIndex) => {
  for (let group of groups) {
    const courseInCell = grid.value[dayIndex][lineIndex][group]
    if (courseInCell && courseInCell.professor === professor) {
      return false // Prof déjà assigné à un créneau sur cette ligne
    }
  }
  return true // Le professeur est disponible
}

const highlightAvailableSlots = (course) => {
  // Logique pour trouver les créneaux disponibles pour le professeur du cours
  availableSlots.value = []
  grid.value.forEach((day, dayIndex) => {
    day.forEach((slot, slotIndex) => {
      console.log(slot)
      if (isSlotAvailable(slot, course.professor)) {
        availableSlots.value.push({ dayIndex, slotIndex });
      }
    });
  });
}

const isSlotAvailable = (slot, professor) => {
  for (let group of groups) {
    if (slot[group] && slot[group].professor === professor) {
      return false;
    }
  }
  return true;
}

// Méthode pour déposer le cours dans la grille (jour, ligne, groupe)
const onDrop = (dayIndex, lineIndex, group) => {
  const courseGroup = draggedCourse.value?.group

  // Vérifie si le cours appartient au bon groupe
  if (courseGroup !== group) {
    alert('Le cours ne peut être placé que dans la colonne de son groupe.')
    return
  }

  // Vérifie si la case est libre
  if (!grid.value[dayIndex][lineIndex][group]) {
    // Choix d'un professeur disponible pour ce créneau
    const availableProfessors = isProfessorAvailable(draggedCourse.value.professor, dayIndex, lineIndex)

    if (availableProfessors === false) {
      alert('Professeur déjà assigné sur cette ligne.')
      return
    }

    // Placement du cours dans la grille
    grid.value[dayIndex][lineIndex][group] = draggedCourse.value

    // Supprime le créneau de la liste des cours disponibles
    availableCourses.value = availableCourses.value.filter(
      (course) => course.id !== draggedCourse.value.id
    )
  } else {
    // Échange avec un cours déjà présent si nécessaire
    const currentCourse = grid.value[dayIndex][lineIndex][group]

    // Remettre le cours actuel dans la liste des cours disponibles
    availableCourses.value.push(currentCourse)

    // Remplacement par le nouveau cours
    grid.value[dayIndex][lineIndex][group] = draggedCourse.value

    // Supprimer le cours déplacé de la liste
    availableCourses.value = availableCourses.value.filter(
      (course) => course.id !== draggedCourse.value.id
    )
  }

  // Réinitialisation du cours déplacé
  draggedCourse.value = null
  isDragging.value = false;
  availableSlots.value = [];
}

const rooms = ["A1", "A2", "A3", "A4", "I1", "I2"]; // Salles disponibles

const assignRooms = () => {
  const roomAssignments = {};

  // Parcourir chaque jour
  for (let dayIndex = 0; dayIndex < grid.value.length; dayIndex++) {
    // Parcourir chaque ligne (heure) pour le jour
    for (let lineIndex = 0; lineIndex < grid.value[dayIndex].length; lineIndex++) {
      // Parcourir chaque groupe
      for (let group = 1; group <= 6; group++) {
        // Vérifier si le cours existe pour ce groupe
        if (grid.value[dayIndex][lineIndex][group]) {
          // Si la salle n'a pas encore été affectée pour cette heure, l'affecter
          let assignedRoom = null;

          for (const room of rooms) {
            // Vérifie si la salle est déjà utilisée à cette heure
            if (!roomAssignments[lineIndex] || !roomAssignments[lineIndex].includes(room)) {
              assignedRoom = room;
              break; // Salle disponible trouvée
            }
          }

          if (assignedRoom) {
            // Affecte la salle au cours
            grid.value[dayIndex][lineIndex][group].assignedRoom = assignedRoom;

            // Ajoute la salle à l'enregistrement pour éviter d'utiliser la même salle à la même heure
            if (!roomAssignments[lineIndex]) {
              roomAssignments[lineIndex] = [];
            }
            roomAssignments[lineIndex].push(assignedRoom);
          }
        }
      }
    }
  }
};
</script>
