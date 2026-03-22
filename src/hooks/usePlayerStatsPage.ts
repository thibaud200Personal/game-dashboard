import { useMemo } from 'react';
import { Game, Player } from '@/types';

interface PlayerSession {
  game_id: number
  game_name: string
  player_id: number
  score: number
  is_winner: boolean
}

// Mock session data for demonstration
const mockSessions: PlayerSession[] = [
  { game_id: 1, game_name: 'Strategy Pro', player_id: 1, score: 95, is_winner: true },
  { game_id: 2, game_name: 'Battle Arena', player_id: 1, score: 120, is_winner: true },
  { game_id: 3, game_name: 'Mind Games', player_id: 1, score: 78, is_winner: false },
  { game_id: 1, game_name: 'Strategy Pro', player_id: 2, score: 85, is_winner: false },
  { game_id: 2, game_name: 'Battle Arena', player_id: 2, score: 110, is_winner: false },
  { game_id: 3, game_name: 'Mind Games', player_id: 2, score: 92, is_winner: true },
  { game_id: 1, game_name: 'Strategy Pro', player_id: 3, score: 88, is_winner: false },
  { game_id: 2, game_name: 'Battle Arena', player_id: 3, score: 105, is_winner: false },
  { game_id: 3, game_name: 'Mind Games', player_id: 3, score: 86, is_winner: false },
];

export const usePlayerStatsPage = (
  players: Player[],
  games: Game[],
  selectedPlayerId?: number
) => {
  // Memoize displayPlayers to prevent dependency issues in useMemo hooks
  const displayPlayers = useMemo(() => {
    return selectedPlayerId 
      ? (players || []).filter(p => p.player_id === selectedPlayerId)
      : (players || []);
  }, [players, selectedPlayerId]);

  // Filter sessions for selected player if specified
  const displaySessions = selectedPlayerId
    ? mockSessions.filter(session => session.player_id === selectedPlayerId)
    : mockSessions;

  const selectedPlayer = selectedPlayerId 
    ? (players || []).find(p => p.player_id === selectedPlayerId)
    : null;

  const stats = useMemo(() => {
    const totalPlayers = displayPlayers?.length || 0;
    const totalGames = games?.length || 0;
    const totalSessions = displaySessions?.length || 0;
    const avgScore = displayPlayers?.length ? 
      displayPlayers.reduce((sum, p) => sum + p.average_score, 0) / displayPlayers.length : 0;

    return {
      totalPlayers,
      totalGames,
      totalSessions,
      avgScore: Math.round(avgScore * 10) / 10
    };
  }, [displayPlayers, games, displaySessions]);

  const topPlayers = useMemo(() => {
    return displayPlayers ? [...displayPlayers]
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 5) : [];
  }, [displayPlayers]);

  const recentActivity = useMemo(() => {
    return displaySessions ? displaySessions
      .map(session => {
        const player = players?.find(p => p.player_id === session.player_id);
        return {
          ...session,
          player_name: player?.player_name || 'Unknown'
        };
      })
      .slice(0, 5) : [];
  }, [displaySessions, players]);

  return {
    stats,
    topPlayers,
    recentActivity,
    selectedPlayer,
    displayPlayers,
    displaySessions
  };
};