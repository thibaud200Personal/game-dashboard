import { useMemo } from 'react';
import { Player, PlayerStatistics } from '@/types';
import { Game } from '@/types';

export const usePlayerStatsPage = (
  players: PlayerStatistics[],
  games: Game[],
  selectedPlayerId?: number
) => {
  const displayPlayers = useMemo(() => {
    return selectedPlayerId
      ? players.filter(p => p.player_id === selectedPlayerId)
      : players;
  }, [players, selectedPlayerId]);

  const selectedPlayer = selectedPlayerId
    ? players.find(p => p.player_id === selectedPlayerId) ?? null
    : null;

  const stats = useMemo(() => {
    const totalPlayers = displayPlayers.length;
    const totalGames = games.length;
    const totalSessions = displayPlayers.reduce((sum, p) => sum + (p.games_played ?? 0), 0);
    const avgScore = displayPlayers.length
      ? displayPlayers.reduce((sum, p) => sum + (p.average_score ?? 0), 0) / displayPlayers.length
      : 0;

    return {
      totalPlayers,
      totalGames,
      totalSessions,
      avgScore: Math.round(avgScore * 10) / 10,
    };
  }, [displayPlayers, games]);

  const topPlayers = useMemo(() => {
    return [...displayPlayers]
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 5);
  }, [displayPlayers]);

  // No per-play API yet — recentActivity is empty until a plays/history endpoint is added
  const recentActivity: Array<{
    game_id: number;
    game_name: string;
    player_id: number;
    score: number;
    is_winner: boolean;
    player_name: string;
  }> = [];

  return {
    stats,
    topPlayers,
    recentActivity,
    selectedPlayer,
    displayPlayers,
  };
};

// Re-export Player type for consumers that import from this module
export type { Player, PlayerStatistics };
