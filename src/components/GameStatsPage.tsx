import React from 'react';
import { useGameStatsPage } from '@/hooks/useGameStatsPage';
import GameStatsView from '@/views/GameStatsView';

interface Game {
  game_id: number
  name: string
  description?: string
  image?: string
  min_players: number
  max_players: number
  duration?: string
  difficulty?: string
  category?: string
  year_published?: number
  bgg_rating?: number
  weight?: number
  age_min?: number
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  has_expansion: boolean
  has_characters: boolean
  created_at: Date
  players?: string
}

interface Player {
  player_id: number
  player_name: string
  avatar?: string
}

interface GameStatsPageProps {
  games: Game[]
  players: Player[]
  onNavigation: (view: string) => void
  currentView: string
  selectedCircleId?: number
  darkMode: boolean
}

export default function GameStatsPage({
  games,
  players,
  onNavigation,
  currentView: _currentView,
  selectedCircleId,
  darkMode
}: GameStatsPageProps) {
  const {
    selectedPeriod,
    setSelectedPeriod,
    selectedGame,
    setSelectedGame,
    gameStats
  } = useGameStatsPage(games, players, selectedCircleId);

  return (
    <GameStatsView
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      selectedGame={selectedGame}
      setSelectedGame={setSelectedGame}
      gameStats={gameStats}
      games={games}
      onNavigation={onNavigation}
      selectedGameId={selectedCircleId}
      players={players}
      darkMode={darkMode}
    />
  );
}