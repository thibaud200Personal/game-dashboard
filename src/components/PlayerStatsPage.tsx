import React from 'react';
import { usePlayerStatsPage } from '@/hooks/usePlayerStatsPage';
import PlayerStatsView from '@/views/PlayerStatsView';
import { Game, Player } from '@/types';

interface PlayerStatsPageProps {
  players: Player[]
  games: Game[]
  onNavigation: (view: string) => void
  currentView: string
  selectedPlayerId?: number
  darkMode: boolean
}

export default function PlayerStatsPage({
  players,
  games,
  onNavigation,
  currentView,
  selectedPlayerId,
  darkMode
}: PlayerStatsPageProps) {
  const {
    stats,
    topPlayers,
    recentActivity,
    selectedPlayer
  } = usePlayerStatsPage(players, games, selectedPlayerId);

  return (
    <PlayerStatsView
      stats={stats}
      topPlayers={topPlayers}
      recentActivity={recentActivity}
      selectedPlayer={selectedPlayer || null}
      onNavigation={onNavigation}
      currentView={currentView}
      darkMode={darkMode}
    />
  );
}