import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../database/DatabaseConnection'

let conn: DatabaseConnection

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
})

afterEach(() => {
  conn.close()
})

describe('DatabaseConnection', () => {
  it('creates schema_version table on first run', () => {
    const row = conn.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'")
      .get()
    expect(row).toBeDefined()
  })

  it('applies migrations in order — players table exists', () => {
    const row = conn.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='players'")
      .get()
    expect(row).toBeDefined()
  })

  it('does not apply a migration twice', () => {
    expect(() => conn.runPendingMigrations()).not.toThrow()
  })

  it('schema_version tracks applied migrations', () => {
    const rows = conn.db
      .prepare('SELECT filename FROM schema_version ORDER BY filename')
      .all() as { filename: string }[]
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].filename).toMatch(/^\d{3}_/)
  })

  it('players table has no dead stats columns', () => {
    const cols = (conn.db.pragma('table_info(players)') as { name: string }[]).map(c => c.name)
    expect(cols).not.toContain('games_played')
    expect(cols).not.toContain('wins')
    expect(cols).not.toContain('total_score')
    expect(cols).not.toContain('average_score')
  })

  it('games table has no game_type column', () => {
    const cols = (conn.db.pragma('table_info(games)') as { name: string }[]).map(c => c.name)
    expect(cols).not.toContain('game_type')
  })

  it('game_sessions accepts hybrid session_type', () => {
    conn.db.exec(`INSERT INTO players (player_name, pseudo) VALUES ('Alice', 'alice')`)
    conn.db.exec(`
      INSERT INTO games (name, min_players, max_players,
        supports_cooperative, supports_competitive, supports_campaign, supports_hybrid,
        has_expansion, has_characters, is_expansion)
      VALUES ('Gloomhaven', 1, 4, 1, 0, 1, 1, 1, 1, 0)
    `)
    expect(() => {
      conn.db.exec(`INSERT INTO game_sessions (game_id, session_type) VALUES (1, 'hybrid')`)
    }).not.toThrow()
  })

  it('player_statistics view exists (created by migration 007) and returns rows', () => {
    conn.db.exec(`INSERT INTO players (player_name, pseudo) VALUES ('Bob', 'bob')`)
    const rows = conn.db.prepare('SELECT * FROM player_statistics').all()
    expect(rows).toHaveLength(1)
  })
})
