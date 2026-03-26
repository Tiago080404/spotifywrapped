<template>
  <div class="stats-overview" v-if="loaded">
    <!-- Welcome header -->
    <div class="welcome-header">
      <div class="welcome-left">
        <div class="welcome-avatar" v-if="profile?.images?.[0]?.url">
          <img :src="profile.images[0].url" alt="" />
          <div class="avatar-ring-anim"></div>
        </div>
        <div>
          <h1 class="welcome-name">Hey {{ profile?.display_name?.split(' ')[0] || 'du' }}!</h1>
          <p class="welcome-sub">Hier ist dein Musik-Ueberblick</p>
        </div>
      </div>
      <div class="sdk-status" :class="{ connected: sdkConnected }">
        <div class="sdk-dot"></div>
        <span>{{ sdkConnected ? 'Playback aktiv' : 'Nur Preview' }}</span>
      </div>
    </div>

    <!-- Stat cards row -->
    <div class="stat-cards">
      <div class="stat-card card-artists" :style="{ animationDelay: '0.1s' }">
        <div class="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span class="card-num">{{ artists.length }}</span>
        <span class="card-label">Top Artists</span>
      </div>
      <div class="stat-card card-tracks" :style="{ animationDelay: '0.15s' }">
        <div class="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <span class="card-num">{{ tracks.length }}</span>
        <span class="card-label">Top Tracks</span>
      </div>
      <div class="stat-card card-genres" :style="{ animationDelay: '0.2s' }">
        <div class="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>
        </div>
        <span class="card-num">{{ genres.length }}</span>
        <span class="card-label">Genres</span>
      </div>
      <div class="stat-card card-pop" :style="{ animationDelay: '0.25s' }">
        <div class="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <span class="card-num">{{ avgPop }}</span>
        <span class="card-label">Vibe Score</span>
      </div>
    </div>

    <!-- Hero cards: #1 Artist + #1 Track -->
    <div class="hero-row">
      <!-- #1 Artist -->
      <div class="hero-card" v-if="artists[0]" :style="{ animationDelay: '0.3s' }">
        <div class="hero-bg">
          <img :src="artists[0].images[0]?.url" alt="" />
        </div>
        <div class="hero-content">
          <span class="hero-badge">#1 ARTIST</span>
          <h3 class="hero-name">{{ artists[0].name }}</h3>
          <p class="hero-meta" v-if="artists[0].genres?.length">{{ artists[0].genres.slice(0, 2).join(' / ') }}</p>
          <div class="hero-stat-row">
            <div class="hero-stat">
              <span class="hs-val">{{ artists[0].popularity }}</span>
              <span class="hs-label">Popularity</span>
            </div>
            <div class="hero-stat" v-if="artists[0].followers?.total">
              <span class="hs-val">{{ formatNum(artists[0].followers.total) }}</span>
              <span class="hs-label">Followers</span>
            </div>
          </div>
        </div>
      </div>

      <!-- #1 Track -->
      <div class="hero-card hero-track-card" v-if="tracks[0]" :style="{ animationDelay: '0.35s' }"
        @click="playTrack(tracks[0])">
        <div class="hero-bg">
          <img :src="tracks[0].album?.images[0]?.url" alt="" />
        </div>
        <div class="hero-content">
          <span class="hero-badge badge-track">#1 TRACK</span>
          <h3 class="hero-name">{{ tracks[0].name }}</h3>
          <p class="hero-meta">{{ tracks[0].artists?.map((a: any) => a.name).join(', ') }}</p>
          <p class="hero-album">{{ tracks[0].album?.name }}</p>
          <div class="hero-play-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Abspielen
          </div>
        </div>
      </div>
    </div>

    <!-- Top Genre + Quick Links -->
    <div class="bottom-row">
      <!-- Top Genres mini -->
      <div class="genre-card" :style="{ animationDelay: '0.4s' }">
        <h4 class="genre-card-title">Top Genres</h4>
        <div class="genre-list">
          <div v-for="(g, i) in topGenres.slice(0, 5)" :key="g.name" class="genre-item">
            <span class="gi-rank">#{{ i + 1 }}</span>
            <span class="gi-name">{{ g.name }}</span>
            <div class="gi-bar">
              <div class="gi-fill" :style="{ width: (g.count / (topGenres[0]?.count || 1) * 100) + '%', background: genreColors[i] }"></div>
            </div>
            <span class="gi-count">{{ g.count }}x</span>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="quick-links" :style="{ animationDelay: '0.45s' }">
        <a href="/story" class="quick-link ql-story">
          <div class="ql-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/></svg>
          </div>
          <div class="ql-info">
            <span class="ql-title">Deine Music Story</span>
            <span class="ql-desc">Fullscreen Wrapped Erlebnis</span>
          </div>
          <svg class="ql-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <a href="/toptracks" class="quick-link ql-tracks">
          <div class="ql-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <div class="ql-info">
            <span class="ql-title">Top Tracks</span>
            <span class="ql-desc">Deine meistgehoerten Songs</span>
          </div>
          <svg class="ql-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <a href="/recent" class="quick-link ql-recent">
          <div class="ql-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="ql-info">
            <span class="ql-title">Zuletzt Gehoert</span>
            <span class="ql-desc">Deine letzten 50 Songs</span>
          </div>
          <svg class="ql-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <a href="/recommendations" class="quick-link ql-recs">
          <div class="ql-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>
          </div>
          <div class="ql-info">
            <span class="ql-title">Fuer Dich</span>
            <span class="ql-desc">Personalisierte Empfehlungen</span>
          </div>
          <svg class="ql-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else-if="!errorMsg" class="loading-state">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring spinner-ring-2"></div>
    </div>
    <p class="loading-text">Lade dein Dashboard...</p>
  </div>

  <!-- Error -->
  <div v-else class="error-state">
    <div class="error-icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <p class="error-title">Etwas ist schiefgelaufen</p>
    <p class="error-msg">{{ errorMsg }}</p>
    <button class="error-retry" @click="retryLoad">Erneut versuchen</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAllTopArtists, getAllTopTracks, getUserProfile, refreshAccessToken } from '@/services/spotify'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const { play, sdkConnected } = useAudioPlayer()

const profile = ref<any>(null)
const artists = ref<any[]>([])
const tracks = ref<any[]>([])
const loaded = ref(false)
const errorMsg = ref('')

const genreColors = ['#1db954', '#a855f7', '#ec4899', '#06b6d4', '#f59e0b']

const genres = computed(() => {
  const all: string[] = []
  artists.value.forEach((a: any) => {
    if (a.genres && Array.isArray(a.genres)) all.push(...a.genres)
  })
  return [...new Set(all)]
})

const topGenres = computed(() => {
  const map: Record<string, number> = {}
  artists.value.forEach((a: any) => {
    if (a.genres && Array.isArray(a.genres)) {
      a.genres.forEach((g: string) => { map[g] = (map[g] || 0) + 1 })
    }
  })
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const avgPop = computed(() => {
  if (!artists.value.length) return 0
  const sum = artists.value.reduce((acc: number, a: any) => acc + (a.popularity || 0), 0)
  return Math.round(sum / artists.value.length)
})

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

function playTrack(track: any) {
  play({
    id: track.id,
    name: track.name,
    artist: track.artists?.map((a: any) => a.name).join(', ') ?? '',
    albumArt: track.album?.images[0]?.url ?? '',
    previewUrl: track.preview_url,
    spotifyUri: track.uri ?? `spotify:track:${track.id}`,
    spotifyUrl: track.external_urls?.spotify ?? '',
  })
}

async function loadData() {
  const token = localStorage.getItem('spotify_token') || ''
  if (!token) {
    errorMsg.value = 'Kein Token gefunden. Bitte erneut einloggen.'
    return
  }
  errorMsg.value = ''
  loaded.value = false
  try {
    const [p, a, t] = await Promise.all([
      getUserProfile(token),
      getAllTopArtists(token),
      getAllTopTracks(token),
    ])
    // Check for API errors (e.g. expired token)
    if (p.error) {
      // Try token refresh
      const refreshed = await refreshAccessToken()
      if (refreshed?.access_token) {
        const [p2, a2, t2] = await Promise.all([
          getUserProfile(refreshed.access_token),
          getAllTopArtists(refreshed.access_token),
          getAllTopTracks(refreshed.access_token),
        ])
        profile.value = p2
        artists.value = a2
        tracks.value = t2
      } else {
        errorMsg.value = 'Token abgelaufen. Bitte erneut einloggen.'
        return
      }
    } else {
      profile.value = p
      artists.value = a
      tracks.value = t
    }
  } catch (err) {
    console.error('[StatsOverview] Load failed:', err)
    errorMsg.value = 'Daten konnten nicht geladen werden. Ueberprüfe deine Verbindung.'
  }
  loaded.value = true
}

function retryLoad() {
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.stats-overview {
  width: 100%;
  max-width: 960px;
  padding: 2rem 1.5rem 4rem;
  animation: fadeIn 0.5s ease both;
}

/* ---- Welcome Header ---- */
.welcome-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  flex-wrap: wrap;
  gap: 12px;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-avatar {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: visible;
  flex-shrink: 0;
}

.welcome-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.1);
  position: relative;
  z-index: 1;
}

.avatar-ring-anim {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: logoSpin 6s linear infinite;
}

@keyframes logoSpin { to { transform: rotate(360deg); } }

.welcome-name {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
}

.welcome-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.sdk-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 50px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
}

.sdk-status.connected { color: var(--accent); border-color: rgba(29,185,84,0.2); }

.sdk-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
}

.sdk-status.connected .sdk-dot {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
  animation: pulse 2s ease-in-out infinite;
}

/* ---- Stat Cards ---- */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 16px 40px rgba(0,0,0,0.3);
}

.card-icon {
  color: rgba(255,255,255,0.2);
  margin-bottom: 4px;
}

.card-num {
  font-size: 1.8rem;
  font-weight: 800;
}

.card-artists .card-num { background: linear-gradient(135deg, #1db954, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.card-tracks .card-num { background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.card-genres .card-num { background: linear-gradient(135deg, #06b6d4, #1db954); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.card-pop .card-num { background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.card-label {
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ---- Hero Cards ---- */
.hero-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}

.hero-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  align-items: flex-end;
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  border-color: rgba(255,255,255,0.15);
}

.hero-track-card { cursor: pointer; }

.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(16px) brightness(0.3) saturate(1.4);
  transform: scale(1.2);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 24px;
  width: 100%;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%);
}

.hero-badge {
  display: inline-block;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #ffd700;
  background: rgba(255,215,0,0.1);
  padding: 3px 10px;
  border-radius: 50px;
  border: 1px solid rgba(255,215,0,0.2);
  margin-bottom: 8px;
}

.badge-track {
  color: var(--accent-3);
  background: rgba(236,72,153,0.1);
  border-color: rgba(236,72,153,0.2);
}

.hero-name {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.hero-meta {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hero-album {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin: 0 0 8px;
}

.hero-stat-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.hero-stat {
  display: flex;
  flex-direction: column;
}

.hs-val { font-size: 0.85rem; font-weight: 800; }
.hs-label { font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

.hero-play-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 50px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.hero-track-card:hover .hero-play-hint {
  background: var(--accent);
  color: #000;
}

/* ---- Bottom Row ---- */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* -- Genre Card -- */
.genre-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 20px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.genre-card-title {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 14px;
}

.genre-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.genre-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gi-rank { width: 22px; font-size: 0.6rem; font-weight: 700; color: var(--text-muted); text-align: center; }
.gi-name { width: 80px; font-size: 0.68rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right; }
.gi-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.gi-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.gi-count { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); width: 24px; text-align: right; }

/* -- Quick Links -- */
.quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.quick-link:hover {
  background: rgba(255,255,255,0.08);
  transform: translateX(4px);
  border-color: rgba(255,255,255,0.12);
}

.ql-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ql-story .ql-icon { background: rgba(236,72,153,0.15); color: var(--accent-3); }
.ql-tracks .ql-icon { background: rgba(168,85,247,0.15); color: var(--accent-2); }
.ql-recent .ql-icon { background: rgba(6,182,212,0.15); color: #06b6d4; }
.ql-recs .ql-icon { background: rgba(245,158,11,0.15); color: #f59e0b; }

.ql-info { flex: 1; min-width: 0; }
.ql-title { font-size: 0.82rem; font-weight: 600; display: block; }
.ql-desc { font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 1px; }
.ql-arrow { color: var(--text-muted); flex-shrink: 0; }

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
  border-top-color: var(--accent-2);
  border-radius: 50%;
  animation: spinnerRotate 1s linear infinite;
}

.spinner-ring-2 {
  inset: 6px;
  border-top-color: var(--accent-3);
  animation-direction: reverse;
  animation-duration: 0.7s;
}

@keyframes spinnerRotate { to { transform: rotate(360deg); } }

.loading-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  animation: pulse 1.5s ease-in-out infinite;
}

/* ---- Error State ---- */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12px;
  animation: fadeIn 0.5s ease both;
}

.error-icon {
  color: rgba(239, 68, 68, 0.6);
  margin-bottom: 4px;
}

.error-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.error-msg {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
  text-align: center;
  max-width: 300px;
}

.error-retry {
  margin-top: 8px;
  padding: 10px 24px;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-retry:hover {
  background: rgba(255,255,255,0.12);
  transform: scale(1.04);
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .hero-row { grid-template-columns: 1fr; }
  .bottom-row { grid-template-columns: 1fr; }
  .welcome-header { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 480px) {
  .stats-overview { padding: 1rem 1rem 4rem; }
  .hero-name { font-size: 1.1rem; }
}
</style>
