import type Database from 'better-sqlite3'
import type { PlayRepository } from '../repositories/PlayRepository'
import type { GamePlay, CreatePlayRequest } from '@shared/types'

export class PlayService {
  constructor(
    // db is passed directly (not via repo) to support better-sqlite3 transactions
    // which require a synchronous callback on the same db instance.
    private db: Database.Database,
    private playRepo: PlayRepository,
  ) {}

  createSession(data: CreatePlayRequest): GamePlay {
    return this.db.transaction(() => {
      const playId = this.playRepo.insertSession({
        game_id: data.game_id,
        play_date: data.session_date,
        duration_minutes: data.duration_minutes,
        winner_player_id: data.winner_player_id,
        play_type: data.session_type,
        notes: data.notes,
      })
      this.playRepo.insertPlayPlayers(playId, data.players)
      return this.playRepo.findById(playId)!
    })()
  }

  getAllSessions(): GamePlay[] {
    return this.playRepo.findAll()
  }

  deleteSession(playId: number): void {
    this.playRepo.delete(playId)
  }
}
