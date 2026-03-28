// BoardGameGeek API — appelle le backend qui fetch + parse le XML BGG

import type { BGGGame, BGGSearchResult } from '@/types';
export type { BGGGame, BGGExpansion, BGGCharacter, BGGSearchResult } from '@/types';

class BGGApiService {
  private readonly baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';

  private authHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async searchGames(query: string): Promise<BGGSearchResult[]> {
    const response = await fetch(`${this.baseUrl}/bgg/search?q=${encodeURIComponent(query)}`, {
      headers: this.authHeaders(),
    });
    if (!response.ok) throw new Error(`BGG search error: ${response.status}`);
    return await response.json();
  }

  async getGameDetails(bggId: number): Promise<BGGGame> {
    const response = await fetch(`${this.baseUrl}/bgg/game/${bggId}`, {
      headers: this.authHeaders(),
    });
    if (!response.ok) throw new Error(`BGG game error: ${response.status}`);
    return await response.json();
  }
}

export const bggApiService = new BGGApiService();
