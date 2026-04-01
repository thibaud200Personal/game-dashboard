import type { Game, GameExpansion, GameCharacter, CreateGameRequest, UpdateGameRequest } from '@shared/types'

const BASE = '/api/v1/games'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const gameApi = {
  getAll:  (): Promise<Game[]> => request<Game[]>(BASE),
  getById: (id: number): Promise<Game> => request<Game>(`${BASE}/${id}`),
  create:  (data: CreateGameRequest): Promise<Game> =>
    request<Game>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update:  (id: number, data: UpdateGameRequest): Promise<Game> =>
    request<Game>(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:  (id: number): Promise<void> => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),

  addExpansion:    (gameId: number, data: Omit<GameExpansion, 'expansion_id' | 'game_id'>): Promise<GameExpansion> =>
    request<GameExpansion>(`${BASE}/${gameId}/expansions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteExpansion: (gameId: number, expansionId: number): Promise<void> =>
    request<void>(`${BASE}/${gameId}/expansions/${expansionId}`, { method: 'DELETE' }),

  addCharacter:    (gameId: number, data: Omit<GameCharacter, 'character_id' | 'game_id'>): Promise<GameCharacter> =>
    request<GameCharacter>(`${BASE}/${gameId}/characters`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteCharacter: (gameId: number, characterId: number): Promise<void> =>
    request<void>(`${BASE}/${gameId}/characters/${characterId}`, { method: 'DELETE' }),
}
