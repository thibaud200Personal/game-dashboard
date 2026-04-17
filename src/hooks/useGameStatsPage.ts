import { useState, useMemo } from 'react';
import { Game, Player } from '@/types';

interface GamePlay {
  play_id: number
  game_id: number
  date: Date
  duration_minutes?: number
  winner_player_id?: number
  play_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  player_count: number
  average_score: number
}

// Mock play data for demonstration
const mockGamePlays: GamePlay[] = [
  { play_id: 1, game_id: 1, date: new Date('2024-02-15'), duration_minutes: 75, winner_player_id: 1, play_type: 'competitive', player_count: 4, average_score: 85 },
  { play_id: 2, game_id: 1, date: new Date('2024-02-12'), duration_minutes: 80, winner_player_id: 2, play_type: 'competitive', player_count: 3, average_score: 78 },
  { play_id: 3, game_id: 1, date: new Date('2024-02-08'), duration_minutes: 70, winner_player_id: 1, play_type: 'campaign', player_count: 4, average_score: 92 },
  { play_id: 4, game_id: 2, date: new Date('2024-02-14'), duration_minutes: 60, winner_player_id: 3, play_type: 'competitive', player_count: 5, average_score: 76 },
  { play_id: 5, game_id: 2, date: new Date('2024-02-10'), duration_minutes: 65, winner_player_id: 2, play_type: 'competitive', player_count: 4, average_score: 82 }
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
    let gamePlays: GamePlay[];
    let isGlobalStats = false;

    if (selectedGame) {
      // Specific game stats
      gamePlays = mockGamePlays.filter(s => s.game_id === selectedGame.game_id);
    } else {
      // Global stats for all games
      gamePlays = mockGamePlays;
      isGlobalStats = true;
    }

    const totalSessions = gamePlays.length;
    const totalPlayers = gamePlays.reduce((sum, s) => sum + s.player_count, 0);
    const averagePlayerCount = totalSessions > 0 ? totalPlayers / totalSessions : 0;
    const totalPlayTime = gamePlays.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const averageSessionTime = totalSessions > 0 ? totalPlayTime / totalSessions : 0;
    const averageScore = totalSessions > 0 ? gamePlays.reduce((sum, s) => sum + s.average_score, 0) / totalSessions : 0;

    // Session types distribution
    const sessionTypes = gamePlays.reduce((acc, session) => {
      acc[session.play_type] = (acc[session.play_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Player count distribution
    const playerCountDistribution = gamePlays.reduce((acc, session) => {
      const count = session.player_count.toString();
      acc[count] = (acc[count] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Winner frequency
    const winnerFrequency = gamePlays.reduce((acc, session) => {
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
    const recentSessions = gamePlays.slice(-10);
    const performanceTrend = recentSessions.map(s => s.average_score);

    // Play frequency over time
    const playFrequency = gamePlays.reduce((acc, session) => {
      const month = session.date.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Game popularity (for global stats)
    const gamePopularity = isGlobalStats ? 
      gamePlays.reduce((acc, session) => {
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
      recentSessions: gamePlays.slice(-5),
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