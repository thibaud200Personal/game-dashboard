// BoardGameGeek API — appelle le backend qui fetch + parse le XML BGG

import type { BGGGame, BGGSearchResult } from '@/types';
export type { BGGGame, BGGExpansion, BGGCharacter, BGGSearchResult } from '@/types';

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`BGG error: ${res.status}`);
  return res.json() as Promise<T>;
}

class BGGApiService {
  async searchGames(query: string): Promise<BGGSearchResult[]> {
    return request<BGGSearchResult[]>(`/api/v1/bgg/search?q=${encodeURIComponent(query)}`);
  }

  async getGameDetails(bggId: number): Promise<BGGGame> {
    return request<BGGGame>(`/api/v1/bgg/game/${bggId}`);
  }
}

export const bggApiService = new BGGApiService();
