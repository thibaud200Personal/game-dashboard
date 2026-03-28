// API service to connect frontend with backend database
import {
  Player,
  Game,
  GameExpansion,
  GameCharacter,
  GameSession,
  GameFormData,
  CreateSessionPayload
} from '@/types';

class ApiService {
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
    return this.request<Player[]>('/players');
  }

  async getPlayerById(playerId: number) {
    return this.request<Player>(`/players/${playerId}`);
  }

  async createPlayer(playerData: { player_name: string; avatar?: string; favorite_game?: string }) {
    return this.request<Player>('/players', {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  }

  async updatePlayer(playerId: number, playerData: Partial<Player>) {
    return this.request<Player>(`/players/${playerId}`, {
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
    return this.request<Game[]>('/games');
  }

  async getGameById(gameId: number) {
    return this.request<Game>(`/games/${gameId}`);
  }

  async createGame(gameData: GameFormData) {
    const sanitized = {
      ...gameData,
      image: gameData.image || undefined,
      thumbnail: gameData.thumbnail || undefined,
    };
    return this.request<Game>('/games', {
      method: 'POST',
      body: JSON.stringify(sanitized),
    });
  }

  async updateGame(gameId: number, gameData: Partial<GameFormData>) {
    const sanitized = {
      ...gameData,
      image: gameData.image || undefined,
      thumbnail: gameData.thumbnail || undefined,
    };
    return this.request<Game>(`/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(sanitized),
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
    return this.request<GameExpansion[]>(`/expansions${query}`);
  }

  async getExpansionById(expansionId: number) {
    return this.request<GameExpansion>(`/expansions/${expansionId}`);
  }

  async createExpansion(expansionData: Omit<GameExpansion, 'expansion_id'>) {
    return this.request<GameExpansion>('/expansions', {
      method: 'POST',
      body: JSON.stringify(expansionData),
    });
  }

  async updateExpansion(expansionId: number, expansionData: Omit<GameExpansion, 'expansion_id' | 'game_id'>) {
    return this.request<GameExpansion>(`/expansions/${expansionId}`, {
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
    return this.request<GameCharacter[]>(`/characters${query}`);
  }

  async getCharacterById(characterId: number) {
    return this.request<GameCharacter>(`/characters/${characterId}`);
  }

  async createCharacter(characterData: Omit<GameCharacter, 'character_id'>) {
    return this.request<GameCharacter>('/characters', {
      method: 'POST',
      body: JSON.stringify(characterData),
    });
  }

  async updateCharacter(characterId: number, characterData: Omit<GameCharacter, 'character_id' | 'game_id'>) {
    return this.request<GameCharacter>(`/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify(characterData),
    });
  }

  async deleteCharacter(characterId: number) {
    return this.request<void>(`/characters/${characterId}`, {
      method: 'DELETE',
    });
  }

  async createSession(sessionData: CreateSessionPayload) {
    return this.request<GameSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Session operations
  async getAllSessions(gameId?: number) {
    const query = gameId ? `?game_id=${gameId}` : '';
    return this.request<GameSession[]>(`/sessions${query}`);
  }

  async getSessionsByGame(gameId: number) {
    return this.request<GameSession[]>(`/sessions/game/${gameId}`);
  }

  async getSessionsByPlayer(playerId: number) {
    return this.request<GameSession[]>(`/sessions/player/${playerId}`);
  }

  async updateSession(sessionId: number, sessionData: Partial<GameSession>) {
    return this.request<GameSession>(`/sessions/${sessionId}`, {
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
    return this.request<unknown>('/stats/players');
  }

  async getGameStats() {
    return this.request<unknown>('/stats/games');
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export default new ApiService();