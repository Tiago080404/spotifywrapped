<template>
  <div class="top-tracks-view" v-if="favTracks.length">
    <!-- Header -->
    <div class="section-header">
      <div class="header-left">
        <h2 class="section-title">
          <span class="title-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </span>
          Top Tracks
        </h2>
        <p class="section-sub">Die Songs auf Heavy Rotation</p>
      </div>
      <div class="time-pills">
        <button v-for="option in timeOptions" :key="option.value"
          class="pill" :class="{ active: timeRange === option.value }"
          @click="timeRange = option.value; getUsersTopTracks()">
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Featured #1 track -->
    <div class="featured-track" v-if="favTracks[0]"
      :class="{ playing: isTrackPlaying(favTracks[0].id).value }"
      @click="playTrack(favTracks[0])"
      @mouseenter="hoveredTrack = favTracks[0].id"
      @mouseleave="hoveredTrack = null">
      <div class="featured-bg">
        <img :src="favTracks[0].album.images[0]?.url" alt="" />
      </div>
      <div class="featured-content">
        <div class="featured-badge">
          <span class="badge-num">#1</span>
          <span class="badge-label">MOST PLAYED</span>
        </div>
        <h3 class="featured-name">{{ favTracks[0].name }}</h3>
        <p class="featured-artist">{{ favTracks[0].artists?.map((a: any) => a.name).join(', ') }}</p>
        <div class="featured-meta">
          <span class="meta-album">{{ favTracks[0].album.name }}</span>
          <span class="meta-dot"></span>
          <span class="meta-pop">Popularity {{ favTracks[0].popularity }}%</span>
        </div>
        <!-- Sound wave visualizer -->
        <div class="sound-wave" :class="{ active: isTrackPlaying(favTracks[0].id).value }">
          <div v-for="n in 20" :key="n" class="wave-line"
            :style="{ animationDelay: (n * 0.08) + 's', height: (15 + Math.random() * 25) + 'px' }">
          </div>
        </div>
        <div class="featured-play-hint">
          <svg v-if="!isTrackPlaying(favTracks[0].id).value" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <span>{{ isTrackPlaying(favTracks[0].id).value ? 'Playing' : 'Preview abspielen' }}</span>
        </div>
      </div>
    </div>

    <!-- Track list -->
    <div class="tracks-list">
      <div v-for="(track, i) in favTracks.slice(1)" :key="track.id"
        class="track-row"
        :class="{ hovered: hoveredTrack === track.id, playing: isTrackPlaying(track.id).value }"
        :style="{ animationDelay: (0.3 + i * 0.05) + 's' }"
        @click="playTrack(track)"
        @mouseenter="hoveredTrack = track.id"
        @mouseleave="hoveredTrack = null">

        <div class="track-rank">{{ i + 2 }}</div>

        <div class="track-cover-wrap">
          <img :src="track.album.images[0]?.url" :alt="track.name" loading="lazy" />
          <div class="cover-play-icon">
            <svg v-if="!isTrackPlaying(track.id).value" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          </div>
        </div>

        <div class="track-info">
          <div class="track-name">{{ track.name }}</div>
          <div class="track-artist">{{ track.artists?.map((a: any) => a.name).join(', ') }}</div>
        </div>

        <div class="track-album">{{ track.album.name }}</div>

        <div class="track-pop">
          <div class="track-bar-bg">
            <div class="track-bar-fill"
              :style="{
                width: track.popularity + '%',
                background: `linear-gradient(90deg, hsl(${(track.popularity / 100) * 120 + 200}, 80%, 60%), hsl(${(track.popularity / 100) * 120 + 260}, 80%, 60%))`,
              }">
            </div>
          </div>
          <span class="track-pop-num">{{ track.popularity }}</span>
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
    <p class="loading-text">Lade deine Top Tracks</p>
  </div>
</template>

<script setup lang="ts">
import { getTopSongs } from '@/services/spotify'
import { onMounted, ref } from 'vue'
import { useAudioPlayer, type PlayerTrack } from '@/composables/useAudioPlayer'

const { play, isTrackPlaying } = useAudioPlayer()

const spotToken = ref('')
const favTracks = ref<any[]>([])
const timeRange = ref('medium_term')
const hoveredTrack = ref<string | null>(null)

const timeOptions = [
  { value: 'short_term', label: '4 Wochen' },
  { value: 'medium_term', label: '6 Monate' },
  { value: 'long_term', label: 'Allzeit' },
]

onMounted(async () => {
  spotToken.value = localStorage.getItem('spotify_token') || ''
  await getUsersTopTracks()
})

const getUsersTopTracks = async () => {
  favTracks.value = []
  const data = await getTopSongs(spotToken.value, timeRange.value)
  for (let i = 0; i < data.length; i++) {
    setTimeout(() => {
      favTracks.value.push(data[i])
    }, i * 35)
  }
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
</script>

<style scoped>
.top-tracks-view {
  width: 100%;
  max-width: 960px;
  padding: 2rem 1.5rem;
  animation: fadeIn 0.5s ease both;
}

/* ---- Header (same as TopArtists) ---- */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
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
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.2);
  color: var(--accent-2);
}

.section-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

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
  background: var(--accent-2);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 20px var(--accent-2-glow);
}

/* ---- Featured Track (#1) ---- */
.featured-track {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 28px;
  min-height: 220px;
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.featured-track:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.15);
}

.featured-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.featured-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px) brightness(0.35) saturate(1.4);
  transform: scale(1.2);
}

.featured-content {
  position: relative;
  z-index: 1;
  padding: 28px 32px;
  width: 100%;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 4px 12px 4px 6px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.badge-num {
  font-size: 0.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.badge-label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}

.featured-name {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
  line-height: 1.2;
}

.featured-artist {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 8px;
}

.featured-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-muted);
}

/* ---- Sound wave ---- */
.sound-wave {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  margin-top: 16px;
  height: 40px;
}

.sound-wave .wave-line {
  animation-play-state: paused;
}

.sound-wave.active .wave-line {
  animation-play-state: running;
}

.wave-line {
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(to top, var(--accent-2), var(--accent-3));
  opacity: 0.5;
  animation: waveAnimate 1.4s ease-in-out infinite alternate;
}

@keyframes waveAnimate {
  0% { transform: scaleY(0.3); opacity: 0.3; }
  100% { transform: scaleY(1); opacity: 0.7; }
}

.featured-play-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 6px 16px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  width: fit-content;
}

.featured-track:hover .featured-play-hint {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}

.featured-track.playing {
  border-color: var(--accent);
  box-shadow: 0 0 40px var(--accent-glow);
}

/* ---- Track row playing state ---- */
.track-row.playing {
  background: rgba(29, 185, 84, 0.08);
}

.track-row.playing .track-name {
  color: var(--accent);
}

.track-row.playing .cover-play-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.track-row.playing .track-cover-wrap img {
  filter: brightness(0.7);
}

/* ---- Track list ---- */
.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.track-row {
  display: grid;
  grid-template-columns: 32px 52px 1fr minmax(0, 0.6fr) 120px;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.track-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.track-row:hover .cover-play-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.track-row:hover .track-cover-wrap img {
  transform: scale(1.08);
  filter: brightness(0.7);
}

.track-rank {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  text-align: center;
}

.track-cover-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.track-cover-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: all 0.3s ease;
}

.cover-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  transition: all 0.25s ease;
  color: #fff;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
}

.track-info {
  min-width: 0;
}

.track-name {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-album {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-pop {
  display: flex;
  align-items: center;
  gap: 8px;
}

.track-bar-bg {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.track-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.track-pop-num {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 20px;
  text-align: right;
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
  .track-row {
    grid-template-columns: 28px 44px 1fr 80px;
  }
  .track-album {
    display: none;
  }
  .section-header {
    flex-direction: column;
    gap: 12px;
  }
  .featured-name {
    font-size: 1.2rem;
  }
  .featured-track {
    min-height: 180px;
  }
  .featured-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .track-row {
    grid-template-columns: 24px 38px 1fr;
    gap: 8px;
    padding: 8px 10px;
  }
  .track-pop {
    display: none;
  }
  .track-cover {
    width: 38px;
    height: 38px;
  }
  .track-name {
    font-size: 0.76rem;
  }
  .track-artist-name {
    font-size: 0.62rem;
  }
  .featured-track {
    min-height: 160px;
  }
  .featured-name {
    font-size: 1rem;
  }
  .featured-content {
    padding: 16px;
  }
  .time-pills {
    align-self: flex-start;
  }
  .top-tracks-view {
    padding: 1rem 0.75rem 6rem;
  }
}
</style>
