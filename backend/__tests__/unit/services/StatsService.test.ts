// backend/__tests__/unit/services/StatsService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { GameRepository } from '../../../repositories/GameRepository'
import { PlayRepository } from '../../../repositories/PlayRepository'
import { StatsRepository } from '../../../repositories/StatsRepository'
import { StatsService } from '../../../services/StatsService'

let conn: DatabaseConnection
let service: StatsService
let playerId: number
let gameId: number

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  const playerRepo  = new PlayerRepository(conn.db)
  const gameRepo    = new GameRepository(conn.db)
  const playRepo    = new PlayRepository(conn.db)
  service = new StatsService(new StatsRepository(conn.db))

  playerId = playerRepo.create({ player_name: 'Alice', pseudo: 'alice' })
  gameId   = gameRepo.create({
    name: 'Catan', min_players: 3, max_players: 4,
    supports_cooperative: false, supports_competitive: true,
    supports_campaign: false, supports_hybrid: false,
    has_expansion: false, has_characters: false, is_expansion: false,
  })
  const pid = playRepo.insertPlay({ game_id: gameId, play_type: 'competitive' })
  playRepo.insertPlayPlayers(pid, [{ player_id: playerId, score: 10, is_winner: true }])
})
afterEach(() => conn.close())

describe('StatsService.getDashboard', () => {
  it('retourne les totaux corrects', () => {
    const d = service.getDashboard()
    expect(d.total_players).toBe(1)
    expect(d.total_plays).toBe(1)
  })
})

describe('StatsService.getPlayerStats', () => {
  it('retourne les stats d\'un joueur', () => {
    const stats = service.getPlayerStatsById(playerId)
    expect(stats?.wins).toBe(1)
  })

  it('retourne undefined pour joueur inexistant', () => {
    expect(service.getPlayerStatsById(9999)).toBeUndefined()
  })
})

describe('StatsService.getGameStats', () => {
  it('retourne les stats d\'un jeu', () => {
    const stats = service.getGameStatsById(gameId)
    expect(stats?.game_id).toBe(gameId)
  })

  it('retourne undefined pour jeu inexistant', () => {
    expect(service.getGameStatsById(9999)).toBeUndefined()
  })
})
