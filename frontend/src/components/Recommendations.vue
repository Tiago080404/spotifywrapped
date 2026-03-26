<template>
  <div class="discovery" v-if="loaded">
    <div class="disc-header">
      <div>
        <h1 class="disc-title">Entdecke Neues</h1>
        <p class="disc-sub">Songs die du noch nie gehoert hast — perfekt auf deinen Geschmack abgestimmt</p>
      </div>
      <button class="disc-refresh" @click="refresh" :disabled="refreshing" title="Neue Songs entdecken">
        <svg :class="{ spinning: refreshing }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </div>

    <!-- Discovery Stats -->
    <div class="disc-stats" v-if="stats">
      <div class="stat-pill">
        <span class="stat-num">{{ stats.knownTracksCount }}</span>
        <span class="stat-label">Songs analysiert</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{{ stats.relatedArtistsFound }}</span>
        <span class="stat-label">Verwandte Kuenstler</span>
      </div>
      <div class="stat-pill accent">
        <span class="stat-num">{{ stats.finalCount }}</span>
        <span class="stat-label">Neue Songs gefunden</span>
      </div>
    </div>

    <!-- Related Artists Used -->
    <div class="disc-sources" v-if="stats?.relatedArtistNames?.length">
      <p class="sources-label">Basierend auf Kuenstlern wie:</p>
      <div class="sources-tags">
        <span class="source-tag" v-for="name in stats.relatedArtistNames" :key="name">{{ name }}</span>
      </div>
    </div>

    <!-- Top Genres Used -->
    <div class="disc-genres" v-if="stats?.topGenres?.length">
      <div class="genre-chips">
        <span class="genre-chip" v-for="genre in stats.topGenres" :key="genre">{{ genre }}</span>
      </div>
    </div>

    <!-- Create Playlist Button — THE MAIN CTA -->
    <div class="disc-cta" v-if="tracks.length">
      <button class="cta-btn" @click="saveDiscoveryPlaylist" :disabled="creatingPlaylist">
        <div class="cta-icon">
          <svg v-if="!playlistCreated" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="cta-text">
          <span class="cta-main">
            {{ playlistCreated ? 'Playlist erstellt!' : (creatingPlaylist ? 'Wird erstellt...' : 'Playlist erstellen') }}
          </span>
          <span class="cta-desc" v-if="!playlistCreated && !creatingPlaylist">
            {{ tracks.length }} Songs die du noch nie gehoert hast
          </span>
          <span class="cta-desc" v-if="playlistCreated">
            Oeffne Spotify und hoer rein!
          </span>
        </div>
        <svg v-if="!playlistCreated && !creatingPlaylist" class="cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <div v-if="creatingPlaylist" class="cta-spinner"></div>
      </button>
    </div>

    <!-- Track List -->
    <div class="disc-list">
      <div v-for="(track, i) in tracks" :key="track.id"
        class="disc-item" :style="{ animationDelay: (i * 0.025) + 's' }"
        @click="playTrack(track)">
        <span class="disc-num">{{ i + 1 }}</span>
        <div class="disc-art">
          <img :src="track.album?.images?.[0]?.url" :alt="track.name" loading="lazy" />
          <div class="disc-play-overlay">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        <div class="disc-info">
          <div class="disc-name">{{ track.name }}</div>
          <div class="disc-artist">{{ track.artists?.map((a: any) => a.name).join(', ') }}</div>
        </div>
        <div class="disc-album">{{ track.album?.name }}</div>
        <div class="disc-pop" :style="{ background: popColor(track.popularity) }">
          {{ track.popularity }}
        </div>
      </div>
    </div>

    <div v-if="!tracks.length && !error" class="disc-empty">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
      <p>Keine neuen Songs gefunden. Versuch es spaeter nochmal!</p>
    </div>

    <div v-if="error" class="disc-error">
      <p>{{ error }}</p>
      <button class="error-retry" @click="refresh">Nochmal versuchen</button>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="loading-state">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring spinner-ring-2"></div>
    </div>
    <p class="loading-text">{{ loadingMessage }}</p>
    <p class="loading-sub">{{ loadingSub }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { discoverNewTracks, getUserProfile, createPlaylist, addTracksToPlaylist, type DiscoveryStats } from '@/services/spotify'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const { play } = useAudioPlayer()

const tracks = ref<any[]>([])
const stats = ref<DiscoveryStats | null>(null)
const loaded = ref(false)
const refreshing = ref(false)
const error = ref('')
const creatingPlaylist = ref(false)
const playlistCreated = ref(false)
const loadingMessage = ref('Analysiere deinen Musikgeschmack...')
const loadingSub = ref('Deine Top Songs, Kuenstler & Genres werden durchsucht')

function popColor(pop: number) {
  if (pop >= 80) return 'rgba(29, 185, 84, 0.3)'
  if (pop >= 60) return 'rgba(168, 85, 247, 0.3)'
  if (pop >= 40) return 'rgba(236, 72, 153, 0.3)'
  return 'rgba(245, 158, 11, 0.3)'
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

async function loadDiscovery() {
  const token = localStorage.getItem('spotify_token') || ''
  if (!token) return
  error.value = ''

  // Animated loading messages
  const messages = [
    { msg: 'Analysiere deinen Musikgeschmack...', sub: 'Deine Top Songs, Kuenstler & Genres werden durchsucht' },
    { msg: 'Suche verwandte Kuenstler...', sub: 'Wir finden Artists die zu dir passen' },
    { msg: 'Filtere bekannte Songs raus...', sub: 'Nur wirklich neue Songs fuer dich' },
  ]
  let msgIdx = 0
  const msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % messages.length
    const m = messages[msgIdx]
    if (m) {
      loadingMessage.value = m.msg
      loadingSub.value = m.sub
    }
  }, 2500)

  try {
    const result = await discoverNewTracks(token, 40)
    tracks.value = result.tracks
    stats.value = result.stats
  } catch (err: any) {
    console.error('[Discovery] Failed:', err)
    error.value = 'Entdeckung fehlgeschlagen. Bitte versuch es nochmal.'
  }

  clearInterval(msgInterval)
  loaded.value = true
}

async function refresh() {
  refreshing.value = true
  playlistCreated.value = false
  loaded.value = false
  await loadDiscovery()
  setTimeout(() => { refreshing.value = false }, 600)
}

async function saveDiscoveryPlaylist() {
  const token = localStorage.getItem('spotify_token') || ''
  if (!token || !tracks.value.length) return

  creatingPlaylist.value = true
  error.value = ''
  try {
    const profile = await getUserProfile(token)
    const now = new Date().toLocaleDateString('de-DE')
    const playlist = await createPlaylist(
      token,
      profile.id,
      `Neue Entdeckungen - ${now}`,
      `${tracks.value.length} Songs die du noch nie gehoert hast. Automatisch erstellt von Spotify Wrapped.`,
      false,
    )
    const uris = tracks.value.map((t: any) => t.uri || `spotify:track:${t.id}`)
    await addTracksToPlaylist(token, playlist.id, uris)
    playlistCreated.value = true
  } catch (err: any) {
    console.error('[Discovery] Playlist creation failed:', err)
    error.value = err.message || 'Playlist konnte nicht erstellt werden.'
  }
  creatingPlaylist.value = false
}

onMounted(loadDiscovery)
</script>

<style scoped>
.discovery {
  width: 100%;
  max-width: 900px;
  padding: 2rem 1.5rem 6rem;
  animation: fadeIn 0.5s ease both;
}

/* ---- Header ---- */
.disc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.disc-title {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
  background: linear-gradient(135deg, #1db954, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.disc-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 4px 0 0;
  line-height: 1.4;
  max-width: 400px;
}

.disc-refresh {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.disc-refresh:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
  color: var(--text-primary);
}

.disc-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
.disc-refresh .spinning { animation: spinnerRotate 0.6s linear infinite; }

/* ---- Stats Pills ---- */
.disc-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 50px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
}

.stat-pill.accent {
  background: rgba(29, 185, 84, 0.1);
  border-color: rgba(29, 185, 84, 0.2);
}

.stat-num {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-pill.accent .stat-num { color: var(--accent); }

.stat-label {
  font-size: 0.62rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* ---- Sources / Related Artists ---- */
.disc-sources {
  margin-bottom: 12px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.sources-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sources-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.source-tag {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.68rem;
  font-weight: 600;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.15);
  color: rgba(168, 85, 247, 0.9);
}

/* ---- Genre Chips ---- */
.disc-genres {
  margin-bottom: 20px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
}

.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.genre-chip {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 600;
  background: rgba(236, 72, 153, 0.08);
  border: 1px solid rgba(236, 72, 153, 0.12);
  color: rgba(236, 72, 153, 0.8);
  text-transform: lowercase;
}

/* ---- CTA Button ---- */
.disc-cta {
  margin-bottom: 24px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
}

.cta-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid rgba(29, 185, 84, 0.25);
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.12), rgba(29, 185, 84, 0.06));
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
  position: relative;
  overflow: hidden;
}

.cta-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.08), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-btn:hover::before { opacity: 1; }

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(29, 185, 84, 0.2);
  border-color: rgba(29, 185, 84, 0.4);
}

.cta-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cta-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(29, 185, 84, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.cta-text {
  flex: 1;
  min-width: 0;
}

.cta-main {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
}

.cta-desc {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.cta-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.cta-btn:hover .cta-arrow { transform: translateX(4px); }

.cta-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spinnerRotate 0.6s linear infinite;
  flex-shrink: 0;
}

/* ---- Track List ---- */
.disc-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.disc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.disc-item:hover {
  background: rgba(255,255,255,0.06);
  transform: translateX(4px);
}

.disc-num {
  width: 24px;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  flex-shrink: 0;
}

.disc-art {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.08);
}

.disc-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.disc-play-overlay {
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

.disc-item:hover .disc-play-overlay { opacity: 1; }

.disc-info {
  flex: 1;
  min-width: 0;
}

.disc-name {
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.disc-artist {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.disc-album {
  width: 140px;
  font-size: 0.68rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.disc-pop {
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* ---- Empty / Error ---- */
.disc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-muted);
  gap: 12px;
  text-align: center;
}

.empty-icon { opacity: 0.3; }

.disc-empty p { font-size: 0.85rem; }

.disc-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 12px;
  text-align: center;
}

.disc-error p {
  color: rgba(239, 68, 68, 0.7);
  font-size: 0.82rem;
}

.error-retry {
  padding: 8px 20px;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-retry:hover {
  background: rgba(255,255,255,0.1);
  color: var(--text-primary);
}

/* ---- Loading ---- */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  animation: fadeIn 0.5s ease both;
  padding: 0 20px;
  text-align: center;
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
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
  max-width: 280px;
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .disc-album { display: none; }
  .discovery { padding: 1.25rem 1rem 6rem; }
  .disc-title { font-size: 1.3rem; }
  .disc-sub { font-size: 0.72rem; max-width: none; }
  .cta-btn { padding: 14px 16px; gap: 12px; }
  .cta-icon { width: 38px; height: 38px; border-radius: 10px; }
  .cta-main { font-size: 0.82rem; }
}

@media (max-width: 480px) {
  .discovery { padding: 1rem 0.75rem 6rem; }
  .disc-title { font-size: 1.15rem; }
  .disc-header { flex-direction: column; gap: 8px; }
  .disc-refresh { align-self: flex-end; margin-top: -36px; }
  .disc-stats { gap: 6px; }
  .stat-pill { padding: 6px 10px; }
  .stat-num { font-size: 0.78rem; }
  .stat-label { font-size: 0.55rem; }
  .disc-item { padding: 8px 10px; gap: 10px; }
  .disc-art { width: 40px; height: 40px; }
  .disc-num { width: 20px; font-size: 0.65rem; }
  .disc-name { font-size: 0.76rem; }
  .disc-pop { display: none; }
}
</style>
