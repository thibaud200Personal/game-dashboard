import type Database from 'better-sqlite3'
import type { GameSession, SessionPlayer } from '@shared/types'

type InsertSessionData = {
  game_id: number
  session_date?: string
  duration_minutes?: number
  winner_player_id?: number
  session_type?: GameSession['session_type']
  notes?: string
}

type InsertSessionPlayerData = {
  player_id: number
  character_id?: number
  score: number
  placement?: number
  is_winner?: boolean
  notes?: string
}

export class SessionRepository {
  constructor(private db: Database.Database) {}

  findAll(): GameSession[] {
    return this.db
      .prepare('SELECT * FROM game_sessions ORDER BY session_date DESC')
      .all() as GameSession[]
  }

  findById(id: number): GameSession | undefined {
    return this.db
      .prepare('SELECT * FROM game_sessions WHERE session_id = ?')
      .get(id) as GameSession | undefined
  }

  findSessionPlayers(sessionId: number): SessionPlayer[] {
    type RawRow = Omit<SessionPlayer, 'is_winner'> & { is_winner: number }
    const rows = this.db
      .prepare('SELECT * FROM session_players WHERE session_id = ?')
      .all(sessionId) as RawRow[]
    return rows.map(r => ({ ...r, is_winner: !!r.is_winner }))
  }

  insertSession(data: InsertSessionData): number {
    const result = this.db.prepare(`
      INSERT INTO game_sessions (game_id, session_date, duration_minutes, winner_player_id, session_type, notes)
      VALUES (?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, COALESCE(?, 'competitive'), ?)
    `).run(
      data.game_id,
      data.session_date ?? null,
      data.duration_minutes ?? null,
      data.winner_player_id ?? null,
      data.session_type ?? null,
      data.notes ?? null,
    )
    return result.lastInsertRowid as number
  }

  insertSessionPlayers(sessionId: number, players: InsertSessionPlayerData[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO session_players (session_id, player_id, character_id, score, placement, is_winner, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    for (const p of players) {
      stmt.run(
        sessionId,
        p.player_id,
        p.character_id ?? null,
        p.score,
        p.placement ?? null,
        p.is_winner ? 1 : 0,
        p.notes ?? null,
      )
    }
  }

  delete(sessionId: number): void {
    this.db.prepare('DELETE FROM game_sessions WHERE session_id = ?').run(sessionId)
  }
}
