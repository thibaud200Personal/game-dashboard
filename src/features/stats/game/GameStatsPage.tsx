import React from 'react';
import { useGameStatsPage } from './useGameStatsPage';
import GameStatsView from './GameStatsView';
import { Game, Player } from '@/types';

interface GameStatsPageProps {
  games: Game[]
  players: Player[]
  onNavigation: (view: string) => void
  currentView: string
  selectedCircleId?: number
}

export default function GameStatsPage({
  games,
  players,
  onNavigation,
  currentView: _currentView,
  selectedCircleId,
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
    />
  );
}
