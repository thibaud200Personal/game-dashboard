import type Database from 'better-sqlite3'
import type { BGGSearchResult } from '@shared/types'
import type { BggCatalogRow } from '../database/parseBggCsv'

type BggRow = { bgg_id: number; name: string; year_published: number | null; is_expansion: number }

export class BGGRepository {
  constructor(private db: Database.Database) {}

  search(query: string, limit = 20): BGGSearchResult[] {
    const rows = this.db.prepare(`
      SELECT bgg_id, name, year_published, is_expansion
      FROM bgg_catalog
      WHERE name LIKE ?
      ORDER BY
        CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
        name
      LIMIT ?
    `).all(`%${query}%`, `${query}%`, limit) as BggRow[]
    return rows.map(r => ({ ...r, is_expansion: !!r.is_expansion, year_published: r.year_published ?? undefined }))
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

  upsertCatalogBatch(rows: BggCatalogRow[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO bgg_catalog (bgg_id, name, year_published, is_expansion)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(bgg_id) DO UPDATE SET
        name = excluded.name,
        year_published = excluded.year_published,
        is_expansion = excluded.is_expansion
    `)
    const insert = this.db.transaction((batch: BggCatalogRow[]) => {
      for (const row of batch) {
        stmt.run(row.bgg_id, row.name, row.year_published, row.is_expansion)
      }
    })
    insert(rows)
  }
}
