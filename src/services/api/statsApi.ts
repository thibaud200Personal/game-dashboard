import type { DashboardStats, PlayerStatistics, GameStatistics } from '@shared/types';

const BASE = '/api/v1/stats';

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const statsApi = {
  getDashboard:   (): Promise<DashboardStats> => request<DashboardStats>(`${BASE}/dashboard`),
  getPlayerStats: (): Promise<PlayerStatistics[]> => request<PlayerStatistics[]>(`${BASE}/players`),
  getPlayerById:  (id: number): Promise<PlayerStatistics> => request<PlayerStatistics>(`${BASE}/players/${id}`),
  getGameStats:   (): Promise<GameStatistics[]> => request<GameStatistics[]>(`${BASE}/games`),
  getGameById:    (id: number): Promise<GameStatistics> => request<GameStatistics>(`${BASE}/games/${id}`),
};
