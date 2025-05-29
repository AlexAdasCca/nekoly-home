import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    component: App
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
