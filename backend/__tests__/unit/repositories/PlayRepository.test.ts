import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { GameRepository } from '../../../repositories/GameRepository'
import { PlayRepository } from '../../../repositories/PlayRepository'

let conn: DatabaseConnection
let playRepo: PlayRepository
let playerId: number
let gameId: number

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  const playerRepo = new PlayerRepository(conn.db)
  const gameRepo = new GameRepository(conn.db)
  playRepo = new PlayRepository(conn.db)

  playerId = playerRepo.create({ player_name: 'Alice', pseudo: 'alice' })
  gameId = gameRepo.create({
    name: 'Wingspan', min_players: 1, max_players: 5,
    supports_cooperative: false, supports_competitive: true,
    supports_campaign: false, supports_hybrid: false,
    has_expansion: true, has_characters: false, is_expansion: false,
  })
})

afterEach(() => conn.close())

describe('PlayRepository', () => {
  it('inserts a play and retrieves it', () => {
    const playId = playRepo.insertSession({ game_id: gameId, play_type: 'competitive' })
    const play = playRepo.findById(playId)
    expect(play?.game_id).toBe(gameId)
    expect((play as any).play_type).toBe('competitive')
  })

  it('accepts hybrid play_type', () => {
    const playId = playRepo.insertSession({ game_id: gameId, play_type: 'hybrid' })
    expect((playRepo.findById(playId) as any).play_type).toBe('hybrid')
  })

  it('inserts play players and retrieves them', () => {
    const playId = playRepo.insertSession({ game_id: gameId, play_type: 'competitive' })
    playRepo.insertPlayPlayers(playId, [
      { player_id: playerId, score: 42, is_winner: true },
    ])
    const players = playRepo.findPlayPlayers(playId)
    expect(players).toHaveLength(1)
    expect(players[0].score).toBe(42)
    expect(players[0].is_winner).toBe(true)
  })

  it('findAll returns all plays', () => {
    playRepo.insertSession({ game_id: gameId, play_type: 'hybrid' })
    playRepo.insertSession({ game_id: gameId, play_type: 'cooperative' })
    expect(playRepo.findAll()).toHaveLength(2)
  })

  it('delete removes a play', () => {
    const playId = playRepo.insertSession({ game_id: gameId, play_type: 'competitive' })
    playRepo.delete(playId)
    expect(playRepo.findById(playId)).toBeUndefined()
  })
})
