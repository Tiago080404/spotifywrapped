/**
 * Spotify Web Playback SDK composable.
 *
 * Manages the SDK player instance, device registration, and playback
 * via the Spotify Web API (PUT /me/player/play).
 *
 * Requirements:
 * - Spotify Premium account
 * - OAuth scopes: streaming, user-modify-playback-state, user-read-playback-state
 * - SDK script loaded: <script src="https://sdk.scdn.co/spotify-player.js">
 */

import { ref, readonly } from 'vue'

// ---------- Types ----------

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: {
      Player: new (opts: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume?: number
      }) => SpotifyPlayer
    }
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>
  disconnect: () => void
  addListener: (event: string, cb: (...args: any[]) => void) => void
  removeListener: (event: string) => void
  getCurrentState: () => Promise<SpotifyPlaybackState | null>
  setName: (name: string) => Promise<void>
  getVolume: () => Promise<number>
  setVolume: (vol: number) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  togglePlay: () => Promise<void>
  seek: (posMs: number) => Promise<void>
  previousTrack: () => Promise<void>
  nextTrack: () => Promise<void>
}

interface SpotifyPlaybackState {
  paused: boolean
  position: number
  duration: number
  track_window: {
    current_track: {
      id: string
      uri: string
      name: string
      album: {
        name: string
        uri: string
        images: { url: string }[]
      }
      artists: { name: string; uri: string }[]
    }
  }
}

// ---------- Singleton state ----------

const player = ref<SpotifyPlayer | null>(null)
const deviceId = ref<string | null>(null)
const sdkReady = ref(false)
const connected = ref(false)
const sdkError = ref<string | null>(null)
const isPremium = ref(true) // assume true until proven otherwise

let initPromise: Promise<void> | null = null

// ---------- Init ----------

function initSDK(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = new Promise<void>((resolve) => {
    // SDK may already be loaded
    if (window.Spotify) {
      sdkReady.value = true
      resolve()
      return
    }

    // Wait for SDK ready callback
    window.onSpotifyWebPlaybackSDKReady = () => {
      sdkReady.value = true
      resolve()
    }

    // If the script was already in DOM but not ready yet, just wait
    // If not, it's loaded via index.html <script> tag
  })

  return initPromise
}

// ---------- Composable ----------

export function useSpotifyPlayer() {
  async function connectPlayer(): Promise<boolean> {
    const token = localStorage.getItem('spotify_token')
    if (!token) {
      sdkError.value = 'Kein Token vorhanden'
      return false
    }

    await initSDK()

    if (!window.Spotify) {
      sdkError.value = 'Spotify SDK konnte nicht geladen werden'
      return false
    }

    // Don't double-connect
    if (player.value && connected.value && deviceId.value) {
      return true
    }

    // Disconnect old player if any
    if (player.value) {
      try { player.value.disconnect() } catch {}
    }

    return new Promise<boolean>((resolve) => {
      const p = new window.Spotify.Player({
        name: 'Spotify Wrapped Player',
        getOAuthToken: (cb) => {
          const t = localStorage.getItem('spotify_token') || ''
          cb(t)
        },
        volume: 0.7,
      })

      p.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('[SpotifySDK] Ready, device_id:', device_id)
        deviceId.value = device_id
        connected.value = true
        sdkError.value = null
        resolve(true)
      })

      p.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.warn('[SpotifySDK] Device went offline:', device_id)
        connected.value = false
      })

      p.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('[SpotifySDK] Init error:', message)
        sdkError.value = message
        connected.value = false
        resolve(false)
      })

      p.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('[SpotifySDK] Auth error:', message)
        sdkError.value = 'Premium erforderlich oder Token abgelaufen'
        isPremium.value = false
        connected.value = false
        resolve(false)
      })

      p.addListener('account_error', ({ message }: { message: string }) => {
        console.error('[SpotifySDK] Account error:', message)
        sdkError.value = 'Spotify Premium erforderlich'
        isPremium.value = false
        connected.value = false
        resolve(false)
      })

      p.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('[SpotifySDK] Playback error:', message)
        sdkError.value = message
      })

      p.connect()
      player.value = p
    })
  }

  /**
   * Play a track by its Spotify URI (spotify:track:xxx).
   * Uses the Web API to start playback on our SDK device.
   */
  async function playTrackOnDevice(spotifyUri: string): Promise<boolean> {
    const token = localStorage.getItem('spotify_token')
    if (!token || !deviceId.value) {
      console.warn('[SpotifySDK] Cannot play: no token or device')
      return false
    }

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [spotifyUri] }),
        },
      )

      if (res.status === 403) {
        sdkError.value = 'Spotify Premium erforderlich'
        isPremium.value = false
        return false
      }

      if (!res.ok) {
        const err = await res.text()
        console.error('[SpotifySDK] Play API error:', res.status, err)
        sdkError.value = 'Wiedergabe fehlgeschlagen'
        return false
      }

      return true
    } catch (err) {
      console.error('[SpotifySDK] Play fetch error:', err)
      sdkError.value = 'Netzwerkfehler'
      return false
    }
  }

  async function pausePlayback(): Promise<void> {
    if (player.value) {
      try { await player.value.pause() } catch {}
    }
  }

  async function resumePlayback(): Promise<void> {
    if (player.value) {
      try { await player.value.resume() } catch {}
    }
  }

  async function togglePlayback(): Promise<void> {
    if (player.value) {
      try { await player.value.togglePlay() } catch {}
    }
  }

  async function seekTo(posMs: number): Promise<void> {
    if (player.value) {
      try { await player.value.seek(posMs) } catch {}
    }
  }

  async function setPlayerVolume(vol: number): Promise<void> {
    if (player.value) {
      try { await player.value.setVolume(vol) } catch {}
    }
  }

  async function getState(): Promise<SpotifyPlaybackState | null> {
    if (!player.value) return null
    try {
      return await player.value.getCurrentState()
    } catch {
      return null
    }
  }

  function disconnectPlayer(): void {
    if (player.value) {
      try { player.value.disconnect() } catch {}
    }
    player.value = null
    deviceId.value = null
    connected.value = false
  }

  return {
    player: readonly(player),
    deviceId: readonly(deviceId),
    sdkReady: readonly(sdkReady),
    connected: readonly(connected),
    sdkError: readonly(sdkError),
    isPremium: readonly(isPremium),
    connectPlayer,
    playTrackOnDevice,
    pausePlayback,
    resumePlayback,
    togglePlayback,
    seekTo,
    setPlayerVolume,
    getState,
    disconnectPlayer,
  }
}
