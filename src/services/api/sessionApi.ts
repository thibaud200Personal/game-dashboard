import type { GameSession, CreateSessionRequest } from '@shared/types'

const BASE = '/api/v1/sessions'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const sessionApi = {
  getAll:  (): Promise<GameSession[]> => request<GameSession[]>(BASE),
  create:  (data: CreateSessionRequest): Promise<GameSession> =>
    request<GameSession>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:  (id: number): Promise<void> => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
