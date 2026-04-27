import type { DashboardStats, PlayerStatistics, GameStatistics, PlayerRecentPlay } from '@shared/types';
import { request } from './request';

const BASE = '/api/v1/stats';

export const statsApi = {
  getDashboard:         (): Promise<DashboardStats> => request<DashboardStats>(`${BASE}/dashboard`),
  getPlayerStats:       (): Promise<PlayerStatistics[]> => request<PlayerStatistics[]>(`${BASE}/players`),
  getPlayerById:        (id: number): Promise<PlayerStatistics> => request<PlayerStatistics>(`${BASE}/players/${id}`),
  getPlayerRecentPlays: (id: number, limit = 10): Promise<PlayerRecentPlay[]> =>
    request<PlayerRecentPlay[]>(`${BASE}/players/${id}/recent-plays?limit=${limit}`),
  getGameStats:         (): Promise<GameStatistics[]> => request<GameStatistics[]>(`${BASE}/games`),
  getGameById:          (id: number): Promise<GameStatistics> => request<GameStatistics>(`${BASE}/games/${id}`),
};
