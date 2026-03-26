<template>
  <Transition name="player-slide">
    <div class="mini-player" v-if="currentTrack" @click.self="expanded = !expanded">
      <!-- Progress bar (always visible when playing or has progress) -->
      <div class="player-progress" @click.stop="onSeek">
        <div class="progress-fill" :style="{ width: (progress * 100) + '%' }">
          <div class="progress-glow"></div>
        </div>
      </div>

      <div class="player-inner">
        <!-- Album art -->
        <div class="player-art" :class="{ spinning: isPlaying }">
          <img :src="currentTrack.albumArt" :alt="currentTrack.name" />
        </div>

        <!-- Track info -->
        <div class="player-info">
          <div class="player-track-name">{{ currentTrack.name }}</div>
          <div class="player-artist-name">{{ currentTrack.artist }}</div>
          <div v-if="error" class="player-error">{{ error }}</div>
        </div>

        <!-- Controls -->
        <div class="player-controls">
          <button class="ctrl-btn play-btn" @click.stop="togglePlay" :title="isPlaying ? 'Pause' : 'Play'">
            <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>

          <a class="ctrl-btn spotify-link" :href="currentTrack.spotifyUrl" target="_blank"
            @click.stop title="In Spotify oeffnen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </a>

          <button class="ctrl-btn close-btn" @click.stop="stop" title="Schliessen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Volume -->
        <div class="player-volume">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path v-if="volume > 0.3" d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path v-if="volume > 0.6" d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          <input type="range" class="vol-slider" min="0" max="1" step="0.05"
            :value="volume" @input="onVolume" @click.stop />
        </div>
      </div>

      <!-- Mode badge -->
      <div v-if="useSDK" class="preview-badge sdk-badge">SPOTIFY CONNECT</div>
      <div v-else class="preview-badge">30s PREVIEW</div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const { currentTrack, isPlaying, progress, volume, useSDK, error, togglePlay, seek, setVolume, stop } = useAudioPlayer()
const expanded = ref(false)

function onSeek(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  seek(Math.max(0, Math.min(1, pct)))
}

function onVolume(e: Event) {
  const v = parseFloat((e.target as HTMLInputElement).value)
  setVolume(v)
}
</script>

<style scoped>
.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(40px) saturate(1.8);
  -webkit-backdrop-filter: blur(40px) saturate(1.8);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.5);
}

/* ---- Progress ---- */
.player-progress {
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: height 0.2s ease;
}

.player-progress:hover {
  height: 8px;
  top: -5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 0 3px 3px 0;
  position: relative;
  transition: width 0.1s linear;
}

.progress-glow {
  position: absolute;
  right: -4px;
  top: -3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.player-progress:hover .progress-glow {
  opacity: 1;
}

/* ---- Inner ---- */
.player-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ---- Album art ---- */
.player-art {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
}

.player-art.spinning {
  border-radius: 50%;
  animation: vinylSpin 3s linear infinite;
}

.player-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@keyframes vinylSpin {
  to { transform: rotate(360deg); }
}

/* ---- Info ---- */
.player-info {
  flex: 1;
  min-width: 0;
}

.player-track-name {
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-artist-name {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-error {
  font-size: 0.65rem;
  color: #ff6b6b;
  margin-top: 2px;
  font-weight: 500;
}

/* ---- Controls ---- */
.player-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ctrl-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.08);
}

.play-btn {
  width: 42px;
  height: 42px;
  background: var(--accent);
  color: #000;
}

.play-btn:hover {
  background: #1ed760;
  box-shadow: 0 4px 20px var(--accent-glow);
}

.spotify-link {
  color: var(--accent);
}

.close-btn {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.04);
}

/* ---- Volume ---- */
.player-volume {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
}

.vol-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.vol-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

/* ---- Preview/SDK badge ---- */
.preview-badge {
  position: absolute;
  top: -24px;
  right: 20px;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 4px 10px;
  border-radius: 6px 6px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
}

.sdk-badge {
  color: var(--accent);
  border-color: rgba(29, 185, 84, 0.2);
}

/* ---- Transition ---- */
.player-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.player-slide-leave-active {
  transition: all 0.3s ease-in;
}
.player-slide-enter-from,
.player-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ---- Responsive ---- */
@media (max-width: 900px) {
  .mini-player {
    bottom: 72px; /* Above mobile NavBar */
    left: 8px;
    right: 8px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .player-volume { display: none; }
  .preview-badge { display: none; }
  .player-inner { padding: 8px 12px; gap: 10px; }
  .player-art { width: 40px; height: 40px; border-radius: 8px; }
  .player-track-name { font-size: 0.78rem; }
  .player-artist-name { font-size: 0.65rem; }
  .ctrl-btn { width: 34px; height: 34px; }
  .play-btn { width: 38px; height: 38px; }
  .close-btn { width: 28px; height: 28px; }
}

@media (max-width: 480px) {
  .mini-player {
    left: 4px;
    right: 4px;
  }
  .player-inner { padding: 6px 10px; gap: 8px; }
  .spotify-link { display: none; }
}
</style>
