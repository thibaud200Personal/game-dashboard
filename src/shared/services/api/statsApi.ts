import type { DashboardStats, PlayerStatistics, GameStatistics } from '@shared/types';
import { request } from './request';

const BASE = '/api/v1/stats';

export const statsApi = {
  getDashboard:   (): Promise<DashboardStats> => request<DashboardStats>(`${BASE}/dashboard`),
  getPlayerStats: (): Promise<PlayerStatistics[]> => request<PlayerStatistics[]>(`${BASE}/players`),
  getPlayerById:  (id: number): Promise<PlayerStatistics> => request<PlayerStatistics>(`${BASE}/players/${id}`),
  getGameStats:   (): Promise<GameStatistics[]> => request<GameStatistics[]>(`${BASE}/games`),
  getGameById:    (id: number): Promise<GameStatistics> => request<GameStatistics>(`${BASE}/games/${id}`),
};
