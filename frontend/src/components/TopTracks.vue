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
    <div class="podium" v-if="podiumTracks.length">
      <div
        v-for="entry in podiumTracks"
        :key="entry.item.id"
        class="podium-item"
        :class="`slot-${entry.slot}`"
      >
        <div class="podium-card">
          <div class="img-wrap">
            <span class="rank-badge gold">{{ entry.rank }}</span>
            <img :src="entry.item.album.images[0]?.url" :alt="entry.item.name" loading="lazy" />
          </div>
          <div class="track-name">{{ entry.item.name }}</div>
          <div class="track-artist">
            {{ entry.item.artists?.map((a: any) => a.name).join(', ') }}
          </div>
          <div class="pop-row">
            <div class="pop-track">
              <div class="pop-fill" :style="{ width: entry.item.popularity + '%' }" />
            </div>
            <span class="pop-num">{{ entry.item.popularity }}</span>
          </div>
        </div>
        <div class="pedestal">Platz {{ entry.rank }}</div>
      </div>
    </div>

    <div class="vertical-list" v-if="remainingTracks.length">
      <div v-for="(track, i) in remainingTracks" :key="track.id" class="list-row">
        <div class="list-rank">{{ i + 4 }}</div>
        <img
          class="list-image"
          :src="track.album.images[0]?.url"
          :alt="track.name"
          loading="lazy"
        />
        <div class="list-meta">
          <div class="track-name">{{ track.name }}</div>
          <div class="track-artist">{{ track.artists?.map((a: any) => a.name).join(', ') }}</div>
        </div>
        <div class="list-pop">
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
import { computed, onMounted, ref } from 'vue'

const spotToken = ref('')
const favTracks = ref<any[]>([])
const timeRange = ref('medium_term')
const userId = ref(localStorage.getItem('user_id'))

onMounted(async () => {
  spotToken.value = localStorage.getItem('spotify_token') || ''
  await getUsersTopTracks()
})

const getUsersTopTracks = async () => {
  if ((await checkCachedData()) === true) {
    console.log('already cached')
    return
  } else {
    console.log('fetching from spot')
    favTracks.value = await getTopSongs(spotToken.value, timeRange.value)
    await setCachedData()
  }
}
const checkCachedData = async () => {
  const response = await fetch(
    `http://localhost:3000/getCachedData?userId=${userId.value}&timeRange=${timeRange.value}&setting=${'top-tracks'}`,
    {
      method: 'GET',
    },
  )
  const data = await response.json()
  if (!data || !data.cached) {
    console.log('ist null')
    return null
  }
  favTracks.value = data.cached
  return true
}

const setCachedData = async () => {
  const response = await fetch('http://localhost:3000/setCachedData', {
    method: 'POST',
    body: JSON.stringify({
      userId: userId.value,
      favTracks: favTracks.value,
      timeRange: timeRange.value,
      setting: 'top-tracks',
    }),
  })
  if (response.ok) {
    console.log('fdata cached')
  }
}

const topThreeTracks = computed(() => favTracks.value.slice(0, 3))
const remainingTracks = computed(() => favTracks.value.slice(3))
const podiumTracks = computed(() => {
  const top = topThreeTracks.value
  const arranged = [
    top[1] ? { item: top[1], rank: 2, slot: 'second' } : null,
    top[0] ? { item: top[0], rank: 1, slot: 'first' } : null,
    top[2] ? { item: top[2], rank: 3, slot: 'third' } : null,
  ]

  return arranged.filter(Boolean) as { item: any; rank: number; slot: string }[]
})
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

.podium {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  align-items: end;
  margin-bottom: 1rem;
}

.podium-item {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.podium-card {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.podium-card:hover {
  transform: translateY(-4px);
}

.podium-card:hover .img-wrap::after {
  opacity: 1;
}

.slot-first .pedestal {
  height: 128px;
}

.slot-second .pedestal {
  height: 96px;
}

.slot-third .pedestal {
  height: 82px;
}

.pedestal {
  margin-top: 10px;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, rgba(29, 185, 84, 0.45), rgba(29, 185, 84, 0.2));
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.72rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 0;
}

.vertical-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-row {
  display: grid;
  grid-template-columns: 34px 56px minmax(0, 1fr) 120px;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.list-rank {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.list-image {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}

.list-meta {
  min-width: 0;
}

.list-pop {
  display: flex;
  align-items: center;
  gap: 6px;
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

@media (max-width: 900px) {
  .podium {
    grid-template-columns: 1fr;
  }

  .slot-first {
    order: 1;
  }

  .slot-second {
    order: 2;
  }

  .slot-third {
    order: 3;
  }

  .slot-first .pedestal,
  .slot-second .pedestal,
  .slot-third .pedestal {
    height: 70px;
  }

  .list-row {
    grid-template-columns: 30px 48px minmax(0, 1fr);
  }

  .list-pop {
    grid-column: 1 / -1;
    padding-left: 40px;
  }

  .list-image {
    width: 48px;
    height: 48px;
  }
}
</style>
