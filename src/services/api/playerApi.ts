import type { Player, PlayerStatistics, CreatePlayerRequest, UpdatePlayerRequest } from '@shared/types';
import { request } from './request';

const BASE = '/api/v1/players';

export const playerApi = {
  getAll:    (): Promise<PlayerStatistics[]> => request<PlayerStatistics[]>(BASE),
  getById:   (id: number): Promise<Player> => request<Player>(`${BASE}/${id}`),
  create:    (data: CreatePlayerRequest): Promise<Player> =>
    request<Player>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update:    (id: number, data: UpdatePlayerRequest): Promise<Player> =>
    request<Player>(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:    (id: number): Promise<void> =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
