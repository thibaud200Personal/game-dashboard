import type { GameSession, CreateSessionRequest } from '@shared/types';
import { request } from './request';

const BASE = '/api/v1/sessions';

export const sessionApi = {
  getAll:  (): Promise<GameSession[]> => request<GameSession[]>(BASE),
  create:  (data: CreateSessionRequest): Promise<GameSession> =>
    request<GameSession>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:  (id: number): Promise<void> => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
