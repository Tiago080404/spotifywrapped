<template>
  <div v-if="loading" class="auth-loading">
    <div class="auth-spinner">
      <div class="spinner-orbit"></div>
      <div class="spinner-orbit spinner-orbit-2"></div>
      <div class="spinner-orbit spinner-orbit-3"></div>
    </div>
    <p class="auth-text">Verbinde mit Spotify...</p>
  </div>

  <div v-else class="dashboard-layout">
    <div class="nav-col">
      <NavBar />
    </div>
    <main class="main-col">
      <StatsOverview />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import StatsOverview from '@/components/StatsOverview.vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const { connectSDK } = useAudioPlayer()
const loading = ref(true)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (code) {
    const redirectUri = `${window.location.protocol}//${window.location.host}/dashboard`
    const res = await fetch(`/api/exchange?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`)
    const data = await res.json()
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_refresh_token', data.refresh_token)
    window.history.replaceState({}, '', '/dashboard')
  }

  loading.value = false

  // Connect Spotify Web Playback SDK (for Premium users)
  if (localStorage.getItem('spotify_token')) {
    connectSDK().then((ok) => {
      if (ok) {
        console.log('[Dashboard] Spotify SDK connected - full playback enabled')
      } else {
        console.log('[Dashboard] Spotify SDK not available - using preview fallback')
      }
    })
  }
})
</script>

<style scoped>
/* ---- Auth loading ---- */
.auth-loading {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 28px;
}

.auth-spinner {
  position: relative;
  width: 64px;
  height: 64px;
}

.spinner-orbit {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spinnerRotate 1.2s linear infinite;
}

.spinner-orbit-2 {
  inset: 8px;
  border-top-color: var(--accent-2);
  animation-direction: reverse;
  animation-duration: 0.9s;
}

.spinner-orbit-3 {
  inset: 16px;
  border-top-color: var(--accent-3);
  animation-duration: 0.6s;
}

@keyframes spinnerRotate {
  to { transform: rotate(360deg); }
}

.auth-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

/* ---- Dashboard layout ---- */
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

/* ---- Responsive ---- */
@media (max-width: 900px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    padding-bottom: 140px; /* NavBar ~56px + MiniPlayer ~72px + gap */
  }

  .nav-col {
    padding: 0;
  }

  .main-col {
    padding: 12px;
  }
}
</style>
