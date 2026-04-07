<template>
  <div v-if="loading" class="state-panel">Lade dein Genre-Dashboard …</div>

  <div v-else class="grid-container">
    <div class="div1">
      <NavBar />
    </div>

    <div class="div2">
      <section class="dashboard-card">
        <div class="hero">
          <p class="eyebrow">Soundcharts</p>
          <h1>Deine Top Genres</h1>
          <p class="subtitle">
            Aus deinen Spotify-Top-Tracks aufgelöst über Soundcharts und als einfache Liste
            dargestellt.
          </p>

          <label class="time-select">
            <span>Zeitraum</span>
            <select v-model="timeRange" @change="loadTopGenres">
              <option value="short_term">Letzte 4 Wochen</option>
              <option value="medium_term">Letzte 6 Monate</option>
              <option value="long_term">Allzeit</option>
            </select>
          </label>
        </div>

        <div v-if="errorMessage" class="state-panel error">{{ errorMessage }}</div>

        <div v-else-if="!topGenres.length" class="state-panel empty">
          Für diesen Zeitraum wurden keine Genres gefunden.
        </div>

        <ul v-else class="genre-list">
          <li v-for="entry in topGenres" :key="entry.genre" class="genre-row">
            <span class="genre-name">{{ entry.genre }}</span>
            <span class="genre-count">{{ entry.count }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { getTopSongs } from '@/services/spotify'
import {
  getTopGenresFromSoundcharts,
  type GenreCount,
  type TrackInput,
} from '@/services/soundcharts'
import { onMounted, ref } from 'vue'

const loading = ref(true)
const errorMessage = ref('')
const topGenres = ref<GenreCount[]>([])
const spotToken = ref('')
const userId = ref(localStorage.getItem('user_id') || '')
const timeRange = ref<'short_term' | 'medium_term' | 'long_term'>('medium_term')

async function exchangeCodeIfPresent() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (!code) {
    return
  }

  const res = await fetch(`http://127.0.0.1:3000/exchange?code=${code}`)
  const data = await res.json()

  localStorage.setItem('spotify_token', data.access_token)
  localStorage.setItem('spotify_refresh_token', data.refresh_token)
  localStorage.setItem('user_id', data.user_id)
  spotToken.value = data.access_token || ''
  userId.value = data.user_id || ''
  window.history.replaceState({}, '', '/dashboard')
}

async function loadTopGenres() {
  loading.value = true
  errorMessage.value = ''
  try {
    if (!spotToken.value) {
      spotToken.value = localStorage.getItem('spotify_token') || ''
    }

    if (!userId.value) {
      userId.value = localStorage.getItem('user_id') || ''
    }

    if (!spotToken.value) {
      throw new Error('Spotify-Token fehlt. Bitte neu anmelden.')
    }

    const tracks = await getTopSongs(spotToken.value, timeRange.value)

    const trackInputs: TrackInput[] = tracks
      .map((track: any) => ({
        name: track.name,
        artist: track.artists?.[0]?.name || track.creditName || '',
      }))
      .filter((track: TrackInput) => Boolean(track.name && track.artist))

    topGenres.value = await getTopGenresFromSoundcharts({
      userId: userId.value,
      timeRange: timeRange.value,
      tracks: trackInputs,
    })

  } catch (error) {
    console.error('[Genres] loadTopGenres failed', error)
    errorMessage.value = 'Die Genres konnten gerade nicht geladen werden.'
    topGenres.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await exchangeCodeIfPresent()
  await loadTopGenres()
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

.dashboard-card {
  width: min(760px, 100%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
}

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  max-width: 58ch;
}

.time-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: fit-content;
}

.time-select span {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.72);
}

.time-select select {
  min-width: 220px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  border-radius: 14px;
  padding: 12px 14px;
  outline: none;
}

.time-select select:focus {
  border-color: rgba(29, 185, 84, 0.8);
}

.genre-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.genre-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.genre-name {
  font-weight: 600;
  text-transform: capitalize;
}

.genre-count {
  min-width: 38px;
  text-align: center;
  font-weight: 700;
  color: #1db954;
}

.state-panel {
  width: min(760px, 100%);
  margin: 24px auto;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.84);
}

.state-panel.error {
  border-color: rgba(255, 98, 98, 0.32);
  color: #ffd0d0;
}

.state-panel.empty {
  color: rgba(255, 255, 255, 0.7);
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

  .dashboard-card {
    padding: 20px;
    border-radius: 22px;
  }

  .time-select,
  .time-select select {
    width: 100%;
  }
}
</style>
