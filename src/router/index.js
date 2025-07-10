import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import MainLeft from '@/views/Main/Left.vue'
import NotFound from '@/views/NotFound.vue'
import Webmaster from '@/views/Webmaster/index.vue'
import Status from '@/views/Status/index.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        component: MainLeft
      }
    ]
  },
  {
    path: '/onlinetools',
    component: Webmaster
  },
  {
    path: '/status',
    component: Status
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
