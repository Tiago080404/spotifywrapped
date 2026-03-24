import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TopSongs from '../components/TopArtists.vue'
import { getTopArtists } from '@/services/spotify'
const fakeArtists = [
  { id: '1', name: 'Radiohead', images: [], genres: [], popularity: 82 },
  { id: '2', name: 'Tame Impala', images: [], genres: [], popularity: 79 },
]

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('spotify_token', 'fake-token')

  globalThis.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ items: fakeArtists }),
  })
})

/* describe('TopSongs fetch', () => {
  it('ruft die Spotify API auf und rendert die Artists', async () => {
    const wrapper = mount(TopSongs)
    await flushPromises()

    expect(wrapper.text()).toContain('Radiohead')
    expect(wrapper.text()).toContain('Tame Impala')
    expect(wrapper.findAll('.card')).toHaveLength(2)
  })

  it('')
}) */



describe('getTopArtists', () => {
  it('gibt die Artists aus der API-Antwort zurück', async () => {
    const result = await getTopArtists('fake-token')

    expect(result).toEqual(fakeArtists)
  })

  it('sendet den Token im Authorization-Header', async () => {
    await getTopArtists('mein-token-123')

    expect(globalThis.fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'Bearer mein-token-123' },
    })
  })

  it('setzt den time_range als Query-Parameter', async () => {
    await getTopArtists('fake-token', 'short_term')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/top/artists?time_range=short_term',
      expect.any(Object),
    )
  })
})
