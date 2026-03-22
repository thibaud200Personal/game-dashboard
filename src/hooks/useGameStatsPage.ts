import { useState, useMemo } from 'react';
import { Game, Player } from '@/types';

interface GameSession {
  session_id: number
  game_id: number
  date: Date
  duration_minutes?: number
  winner_player_id?: number
  session_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  player_count: number
  average_score: number
}

// Mock session data for demonstration
const mockGameSessions: GameSession[] = [
  { session_id: 1, game_id: 1, date: new Date('2024-02-15'), duration_minutes: 75, winner_player_id: 1, session_type: 'competitive', player_count: 4, average_score: 85 },
  { session_id: 2, game_id: 1, date: new Date('2024-02-12'), duration_minutes: 80, winner_player_id: 2, session_type: 'competitive', player_count: 3, average_score: 78 },
  { session_id: 3, game_id: 1, date: new Date('2024-02-08'), duration_minutes: 70, winner_player_id: 1, session_type: 'campaign', player_count: 4, average_score: 92 },
  { session_id: 4, game_id: 2, date: new Date('2024-02-14'), duration_minutes: 60, winner_player_id: 3, session_type: 'competitive', player_count: 5, average_score: 76 },
  { session_id: 5, game_id: 2, date: new Date('2024-02-10'), duration_minutes: 65, winner_player_id: 2, session_type: 'competitive', player_count: 4, average_score: 82 }
];

export const useGameStatsPage = (
  games: Game[],
  players: Player[],
  selectedGameId?: number
) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  
  // Use selectedGameId if provided, otherwise null for global stats
  const [selectedGame, setSelectedGame] = useState<Game | null>(() => {
    if (selectedGameId && games?.length) {
      return games.find(g => g.game_id === selectedGameId) || null;
    }
    return null; // No game selected = global stats
  });

  // Calculate comprehensive game stats
  const gameStats = useMemo(() => {
    let gameSessions: GameSession[];
    let isGlobalStats = false;

    if (selectedGame) {
      // Specific game stats
      gameSessions = mockGameSessions.filter(s => s.game_id === selectedGame.game_id);
    } else {
      // Global stats for all games
      gameSessions = mockGameSessions;
      isGlobalStats = true;
    }

    const totalSessions = gameSessions.length;
    const totalPlayers = gameSessions.reduce((sum, s) => sum + s.player_count, 0);
    const averagePlayerCount = totalSessions > 0 ? totalPlayers / totalSessions : 0;
    const totalPlayTime = gameSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const averageSessionTime = totalSessions > 0 ? totalPlayTime / totalSessions : 0;
    const averageScore = totalSessions > 0 ? gameSessions.reduce((sum, s) => sum + s.average_score, 0) / totalSessions : 0;

    // Session types distribution
    const sessionTypes = gameSessions.reduce((acc, session) => {
      acc[session.session_type] = (acc[session.session_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Player count distribution
    const playerCountDistribution = gameSessions.reduce((acc, session) => {
      const count = session.player_count.toString();
      acc[count] = (acc[count] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Winner frequency
    const winnerFrequency = gameSessions.reduce((acc, session) => {
      if (session.winner_player_id) {
        acc[session.winner_player_id] = (acc[session.winner_player_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const topWinners = Object.entries(winnerFrequency)
      .map(([playerId, wins]) => {
        const player = players?.find(p => p.player_id === parseInt(playerId));
        return { player, wins: wins as number };
      })
      .filter(w => w.player)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 5);

    // Performance trend (last 10 sessions)
    const recentSessions = gameSessions.slice(-10);
    const performanceTrend = recentSessions.map(s => s.average_score);

    // Play frequency over time
    const playFrequency = gameSessions.reduce((acc, session) => {
      const month = session.date.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Game popularity (for global stats)
    const gamePopularity = isGlobalStats ? 
      gameSessions.reduce((acc, session) => {
        const game = games.find(g => g.game_id === session.game_id);
        if (game) {
          acc[game.name] = (acc[game.name] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) : {};

    return {
      totalSessions,
      totalPlayers,
      averagePlayerCount,
      totalPlayTime,
      averageSessionTime,
      averageScore,
      sessionTypes,
      playerCountDistribution,
      topWinners,
      performanceTrend,
      playFrequency,
      recentSessions: gameSessions.slice(-5),
      isGlobalStats,
      gamePopularity
    };
  }, [selectedGame, players, games]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    selectedGame,
    setSelectedGame,
    gameStats,
    games
  };
};