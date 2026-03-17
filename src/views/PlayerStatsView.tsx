import React from 'react';
import {
  Trophy,
  Clock,
  Target,
  Star,
  ChartBar
} from '@phosphor-icons/react';

interface Player {
  player_id: number
  player_name: string
  avatar?: string
  games_played: number
  wins: number
  total_score: number
  average_score: number
  favorite_game?: string
  created_at: Date
  updated_at?: Date
  stats?: string
}

interface PlayerStatsViewProps {
  stats: {
    totalPlayers: number
    totalGames: number
    totalSessions: number
    avgScore: number
  }
  topPlayers: Player[]
  recentActivity: Array<{
    game_id: number
    game_name: string
    player_id: number
    score: number
    is_winner: boolean
    player_name: string
  }>
  selectedPlayer: Player | null
  onNavigation: (view: string) => void
  currentView: string
  darkMode: boolean
}

export default function PlayerStatsView({
  stats,
  topPlayers,
  recentActivity,
  selectedPlayer,
  onNavigation: _onNavigation,
  currentView: _currentView,
  darkMode
}: PlayerStatsViewProps) {
  const isDark = darkMode;
  const labelClass = isDark ? "text-white/60 text-sm" : "text-slate-500 text-sm";
  const titleClass = isDark ? "text-2xl font-bold text-white" : "text-2xl font-bold text-slate-900";
  const cardClass = isDark ? "bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl" : "bg-white rounded-2xl p-6 border border-slate-300 shadow-xl";
  const subLabelClass = isDark ? "text-white/60 text-xs" : "text-slate-400 text-xs";
  const valueClass = isDark ? "text-white" : "text-slate-900";
  return (
    <div className="space-y-6">
        {selectedPlayer ? (
          <>
            <div className={cardClass}>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={selectedPlayer.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                  alt={selectedPlayer.player_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className={titleClass}>{selectedPlayer.player_name}</h2>
                  <p className={labelClass}>Player Profile</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={cardClass}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={titleClass}>{selectedPlayer.wins}</div>
                    <div className={labelClass}>Wins</div>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={titleClass}>{selectedPlayer.games_played}</div>
                    <div className={labelClass}>Games Played</div>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={titleClass}>{selectedPlayer.total_score}</div>
                    <div className={labelClass}>Total Score</div>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <ChartBar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={titleClass}>{selectedPlayer.average_score}</div>
                    <div className={labelClass}>Avg Score</div>
                  </div>
                </div>
              </div>
            </div>

            {selectedPlayer.favorite_game && (
              <div className={cardClass}>
                <h3 className={isDark ? "text-lg font-semibold mb-2 flex items-center text-white" : "text-lg font-semibold mb-2 flex items-center text-slate-900"}>
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  Favorite Game
                </h3>
                <div className="text-xl font-medium">{selectedPlayer.favorite_game}</div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className={cardClass}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={titleClass}>{stats.totalPlayers}</div>
                    <div className={labelClass}>Total Players</div>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={titleClass}>{stats.avgScore}</div>
                    <div className={labelClass}>Avg Score</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Top Players or Recent Activity for selected player */}
        {!selectedPlayer ? (
          <div className={cardClass.replace('p-6', 'p-4')}>
            <h2 className={isDark ? "text-lg font-semibold mb-4 flex items-center text-white" : "text-lg font-semibold mb-4 flex items-center text-slate-900"}>
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Top Players
            </h2>
            <div className="space-y-3">
              {topPlayers.map((player, index) => (
                <div key={player.player_id} className={isDark ? "flex items-center space-x-3 p-3 bg-white/5 rounded-xl" : "flex items-center space-x-3 p-3 bg-slate-100 rounded-xl"}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={player.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                    alt={player.player_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className={valueClass + " font-medium"}>{player.player_name}</div>
                    <div className={labelClass}>{player.total_score} pts</div>
                  </div>
                  <div className="text-right">
                    <div className={valueClass + " text-sm font-medium"}>{player.wins} wins</div>
                    <div className={subLabelClass}>{player.games_played} games</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={isDark ? "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl" : "bg-white rounded-2xl p-4 border border-slate-300 shadow-xl"}>
            <h2 className={isDark ? "text-lg font-semibold mb-4 flex items-center text-white" : "text-lg font-semibold mb-4 flex items-center text-slate-900"}>
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              {selectedPlayer.player_name}'s Recent Games
            </h2>
            <div className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${activity.is_winner ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{activity.game_name}</div>
                    <div className="text-white/60 text-sm">Score: {activity.score} pts</div>
                  </div>
                  <div className="text-right">
                    {activity.is_winner && (
                      <div className="text-green-400 text-xs font-medium">Winner</div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-white/60">
                  No recent games found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity (only for global stats) */}
        {!selectedPlayer && (
          <div className={isDark ? "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl" : "bg-white rounded-2xl p-4 border border-slate-300 shadow-xl"}>
            <h2 className={isDark ? "text-lg font-semibold mb-4 flex items-center text-white" : "text-lg font-semibold mb-4 flex items-center text-slate-900"}>
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className={isDark ? "flex items-center space-x-3 p-3 bg-white/5 rounded-xl" : "flex items-center space-x-3 p-3 bg-slate-100 rounded-xl"}>
                  <div className={`w-3 h-3 rounded-full ${activity.is_winner ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <div className="flex-1">
                    <div className={valueClass + " font-medium"}>{activity.player_name}</div>
                    <div className={labelClass}>played {activity.game_name}</div>
                  </div>
                  <div className="text-right">
                    <div className={valueClass + " text-sm font-medium"}>{activity.score} pts</div>
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
        <div className={isDark ? "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl" : "bg-white rounded-2xl p-4 border border-slate-300 shadow-xl"}>
          <h2 className={isDark ? "text-lg font-semibold mb-4 flex items-center text-white" : "text-lg font-semibold mb-4 flex items-center text-slate-900"}>
            <ChartBar className="w-5 h-5 mr-2 text-purple-400" />
            {selectedPlayer ? `${selectedPlayer.player_name}'s Performance` : 'Performance Overview'}
          </h2>
          <div className={labelClass + " text-center py-8"}>
            <ChartBar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Detailed charts coming soon...</p>
          </div>
        </div>
      </div>
    );
  }