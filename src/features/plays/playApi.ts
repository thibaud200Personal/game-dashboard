import type { GamePlay, CreatePlayRequest } from '@shared/types';
import { request } from '@/shared/services/api/request';

const BASE = '/api/v1/plays';

export const playApi = {
  getAll:  (): Promise<GamePlay[]> => request<GamePlay[]>(BASE),
  create:  (data: CreatePlayRequest): Promise<GamePlay> =>
    request<GamePlay>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:  (id: number): Promise<void> => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
