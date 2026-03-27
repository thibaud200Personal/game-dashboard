// Database-aligned interfaces for Board Game Score Tracker
// These interfaces match the database schema exactly

export interface Player {
  player_id: number;
  player_name: string;
  avatar?: string;
  games_played: number;
  wins: number;
  total_score: number;
  average_score: number;
  favorite_game?: string;
  created_at: Date;
  updated_at?: Date;
  // Calculated field for display
  stats?: string;
}

export interface Game {
  game_id: number;
  bgg_id?: number;
  name: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  min_players: number;
  max_players: number;
  playing_time?: number;
  min_playtime?: number;
  max_playtime?: number;
  duration?: string;
  difficulty?: string;
  category?: string;
  categories?: string[];
  mechanics?: string[];
  year_published?: number;
  publisher?: string;
  designer?: string;
  bgg_rating?: number;
  weight?: number;
  age_min?: number;
  game_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid';
  supports_cooperative: boolean;
  supports_competitive: boolean;
  supports_campaign: boolean;
  supports_hybrid?: boolean;
  has_expansion: boolean;
  has_characters: boolean;
  is_expansion?: boolean;
  created_at: Date;
  updated_at?: Date;
  // Related data
  expansions?: GameExpansion[];
  characters?: GameCharacter[];
  // Calculated field for display
  players?: string;
}

export interface GameExpansion {
  expansion_id?: number;
  game_id?: number;
  bgg_expansion_id?: number;
  name: string;
  year_published?: number;
  description?: string;
}

export interface GameCharacter {
  character_id?: number;
  game_id?: number;
  character_key: string;
  name: string;
  description?: string;
  avatar?: string; // Avatar field included as requested
  abilities?: string[]; // Will be stored as JSON in database
}

export interface GameSession {
  session_id: number;
  game_id: number;
  session_date: Date;
  duration_minutes?: number;
  winner_player_id?: number;
  session_type: 'competitive' | 'cooperative' | 'campaign';
  notes?: string;
  created_at: Date;
}

export interface SessionPlayer {
  session_player_id?: number;
  session_id: number;
  player_id: number;
  character_id?: number;
  score: number;
  placement?: number;
  is_winner: boolean;
  notes?: string;
}

// API Request/Response types
export interface CreatePlayerRequest {
  player_name: string;
  avatar?: string;
  favorite_game?: string;
}

export interface UpdatePlayerRequest {
  player_name?: string;
  avatar?: string;
  games_played?: number;
  wins?: number;
  total_score?: number;
  average_score?: number;
  favorite_game?: string;
}

export interface CreateGameRequest {
  bgg_id?: number;
  name: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  min_players: number;
  max_players: number;
  playing_time?: number;
  min_playtime?: number;
  max_playtime?: number;
  duration?: string;
  difficulty?: string;
  category?: string;
  categories?: string[];
  mechanics?: string[];
  year_published?: number;
  publisher?: string;
  designer?: string;
  bgg_rating?: number;
  weight?: number;
  age_min?: number;
  game_type?: 'competitive' | 'cooperative' | 'campaign' | 'hybrid';
  supports_cooperative?: boolean;
  supports_competitive?: boolean;
  supports_campaign?: boolean;
  supports_hybrid?: boolean;
  has_expansion?: boolean;
  has_characters?: boolean;
  is_expansion?: boolean;
  expansions?: GameExpansion[];
  characters?: GameCharacter[];
}

export interface UpdateGameRequest {
  bgg_id?: number;
  name?: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  min_players?: number;
  max_players?: number;
  playing_time?: number;
  min_playtime?: number;
  max_playtime?: number;
  duration?: string;
  difficulty?: string;
  category?: string;
  categories?: string[];
  mechanics?: string[];
  year_published?: number;
  publisher?: string;
  designer?: string;
  bgg_rating?: number;
  weight?: number;
  age_min?: number;
  game_type?: 'competitive' | 'cooperative' | 'campaign' | 'hybrid';
  supports_cooperative?: boolean;
  supports_competitive?: boolean;
  supports_campaign?: boolean;
  supports_hybrid?: boolean;
  has_expansion?: boolean;
  has_characters?: boolean;
  is_expansion?: boolean;
  expansions?: GameExpansion[];
  characters?: GameCharacter[];
}

export interface CreateSessionRequest {
  game_id: number;
  session_date?: Date;
  duration_minutes?: number;
  winner_player_id?: number;
  session_type?: 'competitive' | 'cooperative' | 'campaign';
  notes?: string;
  players: Array<{
    player_id: number;
    character_id?: number;
    score: number;
    placement?: number;
    is_winner?: boolean;
    notes?: string;
  }>;
}

// Statistics and reporting types
export interface PlayerStatistics {
  player_id: number;
  player_name: string;
  games_played: number;
  wins: number;
  win_percentage: number;
  total_score: number;
  average_score: number;
  favorite_game?: string;
}

export interface GameStatistics {
  game_id: number;
  name: string;
  times_played: number;
  unique_players: number;
  average_score: number;
  bgg_rating?: number;
}

export interface CharacterStatistics {
  character_id: number;
  character_name: string;
  game_name: string;
  times_played: number;
  average_score: number;
  wins: number;
  win_rate: number;
}

export interface DashboardStats {
  total_players: number;
  total_games: number;
  total_sessions: number;
  average_session_duration: number;
}