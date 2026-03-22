// BoardGameGeek API — appelle le backend qui fetch + parse le XML BGG

export interface BGGGame {
  id: number
  name: string
  image: string
  thumbnail: string
  description: string
  min_players: number
  max_players: number
  playing_time: number
  min_playtime: number
  max_playtime: number
  min_age: number
  year_published: number
  designers: string[]
  publishers: string[]
  categories: string[]
  mechanics: string[]
  rating: number
  weight: number
  difficulty: string
  expansions: BGGExpansion[]
  characters: BGGCharacter[]
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  is_expansion: boolean
  base_game_id?: number
}

export interface BGGExpansion {
  expansion_id?: number
  bgg_expansion_id: number
  name: string
  year_published: number
  description?: string
}

export interface BGGCharacter {
  character_id?: string
  character_key: string
  name: string
  description: string
  abilities: string[]
  avatar?: string
}

export interface BGGSearchResult {
  id: number
  name: string
  year_published: number
  type: string
}

class BGGApiService {
  private readonly baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api'

  async searchGames(query: string): Promise<BGGSearchResult[]> {
    const response = await fetch(`${this.baseUrl}/bgg/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error(`BGG search error: ${response.status}`)
    return await response.json()
  }

  async getGameDetails(bggId: number): Promise<BGGGame | null> {
    try {
      const response = await fetch(`${this.baseUrl}/bgg/game/${bggId}`)
      if (!response.ok) throw new Error(`BGG game error: ${response.status}`)
      return await response.json()
    } catch {
      return null
    }
  }

  async getGameExpansions(bggId: number): Promise<BGGExpansion[]> {
    try {
      const game = await this.getGameDetails(bggId)
      return game?.expansions || []
    } catch {
      return []
    }
  }
}

export const bggApiService = new BGGApiService()
