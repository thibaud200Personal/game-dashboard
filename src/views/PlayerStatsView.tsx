import React from 'react';
import {
  Trophy,
  Clock,
  Target,
  Star,
  ChartBar
} from '@phosphor-icons/react';
import { useLabels } from '@/shared/hooks/useLabels';

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

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  cardClass: string;
  titleClass: string;
  labelClass: string;
}

function StatCard({ icon, value, label, cardClass, titleClass, labelClass }: StatCardProps) {
  return (
    <div className={cardClass}>
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <div className={titleClass}>{value}</div>
          <div className={labelClass}>{label}</div>
        </div>
      </div>
    </div>
  );
}

interface ActivityRowProps {
  isWinner: boolean;
  primary: string;
  secondary: string;
  score: number;
  rowClass: string;
  valueClass: string;
  labelClass: string;
}

function ActivityRow({ isWinner, primary, secondary, score, rowClass, valueClass, labelClass }: ActivityRowProps) {
  return (
    <div className={`flex items-center space-x-3 p-3 ${rowClass} rounded-xl`}>
      <div className={`w-3 h-3 rounded-full ${isWinner ? 'bg-green-400' : 'bg-gray-400'}`} />
      <div className="flex-1">
        <div className={valueClass + " font-medium"}>{primary}</div>
        <div className={labelClass}>{secondary}</div>
      </div>
      <div className="text-right">
        <div className={valueClass + " text-sm font-medium"}>{score} pts</div>
        {isWinner && <div className="text-green-400 text-xs">Winner</div>}
      </div>
    </div>
  );
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
  const { t } = useLabels();
  const isDark = darkMode;
  const labelClass = isDark ? "text-white/60 text-sm" : "text-slate-500 text-sm";
  const titleClass = isDark ? "text-2xl font-bold text-white" : "text-2xl font-bold text-slate-900";
  const cardClass = isDark ? "bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl" : "bg-white rounded-2xl p-6 border border-slate-300 shadow-xl";
  const cardSmClass = isDark ? "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl" : "bg-white rounded-2xl p-4 border border-slate-300 shadow-xl";
  const subLabelClass = isDark ? "text-white/60 text-xs" : "text-slate-400 text-xs";
  const valueClass = isDark ? "text-white" : "text-slate-900";
  const sectionTitleClass = isDark ? "text-lg font-semibold mb-4 flex items-center text-white" : "text-lg font-semibold mb-4 flex items-center text-slate-900";
  const rowClass = isDark ? "bg-white/5" : "bg-slate-100";

  return (
    <div className="space-y-6">
      {selectedPlayer ? (
        <>
          <div className={cardClass}>
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={selectedPlayer.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face&fm=webp&q=70`}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <h2 className={titleClass}>{selectedPlayer.player_name}</h2>
                <p className={labelClass}>{t('stats.player.profile')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center"><Trophy className="w-5 h-5" /></div>} value={selectedPlayer.wins} label={t('stats.player.stat.wins')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
            <StatCard icon={<div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"><Target className="w-5 h-5" /></div>} value={selectedPlayer.games_played} label={t('stats.player.stat.games_played')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
            <StatCard icon={<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><Star className="w-5 h-5" /></div>} value={selectedPlayer.total_score} label={t('stats.player.stat.total_score')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
            <StatCard icon={<div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center"><ChartBar className="w-5 h-5" /></div>} value={selectedPlayer.average_score} label={t('stats.player.stat.avg_score')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
          </div>

          {selectedPlayer.favorite_game && (
            <div className={cardClass}>
              <h3 className={sectionTitleClass.replace('mb-4', 'mb-2')}>
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                {t('stats.player.favorite_game')}
              </h3>
              <div className="text-xl font-medium">{selectedPlayer.favorite_game}</div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center"><Trophy className="w-5 h-5" /></div>} value={stats.totalPlayers} label={t('stats.player.stat.total_players')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
          <StatCard icon={<div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"><Target className="w-5 h-5" /></div>} value={stats.avgScore} label={t('stats.player.stat.avg_score')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
        </div>
      )}

      {/* Top Players or Recent Activity for selected player */}
      {!selectedPlayer ? (
        <div className={cardSmClass}>
          <h2 className={sectionTitleClass}>
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            {t('stats.player.top_players')}
          </h2>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div key={player.player_id} className={`flex items-center space-x-3 p-3 ${rowClass} rounded-xl`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                  {index + 1}
                </div>
                <img
                  src={player.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&fm=webp&q=70`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                  loading="lazy"
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
        <div className={cardSmClass}>
          <h2 className={sectionTitleClass}>
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            {selectedPlayer.player_name}'s Recent Games
          </h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <ActivityRow
                key={index}
                isWinner={activity.is_winner}
                primary={activity.game_name}
                secondary={`Score: ${activity.score} pts`}
                score={activity.score}
                rowClass="bg-white/5"
                valueClass={valueClass}
                labelClass={labelClass}
              />
            )) : (
              <div className="text-center py-4 text-white/60">{t('stats.player.recent.empty')}</div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity (only for global stats) */}
      {!selectedPlayer && (
        <div className={cardSmClass}>
          <h2 className={sectionTitleClass}>
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            {t('stats.player.activity.title')}
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <ActivityRow
                key={index}
                isWinner={activity.is_winner}
                primary={activity.player_name}
                secondary={`played ${activity.game_name}`}
                score={activity.score}
                rowClass={rowClass}
                valueClass={valueClass}
                labelClass={labelClass}
              />
            ))}
          </div>
        </div>
      )}

      {/* Performance Charts Placeholder */}
      <div className={cardSmClass}>
        <h2 className={sectionTitleClass}>
          <ChartBar className="w-5 h-5 mr-2 text-purple-400" />
          {selectedPlayer ? `${selectedPlayer.player_name}'s Performance` : 'Performance Overview'}
        </h2>
        <div className={labelClass + " text-center py-8"}>
          <ChartBar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>{t('stats.player.performance.coming_soon')}</p>
        </div>
      </div>
    </div>
  );
}
