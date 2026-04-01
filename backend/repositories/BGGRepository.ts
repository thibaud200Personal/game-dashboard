import type Database from 'better-sqlite3'
import type { BggGame } from '@shared/types'

export class BGGRepository {
  constructor(private db: Database.Database) {}

  search(query: string, limit = 20): BggGame[] {
    const rows = this.db.prepare(`
      SELECT bgg_id, name, year_published, is_expansion
      FROM bgg_catalog
      WHERE name LIKE ?
      ORDER BY
        CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
        name
      LIMIT ?
    `).all(`%${query}%`, `${query}%`, limit) as (BggGame & { is_expansion: number })[]
    return rows.map(r => ({ ...r, is_expansion: !!r.is_expansion }))
  }

  getImportLog(): { bgg_catalog_imported_at: string | null } {
    return this.db
      .prepare('SELECT bgg_catalog_imported_at FROM log_import WHERE id = 1')
      .get() as { bgg_catalog_imported_at: string | null }
  }

  recordCatalogImport(): void {
    this.db.prepare(
      'UPDATE log_import SET bgg_catalog_imported_at = CURRENT_TIMESTAMP WHERE id = 1'
    ).run()
  }

  upsertCatalogBatch(rows: BggGame[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO bgg_catalog (bgg_id, name, year_published, is_expansion)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(bgg_id) DO UPDATE SET
        name = excluded.name,
        year_published = excluded.year_published,
        is_expansion = excluded.is_expansion
    `)
    const insert = this.db.transaction((batch: BggGame[]) => {
      for (const row of batch) {
        stmt.run(row.bgg_id, row.name, row.year_published ?? null, row.is_expansion ? 1 : 0)
      }
    })
    insert(rows)
  }
}
