export const getTopArtists = async (token: string, timeRange: string = 'medium_term') => {
  if (!token) {
    return []
  }

  const response = await fetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return Array.isArray(data.items) ? data.items : []
}
export const getTopSongs = async (token: string, timeRange: string = 'medium_term') => {
  const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json()
  return data.items
}
