<template>
  <div class="top-artists-view" v-if="favArtists.length">
    <!-- Header -->
    <div class="section-header">
      <div class="header-left">
        <h2 class="section-title">
          <span class="title-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          Top Artists
        </h2>
        <p class="section-sub">Die Artists, die deinen Sound definieren</p>
      </div>
      <div class="time-pills">
        <button v-for="option in timeOptions" :key="option.value"
          class="pill" :class="{ active: timeRange === option.value }"
          @click="timeRange = option.value; getUsersTopArtists()">
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Top 3 Podium -->
    <div class="podium">
      <div v-for="(artist, i) in favArtists.slice(0, 3)" :key="'podium-' + artist.id"
        class="podium-card"
        :class="['podium-' + (i + 1)]"
        :style="{ animationDelay: (0.2 + i * 0.15) + 's' }"
        @mouseenter="activeCard = artist.id"
        @mouseleave="activeCard = null">
        <div class="podium-rank">{{ i + 1 }}</div>
        <div class="podium-img-wrap">
          <img :src="artist.images[0]?.url" :alt="artist.name" loading="lazy" />
          <div class="podium-img-overlay"></div>
          <!-- Vinyl record effect for #1 -->
          <div v-if="i === 0" class="vinyl-ring"></div>
        </div>
        <div class="podium-info">
          <div class="podium-name">{{ artist.name }}</div>
          <div class="podium-genre">{{ artist.genres?.slice(0, 2).join(' / ') }}</div>
          <div class="podium-pop">
            <div class="pop-bar-bg">
              <div class="pop-bar-fill" :style="{ width: artist.popularity + '%' }">
                <div class="pop-bar-glow"></div>
              </div>
            </div>
            <span class="pop-value">{{ artist.popularity }}%</span>
          </div>
          <a v-if="artist.external_urls?.spotify" class="artist-spotify-link"
            :href="artist.external_urls.spotify" target="_blank" @click.stop title="In Spotify oeffnen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>Spotify</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Rest of artists as list -->
    <div class="artists-list">
      <div v-for="(artist, i) in favArtists.slice(3)" :key="artist.id"
        class="list-item"
        :style="{ animationDelay: (0.5 + i * 0.06) + 's' }"
        @mouseenter="activeCard = artist.id"
        @mouseleave="activeCard = null">
        <div class="list-rank">{{ i + 4 }}</div>
        <div class="list-img-wrap">
          <img :src="artist.images[0]?.url" :alt="artist.name" loading="lazy" />
        </div>
        <div class="list-info">
          <div class="list-name">{{ artist.name }}</div>
          <div class="list-genre">{{ artist.genres?.slice(0, 2).join(' / ') }}</div>
        </div>
        <a v-if="artist.external_urls?.spotify" class="list-spotify-link"
          :href="artist.external_urls.spotify" target="_blank" @click.stop title="In Spotify oeffnen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </a>
        <div class="list-pop">
          <div class="mini-bar-bg">
            <div class="mini-bar-fill" :style="{ width: artist.popularity + '%' }"></div>
          </div>
          <span class="mini-pop-num">{{ artist.popularity }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading state -->
  <div v-else class="loading-state">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring spinner-ring-2"></div>
    </div>
    <p class="loading-text">Lade deine Top Artists</p>
  </div>
</template>

<script setup lang="ts">
import { getTopArtists } from '@/services/spotify'
import { onMounted, ref } from 'vue'

const spotToken = ref('')
const favArtists = ref<any[]>([])
const timeRange = ref('medium_term')
const activeCard = ref<string | null>(null)

const timeOptions = [
  { value: 'short_term', label: '4 Wochen' },
  { value: 'medium_term', label: '6 Monate' },
  { value: 'long_term', label: 'Allzeit' },
]

onMounted(async () => {
  spotToken.value = localStorage.getItem('spotify_token') || ''
  await getUsersTopArtists()
})

const getUsersTopArtists = async () => {
  favArtists.value = []
  const data = await getTopArtists(spotToken.value, timeRange.value)
  // Stagger the appearance
  for (let i = 0; i < data.length; i++) {
    setTimeout(() => {
      favArtists.value.push(data[i])
    }, i * 40)
  }
}
</script>

<style scoped>
.top-artists-view {
  width: 100%;
  max-width: 900px;
  padding: 2rem 1.5rem;
  animation: fadeIn 0.5s ease both;
}

/* ---- Header ---- */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 36px;
  gap: 16px;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 6px;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(29, 185, 84, 0.15);
  border: 1px solid rgba(29, 185, 84, 0.2);
  color: var(--accent);
}

.section-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

/* ---- Time pills ---- */
.time-pills {
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  padding: 4px;
}

.pill {
  padding: 8px 16px;
  border: none;
  border-radius: 50px;
  background: transparent;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.pill:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.pill.active {
  background: var(--accent);
  color: #000;
  font-weight: 600;
  box-shadow: 0 4px 20px var(--accent-glow);
}

/* ---- Podium ---- */
.podium {
  display: grid;
  grid-template-columns: 1fr 1.15fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.podium-card {
  position: relative;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 16px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  overflow: hidden;
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.podium-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.podium-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(29, 185, 84, 0.08);
}

.podium-card:hover::before {
  opacity: 1;
}

/* Podium 1 special glow */
.podium-1 {
  order: 2;
}
.podium-1:hover {
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(255, 215, 0, 0.1);
}

.podium-2 {
  order: 1;
  margin-top: 24px;
}

.podium-3 {
  order: 3;
  margin-top: 24px;
}

.podium-rank {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  z-index: 3;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.podium-1 .podium-rank {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3));
  color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.podium-2 .podium-rank {
  background: rgba(192, 192, 192, 0.2);
  color: #c0c0c0;
}

.podium-3 .podium-rank {
  background: rgba(205, 127, 50, 0.2);
  color: #cd7f32;
}

/* ---- Podium image ---- */
.podium-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 14px;
}

.podium-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.podium-card:hover .podium-img-wrap img {
  transform: scale(1.08);
}

.podium-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

.vinyl-ring {
  position: absolute;
  inset: 0;
  border: 3px solid rgba(255, 215, 0, 0.15);
  border-radius: var(--radius-md);
  pointer-events: none;
  animation: vinylPulse 3s ease-in-out infinite;
}

@keyframes vinylPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

/* ---- Podium info ---- */
.podium-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.podium-name {
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.podium-genre {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ---- Popularity bar ---- */
.podium-pop {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.pop-bar-bg {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.pop-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  position: relative;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.pop-bar-glow {
  position: absolute;
  right: 0;
  top: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
  animation: pulse 2s ease-in-out infinite;
}

.pop-value {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 30px;
  text-align: right;
}

/* ---- List items ---- */
.artists-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: transparent;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.list-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(6px);
}

.list-rank {
  width: 24px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  text-align: center;
  flex-shrink: 0;
}

.list-img-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.list-item:hover .list-img-wrap {
  border-color: rgba(255, 255, 255, 0.15);
  transform: scale(1.06);
}

.list-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-name {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-genre {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.list-pop {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
  flex-shrink: 0;
}

.mini-bar-bg {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.mini-pop-num {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 20px;
  text-align: right;
}

/* ---- Spotify links ---- */
.artist-spotify-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 50px;
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.15);
  color: var(--accent);
  font-size: 0.62rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  width: fit-content;
}

.artist-spotify-link:hover {
  background: var(--accent);
  color: #000;
  transform: scale(1.05);
}

.list-spotify-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(29, 185, 84, 0.08);
  color: var(--accent);
  text-decoration: none;
  transition: all 0.25s ease;
  flex-shrink: 0;
  opacity: 0;
}

.list-item:hover .list-spotify-link {
  opacity: 1;
}

.list-spotify-link:hover {
  background: var(--accent);
  color: #000;
  transform: scale(1.1);
}

/* ---- Loading ---- */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
  animation: fadeIn 0.5s ease both;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spinnerRotate 1s linear infinite;
}

.spinner-ring-2 {
  inset: 6px;
  border-top-color: var(--accent-2);
  animation-direction: reverse;
  animation-duration: 0.7s;
}

@keyframes spinnerRotate {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  animation: pulse 1.5s ease-in-out infinite;
}

/* ---- Responsive ---- */
@media (max-width: 700px) {
  .podium {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .podium-1, .podium-2, .podium-3 {
    order: unset;
    margin-top: 0;
  }
  .section-header {
    flex-direction: column;
  }
  .list-pop {
    width: 80px;
  }
}
</style>
