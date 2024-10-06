<template>
  <div class="container">
    <div class="row">
      <!-- Colonne de gauche avec la grille -->
      <div class="col-md-8">
        <div class="grid">
          <!-- Boucle sur les jours -->
          <div v-for="(day, dayIndex) in grid" :key="dayIndex">
            <h5>Jour {{ dayIndex + 1 }}</h5>
            <!-- Séparation des jours avec une bordure -->
            <div class="day-separator"></div>

            <!-- En-tête avec les noms des groupes -->
            <div class="row">
              <div class="col-md-1 text-center font-weight-bold"></div> <!-- Colonne vide pour alignement -->
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
                :class="{ 'droppable': true }"
                @drop.prevent="onDrop(dayIndex, lineIndex, group)"
                @dragover.prevent
              >
                <div v-if="grid[dayIndex][lineIndex][group]" class="course-cell">
                  <span
                    :style="{ backgroundColor: grid[dayIndex][lineIndex][group].color }"
                    class="p-1 text-white"
                  >
                    {{ grid[dayIndex][lineIndex][group].name }}<br />
                    <small>Prof : {{ grid[dayIndex][lineIndex][group].assignedProfessor }}</small>
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
const groups = [1, 2, 3, 4, 5, 6]
const timeSlots = ["8h00", "9h30", "11h00", "14h00", "15h30", "17h00"];

// Liste initiale des professeurs par matière
const professorsByCourse = {
  Mathématiques: ['Prof A', 'Prof B'],
  Histoire: ['Prof C'],
  Physique: ['Prof D'],
  Chimie: ['Prof D'], // Même prof pour Physique et Chimie
  Anglais: ['Prof E', 'Prof F', 'Prof G'],
  Philosophie: ['Prof H', 'Prof I']
}

// Liste initiale des cours avec leur groupe associé et leurs professeurs
const initialCourses = [
  { name: 'Mathématiques', color: '#f28b82' },
  { name: 'Histoire', color: '#fbbc04' },
  { name: 'Physique', color: '#34a853' },
  { name: 'Chimie', color: '#4285f4' },
  { name: 'Anglais', color: '#ea4335' },
  { name: 'Philosophie', color: '#a142f4' }
]

// Génération des créneaux avec groupes et professeurs
const generateCourseSlots = (courses) => {
  return courses.flatMap((course) =>
    groups.map((group) => ({
      id: `${course.name}-${group}`,
      name: course.name,
      color: course.color,
      group: group,
      availableProfessors: professorsByCourse[course.name], // Associe les profs à chaque créneau
      assignedProfessor: null // Professeur affecté au créneau
    }))
  )
}

// Variables réactives
const availableCourses = ref(generateCourseSlots(initialCourses)) // Cours disponibles pour le drag

// Grille 3 jours x 6 lignes par jour x 6 groupes
const grid = ref(
  Array.from({ length: 3 }, () =>
    Array.from({ length: 6 }, () => groups.reduce((acc, group) => ({ ...acc, [group]: null }), {}))
  )
)

const draggedCourse = ref(null)

// Méthode pour démarrer le drag d'un cours
const onDragStart = (course) => {
  draggedCourse.value = course // Stocke le cours en train d'être déplacé
}

// Méthode pour vérifier la disponibilité des professeurs sur le créneau
const isProfessorAvailable = (professor, dayIndex, lineIndex) => {
  for (let group of groups) {
    const courseInCell = grid.value[dayIndex][lineIndex][group]
    if (courseInCell && courseInCell.assignedProfessor === professor) {
      return false // Prof déjà assigné à un créneau sur cette ligne
    }
  }
  return true // Le professeur est disponible
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
    const availableProfessors = draggedCourse.value.availableProfessors.filter((prof) =>
      isProfessorAvailable(prof, dayIndex, lineIndex)
    )

    if (availableProfessors.length === 0) {
      alert('Aucun professeur n’est disponible pour ce créneau.')
      return
    }

    // Assignation du premier professeur disponible
    draggedCourse.value.assignedProfessor = availableProfessors[0]

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
}
</script>
