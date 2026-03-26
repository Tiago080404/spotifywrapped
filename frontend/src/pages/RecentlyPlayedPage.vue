<template>
  <div v-if="!hasToken" class="auth-loading">
    <p class="auth-text">Kein Token gefunden. Bitte einloggen.</p>
  </div>
  <div v-else class="dashboard-layout">
    <div class="nav-col">
      <NavBar />
    </div>
    <main class="main-col">
      <RecentlyPlayed />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import RecentlyPlayed from '@/components/RecentlyPlayed.vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const { connectSDK } = useAudioPlayer()
const hasToken = ref(false)

onMounted(async () => {
  const token = localStorage.getItem('spotify_token')
  hasToken.value = !!token
  if (token) {
    connectSDK().then((ok) => {
      if (ok) console.log('[RecentlyPlayed] SDK connected')
    })
  }
})
</script>

<style scoped>
.auth-loading {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.auth-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.dashboard-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
  gap: 8px;
}

.nav-col {
  padding: 20px 0 20px 20px;
}

.main-col {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px 24px 20px 12px;
  overflow-y: auto;
  animation: fadeIn 0.6s ease 0.3s both;
}

@media (max-width: 900px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    padding-bottom: 140px;
  }
  .nav-col { padding: 0; }
  .main-col { padding: 12px; }
}
</style>
