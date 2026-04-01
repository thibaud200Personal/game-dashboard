import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { GameRepository } from '../../../repositories/GameRepository'
import { SessionRepository } from '../../../repositories/SessionRepository'

let conn: DatabaseConnection
let sessionRepo: SessionRepository
let playerId: number
let gameId: number

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  const playerRepo = new PlayerRepository(conn.db)
  const gameRepo = new GameRepository(conn.db)
  sessionRepo = new SessionRepository(conn.db)

  playerId = playerRepo.create({ player_name: 'Alice', pseudo: 'alice' })
  gameId = gameRepo.create({
    name: 'Wingspan', min_players: 1, max_players: 5,
    supports_cooperative: false, supports_competitive: true,
    supports_campaign: false, supports_hybrid: false,
    has_expansion: true, has_characters: false, is_expansion: false,
  })
})

afterEach(() => conn.close())

describe('SessionRepository', () => {
  it('inserts a session and retrieves it', () => {
    const sessionId = sessionRepo.insertSession({ game_id: gameId, session_type: 'competitive' })
    const session = sessionRepo.findById(sessionId)
    expect(session?.game_id).toBe(gameId)
    expect(session?.session_type).toBe('competitive')
  })

  it('accepts hybrid session_type', () => {
    const sessionId = sessionRepo.insertSession({ game_id: gameId, session_type: 'hybrid' })
    expect(sessionRepo.findById(sessionId)?.session_type).toBe('hybrid')
  })

  it('inserts session players and retrieves them', () => {
    const sessionId = sessionRepo.insertSession({ game_id: gameId, session_type: 'competitive' })
    sessionRepo.insertSessionPlayers(sessionId, [
      { player_id: playerId, score: 42, is_winner: true },
    ])
    const players = sessionRepo.findSessionPlayers(sessionId)
    expect(players).toHaveLength(1)
    expect(players[0].score).toBe(42)
    expect(players[0].is_winner).toBe(true)
  })

  it('findAll returns all sessions', () => {
    sessionRepo.insertSession({ game_id: gameId, session_type: 'hybrid' })
    sessionRepo.insertSession({ game_id: gameId, session_type: 'cooperative' })
    expect(sessionRepo.findAll()).toHaveLength(2)
  })

  it('delete removes a session', () => {
    const sessionId = sessionRepo.insertSession({ game_id: gameId, session_type: 'competitive' })
    sessionRepo.delete(sessionId)
    expect(sessionRepo.findById(sessionId)).toBeUndefined()
  })
})
