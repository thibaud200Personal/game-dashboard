import { useMemo } from 'react';
import { PlayerStatistics } from '@/types';
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

  return {
    stats,
    topPlayers,
    selectedPlayer,
    displayPlayers,
  };
};
