// BoardGameGeek API — appelle le backend qui fetch + parse le XML BGG

import type { BGGGame, BGGSearchResult } from '@/types';
export type { BGGGame, BGGExpansion, BGGCharacter, BGGSearchResult } from '@/types';

class BGGApiService {
  private readonly baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';

  async searchGames(query: string): Promise<BGGSearchResult[]> {
    const response = await fetch(`${this.baseUrl}/bgg/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`BGG search error: ${response.status}`);
    return await response.json();
  }

  async getGameDetails(bggId: number): Promise<BGGGame> {
    const response = await fetch(`${this.baseUrl}/bgg/game/${bggId}`);
    if (!response.ok) throw new Error(`BGG game error: ${response.status}`);
    return await response.json();
  }
}

export const bggApiService = new BGGApiService();
