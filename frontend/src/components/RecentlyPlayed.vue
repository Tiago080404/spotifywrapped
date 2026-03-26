<template>
  <div class="recently-played" v-if="loaded">
    <div class="rp-header">
      <div>
        <h1 class="rp-title">Zuletzt Gehoert</h1>
        <p class="rp-sub">{{ groupedTracks.length }} verschiedene Songs aus {{ rawCount }} Wiedergaben</p>
      </div>
      <button class="rp-refresh" @click="refresh" :disabled="refreshing">
        <svg :class="{ spinning: refreshing }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </div>

    <div class="rp-list">
      <div v-for="(item, i) in groupedTracks" :key="item.track.id"
        class="rp-item" :style="{ animationDelay: (i * 0.03) + 's' }"
        @click="playTrack(item.track)">
        <div class="rp-time-col">
          <span class="rp-time">{{ formatTime(item.lastPlayed) }}</span>
        </div>
        <div class="rp-art">
          <img :src="item.track.album?.images?.[0]?.url" :alt="item.track.name" loading="lazy" />
          <div class="rp-play-overlay">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        <div class="rp-info">
          <div class="rp-name">{{ item.track.name }}</div>
          <div class="rp-artist">{{ item.track.artists?.map((a: any) => a.name).join(', ') }}</div>
        </div>
        <div class="rp-count-badge" v-if="item.count > 1" :class="countClass(item.count)">
          <span class="rp-count-num">{{ item.count }}x</span>
          <span class="rp-count-label">gespielt</span>
        </div>
        <div class="rp-album-name">{{ item.track.album?.name }}</div>
        <div class="rp-duration">{{ formatDuration(item.track.duration_ms) }}</div>
      </div>
    </div>

    <div v-if="!groupedTracks.length" class="rp-empty">
      <p>Keine kuerzlich gehoerten Songs gefunden.</p>
    </div>
  </div>

  <div v-else class="loading-state">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring spinner-ring-2"></div>
    </div>
    <p class="loading-text">Lade zuletzt gehoerte Songs...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getRecentlyPlayed } from '@/services/spotify'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const { play } = useAudioPlayer()

const rawTracks = ref<any[]>([])
const loaded = ref(false)
const refreshing = ref(false)

const rawCount = computed(() => rawTracks.value.length)

interface GroupedTrack {
  track: any
  count: number
  lastPlayed: string
}

const groupedTracks = computed<GroupedTrack[]>(() => {
  const map = new Map<string, GroupedTrack>()

  for (const item of rawTracks.value) {
    const id = item.track?.id
    if (!id) continue

    const existing = map.get(id)
    if (existing) {
      existing.count++
      // Keep the most recent played_at
      if (item.played_at > existing.lastPlayed) {
        existing.lastPlayed = item.played_at
      }
    } else {
      map.set(id, {
        track: item.track,
        count: 1,
        lastPlayed: item.played_at,
      })
    }
  }

  // Sort by most recent play
  return [...map.values()].sort((a, b) => b.lastPlayed.localeCompare(a.lastPlayed))
})

function countClass(count: number) {
  if (count >= 5) return 'count-fire'
  if (count >= 3) return 'count-hot'
  return 'count-normal'
}

function formatTime(isoStr: string) {
  const d = new Date(isoStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)

  if (mins < 1) return 'Gerade eben'
  if (mins < 60) return `vor ${mins}m`
  if (hrs < 24) return `vor ${hrs}h`
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

function formatDuration(ms: number) {
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function playTrack(track: any) {
  play({
    id: track.id,
    name: track.name,
    artist: track.artists?.map((a: any) => a.name).join(', ') ?? '',
    albumArt: track.album?.images?.[0]?.url ?? '',
    previewUrl: track.preview_url,
    spotifyUri: track.uri ?? `spotify:track:${track.id}`,
    spotifyUrl: track.external_urls?.spotify ?? '',
  })
}

async function loadTracks() {
  const token = localStorage.getItem('spotify_token') || ''
  if (!token) return
  try {
    rawTracks.value = await getRecentlyPlayed(token, 50)
  } catch (err) {
    console.error('[RecentlyPlayed] Failed:', err)
  }
  loaded.value = true
}

async function refresh() {
  refreshing.value = true
  await loadTracks()
  setTimeout(() => { refreshing.value = false }, 600)
}

onMounted(loadTracks)
</script>

<style scoped>
.recently-played {
  width: 100%;
  max-width: 900px;
  padding: 2rem 1.5rem 4rem;
  animation: fadeIn 0.5s ease both;
}

/* ---- Header ---- */
.rp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.rp-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
}

.rp-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.rp-refresh {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.rp-refresh:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
  color: var(--text-primary);
}

.rp-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

.rp-refresh .spinning {
  animation: spinnerRotate 0.6s linear infinite;
}

/* ---- List ---- */
.rp-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rp-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.rp-item:hover {
  background: rgba(255,255,255,0.06);
  transform: translateX(4px);
}

/* Time */
.rp-time-col {
  width: 56px;
  flex-shrink: 0;
}

.rp-time {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Art */
.rp-art {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.08);
}

.rp-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rp-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.rp-item:hover .rp-play-overlay { opacity: 1; }

/* Info */
.rp-info {
  flex: 1;
  min-width: 0;
}

.rp-name {
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rp-artist {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Album */
.rp-album-name {
  width: 140px;
  font-size: 0.68rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

/* Duration */
.rp-duration {
  width: 40px;
  text-align: right;
  font-size: 0.68rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* Empty */
.rp-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 0.85rem;
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
  border-top-color: #06b6d4;
  border-radius: 50%;
  animation: spinnerRotate 1s linear infinite;
}

.spinner-ring-2 {
  inset: 6px;
  border-top-color: var(--accent);
  animation-direction: reverse;
  animation-duration: 0.7s;
}

@keyframes spinnerRotate { to { transform: rotate(360deg); } }

.loading-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  animation: pulse 1.5s ease-in-out infinite;
}

/* ---- Play Count Badge ---- */
.rp-count-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  line-height: 1;
  gap: 1px;
}

.rp-count-num {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.rp-count-label {
  font-size: 0.48rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.8;
}

.count-normal {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.count-hot {
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.3);
  color: #fb923c;
  box-shadow: 0 0 12px rgba(251, 146, 60, 0.15);
}

.count-fire {
  background: rgba(244, 63, 94, 0.14);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #f43f5e;
  box-shadow: 0 0 16px rgba(244, 63, 94, 0.2);
  animation: firePulse 2s ease-in-out infinite;
}

@keyframes firePulse {
  0%, 100% { box-shadow: 0 0 16px rgba(244, 63, 94, 0.2); }
  50% { box-shadow: 0 0 24px rgba(244, 63, 94, 0.35); }
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .rp-album-name { display: none; }
  .rp-time-col { width: 44px; }
  .recently-played { padding: 1rem 1rem 4rem; }
}

@media (max-width: 480px) {
  .rp-duration { display: none; }
  .rp-count-label { display: none; }
  .rp-count-badge { padding: 3px 8px; }
}
</style>
