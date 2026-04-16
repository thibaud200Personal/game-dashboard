// backend/__tests__/unit/repositories/StatsRepository.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { GameRepository } from '../../../repositories/GameRepository'
import { PlayRepository } from '../../../repositories/PlayRepository'
import { StatsRepository } from '../../../repositories/StatsRepository'

let conn: DatabaseConnection
let statsRepo: StatsRepository
let playerId: number
let gameId: number

const baseGame = {
  name: 'Wingspan', min_players: 1, max_players: 5,
  supports_cooperative: false, supports_competitive: true,
  supports_campaign: false, supports_hybrid: false,
  has_expansion: false, has_characters: false, is_expansion: false,
}

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  const playerRepo  = new PlayerRepository(conn.db)
  const gameRepo    = new GameRepository(conn.db)
  const playRepo    = new PlayRepository(conn.db)
  statsRepo = new StatsRepository(conn.db)

  playerId = playerRepo.create({ player_name: 'Alice', pseudo: 'alice' })
  gameId   = gameRepo.create(baseGame)

  const playId = playRepo.insertSession({ game_id: gameId, play_type: 'competitive' })
  playRepo.insertPlayPlayers(playId, [{ player_id: playerId, score: 42, is_winner: true }])
})

afterEach(() => conn.close())

describe('StatsRepository.getDashboard', () => {
  it('retourne le bon comptage des entités', () => {
    const d = statsRepo.getDashboard()
    expect(d.total_players).toBe(1)
    expect(d.total_games).toBe(1)
    expect(d.total_plays).toBe(1)
    expect(typeof d.average_play_duration).toBe('number')
  })

  it('ne compte pas les expansions dans total_games', () => {
    const gameRepo = new GameRepository(conn.db)
    gameRepo.create({ ...baseGame, name: 'Expansion', is_expansion: true })
    const d = statsRepo.getDashboard()
    expect(d.total_games).toBe(1)
  })
})

describe('StatsRepository.getAllPlayerStats', () => {
  it('retourne les stats de tous les joueurs', () => {
    const stats = statsRepo.getAllPlayerStats()
    expect(stats).toHaveLength(1)
    expect(stats[0].player_id).toBe(playerId)
    expect(stats[0].games_played).toBe(1)
    expect(stats[0].wins).toBe(1)
  })
})

describe('StatsRepository.getPlayerStats', () => {
  it('retourne les stats d\'un joueur donné', () => {
    const stats = statsRepo.getPlayerStats(playerId)
    expect(stats?.player_id).toBe(playerId)
    expect(stats?.win_percentage).toBeCloseTo(100)
  })

  it('retourne undefined pour un joueur inexistant', () => {
    expect(statsRepo.getPlayerStats(9999)).toBeUndefined()
  })
})

describe('StatsRepository.getAllGameStats', () => {
  it('retourne les stats de tous les jeux', () => {
    const stats = statsRepo.getAllGameStats()
    expect(stats).toHaveLength(1)
    expect(stats[0].game_id).toBe(gameId)
  })
})

describe('StatsRepository.getGameStats', () => {
  it('retourne les stats d\'un jeu donné', () => {
    const stats = statsRepo.getGameStats(gameId)
    expect(stats?.game_id).toBe(gameId)
  })

  it('retourne undefined pour un jeu inexistant', () => {
    expect(statsRepo.getGameStats(9999)).toBeUndefined()
  })
})
