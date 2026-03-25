import Login from '@/pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import MainPage from '@/pages/MainPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: MainPage },
    { path: '/dashboard', component: Dashboard },
    { path: '/login', component: Login },
  ],
})

export default router
