import type Database from 'better-sqlite3'
import type { LocaleInfo } from '@shared/types'

export class LabelsRepository {
  constructor(private db: Database.Database) {}

  getByLocale(locale: string): Record<string, string> {
    const rows = this.db
      .prepare('SELECT key, value FROM labels WHERE locale = ?')
      .all(locale) as { key: string; value: string }[]
    return Object.fromEntries(rows.map(r => [r.key, r.value]))
  }

  getAvailableLocales(): LocaleInfo[] {
    const rows = this.db
      .prepare(`
        SELECT l.locale,
               COALESCE(n.value, l.locale) AS name
        FROM labels l
        LEFT JOIN labels n
          ON n.key = 'locale.' || l.locale || '.name'
         AND n.locale = l.locale
        GROUP BY l.locale
        ORDER BY l.locale
      `)
      .all() as { locale: string; name: string }[]
    return rows
  }
}
