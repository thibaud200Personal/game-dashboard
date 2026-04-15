// Re-export shared types — single source of truth
export type {
  Player,
  PlayerStatistics,
  Game,
  GameExpansion,
  GameCharacter,
  GameSession,
  SessionPlayer,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  CreateGameRequest,
  UpdateGameRequest,
  CreateSessionRequest,
  DashboardStats,
  GameStatistics,
  BGGGame,
  BGGExpansion,
  BGGCharacter,
  BGGSearchResult,
  LocaleInfo,
} from '../../shared/types';

// ── Frontend-only types ──────────────────────────────────────────────────────

// Navigation (transitional — removed in C2 when React Router replaces state-based nav)
export type NavigationHandler = (view: string, id?: number, source?: string) => void

export interface BasePageProps {
  currentView?: string
  onNavigation: NavigationHandler
}

export interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Form data types (frontend form state — separate from API request types)
export interface PlayerFormData {
  player_name: string
  pseudo: string
  avatar: string
  favorite_game: string
}

export interface GameFormData {
  name: string
  description: string
  image: string
  thumbnail?: string
  min_players: number
  max_players: number
  duration: string
  playing_time?: number
  min_playtime?: number
  max_playtime?: number
  difficulty: string
  category: string
  categories?: string[]
  mechanics?: string[]
  families?: string[]
  year_published: number
  publisher: string
  designer: string
  bgg_rating: number
  weight: number
  age_min: number
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  has_expansion: boolean
  has_characters: boolean
  is_expansion?: boolean
  bgg_id?: number
}


// Session creation (frontend-side extended payload with cooperative fields)
export interface CreateSessionPayload {
  game_id: number
  session_date?: Date
  duration_minutes?: number | null
  winner_player_id?: number | null
  session_type?: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  notes?: string | null
  players: Array<{
    player_id: number
    score: number
    is_winner: boolean
  }>
}

// Hook return utilities
import React from 'react';

export interface UseFormReturn<T> {
  formData: T
  setFormData: React.Dispatch<React.SetStateAction<T>>
  resetForm: () => void
  isValid: boolean
}

export interface UseDialogReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export default {};
