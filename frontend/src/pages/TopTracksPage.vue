<template>
  <div class="dashboard-layout">
    <div class="nav-col">
      <NavBar />
    </div>
    <main class="main-col">
      <TopTracks />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import TopTracks from '@/components/TopTracks.vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const { connectSDK, sdkConnected } = useAudioPlayer()

onMounted(() => {
  // Ensure SDK is connected when navigating directly to this page
  if (localStorage.getItem('spotify_token') && !sdkConnected.value) {
    connectSDK()
  }
})
</script>

<style scoped>
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

  .nav-col {
    padding: 0;
  }

  .main-col {
    padding: 12px;
  }
}
</style>
