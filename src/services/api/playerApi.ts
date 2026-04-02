import type { Player, PlayerStatistics, CreatePlayerRequest, UpdatePlayerRequest } from '@shared/types';

const BASE = '/api/v1/players';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

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
