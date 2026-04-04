import { Router } from 'express'
import type Database from 'better-sqlite3'
import { requireRole } from '../middleware/requireRole'
import type { AuthRequest } from '../middleware/auth'

interface ExportedData {
  exported_at: string
  version: number
  players: unknown[]
  games: unknown[]
  game_expansions: unknown[]
  game_characters: unknown[]
  game_sessions: unknown[]
  session_players: unknown[]
}

export function createDataRouter(db: Database.Database): Router {
  const router = Router()

  // GET /api/v1/data/export — admin only
  router.get('/export', requireRole('admin'), (_req: AuthRequest, res) => {
    const data: ExportedData = {
      exported_at: new Date().toISOString(),
      version: 1,
      players:         db.prepare('SELECT * FROM players').all(),
      games:           db.prepare('SELECT * FROM games').all(),
      game_expansions: db.prepare('SELECT * FROM game_expansions').all(),
      game_characters: db.prepare('SELECT * FROM game_characters').all(),
      game_sessions:   db.prepare('SELECT * FROM game_sessions').all(),
      session_players: db.prepare('SELECT * FROM session_players').all(),
    }
    res
      .setHeader('Content-Disposition', `attachment; filename="board-game-dashboard-${data.exported_at.slice(0, 10)}.json"`)
      .setHeader('Content-Type', 'application/json')
      .json(data)
  })

  // POST /api/v1/data/import — admin only
  router.post('/import', requireRole('admin'), (req: AuthRequest, res) => {
    const data = req.body as Partial<ExportedData>
    if (!data || typeof data !== 'object' || data.version !== 1) {
      res.status(400).json({ error: 'Format invalide : fichier export v1 attendu' })
      return
    }

    const tables: (keyof Omit<ExportedData, 'exported_at' | 'version'>)[] = [
      'players', 'games', 'game_expansions', 'game_characters', 'game_sessions', 'session_players',
    ]

    db.transaction(() => {
      db.pragma('foreign_keys = OFF')
      // Vider dans l'ordre inverse des FK
      ;[...tables].reverse().forEach(t => db.prepare(`DELETE FROM ${t}`).run())

      for (const table of tables) {
        const rows = data[table]
        if (!Array.isArray(rows) || rows.length === 0) continue
        const cols = Object.keys(rows[0] as object)
        const placeholders = cols.map(() => '?').join(', ')
        const stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`)
        for (const row of rows) {
          stmt.run(...cols.map(c => (row as Record<string, unknown>)[c]))
        }
      }
      db.pragma('foreign_keys = ON')
    })()

    res.json({ ok: true })
  })

  // POST /api/v1/data/reset — admin only
  router.post('/reset', requireRole('admin'), (_req: AuthRequest, res) => {
    db.transaction(() => {
      db.prepare('DELETE FROM session_players').run()
      db.prepare('DELETE FROM game_sessions').run()
      db.prepare('DELETE FROM game_characters').run()
      db.prepare('DELETE FROM game_expansions').run()
      db.prepare('DELETE FROM games').run()
      db.prepare('DELETE FROM players').run()
    })()
    res.json({ ok: true })
  })

  return router
}
