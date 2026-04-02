import type Database from 'better-sqlite3'
import type { Player, PlayerStatistics, CreatePlayerRequest, UpdatePlayerRequest } from '@shared/types'

export class PlayerRepository {
  constructor(private db: Database.Database) {}

  findAll(): Player[] {
    return this.db.prepare('SELECT * FROM players ORDER BY player_name').all() as Player[]
  }

  findById(id: number): Player | undefined {
    return this.db.prepare('SELECT * FROM players WHERE player_id = ?').get(id) as Player | undefined
  }

  findStatistics(id: number): PlayerStatistics | undefined {
    return this.db
      .prepare('SELECT * FROM player_statistics WHERE player_id = ?')
      .get(id) as PlayerStatistics | undefined
  }

  findAllStatistics(): PlayerStatistics[] {
    return this.db.prepare('SELECT * FROM player_statistics ORDER BY player_name').all() as PlayerStatistics[]
  }

  create(data: CreatePlayerRequest): number {
    const result = this.db.prepare(`
      INSERT INTO players (player_name, pseudo, avatar, favorite_game)
      VALUES (?, ?, ?, ?)
    `).run(
      data.player_name,
      data.pseudo ?? data.player_name,
      data.avatar ?? null,
      data.favorite_game ?? null,
    )
    return result.lastInsertRowid as number
  }

  update(id: number, data: UpdatePlayerRequest): void {
    this.db.prepare(`
      UPDATE players
      SET player_name   = COALESCE(?, player_name),
          pseudo        = COALESCE(?, pseudo),
          avatar        = COALESCE(?, avatar),
          favorite_game = COALESCE(?, favorite_game),
          updated_at    = CURRENT_TIMESTAMP
      WHERE player_id = ?
    `).run(
      data.player_name ?? null,
      data.pseudo ?? null,
      data.avatar ?? null,
      data.favorite_game ?? null,
      id,
    )
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM players WHERE player_id = ?').run(id)
  }
}
