// Shared types for the application

export interface Player {
  player_id: number;
  player_name: string;
  pseudo: string;
  avatar?: string;
  stats?: string;
  games_played: number;
  wins: number;
  total_score: number;
  average_score: number;
  created_at: Date;
  updated_at?: Date;
  favorite_game: string;
}

export interface Game {
  game_id: number;
  bgg_id?: number;
  name: string;
  description: string;
  image: string;
  thumbnail?: string;
  min_players: number;
  max_players: number;
  duration: string;
  playing_time?: number;
  min_playtime?: number;
  max_playtime?: number;
  difficulty: string;
  category: string;
  categories?: string[];
  mechanics?: string[];
  families?: string[];
  year_published: number;
  publisher: string;
  designer: string;
  bgg_rating: number;
  weight: number;
  age_min: number;
  supports_cooperative: boolean;
  supports_competitive: boolean;
  supports_campaign: boolean;
  supports_hybrid: boolean;
  has_expansion: boolean;
  has_characters: boolean;
  created_at: Date;
  updated_at?: Date;
  expansions: GameExpansion[];
  characters: GameCharacter[];
  players: string; // Computed field "min-max"
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
  avatar?: string;
  abilities: string[];
}

export interface GameSession {
  session_id?: number;
  game_id: number;
  session_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid';
  session_date: Date;
  duration_minutes?: number;
  notes?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface SessionPlayer {
  session_player_id?: number;
  session_id: number;
  player_id: number;
  character_id?: number;
  score?: number;
  placement?: number;
  is_winner: boolean;
  notes?: string;
}

// Navigation handler type
export type NavigationHandler = (view: string, id?: number, source?: string) => void;

// Form data types
export interface PlayerFormData {
  player_name: string;
  pseudo: string;
  avatar: string;
  favorite_game: string;
  total_score: number;
  games_played: number;
  wins: number;
}

export interface GameFormData {
  name: string;
  description: string;
  image: string;
  thumbnail?: string;
  min_players: number;
  max_players: number;
  duration: string;
  playing_time?: number;
  min_playtime?: number;
  max_playtime?: number;
  difficulty: string;
  category: string;
  categories?: string[];
  mechanics?: string[];
  families?: string[];
  year_published: number;
  publisher: string;
  designer: string;
  bgg_rating: number;
  weight: number;
  age_min: number;
  supports_cooperative: boolean;
  supports_competitive: boolean;
  supports_campaign: boolean;
  supports_hybrid: boolean;
  has_expansion: boolean;
  has_characters: boolean;
  is_expansion?: boolean;
  bgg_id?: number;
}

// Statistics types
export interface PlayerStats {
  player_id: number;
  total_games: number;
  total_wins: number;
  win_rate: number;
  average_score: number;
  favorite_games: string[];
  recent_activity: SessionPlayer[];
}

export interface GameStats {
  game_id: number;
  total_sessions: number;
  unique_players: number;
  average_duration: number;
  most_frequent_players: Player[];
  win_distribution: { [key: string]: number };
}

// BGG API types
export interface BGGSearchResult {
  id: number;
  name: string;
  year_published: number;
  type: string;
  thumbnail: string;
}

export interface BGGGame {
  id: number;
  name: string;
  description: string;
  image: string;
  thumbnail: string;
  min_players: number;
  max_players: number;
  playing_time: number;
  min_playtime: number;
  max_playtime: number;
  min_age: number;
  year_published: number;
  categories: string[];
  mechanics: string[];
  families: string[];
  designers: string[];
  publishers: string[];
  rating: number;
  weight: number;
  difficulty: string;
  expansions: BGGExpansion[];
  characters: BGGCharacter[];
  supports_cooperative: boolean;
  supports_competitive: boolean;
  supports_campaign: boolean;
  supports_hybrid: boolean;
  is_expansion: boolean;
  base_game_id?: number;
}

export interface BGGExpansion {
  expansion_id?: number;
  bgg_expansion_id: number;
  name: string;
  year_published: number;
  description?: string;
}

export interface BGGCharacter {
  character_id?: string;
  character_key: string;
  name: string;
  description: string;
  abilities: string[];
  avatar?: string;
}

// Session creation payload (includes cooperative-specific fields)
export interface CreateSessionPayload {
  game_id: number;
  session_date?: Date;
  duration_minutes?: number | null;
  winner_player_id?: number | null;
  session_type?: 'competitive' | 'cooperative' | 'campaign' | 'hybrid';
  notes?: string | null;
  players: Array<{
    player_id: number;
    score: number;
    is_winner: boolean;
  }>;
  team_score?: number;
  team_success?: boolean;
  difficulty_level?: string;
  objectives?: Array<{ description: string; completed: boolean; points: number }>;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component props base types
export interface BasePageProps {
  currentView?: string;
  onNavigation: NavigationHandler;
}

export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Hook return types for common patterns
import React from 'react';

export interface UseFormReturn<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  resetForm: () => void;
  isValid: boolean;
}

export interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface UseMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// Loading states
export interface LoadingState {
  loading: boolean;
  error: AppError | null;
}

// Pagination types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// Search and filter types
export interface SearchState {
  query: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default {};