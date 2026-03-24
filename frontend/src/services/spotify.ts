export const getTopArtists = async (token: string, timeRange: string = 'medium_term') => {
  const response = await fetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  const data = await response.json()
  return data.items
}
