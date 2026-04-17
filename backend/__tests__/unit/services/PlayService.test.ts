import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { GameRepository } from '../../../repositories/GameRepository'
import { PlayRepository } from '../../../repositories/PlayRepository'
import { PlayService } from '../../../services/PlayService'

let conn: DatabaseConnection
let service: PlayService
let playerId: number
let gameId: number

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  const playerRepo = new PlayerRepository(conn.db)
  const gameRepo = new GameRepository(conn.db)
  const playRepo = new PlayRepository(conn.db)
  service = new PlayService(conn.db, playRepo)

  playerId = playerRepo.create({ player_name: 'Bob', pseudo: 'bob' })
  gameId = gameRepo.create({
    name: 'Catan', min_players: 3, max_players: 4,
    supports_cooperative: false, supports_competitive: true,
    supports_campaign: false, supports_hybrid: false,
    has_expansion: false, has_characters: false, is_expansion: false,
  })
})

afterEach(() => conn.close())

describe('PlayService', () => {
  it('creates play and players_play atomically', () => {
    const result = service.createPlay({
      game_id: gameId,
      play_type: 'competitive',
      players: [{ player_id: playerId, score: 10, is_winner: true }],
    })
    const playId = (result as any).play_id
    expect(playId).toBeTruthy()
    const players = conn.db
      .prepare('SELECT * FROM players_play WHERE play_id = ?')
      .all(playId)
    expect(players).toHaveLength(1)
  })

  it('rolls back entire transaction if player_id is invalid', () => {
    expect(() =>
      service.createPlay({
        game_id: gameId,
        play_type: 'competitive',
        players: [{ player_id: 9999, score: 10, is_winner: false }],
      })
    ).toThrow()
    const plays = conn.db
      .prepare('SELECT COUNT(*) as n FROM game_plays')
      .get() as { n: number }
    expect(plays.n).toBe(0)
  })

  it('getAllPlays returns all plays', () => {
    service.createPlay({ game_id: gameId, play_type: 'competitive', players: [{ player_id: playerId, score: 5, is_winner: true }] })
    expect(service.getAllPlays()).toHaveLength(1)
  })

  it('deletePlay removes play and cascades to players', () => {
    const play = service.createPlay({ game_id: gameId, play_type: 'competitive', players: [{ player_id: playerId, score: 5, is_winner: true }] })
    service.deletePlay((play as any).play_id)
    const sp = conn.db.prepare('SELECT COUNT(*) as n FROM players_play').get() as { n: number }
    expect(sp.n).toBe(0)
  })
})
