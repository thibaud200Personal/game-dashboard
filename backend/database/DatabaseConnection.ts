import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

export class DatabaseConnection {
  readonly db: Database.Database

  constructor(dbPath: string) {
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this._ensureSchemaVersionTable()
    this.runPendingMigrations()
  }

  private _ensureSchemaVersionTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  runPendingMigrations(): void {
    const applied = new Set(
      (this.db.prepare('SELECT filename FROM schema_version').all() as { filename: string }[])
        .map(r => r.filename)
    )

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (applied.has(file)) continue

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')

      // Guard: skip migration 004 if dead columns are already absent
      if (file === '004_remove_dead_stats_columns.sql') {
        const cols = (this.db.pragma('table_info(players)') as { name: string }[]).map(c => c.name)
        if (!cols.includes('games_played')) {
          this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
          continue
        }
      }

      // Guard: skip migration 005 if game_type column is already absent
      if (file === '005_remove_game_type.sql') {
        const cols = (this.db.pragma('table_info(games)') as { name: string }[]).map(c => c.name)
        if (!cols.includes('game_type')) {
          this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
          continue
        }
      }

      // Guard: skip migration 006 if session_type CHECK already includes 'hybrid'
      if (file === '006_add_hybrid_session_type.sql') {
        const row = this.db.prepare(
          "SELECT sql FROM sqlite_master WHERE type='table' AND name='game_sessions'"
        ).get() as { sql: string } | undefined
        if (row?.sql?.includes("'hybrid'")) {
          this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
          continue
        }
      }

      // Guard: skip migration 008 if bgg_catalog already has extended columns
      if (file === '008_extend_bgg_catalog.sql') {
        const cols = (this.db.pragma('table_info(bgg_catalog)') as { name: string }[]).map(c => c.name)
        if (cols.includes('rank')) {
          this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
          continue
        }
      }

      // Guard: skip migration 010 if bgg_catalog_langue was already renamed
      if (file === '010_rename_bgg_catalog_langue.sql') {
        const tables = (this.db.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='bgg_catalog_langue'"
        ).all() as { name: string }[])
        if (tables.length === 0) {
          this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
          continue
        }
        // Safety: abort if bgg_catalog_language already exists with data — the migration
        // would silently DROP it before renaming bgg_catalog_langue.
        const targetExists = (this.db.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='bgg_catalog_language'"
        ).all() as { name: string }[]).length > 0
        if (targetExists) {
          const count = (this.db.prepare('SELECT COUNT(*) as n FROM bgg_catalog_language').get() as { n: number }).n
          if (count > 0) {
            throw new Error(
              'Migration 010 aborted: bgg_catalog_language already exists with data. ' +
              'Drop or rename it manually before running this migration.'
            )
          }
        }
      }

      // better-sqlite3 blocks exec() inside any active transaction (including savepoints).
      // Run exec() directly — if it throws, schema_version is not updated, so the migration
      // will be retried on next startup (safe: DDL statements use IF NOT EXISTS).
      try {
        this.db.exec(sql)
      } catch (e) {
        throw new Error(`Migration ${file} failed: ${e instanceof Error ? e.message : String(e)}`)
      }
      this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
    }
  }

  close(): void {
    this.db.close()
  }
}

// Singleton for production use — NOT initialized on import to avoid side-effects in tests.
// Import and call getDb() in server.ts.
let _dbConnection: DatabaseConnection | null = null
export function getDb(): DatabaseConnection {
  if (!_dbConnection) {
    const dbPath = process.env.DB_PATH ?? path.join(__dirname, 'board_game_score.db')
    _dbConnection = new DatabaseConnection(dbPath)
  }
  return _dbConnection
}
