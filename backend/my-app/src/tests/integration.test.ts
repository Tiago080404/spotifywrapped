import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/redis', () => ({
  client: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

import { app } from '../app.js'
import { client } from '../lib/redis.js'

describe('Integrationstest: Cache-Routen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('speichert Daten über POST und liest sie über GET wieder aus', async () => {
    vi.mocked(client.set).mockResolvedValue('OK')

    const trackDaten = {
      userId: 'benutzer123',
      favTracks: [{ name: 'Blinding Lights', artist: 'The Weeknd' }],
      timeRange: 'short_term',
      setting: 'top-tracks',
    }

    const postAntwort = await app.request('/setCachedData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackDaten),
    })

    expect(postAntwort.status).toBe(200)
    const postJson = (await postAntwort.json()) as { success: boolean }
    expect(postJson.success).toBe(true)

    expect(client.set).toHaveBeenCalledWith(
      'user:benutzer123:top-tracks:short_term',
      JSON.stringify(trackDaten.favTracks),
      { EX: 3600 },
    )

    vi.mocked(client.get).mockResolvedValue(JSON.stringify(trackDaten.favTracks))

    const getAntwort = await app.request(
      '/getCachedData?userId=benutzer123&timeRange=short_term&setting=top-tracks',
    )

    expect(getAntwort.status).toBe(200)
    const getJson = (await getAntwort.json()) as { cached: unknown }
    expect(getJson.cached).toEqual(trackDaten.favTracks)
  })

  it('gibt null zurück wenn keine Daten im Cache sind', async () => {
    vi.mocked(client.get).mockResolvedValue(null)

    const antwort = await app.request(
      '/getCachedData?userId=neuerUser&timeRange=long_term&setting=top-artists',
    )

    expect(antwort.status).toBe(200)
    const json = (await antwort.json()) as { cached: null }
    expect(json.cached).toBeNull()
  })

  it('GET / gibt "Hello Hono!" zurück', async () => {
    const antwort = await app.request('/')
    expect(antwort.status).toBe(200)
    expect(await antwort.text()).toBe('Hello Hono!')
  })

  it('GET /exchange ohne Code gibt Status 400 zurück', async () => {
    const antwort = await app.request('/exchange')
    expect(antwort.status).toBe(400)
    const json = (await antwort.json()) as { error: string }
    expect(json.error).toBe('code fehlt')
  })
})
