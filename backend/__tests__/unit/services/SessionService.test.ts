import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { GameRepository } from '../../../repositories/GameRepository'
import { SessionRepository } from '../../../repositories/SessionRepository'
import { SessionService } from '../../../services/SessionService'

let conn: DatabaseConnection
let service: SessionService
let playerId: number
let gameId: number

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  const playerRepo = new PlayerRepository(conn.db)
  const gameRepo = new GameRepository(conn.db)
  const sessionRepo = new SessionRepository(conn.db)
  service = new SessionService(conn.db, sessionRepo)

  playerId = playerRepo.create({ player_name: 'Bob', pseudo: 'bob' })
  gameId = gameRepo.create({
    name: 'Catan', min_players: 3, max_players: 4,
    supports_cooperative: false, supports_competitive: true,
    supports_campaign: false, supports_hybrid: false,
    has_expansion: false, has_characters: false, is_expansion: false,
  })
})

afterEach(() => conn.close())

describe('SessionService', () => {
  it('creates session and session_players atomically', () => {
    const result = service.createSession({
      game_id: gameId,
      session_type: 'competitive',
      players: [{ player_id: playerId, score: 10, is_winner: true }],
    })
    expect(result.session_id).toBeTruthy()
    const players = conn.db
      .prepare('SELECT * FROM session_players WHERE session_id = ?')
      .all(result.session_id)
    expect(players).toHaveLength(1)
  })

  it('rolls back entire transaction if player_id is invalid', () => {
    expect(() =>
      service.createSession({
        game_id: gameId,
        session_type: 'competitive',
        players: [{ player_id: 9999, score: 10, is_winner: false }],
      })
    ).toThrow()
    const sessions = conn.db
      .prepare('SELECT COUNT(*) as n FROM game_sessions')
      .get() as { n: number }
    expect(sessions.n).toBe(0)
  })

  it('getAllSessions returns all sessions', () => {
    service.createSession({ game_id: gameId, session_type: 'competitive', players: [{ player_id: playerId, score: 5, is_winner: true }] })
    expect(service.getAllSessions()).toHaveLength(1)
  })

  it('deleteSession removes session and cascades to players', () => {
    const session = service.createSession({ game_id: gameId, session_type: 'competitive', players: [{ player_id: playerId, score: 5, is_winner: true }] })
    service.deleteSession(session.session_id)
    const sp = conn.db.prepare('SELECT COUNT(*) as n FROM session_players').get() as { n: number }
    expect(sp.n).toBe(0)
  })
})
