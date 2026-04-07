export type TrackInput = {
  name: string
  artist: string
}

export type GenreCount = {
  genre: string
  count: number
}

type TopGenresPayload = {
  userId: string
  timeRange: string
  tracks: TrackInput[]
}

export async function getTopGenresFromSoundcharts(
  payload: TopGenresPayload,
): Promise<GenreCount[]> {
  console.log('[Genres] Requesting /soundcharts/top-genres', {
    userId: payload.userId,
    timeRange: payload.timeRange,
    tracksCount: payload.tracks.length,
    sampleTracks: payload.tracks.slice(0, 3),
  })

  const response = await fetch('http://127.0.0.1:3000/soundcharts/top-genres', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  console.log('[Genres] /soundcharts/top-genres response', {
    status: response.status,
    ok: response.ok,
  })

  if (!response.ok) {
    throw new Error(`Failed to load top genres: ${response.status}`)
  }

  const data = (await response.json()) as { genres?: GenreCount[] }
  console.log('[Genres] /soundcharts/top-genres payload parsed', {
    genresCount: data.genres?.length || 0,
    topGenres: (data.genres || []).slice(0, 5),
  })

  return data.genres || []
}
