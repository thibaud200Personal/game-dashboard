import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { bggService } from '../../../bggService'

// Geekdo search response fixture
const geekdoSearchResponse = {
  search: 'wingspan',
  items: [
    { objecttype: 'thing', objectid: '266192', name: 'Wingspan' },
    { objecttype: 'thing', objectid: '266192', name: 'Wingspan (FR)' }, // doublon même ID
    { objecttype: 'thing', objectid: '123456', name: 'Wingspan Expansion' },
  ],
}

// Geekdo item response fixture
const geekdoItemResponse = {
  item: {
    objectid: 266192,
    name: 'Wingspan',
    description: 'A competitive bird game.',
    yearpublished: '2019',
    minplayers: '1',
    maxplayers: '5',
    minplaytime: '40',
    maxplaytime: '70',
    minage: '10',
    imageurl: 'https://cf.geekdo-images.com/large.jpg',
    images: { thumb: 'https://cf.geekdo-images.com/thumb.jpg' },
    stats: { average: 8.1, avgweight: 2.44 },
    links: {
      boardgamecategory: [{ objectid: '1', name: 'Animals' }],
      boardgamemechanic: [{ objectid: '2', name: 'Action Retrieval' }],
      boardgamefamily: [],
      boardgamedesigner: [{ objectid: '3', name: 'Elizabeth Hargrave' }],
      boardgamepublisher: [{ objectid: '4', name: 'Stonemaier Games' }],
      boardgameexpansion: [{ objectid: '266193', name: 'Wingspan: European Expansion' }],
    },
  },
}

function mockFetch(response: unknown, status = 200) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  } as Response)
}

beforeEach(() => {
  bggService.clearCache()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── searchGames ───────────────────────────────────────────────────────────────

describe('BGGService.searchGames', () => {
  it('retourne des résultats dédupliqués (même bgg_id)', async () => {
    mockFetch(geekdoSearchResponse)
    const results = await bggService.searchGames('wingspan')
    expect(Array.isArray(results)).toBe(true)
    // Les deux entrées "266192" doivent être dédupliquées → 1 seule
    const ids = results.map(r => r.id)
    expect(ids.filter(id => id === 266192)).toHaveLength(1)
  })

  it('retourne au maximum 15 résultats', async () => {
    const manyItems = Array.from({ length: 20 }, (_, i) => ({
      objecttype: 'thing',
      objectid: String(i + 1),
      name: `Game ${i + 1}`,
    }))
    mockFetch({ search: 'game', items: manyItems })
    const results = await bggService.searchGames('game')
    expect(results.length).toBeLessThanOrEqual(15)
  })

  it('retourne [] si la réponse ne contient pas d\'items', async () => {
    mockFetch({ search: 'nothing', items: [] })
    const results = await bggService.searchGames('nothing')
    expect(results).toEqual([])
  })

  it('lève une erreur si l\'API geekdo répond non-OK', async () => {
    mockFetch({ error: 'Service unavailable' }, 503)
    await expect(bggService.searchGames('wingspan')).rejects.toThrow('BGG search API error: 503')
  })

  it('filtre les items sans objectid ou nom valide', async () => {
    mockFetch({
      search: 'test',
      items: [
        { objecttype: 'thing', objectid: '', name: 'No ID' },
        { objecttype: 'thing', objectid: 'abc', name: 'NaN ID' },
        { objecttype: 'thing', objectid: '99999', name: '' },
        { objecttype: 'thing', objectid: '12345', name: 'Valid Game' },
      ],
    })
    const results = await bggService.searchGames('test')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(12345)
  })
})

// ── getGameDetails ────────────────────────────────────────────────────────────

describe('BGGService.getGameDetails', () => {
  it('parse correctement un item geekdo', async () => {
    mockFetch(geekdoItemResponse)
    const game = await bggService.getGameDetails(266192)

    expect(game).not.toBeNull()
    expect(game?.id).toBe(266192)
    expect(game?.name).toBe('Wingspan')
    expect(game?.year_published).toBe(2019)
    expect(game?.min_players).toBe(1)
    expect(game?.max_players).toBe(5)
    expect(game?.min_playtime).toBe(40)
    expect(game?.max_playtime).toBe(70)
    expect(game?.playing_time).toBe(70)
    expect(game?.min_age).toBe(10)
    expect(game?.rating).toBeCloseTo(8.1)
    expect(game?.weight).toBeCloseTo(2.44)
    expect(game?.designers).toContain('Elizabeth Hargrave')
    expect(game?.publishers).toContain('Stonemaier Games')
    expect(game?.categories).toContain('Animals')
    expect(game?.mechanics).toContain('Action Retrieval')
    expect(game?.characters).toEqual([])
  })

  it('peuple les expansions depuis boardgameexpansion', async () => {
    mockFetch(geekdoItemResponse)
    const game = await bggService.getGameDetails(266192)
    expect(game?.expansions).toHaveLength(1)
    expect(game?.expansions[0].bgg_expansion_id).toBe(266193)
    expect(game?.expansions[0].name).toBe('Wingspan: European Expansion')
  })

  it('retourne null si la réponse ne contient pas d\'item', async () => {
    mockFetch({ item: null })
    const game = await bggService.getGameDetails(99999)
    expect(game).toBeNull()
  })

  it('lève une erreur si l\'API répond non-OK', async () => {
    mockFetch({}, 502)
    await expect(bggService.getGameDetails(1)).rejects.toThrow('BGG geekdo API error: 502')
  })

  it('utilise le cache sur le deuxième appel (pas de second fetch)', async () => {
    const spy = mockFetch(geekdoItemResponse)
    await bggService.getGameDetails(266192)
    await bggService.getGameDetails(266192) // cache hit
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('is_expansion vrai quand expandsboardgame est renseigné', async () => {
    const expansionItem = {
      item: {
        ...geekdoItemResponse.item,
        objectid: 266193,
        links: {
          ...geekdoItemResponse.item.links,
          expandsboardgame: [{ objectid: '266192', name: 'Wingspan' }],
          boardgameexpansion: [],
        },
      },
    }
    mockFetch(expansionItem)
    const game = await bggService.getGameDetails(266193)
    expect(game?.is_expansion).toBe(true)
    expect(game?.base_game_id).toBe(266192)
  })
})

// ── cleanExpiredCache ─────────────────────────────────────────────────────────

describe('BGGService.cleanExpiredCache', () => {
  it('ne lève pas d\'erreur sur un cache vide', () => {
    expect(() => bggService.cleanExpiredCache()).not.toThrow()
  })

  it('entrée valide toujours présente après nettoyage (pas de second fetch)', async () => {
    mockFetch(geekdoItemResponse)
    await bggService.getGameDetails(266192)
    bggService.cleanExpiredCache() // n'expire pas les entrées fraîches
    vi.clearAllMocks() // reset call count du spy sans changer l'implémentation
    const spy = mockFetch(geekdoItemResponse)
    await bggService.getGameDetails(266192) // doit utiliser le cache
    expect(spy).not.toHaveBeenCalled()
  })
})

// ── mapWeightToDifficulty (via getGameDetails) ────────────────────────────────

describe('BGGService — mapWeightToDifficulty', () => {
  const difficulties = [
    { weight: 1.0, expected: 'Beginner' },
    { weight: 2.0, expected: 'Beginner' },
    { weight: 2.5, expected: 'Intermediate' },
    { weight: 3.5, expected: 'Intermediate' },
    { weight: 4.0, expected: 'Expert' },
  ]

  for (const { weight, expected } of difficulties) {
    it(`weight ${weight} → ${expected}`, async () => {
      mockFetch({ item: { ...geekdoItemResponse.item, stats: { avgweight: weight, average: 7 } } })
      const game = await bggService.getGameDetails(weight * 1000)
      expect(game?.difficulty).toBe(expected)
    })
  }
})

// ── determineGameModes (via getGameDetails) ───────────────────────────────────

describe('BGGService — determineGameModes', () => {
  function itemWithMechanics(mechanics: string[]) {
    return {
      item: {
        ...geekdoItemResponse.item,
        links: {
          ...geekdoItemResponse.item.links,
          boardgamemechanic: mechanics.map((n, i) => ({ objectid: String(i), name: n })),
        },
      },
    }
  }

  it('détecte cooperative', async () => {
    mockFetch(itemWithMechanics(['Cooperative Game']))
    const game = await bggService.getGameDetails(1001)
    expect(game?.supports_cooperative).toBe(true)
    expect(game?.supports_competitive).toBe(false)
  })

  it('détecte campaign (legacy)', async () => {
    mockFetch(itemWithMechanics(['Legacy Game']))
    const game = await bggService.getGameDetails(1002)
    expect(game?.supports_campaign).toBe(true)
  })

  it('détecte hybrid (traitor)', async () => {
    mockFetch(itemWithMechanics(['Traitor Game']))
    const game = await bggService.getGameDetails(1003)
    expect(game?.supports_hybrid).toBe(true)
  })

  it('compétitif par défaut sans mécanique coopérative', async () => {
    mockFetch(itemWithMechanics(['Deck Building']))
    const game = await bggService.getGameDetails(1004)
    expect(game?.supports_competitive).toBe(true)
    expect(game?.supports_cooperative).toBe(false)
  })
})
