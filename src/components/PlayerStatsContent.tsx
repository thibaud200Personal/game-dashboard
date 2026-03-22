import React from 'react';
import { usePlayerStatsPage } from '@/hooks/usePlayerStatsPage';
import {
  Trophy,
  Clock,
  Target,
  Star,
  ChartBar
} from '@phosphor-icons/react';
import { Game, Player } from '@/types';

interface PlayerStatsContentProps {
  players: Player[]
  games: Game[]
  selectedPlayerId?: number
  darkMode?: boolean
}

export default function PlayerStatsContent({ 
  players, 
  games,
  selectedPlayerId,
  darkMode = true
}: PlayerStatsContentProps) {
  // darkMode est bien récupéré depuis les props, valeur par défaut true
  const {
    stats,
    topPlayers,
    recentActivity,
    selectedPlayer
  } = usePlayerStatsPage(players, games, selectedPlayerId);

  return (
  <div className={darkMode ? "" : "text-slate-900"}>
      {selectedPlayer ? (
        /* Individual Player Stats */
        <>
          {/* Player Profile */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={selectedPlayer.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                alt={selectedPlayer.player_name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className={darkMode ? "text-2xl font-bold" : "text-2xl font-bold text-blue-700"}>{selectedPlayer.player_name}</h2>
                <p className={darkMode ? "text-white/60" : "text-slate-500"}>Player Profile</p>
              </div>
            </div>
          </div>

          {/* Individual Player Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className={darkMode ? "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl" : "bg-white rounded-2xl p-4 border border-slate-200 shadow-xl"}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{selectedPlayer.wins}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>Wins</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className={darkMode ? "text-2xl font-bold" : "text-2xl font-bold text-blue-700"}>{selectedPlayer.games_played}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>Games Played</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className={darkMode ? "text-2xl font-bold" : "text-2xl font-bold text-blue-700"}>{selectedPlayer.total_score}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>Total Score</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <ChartBar className="w-5 h-5" />
                </div>
                <div>
                  <div className={darkMode ? "text-2xl font-bold" : "text-2xl font-bold text-purple-700"}>{selectedPlayer.average_score}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>Avg Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Game */}
          {selectedPlayer.favorite_game && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <h3 className={darkMode ? "text-lg font-semibold mb-2 flex items-center" : "text-lg font-semibold mb-2 flex items-center text-blue-700"}>
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Favorite Game
              </h3>
              <div className="text-xl font-medium">{selectedPlayer.favorite_game}</div>
                  <div className={darkMode ? "text-xl font-medium" : "text-xl font-medium text-blue-700"}>{selectedPlayer.favorite_game}</div>
            </div>
          )}
        </>
      ) : (
        /* Global Player Stats */
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className={darkMode ? "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl" : "bg-white rounded-2xl p-4 border border-slate-200 shadow-xl"}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalPlayers}</div>
                  <div className={darkMode ? "text-2xl font-bold" : "text-2xl font-bold text-blue-700"}>{stats.totalPlayers}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>Total Players</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className={darkMode ? "text-2xl font-bold" : "text-2xl font-bold text-purple-700"}>{stats.avgScore}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>Avg Score</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top Players or Recent Activity for selected player */}
      {!selectedPlayer ? (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Top Players
          </h2>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div key={player.player_id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                  {index + 1}
                </div>
                <img
                  src={player.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                  alt={player.player_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium">{player.player_name}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>{player.total_score} pts</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{player.wins} wins</div>
                  <div className="text-white/60 text-xs">{player.games_played} games</div>
                  <div className={darkMode ? "text-white/60 text-xs" : "text-slate-400 text-xs"}>{player.games_played} games</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            {selectedPlayer.player_name}'s Recent Games
          </h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                <div className={`w-3 h-3 rounded-full ${activity.is_winner ? 'bg-green-400' : 'bg-gray-400'}`} />
                <div className="flex-1">
                  <div className="font-medium">{activity.game_name}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>Score: {activity.score} pts</div>
                </div>
                <div className="text-right">
                  {activity.is_winner && (
                    <div className="text-green-400 text-xs font-medium">Winner</div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-white/60">
                <div className={darkMode ? "text-center py-4 text-white/60" : "text-center py-4 text-slate-500"}>
                  No recent games found
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity (only for global stats) */}
      {!selectedPlayer && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                <div className={`w-3 h-3 rounded-full ${activity.is_winner ? 'bg-green-400' : 'bg-gray-400'}`} />
                <div className="flex-1">
                  <div className="font-medium">{activity.player_name}</div>
                  <div className={darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm"}>played {activity.game_name}</div>
                  <div className={darkMode ? "text-white/60 text-xs" : "text-green-700 text-xs"}>Winner</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{activity.score} pts</div>
                  {activity.is_winner && (
                    <div className="text-green-400 text-xs">Winner</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Charts Placeholder */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ChartBar className="w-5 h-5 mr-2 text-purple-400" />
          {selectedPlayer ? `${selectedPlayer.player_name}'s Performance` : 'Performance Overview'}
        </h2>
        <div className={darkMode ? "text-center py-8 text-white/60" : "text-center py-8 text-slate-500"}>
          <ChartBar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Detailed charts coming soon...</p>
        </div>
      </div>
    </div>
  );
}