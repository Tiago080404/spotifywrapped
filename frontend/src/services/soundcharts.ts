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
  const response = await fetch('http://127.0.0.1:3000/soundcharts/top-genres', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to load top genres: ${response.status}`)
  }

  const data = (await response.json()) as { genres?: GenreCount[] }

  return data.genres || []
}
