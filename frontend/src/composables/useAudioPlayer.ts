import { ref, computed } from 'vue'
import { useSpotifyPlayer } from './useSpotifyPlayer'

export interface PlayerTrack {
  id: string
  name: string
  artist: string
  albumArt: string
  previewUrl: string | null
  spotifyUri: string        // e.g. "spotify:track:xxx"
  spotifyUrl: string        // e.g. "https://open.spotify.com/track/xxx"
  duration?: number
}

// ---------- Singleton state ----------

const currentTrack = ref<PlayerTrack | null>(null)
const isPlaying = ref(false)
const progress = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const error = ref<string | null>(null)
const useSDK = ref(false)     // true = playing via SDK, false = preview_url fallback

// Preview fallback audio element
const audio = new Audio()
audio.crossOrigin = 'anonymous'
audio.volume = volume.value

let animFrame: number | null = null
let sdkPollInterval: ReturnType<typeof setInterval> | null = null

// ---------- Preview audio event listeners ----------

audio.addEventListener('ended', () => {
  isPlaying.value = false
  progress.value = 0
})

audio.addEventListener('error', () => {
  // Ignore audio element errors when using SDK playback
  if (useSDK.value) return
  // Ignore errors when audio has no source (e.g. after stop/cleanup)
  if (!audio.src || audio.src === window.location.href) return
  isPlaying.value = false
  error.value = 'Audio konnte nicht geladen werden'
  console.warn('[AudioPlayer] Audio error:', audio.error)
})

// ---------- Progress updates ----------

function updatePreviewProgress() {
  if (audio.duration) {
    progress.value = audio.currentTime / audio.duration
    duration.value = audio.duration
  }
  if (isPlaying.value && !useSDK.value) {
    animFrame = requestAnimationFrame(updatePreviewProgress)
  }
}

function startSDKPolling(spotifyPlayer: ReturnType<typeof useSpotifyPlayer>) {
  stopSDKPolling()
  sdkPollInterval = setInterval(async () => {
    const state = await spotifyPlayer.getState()
    if (state) {
      progress.value = state.duration > 0 ? state.position / state.duration : 0
      duration.value = state.duration / 1000 // convert ms to seconds
      isPlaying.value = !state.paused

      // Track ended
      if (state.paused && state.position === 0 && progress.value === 0) {
        // Could be end of track
      }
    } else {
      // No state - player might have been taken over by another device
      isPlaying.value = false
    }
  }, 500)
}

function stopSDKPolling() {
  if (sdkPollInterval) {
    clearInterval(sdkPollInterval)
    sdkPollInterval = null
  }
}

// ---------- Composable ----------

export function useAudioPlayer() {
  const spotifyPlayer = useSpotifyPlayer()

  async function play(track: PlayerTrack) {
    error.value = null
    const isSameTrack = currentTrack.value?.id === track.id
    currentTrack.value = track

    // Try SDK first (full playback)
    if (spotifyPlayer.connected.value && spotifyPlayer.isPremium.value && track.spotifyUri) {
      // Same track + playing -> pause
      if (isSameTrack && isPlaying.value && useSDK.value) {
        await spotifyPlayer.pausePlayback()
        isPlaying.value = false
        stopSDKPolling()
        return
      }

      // Same track + paused -> resume
      if (isSameTrack && !isPlaying.value && useSDK.value) {
        await spotifyPlayer.resumePlayback()
        isPlaying.value = true
        startSDKPolling(spotifyPlayer)
        return
      }

      // New track -> play via SDK
      stopPreviewPlayback()
      useSDK.value = true
      const ok = await spotifyPlayer.playTrackOnDevice(track.spotifyUri)
      if (ok) {
        isPlaying.value = true
        progress.value = 0
        error.value = null  // Clear any stale errors
        startSDKPolling(spotifyPlayer)
        return
      }
      // SDK play failed -> fall through to preview
      console.warn('[AudioPlayer] SDK play failed, trying preview fallback')
    }

    // Fallback: preview_url (30s)
    useSDK.value = false
    stopSDKPolling()

    if (!track.previewUrl) {
      // No preview available either
      isPlaying.value = false
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      error.value = 'Keine Vorschau verfuegbar - oeffne in Spotify'
      return
    }

    // Same track playing via preview -> pause
    if (isSameTrack && isPlaying.value) {
      pause()
      return
    }

    // Same track paused -> resume
    if (isSameTrack && !isPlaying.value && audio.src) {
      audio.play()
        .then(() => {
          isPlaying.value = true
          updatePreviewProgress()
        })
        .catch((err) => {
          console.warn('[AudioPlayer] Resume failed:', err)
          error.value = 'Playback fehlgeschlagen'
          isPlaying.value = false
        })
      return
    }

    // New track via preview
    audio.src = track.previewUrl
    audio.volume = volume.value
    progress.value = 0

    audio.play()
      .then(() => {
        isPlaying.value = true
        updatePreviewProgress()
      })
      .catch((err) => {
        console.warn('[AudioPlayer] Play failed:', err)
        error.value = 'Playback fehlgeschlagen'
        isPlaying.value = false
      })
  }

  function stopPreviewPlayback() {
    audio.pause()
    // Use removeAttribute instead of setting src='' to avoid triggering error event
    audio.removeAttribute('src')
    audio.load()
    if (animFrame) cancelAnimationFrame(animFrame)
  }

  function pause() {
    if (useSDK.value) {
      spotifyPlayer.pausePlayback()
      stopSDKPolling()
    } else {
      audio.pause()
      if (animFrame) cancelAnimationFrame(animFrame)
    }
    isPlaying.value = false
  }

  async function togglePlay() {
    if (!currentTrack.value) return

    if (isPlaying.value) {
      pause()
    } else {
      if (useSDK.value) {
        await spotifyPlayer.resumePlayback()
        isPlaying.value = true
        startSDKPolling(spotifyPlayer)
      } else if (currentTrack.value.previewUrl && audio.src) {
        audio.play()
          .then(() => {
            isPlaying.value = true
            updatePreviewProgress()
          })
          .catch((err) => {
            console.warn('[AudioPlayer] Toggle play failed:', err)
            error.value = 'Playback fehlgeschlagen'
          })
      } else if (currentTrack.value.spotifyUrl) {
        // No playback possible -> open in Spotify
        window.open(currentTrack.value.spotifyUrl, '_blank')
      }
    }
  }

  async function seek(pct: number) {
    if (useSDK.value) {
      const state = await spotifyPlayer.getState()
      if (state) {
        await spotifyPlayer.seekTo(Math.round(pct * state.duration))
        progress.value = pct
      }
    } else if (audio.duration) {
      audio.currentTime = pct * audio.duration
      progress.value = pct
    }
  }

  async function setVolume(v: number) {
    volume.value = v
    audio.volume = v
    if (useSDK.value) {
      await spotifyPlayer.setPlayerVolume(v)
    }
  }

  function stop() {
    if (useSDK.value) {
      spotifyPlayer.pausePlayback()
      stopSDKPolling()
    }
    stopPreviewPlayback()
    isPlaying.value = false
    currentTrack.value = null
    progress.value = 0
    duration.value = 0
    useSDK.value = false
    error.value = null
  }

  const isCurrentTrack = (id: string) => computed(() => currentTrack.value?.id === id)
  const isTrackPlaying = (id: string) => computed(() => currentTrack.value?.id === id && isPlaying.value)

  return {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    useSDK,
    error,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    stop,
    isCurrentTrack,
    isTrackPlaying,
    // Expose SDK connection
    connectSDK: spotifyPlayer.connectPlayer,
    sdkConnected: spotifyPlayer.connected,
    sdkError: spotifyPlayer.sdkError,
    isPremium: spotifyPlayer.isPremium,
  }
}
