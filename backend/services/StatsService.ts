import type { StatsRepository } from '../repositories/StatsRepository'
import type { DashboardStats, PlayerStatistics, GameStatistics, PlayerRecentPlay } from '@shared/types'

export class StatsService {
  constructor(private statsRepo: StatsRepository) {}

  getDashboard(): DashboardStats {
    return this.statsRepo.getDashboard()
  }

  getPlayerStats(): PlayerStatistics[] {
    return this.statsRepo.getAllPlayerStats()
  }

  getPlayerStatsById(id: number): PlayerStatistics | undefined {
    return this.statsRepo.getPlayerStats(id)
  }

  getGameStats(): GameStatistics[] {
    return this.statsRepo.getAllGameStats()
  }

  getGameStatsById(id: number): GameStatistics | undefined {
    return this.statsRepo.getGameStats(id)
  }

  getPlayerRecentPlays(playerId: number, limit?: number): PlayerRecentPlay[] {
    return this.statsRepo.getPlayerRecentPlays(playerId, limit)
  }
}
