<template>
  <div class="top-tracks" v-if="favTracks.length">
    <h2 class="title">Top Tracks</h2>
    <p class="subtitle">Dein Hörverhalten der letzten Wochen</p>
    <div class="dropdown-wrap">
      <select v-model="timeRange" @change="getUsersTopTracks" class="dropdown">
        <option value="short_term">Letzte 4 Wochen</option>
        <option value="medium_term">Letzte 6 Monate</option>
        <option value="long_term">Allzeit</option>
      </select>
    </div>
    <div class="grid">
      <div v-for="(track, i) in favTracks" :key="track.id" class="card">
        <div class="img-wrap">
          <span class="rank-badge" :class="{ gold: i < 3 }">{{ i + 1 }}</span>
          <img :src="track.album.images[0]?.url" :alt="track.name" loading="lazy" />
        </div>
        <div class="track-name">{{ track.name }}</div>
        <div class="track-artist">{{ track.artists?.map((a) => a.name).join(', ') }}</div>
        <div class="pop-row">
          <div class="pop-track">
            <div class="pop-fill" :style="{ width: track.popularity + '%' }" />
          </div>
          <span class="pop-num">{{ track.popularity }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">Lade deine Top Tracks …</div>
</template>

<script setup lang="ts">
import { getTopSongs } from '@/services/spotify'
import { onMounted, ref } from 'vue'

const spotToken = ref('')
const favTracks = ref<any[]>([])
const timeRange = ref('medium_term')
onMounted(async () => {
  spotToken.value = localStorage.getItem('spotify_token') || ''
  await getUsersTopTracks()
})

const getUsersTopTracks = async () => {
  favTracks.value = await getTopSongs(spotToken.value, timeRange.value)
}
</script>

<style scoped>
.top-tracks {
  max-width: 720px;
  padding: 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.subtitle {
  font-size: 0.8rem;
  opacity: 0.4;
  margin: 0 0 1.5rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.card {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.card:hover .img-wrap::after {
  opacity: 1;
}

.img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.img-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.15s;
}

.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1;
}

.rank-badge.gold {
  background: rgba(186, 117, 23, 0.85);
}

.track-name {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.7rem;
  opacity: 0.4;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pop-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.pop-track {
  flex: 1;
  height: 3px;
  background: rgba(128, 128, 128, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.pop-fill {
  height: 100%;
  border-radius: 2px;
  background: #1db954;
  transition: width 0.5s ease;
}

.pop-num {
  font-size: 0.65rem;
  opacity: 0.35;
  min-width: 16px;
  text-align: right;
}

.loading {
  padding: 3rem;
  text-align: center;
  opacity: 0.4;
  font-size: 0.85rem;
}

@media (prefers-color-scheme: dark) {
  .img-wrap {
    background: #222;
  }
}

.dropdown-wrap {
  position: relative;
  margin-bottom: 1.5rem;
}

.dropdown {
  appearance: none;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 8px 36px 8px 16px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

.dropdown:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.dropdown:focus {
  border-color: #1db954;
}

.dropdown option {
  background: #282828;
  color: #ffffff;
}

.dropdown option:hover, .dropdown option:focus {
  background: #1db954;
  color: #181818;
}
</style>
