<template>
  <div v-if="loading">Einloggen...</div>
  <div v-else class="grid-container">
    <div class="div1">
      <NavBar />
    </div>
    <div class="div2">
      <TopArtists />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import TopArtists from '@/components/TopArtists.vue'

const loading = ref(true)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (code) {
    const res = await fetch(`http://127.0.0.1:3000/exchange?code=${code}`)
    const data = await res.json()
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_refresh_token', data.refresh_token)
    window.history.replaceState({}, '', '/dashboard')
  }

  loading.value = false
})
</script>
<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 100vh;
  column-gap: 20px;
  align-items: stretch;
}

.div1 {
  padding: 16px 10px 16px 16px;
}

.div2 {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px 24px 24px 12px;
}

@media (max-width: 900px) {
  .grid-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    row-gap: 12px;
  }

  .div1 {
    padding: 12px;
  }

  .div2 {
    padding: 8px 12px 20px;
  }
}
</style>
