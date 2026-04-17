import type Database from 'better-sqlite3'
import type { GamePlay, PlayPlayer } from '@shared/types'

type InsertPlayData = {
  game_id: number
  play_date?: string
  duration_minutes?: number
  winner_player_id?: number
  play_type?: GamePlay['play_type']
  notes?: string
}

type InsertPlayPlayerData = {
  player_id: number
  character_id?: number
  score: number
  placement?: number
  is_winner?: boolean
  notes?: string
}

export class PlayRepository {
  constructor(private db: Database.Database) {}

  findAll(): GamePlay[] {
    return this.db
      .prepare('SELECT * FROM game_plays ORDER BY play_date DESC')
      .all() as GamePlay[]
  }

  findById(id: number): GamePlay | undefined {
    return this.db
      .prepare('SELECT * FROM game_plays WHERE play_id = ?')
      .get(id) as GamePlay | undefined
  }

  findPlayPlayers(playId: number): PlayPlayer[] {
    type RawRow = Omit<PlayPlayer, 'is_winner'> & { is_winner: number }
    const rows = this.db
      .prepare('SELECT * FROM players_play WHERE play_id = ?')
      .all(playId) as RawRow[]
    return rows.map(r => ({ ...r, is_winner: !!r.is_winner }))
  }

  insertPlay(data: InsertPlayData): number {
    const result = this.db.prepare(`
      INSERT INTO game_plays (game_id, play_date, duration_minutes, winner_player_id, play_type, notes)
      VALUES (?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, COALESCE(?, 'competitive'), ?)
    `).run(
      data.game_id,
      data.play_date ?? null,
      data.duration_minutes ?? null,
      data.winner_player_id ?? null,
      data.play_type ?? null,
      data.notes ?? null,
    )
    return result.lastInsertRowid as number
  }

  insertPlayPlayers(playId: number, players: InsertPlayPlayerData[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO players_play (play_id, player_id, character_id, score, placement, is_winner, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    for (const p of players) {
      stmt.run(
        playId,
        p.player_id,
        p.character_id ?? null,
        p.score,
        p.placement ?? null,
        p.is_winner ? 1 : 0,
        p.notes ?? null,
      )
    }
  }

  delete(playId: number): void {
    this.db.prepare('DELETE FROM game_plays WHERE play_id = ?').run(playId)
  }
}
