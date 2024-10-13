import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EdtView from '@/views/EdtView.vue'
import ProgressionView from '@/views/ProgressionView.vue'
import GenereView from '@/views/GenereView.vue'
import ProfesseursView from '@/views/ProfesseursView.vue'
import MatieresView from '@/views/MatieresView.vue'
import ConstraintsView from '@/views/ConstraintsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/progression',
      name: 'progression',
      component: ProgressionView
    },
    {
      path: '/contraintes',
      name: 'contraintes',
      component: ConstraintsView
    },
    {
      path: '/gestion/professeurs',
      name: 'professeurs',
      component: ProfesseursView
    },
    {
      path: '/gestion/matieres',
      name: 'matieres',
      component: MatieresView
    },
    {
      path: '/edt',
      name: 'edt',
      component: EdtView
    },
    {
      path: '/genere',
      name: 'genere',
      component: GenereView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
