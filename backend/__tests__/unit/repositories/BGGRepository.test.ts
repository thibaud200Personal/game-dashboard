import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { BGGRepository } from '../../../repositories/BGGRepository'

let conn: DatabaseConnection
let repo: BGGRepository

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  repo = new BGGRepository(conn.db)
})

afterEach(() => conn.close())

const catalog = [
  { bgg_id: 266192, name: 'Wingspan',          year_published: 2019, is_expansion: 0 },
  { bgg_id: 174430, name: 'Gloomhaven',         year_published: 2017, is_expansion: 0 },
  { bgg_id: 266193, name: 'Wingspan: European', year_published: 2019, is_expansion: 1 },
]

describe('BGGRepository.upsertCatalogBatch', () => {
  it('insère un lot de jeux', () => {
    repo.upsertCatalogBatch(catalog)
    const { count } = conn.db.prepare('SELECT COUNT(*) as count FROM bgg_catalog').get() as { count: number }
    expect(count).toBe(3)
  })

  it('met à jour les entrées existantes (upsert)', () => {
    repo.upsertCatalogBatch(catalog)
    repo.upsertCatalogBatch([{ bgg_id: 266192, name: 'Wingspan Updated', year_published: 2019, is_expansion: 0 }])
    const row = conn.db.prepare('SELECT name FROM bgg_catalog WHERE bgg_id = 266192').get() as { name: string }
    expect(row.name).toBe('Wingspan Updated')
  })

  it('ne duplique pas les entrées', () => {
    repo.upsertCatalogBatch(catalog)
    repo.upsertCatalogBatch(catalog)
    const { count } = conn.db.prepare('SELECT COUNT(*) as count FROM bgg_catalog').get() as { count: number }
    expect(count).toBe(3)
  })
})

describe('BGGRepository.search', () => {
  beforeEach(() => repo.upsertCatalogBatch(catalog))

  it('retourne les jeux correspondant au nom', () => {
    const results = repo.search('Wingspan')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.name.includes('Wingspan'))).toBe(true)
  })

  it('recherche insensible à la casse', () => {
    const results = repo.search('wingspan')
    expect(results.length).toBeGreaterThan(0)
  })

  it('retourne is_expansion comme boolean', () => {
    const results = repo.search('Wingspan')
    const expansion = results.find(r => r.name.includes('European'))
    expect(typeof expansion?.is_expansion).toBe('boolean')
    expect(expansion?.is_expansion).toBe(true)
  })

  it('retourne [] pour une query sans résultat', () => {
    expect(repo.search('zzznomatch')).toEqual([])
  })

  it('respecte la limite de résultats', () => {
    const big = Array.from({ length: 25 }, (_, i) => ({
      bgg_id: 1000 + i,
      name: `Game ${i}`,
      year_published: 2020,
      is_expansion: 0 as 0,
    }))
    repo.upsertCatalogBatch(big)
    const results = repo.search('Game', 5)
    expect(results.length).toBeLessThanOrEqual(5)
  })

  it('retourne year_published undefined si null en BDD', () => {
    repo.upsertCatalogBatch([{ bgg_id: 99999, name: 'No Year', year_published: null as unknown as number, is_expansion: 0 }])
    const results = repo.search('No Year')
    expect(results[0].year_published).toBeUndefined()
  })

  it('prioritise les correspondances exactes de début de nom', () => {
    const results = repo.search('Wing')
    // "Wingspan" commence par "Wing" → doit apparaître en premier
    expect(results[0].name).toMatch(/^Wing/)
  })
})

describe('BGGRepository.getCatalogStatus', () => {
  it('retourne count=0 et bgg_catalog_imported_at=null avant import', () => {
    const status = repo.getCatalogStatus()
    expect(status.count).toBe(0)
    expect(status.bgg_catalog_imported_at).toBeNull()
  })

  it('retourne le bon count après upsert', () => {
    repo.upsertCatalogBatch(catalog)
    const status = repo.getCatalogStatus()
    expect(status.count).toBe(3)
  })
})

describe('BGGRepository.recordCatalogImport', () => {
  it('met à jour bgg_catalog_imported_at', () => {
    repo.recordCatalogImport()
    const status = repo.getCatalogStatus()
    expect(status.bgg_catalog_imported_at).not.toBeNull()
  })
})

describe('BGGRepository.syncCatalogToLanguage', () => {
  it('copie les entrées de bgg_catalog dans bgg_catalog_language', () => {
    repo.upsertCatalogBatch([
      { bgg_id: 266192, name: 'Wingspan', year_published: 2019, is_expansion: 0,
        rank: null, bgg_rating: null, users_rated: null,
        abstracts_rank: null, cgs_rank: null, childrensgames_rank: null,
        familygames_rank: null, partygames_rank: null, strategygames_rank: 5,
        thematic_rank: null, wargames_rank: null },
    ])
    const inserted = repo.syncCatalogToLanguage()
    expect(inserted).toBe(0) // upsertCatalogBatch already syncs language, so 0 new rows
    const status = repo.getLanguageStatus()
    expect(status.count).toBe(1)
  })

  it('ne duplique pas les entrées déjà présentes', () => {
    repo.upsertCatalogBatch([
      { bgg_id: 266192, name: 'Wingspan', year_published: 2019, is_expansion: 0,
        rank: null, bgg_rating: null, users_rated: null,
        abstracts_rank: null, cgs_rank: null, childrensgames_rank: null,
        familygames_rank: null, partygames_rank: null, strategygames_rank: 5,
        thematic_rank: null, wargames_rank: null },
    ])
    repo.syncCatalogToLanguage()
    const second = repo.syncCatalogToLanguage()
    expect(second).toBe(0)
  })
})

describe('BGGRepository.upsertLanguageNames', () => {
  beforeEach(() => {
    repo.upsertCatalogBatch([
      { bgg_id: 266192, name: 'Wingspan', year_published: 2019, is_expansion: 0,
        rank: null, bgg_rating: null, users_rated: null,
        abstracts_rank: null, cgs_rank: null, childrensgames_rank: null,
        familygames_rank: null, partygames_rank: null, strategygames_rank: 5,
        thematic_rank: null, wargames_rank: null },
    ])
    repo.syncCatalogToLanguage()
  })

  it('met à jour name_fr sans écraser name_en existant', () => {
    repo.upsertLanguageNames([{ bgg_id: 266192, name_fr: 'Envol' }])
    const status = repo.getLanguageStatus()
    expect(status.pending_fr).toBe(0)
    expect(status.pending_es).toBe(1)
  })

  it('ne plante pas sur un bgg_id absent de bgg_catalog_language', () => {
    expect(() =>
      repo.upsertLanguageNames([{ bgg_id: 99999, name_fr: 'Fantôme' }])
    ).not.toThrow()
  })
})

describe('BGGRepository.getLanguageStatus', () => {
  it('retourne count=0 sur table vide', () => {
    const s = repo.getLanguageStatus()
    expect(s.count).toBe(0)
    expect(s.pending_fr).toBe(0)
    expect(s.pending_es).toBe(0)
  })
})

describe('BGGRepository.upsertThumbnail', () => {
  beforeEach(() => {
    repo.upsertCatalogBatch([
      { bgg_id: 266192, name: 'Wingspan', year_published: 2019, is_expansion: 0,
        rank: null, bgg_rating: null, users_rated: null,
        abstracts_rank: null, cgs_rank: null, childrensgames_rank: null,
        familygames_rank: null, partygames_rank: null, strategygames_rank: 5,
        thematic_rank: null, wargames_rank: null },
    ])
    repo.syncCatalogToLanguage()
  })

  it('écrit le thumbnail dans bgg_catalog_language', () => {
    repo.upsertThumbnail(266192, 'https://example.com/thumb.jpg')
    const row = conn.db.prepare('SELECT thumbnail FROM bgg_catalog_language WHERE bgg_id = 266192').get() as { thumbnail: string }
    expect(row.thumbnail).toBe('https://example.com/thumb.jpg')
  })

  it('écrase un thumbnail existant', () => {
    repo.upsertThumbnail(266192, 'https://example.com/old.jpg')
    repo.upsertThumbnail(266192, 'https://example.com/new.jpg')
    const row = conn.db.prepare('SELECT thumbnail FROM bgg_catalog_language WHERE bgg_id = 266192').get() as { thumbnail: string }
    expect(row.thumbnail).toBe('https://example.com/new.jpg')
  })

  it('ne plante pas sur un bgg_id absent de bgg_catalog_language', () => {
    expect(() => repo.upsertThumbnail(99999, 'https://example.com/thumb.jpg')).not.toThrow()
  })
})
