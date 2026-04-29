import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStatsPage } from './usePlayerStatsPage';
import PlayerStatsView from './PlayerStatsView';
import { Game, Player } from '@/types';
import { statsApi } from '@/shared/services/api/statsApi';
import { queryKeys } from '@/shared/services/api/queryKeys';

interface PlayerStatsPageProps {
  players: Player[]
  games: Game[]
  onNavigation: (view: string) => void
  currentView: string
  selectedPlayerId?: number
}

export default function PlayerStatsPage({
  players,
  games,
  onNavigation,
  currentView,
  selectedPlayerId,
}: PlayerStatsPageProps) {
  const { data: recentActivity = [] } = useQuery({
    queryKey: queryKeys.stats.playerRecentPlays(selectedPlayerId ?? 0),
    queryFn: () => statsApi.getPlayerRecentPlays(selectedPlayerId!),
    enabled: selectedPlayerId != null,
  });

  const { stats, topPlayers, selectedPlayer } = usePlayerStatsPage(players, games, selectedPlayerId);

  return (
    <PlayerStatsView
      stats={stats}
      topPlayers={topPlayers}
      recentActivity={recentActivity}
      selectedPlayer={selectedPlayer || null}
      onNavigation={onNavigation}
      currentView={currentView}
    />
  );
}
