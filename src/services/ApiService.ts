// API service to connect frontend with backend database

export class ApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  private async request<T>(endpoint: string, options: globalThis.RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: globalThis.RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  }

  // Player operations
  async getAllPlayers() {
    return this.request<any[]>('/players');
  }

  async getPlayerById(playerId: number) {
    return this.request<any>(`/players/${playerId}`);
  }

  async createPlayer(playerData: any) {
    return this.request<any>('/players', {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  }

  async updatePlayer(playerId: number, playerData: any) {
    return this.request<any>(`/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(playerData),
    });
  }

  async deletePlayer(playerId: number) {
    return this.request<void>(`/players/${playerId}`, {
      method: 'DELETE',
    });
  }

  // Game operations
  async getAllGames() {
    return this.request<any[]>('/games');
  }

  async getGameById(gameId: number) {
    return this.request<any>(`/games/${gameId}`);
  }

  async createGame(gameData: any) {
    return this.request<any>('/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async updateGame(gameId: number, gameData: any) {
    return this.request<any>(`/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(gameData),
    });
  }

  async deleteGame(gameId: number) {
    return this.request<void>(`/games/${gameId}`, {
      method: 'DELETE',
    });
  }

  // Game Expansion operations
  async getAllExpansions(gameId?: number) {
    const query = gameId ? `?game_id=${gameId}` : '';
    return this.request<any[]>(`/expansions${query}`);
  }

  async getExpansionById(expansionId: number) {
    return this.request<any>(`/expansions/${expansionId}`);
  }

  async createExpansion(expansionData: any) {
    return this.request<any>('/expansions', {
      method: 'POST',
      body: JSON.stringify(expansionData),
    });
  }

  async updateExpansion(expansionId: number, expansionData: any) {
    return this.request<any>(`/expansions/${expansionId}`, {
      method: 'PUT',
      body: JSON.stringify(expansionData),
    });
  }

  async deleteExpansion(expansionId: number) {
    return this.request<void>(`/expansions/${expansionId}`, {
      method: 'DELETE',
    });
  }

  // Game Character operations
  async getAllCharacters(gameId?: number) {
    const query = gameId ? `?game_id=${gameId}` : '';
    return this.request<any[]>(`/characters${query}`);
  }

  async getCharacterById(characterId: number) {
    return this.request<any>(`/characters/${characterId}`);
  }

  async createCharacter(characterData: any) {
    return this.request<any>('/characters', {
      method: 'POST',
      body: JSON.stringify(characterData),
    });
  }

  async updateCharacter(characterId: number, characterData: any) {
    return this.request<any>(`/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify(characterData),
    });
  }

  async deleteCharacter(characterId: number) {
    return this.request<void>(`/characters/${characterId}`, {
      method: 'DELETE',
    });
  }

  async createSession(sessionData: any) {
    return this.request<any>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Session operations
  async getAllSessions(gameId?: number) {
    const query = gameId ? `?game_id=${gameId}` : '';
    return this.request<any[]>(`/sessions${query}`);
  }

  async getSessionsByGame(gameId: number) {
    return this.request<any[]>(`/sessions/game/${gameId}`);
  }

  async getSessionsByPlayer(playerId: number) {
    return this.request<any[]>(`/sessions/player/${playerId}`);
  }

  async updateSession(sessionId: number, sessionData: any) {
    return this.request<any>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(sessionId: number) {
    return this.request<void>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Statistics
  async getPlayerStats() {
    return this.request<any>('/stats/players');
  }

  async getGameStats() {
    return this.request<any>('/stats/games');
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export default new ApiService();