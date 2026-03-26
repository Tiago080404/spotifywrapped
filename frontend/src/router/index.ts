import Login from '@/pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import { createRouter, createWebHistory } from 'vue-router'
import TopTracksPage from '@/pages/TopTracksPage.vue'
import TopArtists from '@/pages/TopArtists.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/dashboard', component: Dashboard },
    { path: '/toptracks', component: TopTracksPage },
    { path: '/', component: Login },
    { path: '/topartists', component: TopArtists },
  ],
})

export default router
