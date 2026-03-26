const API = 'https://api.spotify.com/v1'

function headers(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export const getTopArtists = async (token: string, timeRange: string = 'medium_term', limit: number = 20) => {
  const res = await fetch(`${API}/me/top/artists?time_range=${timeRange}&limit=${limit}`, {
    headers: headers(token),
  })
  const data = await res.json()
  return data.items ?? []
}

export const getTopSongs = async (token: string, timeRange: string = 'medium_term', limit: number = 20) => {
  const res = await fetch(`${API}/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
    headers: headers(token),
  })
  const data = await res.json()
  return data.items ?? []
}

export const getUserProfile = async (token: string) => {
  const res = await fetch(`${API}/me`, {
    headers: headers(token),
  })
  return res.json()
}

export const getRecentlyPlayed = async (token: string, limit: number = 50) => {
  const res = await fetch(`${API}/me/player/recently-played?limit=${limit}`, {
    headers: headers(token),
  })
  const data = await res.json()
  return data.items ?? []
}

/**
 * Fetch top artists from ALL 3 time ranges and merge/deduplicate.
 * Returns up to ~150 unique artists (50 per range).
 * Items from short_term are prioritized (most recent listening).
 */
export const getAllTopArtists = async (token: string): Promise<any[]> => {
  const [short, medium, long] = await Promise.all([
    getTopArtists(token, 'short_term', 50),
    getTopArtists(token, 'medium_term', 50),
    getTopArtists(token, 'long_term', 50),
  ])

  const seen = new Set<string>()
  const merged: any[] = []

  // Priority: short > medium > long (most recent first)
  for (const artist of [...short, ...medium, ...long]) {
    if (!seen.has(artist.id)) {
      seen.add(artist.id)
      merged.push(artist)
    }
  }

  return merged
}

/**
 * Fetch top tracks from ALL 3 time ranges and merge/deduplicate.
 * Returns up to ~150 unique tracks (50 per range).
 */
export const getAllTopTracks = async (token: string): Promise<any[]> => {
  const [short, medium, long] = await Promise.all([
    getTopSongs(token, 'short_term', 50),
    getTopSongs(token, 'medium_term', 50),
    getTopSongs(token, 'long_term', 50),
  ])

  const seen = new Set<string>()
  const merged: any[] = []

  for (const track of [...short, ...medium, ...long]) {
    if (!seen.has(track.id)) {
      seen.add(track.id)
      merged.push(track)
    }
  }

  return merged
}

// Legacy aliases
export const getTopArtistsAll = async (token: string) => getTopArtists(token, 'long_term', 50)
export const getTopSongsAll = async (token: string) => getTopSongs(token, 'long_term', 50)

/**
 * Get song recommendations based on seed artists/tracks/genres.
 * Up to 5 seeds total (combined across all seed types).
 * Throws an error with status code if the API returns a non-OK response.
 */
export const getRecommendations = async (
  token: string,
  opts: {
    seedArtists?: string[]
    seedTracks?: string[]
    seedGenres?: string[]
    limit?: number
  },
): Promise<any[]> => {
  const params = new URLSearchParams()
  if (opts.seedArtists?.length) params.set('seed_artists', opts.seedArtists.slice(0, 5).join(','))
  if (opts.seedTracks?.length) params.set('seed_tracks', opts.seedTracks.slice(0, 5).join(','))
  if (opts.seedGenres?.length) params.set('seed_genres', opts.seedGenres.slice(0, 5).join(','))
  params.set('limit', String(opts.limit ?? 20))

  const res = await fetch(`${API}/recommendations?${params}`, {
    headers: headers(token),
  })

  if (!res.ok) {
    const err = new Error(`Recommendations API returned ${res.status}`) as any
    err.status = res.status
    throw err
  }

  const data = await res.json()
  return data.tracks ?? []
}

/**
 * Fallback: Search for tracks by genre keywords via the Spotify Search API.
 * Used when /v1/recommendations is unavailable (deprecated/403).
 * Searches for tracks matching the user's top genres and deduplicates results.
 */
export const searchTracksByGenres = async (
  token: string,
  genres: string[],
  limit: number = 30,
): Promise<any[]> => {
  if (!genres.length) return []

  // Search up to 5 genres, fetch tracks for each
  const genresToSearch = genres.slice(0, 5)
  const perGenre = Math.ceil(limit / genresToSearch.length)

  const results = await Promise.all(
    genresToSearch.map(async (genre) => {
      const params = new URLSearchParams({
        q: `genre:"${genre}"`,
        type: 'track',
        limit: String(Math.min(perGenre, 50)),
      })
      const res = await fetch(`${API}/search?${params}`, {
        headers: headers(token),
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.tracks?.items ?? []
    }),
  )

  // Flatten, deduplicate, shuffle
  const seen = new Set<string>()
  const merged: any[] = []
  for (const tracks of results) {
    for (const track of tracks) {
      if (!seen.has(track.id)) {
        seen.add(track.id)
        merged.push(track)
      }
    }
  }

  // Shuffle to mix genres together
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[merged[i], merged[j]] = [merged[j], merged[i]]
  }

  return merged.slice(0, limit)
}

/**
 * Fallback: Search for tracks by the user's top artist names.
 * Used when genre search yields poor results or no genres are available.
 */
export const searchTracksByArtists = async (
  token: string,
  artistNames: string[],
  limit: number = 30,
): Promise<any[]> => {
  if (!artistNames.length) return []

  const artistsToSearch = artistNames.slice(0, 5)
  const perArtist = Math.ceil(limit / artistsToSearch.length)

  const results = await Promise.all(
    artistsToSearch.map(async (name) => {
      const params = new URLSearchParams({
        q: `artist:"${name}"`,
        type: 'track',
        limit: String(Math.min(perArtist, 50)),
      })
      const res = await fetch(`${API}/search?${params}`, {
        headers: headers(token),
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.tracks?.items ?? []
    }),
  )

  const seen = new Set<string>()
  const merged: any[] = []
  for (const tracks of results) {
    for (const track of tracks) {
      if (!seen.has(track.id)) {
        seen.add(track.id)
        merged.push(track)
      }
    }
  }

  // Shuffle
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[merged[i], merged[j]] = [merged[j], merged[i]]
  }

  return merged.slice(0, limit)
}

/**
 * Create a new playlist on the user's account.
 * Throws on error so callers can display feedback.
 */
export const createPlaylist = async (
  token: string,
  userId: string,
  name: string,
  description: string = '',
  isPublic: boolean = false,
): Promise<any> => {
  const res = await fetch(`${API}/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      ...headers(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description, public: isPublic }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[Spotify] createPlaylist failed:', res.status, body)
    throw new Error(`Playlist erstellen fehlgeschlagen (${res.status})`)
  }

  return res.json()
}

/**
 * Add tracks to a playlist by URIs.
 * Throws on error so callers can display feedback.
 */
export const addTracksToPlaylist = async (
  token: string,
  playlistId: string,
  uris: string[],
): Promise<void> => {
  // Spotify allows max 100 URIs per request
  const chunks: string[][] = []
  for (let i = 0; i < uris.length; i += 100) {
    chunks.push(uris.slice(i, i + 100))
  }
  for (const chunk of chunks) {
    const res = await fetch(`${API}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        ...headers(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: chunk }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[Spotify] addTracksToPlaylist failed:', res.status, body)
      throw new Error(`Tracks hinzufuegen fehlgeschlagen (${res.status})`)
    }
  }
}

/**
 * Get user's saved/liked tracks from their library.
 * Requires user-library-read scope. Returns empty array on 403 (scope missing).
 */
export const getSavedTracks = async (token: string, limit: number = 50, offset: number = 0): Promise<any[]> => {
  const res = await fetch(`${API}/me/tracks?limit=${limit}&offset=${offset}`, {
    headers: headers(token),
  })
  if (!res.ok) return [] // Gracefully handle missing scope
  const data = await res.json()
  return (data.items ?? []).map((item: any) => item.track)
}

/**
 * Get all saved tracks (paginated, up to maxPages * 50).
 */
export const getAllSavedTracks = async (token: string, maxPages: number = 6): Promise<any[]> => {
  const all: any[] = []
  for (let page = 0; page < maxPages; page++) {
    const batch = await getSavedTracks(token, 50, page * 50)
    all.push(...batch)
    if (batch.length < 50) break // No more pages
  }
  return all
}

/**
 * Get artists related to a given artist.
 */
export const getRelatedArtists = async (token: string, artistId: string): Promise<any[]> => {
  const res = await fetch(`${API}/artists/${artistId}/related-artists`, {
    headers: headers(token),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.artists ?? []
}

/**
 * Get an artist's top tracks in a given market.
 */
export const getArtistTopTracks = async (token: string, artistId: string, market: string = 'DE'): Promise<any[]> => {
  const res = await fetch(`${API}/artists/${artistId}/top-tracks?market=${market}`, {
    headers: headers(token),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.tracks ?? []
}

/**
 * DISCOVERY ALGORITHM: Find songs the user has NEVER listened to.
 *
 * How it works:
 * 1. Collects ALL known tracks (top tracks all time ranges + recently played + saved library)
 * 2. Gets user's top artists, extracts genres
 * 3. Finds RELATED artists the user doesn't already listen to
 * 4. Grabs top tracks from those related artists
 * 5. Also searches by genre for variety
 * 6. Filters out ALL known track IDs
 * 7. Scores by relevance (related-artist depth, popularity sweet spot)
 * 8. Returns only truly undiscovered tracks
 */
export const discoverNewTracks = async (
  token: string,
  limit: number = 40,
): Promise<{ tracks: any[]; stats: DiscoveryStats }> => {
  // STEP 1: Build the "known tracks" set — everything the user has heard
  const [topTracks, recentItems, savedTracks, topArtists] = await Promise.all([
    getAllTopTracks(token),
    getRecentlyPlayed(token, 50),
    getAllSavedTracks(token, 6), // Up to 300 saved tracks
    getAllTopArtists(token),
  ])

  const knownTrackIds = new Set<string>()
  const knownArtistIds = new Set<string>()

  for (const t of topTracks) knownTrackIds.add(t.id)
  for (const item of recentItems) {
    if (item.track) knownTrackIds.add(item.track.id)
  }
  for (const t of savedTracks) {
    if (t?.id) knownTrackIds.add(t.id)
  }
  for (const a of topArtists) knownArtistIds.add(a.id)

  // Extract top genres
  const genreCount = new Map<string, number>()
  for (const artist of topArtists) {
    if (Array.isArray(artist.genres)) {
      for (const g of artist.genres) {
        genreCount.set(g, (genreCount.get(g) ?? 0) + 1)
      }
    }
  }
  const topGenres = [...genreCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([g]) => g)

  // STEP 2: Find related artists the user DOESN'T already listen to
  const seedArtists = topArtists.slice(0, 8)
  const relatedResults = await Promise.all(
    seedArtists.map((a) => getRelatedArtists(token, a.id)),
  )

  const relatedArtistMap = new Map<string, { artist: any; depth: number }>()
  relatedResults.forEach((related, idx) => {
    for (const ra of related) {
      if (!knownArtistIds.has(ra.id) && !relatedArtistMap.has(ra.id)) {
        relatedArtistMap.set(ra.id, { artist: ra, depth: idx })
      }
    }
  })

  // Pick up to 12 related artists, prioritizing those related to higher-ranked user artists
  const relatedArtists = [...relatedArtistMap.values()]
    .sort((a, b) => a.depth - b.depth)
    .slice(0, 12)

  // STEP 3: Get top tracks of related artists
  const relatedTrackResults = await Promise.all(
    relatedArtists.map((ra) => getArtistTopTracks(token, ra.artist.id)),
  )

  // STEP 4: Also search by top genres for variety
  const genreSearchResults = await Promise.all(
    topGenres.slice(0, 4).map(async (genre) => {
      const params = new URLSearchParams({
        q: `genre:"${genre}"`,
        type: 'track',
        limit: '20',
      })
      const res = await fetch(`${API}/search?${params}`, {
        headers: headers(token),
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.tracks?.items ?? []
    }),
  )

  // STEP 5: Merge all candidates, deduplicate, filter known
  const candidateMap = new Map<string, { track: any; score: number }>()

  // Tracks from related artists get higher scores (closer depth = higher)
  relatedTrackResults.forEach((tracks, idx) => {
    const ra = relatedArtists[idx]
    if (!ra) return
    const depthBonus = Math.max(0, 12 - ra.depth * 2)
    for (const track of tracks) {
      if (!knownTrackIds.has(track.id) && !candidateMap.has(track.id)) {
        // Score: depth bonus + popularity sweet spot (40-75 is ideal)
        const pop = track.popularity ?? 50
        const popScore = pop >= 30 && pop <= 80 ? 10 : (pop > 80 ? 3 : 5)
        candidateMap.set(track.id, {
          track,
          score: depthBonus + popScore + 20, // +20 base for being from related artist
        })
      }
    }
  })

  // Genre search tracks get a lower base score (less personalized)
  for (const tracks of genreSearchResults) {
    for (const track of tracks) {
      if (!knownTrackIds.has(track.id) && !candidateMap.has(track.id)) {
        const pop = track.popularity ?? 50
        const popScore = pop >= 30 && pop <= 80 ? 8 : 3
        candidateMap.set(track.id, {
          track,
          score: popScore + 5,
        })
      }
    }
  }

  // STEP 6: Sort by score, then add controlled randomness
  const sorted = [...candidateMap.values()]
    .sort((a, b) => b.score - a.score)

  // Take top candidates but shuffle within score tiers for variety
  const topCandidates = sorted.slice(0, Math.min(limit * 2, sorted.length))
  for (let i = topCandidates.length - 1; i > 0; i--) {
    // Only swap within nearby positions (partial shuffle for variety)
    const maxSwap = Math.min(5, i)
    const j = i - Math.floor(Math.random() * maxSwap)
    const a = topCandidates[i]!
    const b = topCandidates[j]!
    topCandidates[i] = b
    topCandidates[j] = a
  }

  const finalTracks = topCandidates.slice(0, limit).map((c) => c.track)

  const stats: DiscoveryStats = {
    knownTracksCount: knownTrackIds.size,
    relatedArtistsFound: relatedArtistMap.size,
    candidatesBeforeFilter: candidateMap.size + knownTrackIds.size,
    finalCount: finalTracks.length,
    topGenres: topGenres.slice(0, 5),
    relatedArtistNames: relatedArtists.slice(0, 6).map((ra) => ra.artist.name),
  }

  return { tracks: finalTracks, stats }
}

export interface DiscoveryStats {
  knownTracksCount: number
  relatedArtistsFound: number
  candidatesBeforeFilter: number
  finalCount: number
  topGenres: string[]
  relatedArtistNames: string[]
}

/**
 * Refresh the access token using the refresh_token.
 * Returns { access_token, refresh_token? }.
 * Call this when 401 is received.
 */
export const refreshAccessToken = async (): Promise<{ access_token: string; refresh_token?: string } | null> => {
  const refreshToken = localStorage.getItem('spotify_refresh_token')
  if (!refreshToken) return null

  try {
    const res = await fetch(`/api/refresh?refresh_token=${encodeURIComponent(refreshToken)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.access_token) {
      localStorage.setItem('spotify_token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token)
      }
    }
    return data
  } catch {
    return null
  }
}

/**
 * Wrapper that auto-refreshes token on 401 and retries.
 */
export async function fetchWithRefresh<T>(fn: (token: string) => Promise<T>): Promise<T> {
  const token = localStorage.getItem('spotify_token') || ''
  try {
    const result = await fn(token)
    return result
  } catch (err: any) {
    // Try refresh
    const refreshed = await refreshAccessToken()
    if (refreshed?.access_token) {
      return fn(refreshed.access_token)
    }
    throw err
  }
}
