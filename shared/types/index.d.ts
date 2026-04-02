// Shared types — single source of truth for frontend and backend.
// Import via @shared/types on both sides.

export interface Player {
  player_id: number
  player_name: string
  pseudo: string
  avatar?: string
  favorite_game?: string
  created_at: Date
  updated_at?: Date
}

// PlayerStatistics = Player + computed stats from player_statistics view
export interface PlayerStatistics extends Player {
  games_played: number
  wins: number
  total_score: number
  average_score: number
  win_percentage: number
}

export interface Game {
  game_id: number
  bgg_id?: number
  name: string
  description?: string
  image?: string
  thumbnail?: string
  min_players: number
  max_players: number
  playing_time?: number
  min_playtime?: number
  max_playtime?: number
  duration?: string
  difficulty?: string
  category?: string
  categories?: string[]
  mechanics?: string[]
  families?: string[]
  year_published?: number
  publisher?: string
  designer?: string
  bgg_rating?: number
  weight?: number
  age_min?: number
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  has_expansion: boolean
  has_characters: boolean
  is_expansion: boolean
  created_at: Date
  updated_at?: Date
  expansions?: GameExpansion[]
  characters?: GameCharacter[]
}

export interface GameExpansion {
  expansion_id?: number
  game_id?: number
  bgg_expansion_id?: number
  name: string
  year_published?: number
  description?: string
}

export interface GameCharacter {
  character_id?: number
  game_id?: number
  character_key: string
  name: string
  description?: string
  avatar?: string
  abilities?: string[]
}

export interface GameSession {
  session_id: number
  game_id: number
  session_date: Date
  duration_minutes?: number
  winner_player_id?: number
  session_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  notes?: string
  created_at: Date
}

export interface SessionPlayer {
  session_player_id?: number
  session_id: number
  player_id: number
  character_id?: number
  score: number
  placement?: number
  is_winner: boolean
  notes?: string
}

// API request types
export interface CreatePlayerRequest {
  player_name: string
  pseudo?: string
  avatar?: string
  favorite_game?: string
}

export interface UpdatePlayerRequest {
  player_name?: string
  pseudo?: string
  avatar?: string
  favorite_game?: string
}

export interface CreateGameRequest {
  bgg_id?: number
  name: string
  description?: string
  image?: string
  thumbnail?: string
  min_players: number
  max_players: number
  playing_time?: number
  min_playtime?: number
  max_playtime?: number
  duration?: string
  difficulty?: string
  category?: string
  categories?: string[]
  mechanics?: string[]
  families?: string[]
  year_published?: number
  publisher?: string
  designer?: string
  bgg_rating?: number
  weight?: number
  age_min?: number
  supports_cooperative?: boolean
  supports_competitive?: boolean
  supports_campaign?: boolean
  supports_hybrid?: boolean
  has_expansion?: boolean
  has_characters?: boolean
  is_expansion?: boolean
  expansions?: GameExpansion[]
  characters?: GameCharacter[]
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {}

export interface CreateSessionRequest {
  game_id: number
  session_date?: string
  duration_minutes?: number
  winner_player_id?: number
  session_type?: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  notes?: string
  players: Array<{
    player_id: number
    character_id?: number
    score: number
    placement?: number
    is_winner?: boolean
    notes?: string
  }>
}

// Stats aggregates
export interface DashboardStats {
  total_players: number
  total_games: number
  total_sessions: number
  average_session_duration: number
}

export interface GameStatistics {
  game_id: number
  name: string
  image?: string
  min_players: number
  max_players: number
  difficulty?: string
  category?: string
  year_published?: number
  bgg_rating?: number
  times_played: number
  unique_players: number
  average_score: number
  average_duration: number
  created_at: Date
}

// BGG types
export interface BggGame {
  bgg_id: number
  name: string
  year_published?: number
  is_expansion: boolean
}
