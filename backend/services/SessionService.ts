import type Database from 'better-sqlite3'
import type { SessionRepository } from '../repositories/SessionRepository'
import type { GameSession, CreateSessionRequest } from '@shared/types'

export class SessionService {
  constructor(
    private db: Database.Database,
    private sessionRepo: SessionRepository,
  ) {}

  createSession(data: CreateSessionRequest): GameSession {
    return this.db.transaction(() => {
      const sessionId = this.sessionRepo.insertSession({
        game_id: data.game_id,
        session_date: data.session_date,
        duration_minutes: data.duration_minutes,
        winner_player_id: data.winner_player_id,
        session_type: data.session_type,
        notes: data.notes,
      })
      this.sessionRepo.insertSessionPlayers(sessionId, data.players)
      return this.sessionRepo.findById(sessionId)!
    })()
  }

  getAllSessions(): GameSession[] {
    return this.sessionRepo.findAll()
  }

  deleteSession(sessionId: number): void {
    this.sessionRepo.delete(sessionId)
  }
}
