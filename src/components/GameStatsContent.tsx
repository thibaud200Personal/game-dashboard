import React from 'react';
import { useGameStatsPage } from '@/hooks/useGameStatsPage';
import {
  Users,
  Clock,
  Star,
  ChartBar,
  Trophy
} from '@phosphor-icons/react';
import { Game, Player } from '@/types';

interface GameStatsContentProps {
  games: Game[]
  players: Player[]
  selectedGameId?: number
}

export default function GameStatsContent({ 
  games, 
  players,
  selectedGameId 
}: GameStatsContentProps) {
  const {
    selectedPeriod,
    setSelectedPeriod,
    selectedGame,
    setSelectedGame,
    gameStats
  } = useGameStatsPage(games, players, selectedGameId);

  if (!selectedGame || !gameStats) {
    return (
      <div className="text-center text-white/60 py-8">
        <ChartBar className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No game data available</p>
      </div>
    );
  }

  return (
    <>
      {/* Game Selector - Only show when not viewing specific game stats */}
      {!selectedGameId && (
        <div className="mb-6">
          <select
            value={selectedGame?.game_id || ''}
            onChange={(e) => {
              const game = games.find(g => g.game_id === parseInt(e.target.value));
              setSelectedGame(game || null);
            }}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {games.map(game => (
              <option key={game.game_id} value={game.game_id} className="bg-slate-800 text-white">
                {game.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex space-x-2 mb-6">
        {(['week', 'month', 'year', 'all'] as const).map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              selectedPeriod === period
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Game Info Card */}
      {selectedGameId && selectedGame && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={selectedGame.image || 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=150&h=150&fit=crop'}
              alt={selectedGame.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">{selectedGame.name}</h2>
              <p className="text-white/60">{selectedGame.players} players • {selectedGame.difficulty}</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{gameStats.totalSessions}</div>
              <div className="text-white/60 text-sm">Total Sessions</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{gameStats.totalPlayers}</div>
              <div className="text-white/60 text-sm">Total Players</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(gameStats.averageSessionTime)}m</div>
              <div className="text-white/60 text-sm">Avg Duration</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{gameStats.averageScore?.toFixed(1) || 'N/A'}</div>
              <div className="text-white/60 text-sm">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Players for this game */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Top Players
        </h2>
        <div className="space-y-3">
          {gameStats.topWinners.map((winner, index: number) => (
            <div key={winner.player?.player_id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                {index + 1}
              </div>
              <img
                src={winner.player?.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                alt={winner.player?.player_name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="font-medium">{winner.player?.player_name}</div>
                <div className="text-white/60 text-sm">{winner.wins} wins</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{winner.wins} wins</div>
                <div className="text-white/60 text-xs">Top winner</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-400" />
          Recent Sessions
        </h2>
        <div className="space-y-3">
          {gameStats.recentSessions.map((session, index: number) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <div className={`w-3 h-3 rounded-full ${session.winner_player_id ? 'bg-green-400' : 'bg-gray-400'}`} />
              <div className="flex-1">
                <div className="font-medium">{session.date.toLocaleDateString()}</div>
                <div className="text-white/60 text-sm">Winner: {players?.find(p => p.player_id === session.winner_player_id)?.player_name || 'Unknown'}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{session.player_count} players</div>
                <div className="text-white/60 text-xs">{session.duration_minutes}m</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Charts Placeholder */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ChartBar className="w-5 h-5 mr-2 text-purple-400" />
          {selectedGame.name} Performance Overview
        </h2>
        <div className="text-center py-8 text-white/60">
          <ChartBar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Detailed charts coming soon...</p>
        </div>
      </div>
    </>
  );
}