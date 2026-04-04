import type Database from 'better-sqlite3'
import type { BGGSearchResult } from '@shared/types'
import type { BggCatalogRow, BggCatalogLangueRow } from '../database/parseBggCsv'

type BggRow = {
  bgg_id: number
  name: string
  year_published: number | null
  is_expansion: number
  rank: number | null
  bgg_rating: number | null
  abstracts_rank: number | null
  cgs_rank: number | null
  childrensgames_rank: number | null
  familygames_rank: number | null
  partygames_rank: number | null
  strategygames_rank: number | null
  thematic_rank: number | null
  wargames_rank: number | null
}

function deriveGameTypes(row: BggRow): string[] {
  const types: string[] = []
  if (row.strategygames_rank   != null) types.push('strategy')
  if (row.familygames_rank     != null) types.push('family')
  if (row.partygames_rank      != null) types.push('party')
  if (row.thematic_rank        != null) types.push('thematic')
  if (row.abstracts_rank       != null) types.push('abstract')
  if (row.wargames_rank        != null) types.push('war')
  if (row.childrensgames_rank  != null) types.push('children')
  if (row.cgs_rank             != null) types.push('customizable')
  return types
}

export class BGGRepository {
  constructor(private db: Database.Database) {}

  search(query: string, limit = 20): BGGSearchResult[] {
    const rows = this.db.prepare(`
      SELECT bgg_id, name, year_published, is_expansion,
             rank, bgg_rating,
             abstracts_rank, cgs_rank, childrensgames_rank,
             familygames_rank, partygames_rank, strategygames_rank,
             thematic_rank, wargames_rank
      FROM bgg_catalog
      WHERE name LIKE ?
      ORDER BY
        CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
        CASE WHEN rank IS NOT NULL THEN rank ELSE 999999 END,
        name
      LIMIT ?
    `).all(`%${query}%`, `${query}%`, limit) as BggRow[]

    return rows.map(r => ({
      bgg_id:        r.bgg_id,
      name:          r.name,
      year_published: r.year_published ?? undefined,
      is_expansion:  !!r.is_expansion,
      rank:          r.rank ?? undefined,
      bgg_rating:    r.bgg_rating ?? undefined,
      game_types:    deriveGameTypes(r),
    }))
  }

  getCatalogStatus(): { count: number; bgg_catalog_imported_at: string | null } {
    const { count } = this.db
      .prepare('SELECT COUNT(*) as count FROM bgg_catalog')
      .get() as { count: number }
    const { bgg_catalog_imported_at } = this.db
      .prepare('SELECT bgg_catalog_imported_at FROM log_import WHERE id = 1')
      .get() as { bgg_catalog_imported_at: string | null }
    return { count, bgg_catalog_imported_at }
  }

  recordCatalogImport(): void {
    this.db.prepare(
      'UPDATE log_import SET bgg_catalog_imported_at = CURRENT_TIMESTAMP WHERE id = 1'
    ).run()
  }

  /**
   * Copie dans bgg_catalog_langue les entrées de bgg_catalog absentes.
   * Les entrées existantes (déjà traduites ou en attente) ne sont pas touchées.
   * Retourne le nombre de nouvelles entrées insérées.
   */
  syncCatalogToLangue(): number {
    const result = this.db.prepare(`
      INSERT OR IGNORE INTO bgg_catalog_langue (
        bgg_id, name_en, name_fr, name_es,
        year_published, is_expansion,
        rank, bgg_rating, users_rated,
        abstracts_rank, cgs_rank, childrensgames_rank,
        familygames_rank, partygames_rank, strategygames_rank,
        thematic_rank, wargames_rank
      )
      SELECT
        bgg_id, name, NULL, NULL,
        year_published, is_expansion,
        rank, bgg_rating, users_rated,
        abstracts_rank, cgs_rank, childrensgames_rank,
        familygames_rank, partygames_rank, strategygames_rank,
        thematic_rank, wargames_rank
      FROM bgg_catalog
      WHERE bgg_id NOT IN (SELECT bgg_id FROM bgg_catalog_langue)
    `).run()
    return result.changes
  }

  getLangueStatus(): { count: number; pending_fr: number; pending_es: number } {
    const { count } = this.db.prepare(
      'SELECT COUNT(*) as count FROM bgg_catalog_langue'
    ).get() as { count: number }
    const { pending_fr } = this.db.prepare(
      'SELECT COUNT(*) as pending_fr FROM bgg_catalog_langue WHERE name_fr IS NULL'
    ).get() as { pending_fr: number }
    const { pending_es } = this.db.prepare(
      'SELECT COUNT(*) as pending_es FROM bgg_catalog_langue WHERE name_es IS NULL'
    ).get() as { pending_es: number }
    return { count, pending_fr, pending_es }
  }

  upsertCatalogLangueBatch(rows: BggCatalogLangueRow[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO bgg_catalog_langue (
        bgg_id, name_en, name_fr, name_es,
        year_published, is_expansion,
        rank, bgg_rating, users_rated,
        abstracts_rank, cgs_rank, childrensgames_rank,
        familygames_rank, partygames_rank, strategygames_rank,
        thematic_rank, wargames_rank
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(bgg_id) DO UPDATE SET
        name_en             = excluded.name_en,
        name_fr             = COALESCE(excluded.name_fr, bgg_catalog_langue.name_fr),
        name_es             = COALESCE(excluded.name_es, bgg_catalog_langue.name_es),
        year_published      = excluded.year_published,
        is_expansion        = excluded.is_expansion,
        rank                = excluded.rank,
        bgg_rating          = excluded.bgg_rating,
        users_rated         = excluded.users_rated,
        abstracts_rank      = excluded.abstracts_rank,
        cgs_rank            = excluded.cgs_rank,
        childrensgames_rank = excluded.childrensgames_rank,
        familygames_rank    = excluded.familygames_rank,
        partygames_rank     = excluded.partygames_rank,
        strategygames_rank  = excluded.strategygames_rank,
        thematic_rank       = excluded.thematic_rank,
        wargames_rank       = excluded.wargames_rank
    `)
    const insert = this.db.transaction((batch: BggCatalogLangueRow[]) => {
      for (const row of batch) {
        stmt.run(
          row.bgg_id, row.name_en, row.name_fr, row.name_es,
          row.year_published, row.is_expansion,
          row.rank, row.bgg_rating, row.users_rated,
          row.abstracts_rank, row.cgs_rank, row.childrensgames_rank,
          row.familygames_rank, row.partygames_rank, row.strategygames_rank,
          row.thematic_rank, row.wargames_rank
        )
      }
    })
    insert(rows)
  }

  upsertCatalogBatch(rows: BggCatalogRow[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO bgg_catalog (
        bgg_id, name, year_published, is_expansion,
        rank, bgg_rating, users_rated,
        abstracts_rank, cgs_rank, childrensgames_rank,
        familygames_rank, partygames_rank, strategygames_rank,
        thematic_rank, wargames_rank
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(bgg_id) DO UPDATE SET
        name                = excluded.name,
        year_published      = excluded.year_published,
        is_expansion        = excluded.is_expansion,
        rank                = excluded.rank,
        bgg_rating          = excluded.bgg_rating,
        users_rated         = excluded.users_rated,
        abstracts_rank      = excluded.abstracts_rank,
        cgs_rank            = excluded.cgs_rank,
        childrensgames_rank = excluded.childrensgames_rank,
        familygames_rank    = excluded.familygames_rank,
        partygames_rank     = excluded.partygames_rank,
        strategygames_rank  = excluded.strategygames_rank,
        thematic_rank       = excluded.thematic_rank,
        wargames_rank       = excluded.wargames_rank
    `)
    const insert = this.db.transaction((batch: BggCatalogRow[]) => {
      for (const row of batch) {
        stmt.run(
          row.bgg_id, row.name, row.year_published, row.is_expansion,
          row.rank, row.bgg_rating, row.users_rated,
          row.abstracts_rank, row.cgs_rank, row.childrensgames_rank,
          row.familygames_rank, row.partygames_rank, row.strategygames_rank,
          row.thematic_rank, row.wargames_rank
        )
      }
    })
    insert(rows)
  }
}
