import React from 'react';
import {
  Trophy,
  Clock,
  Target,
  Star,
  ChartBar,
  TrendUp,
} from '@phosphor-icons/react';
import { useLabels } from '@/shared/hooks/useLabels';
import { PlayerAvatar } from '@/shared/components/InitialAvatar';
import SectionHeader from '@/shared/components/SectionHeader';

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
    play_id?: number
    game_id: number
    game_name: string
    player_id: number
    score: number
    is_winner: boolean
    player_name: string
    play_date?: string
  }>
  selectedPlayer: Player | null
  onNavigation: (view: string) => void
  currentView: string
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
}: PlayerStatsViewProps) {
  const { t } = useLabels();

  const gameTrends = React.useMemo(() => {
    if (!selectedPlayer || recentActivity.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const a of recentActivity) {
      counts[a.game_name] = (counts[a.game_name] ?? 0) + 1;
    }
    const max = Math.max(...Object.values(counts));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }));
  }, [selectedPlayer, recentActivity]);

  const labelClass = "text-slate-500 dark:text-white/60 text-sm";
  const titleClass = "text-2xl font-bold text-slate-900 dark:text-white";
  const cardClass = "bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-4 border border-slate-300 dark:border-white/20 shadow-xl";
  const cardSmClass = "bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-4 border border-slate-300 dark:border-white/20 shadow-xl";
  const subLabelClass = "text-slate-400 dark:text-white/60 text-xs";
  const valueClass = "text-slate-900 dark:text-white";
  const rowClass = "bg-slate-100 dark:bg-white/5";

  return (
    <div className="space-y-6">
      {selectedPlayer ? (
        <>
          <div className={cardClass}>
            <div className="flex items-center space-x-4 mb-6">
              <PlayerAvatar name={selectedPlayer.player_name} url={selectedPlayer.avatar} className="w-16 h-16 text-base" />
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
              <SectionHeader
                icon={<Star className="w-5 h-5 text-yellow-400" />}
                title={t('stats.player.favorite_game')}
                className="mb-2"
              />
              <div className="text-xl font-medium">{selectedPlayer.favorite_game}</div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-4 border border-slate-300 dark:border-white/20 shadow-xl flex gap-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0"><Trophy className="w-4 h-4 text-white" /></div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalPlayers}</div>
              <div className={labelClass}>{t('stats.player.stat.total_players')}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"><Target className="w-4 h-4 text-white" /></div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.avgScore}</div>
              <div className={labelClass}>{t('stats.player.stat.avg_score')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Players or Recent Activity for selected player */}
      {!selectedPlayer ? (
        <div className={cardSmClass}>
          <SectionHeader
            icon={<Star className="w-5 h-5 text-yellow-400" />}
            title={t('stats.player.top_players')}
          />
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div key={player.player_id} className={`flex items-center space-x-3 p-3 ${rowClass} rounded-xl`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                  {index + 1}
                </div>
                <PlayerAvatar name={player.player_name} url={player.avatar} className="w-8 h-8 text-xs" />
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
          <SectionHeader
            icon={<Clock className="w-5 h-5 text-blue-400" />}
            title={`${selectedPlayer.player_name}'s Recent Games`}
          />
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <ActivityRow
                key={index}
                isWinner={activity.is_winner}
                primary={activity.game_name}
                secondary={`Score: ${activity.score} pts`}
                score={activity.score}
                rowClass="bg-slate-100 dark:bg-white/5"
                valueClass={valueClass}
                labelClass={labelClass}
              />
            )) : (
              <div className="text-center py-4 text-slate-500 dark:text-white/60">{t('stats.player.recent.empty')}</div>
            )}
          </div>
        </div>
      )}

      {/* Score evolution chart — selected player only */}
      {selectedPlayer && recentActivity.length > 0 && (
        <div className={cardSmClass}>
          <SectionHeader
            icon={<TrendUp className="w-5 h-5 text-teal-400" />}
            title={t('stats.player.chart.score_evolution')}
          />
          <p className={labelClass + " mb-4"}>{t('stats.player.chart.score_evolution.subtitle')}</p>
          {(() => {
            const recent10 = recentActivity.slice(-10);
            const maxScore = Math.max(...recent10.map(a => a.score));
            return (
              <div className="flex items-end gap-1 h-28">
                {recent10.map((activity, index) => {
                  const pct = maxScore > 0 ? Math.round((activity.score / maxScore) * 100) : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-sm transition-all ${activity.is_winner ? 'bg-teal-400' : 'bg-slate-400 dark:bg-white/30'}`}
                        style={{ height: `${Math.max(pct, 8)}%` }}
                        title={`${activity.game_name}: ${activity.score} pts`}
                      />
                      <span className={labelClass + " truncate w-full text-center"} style={{ fontSize: '9px' }}>
                        {activity.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Game trends — selected player only */}
      {selectedPlayer && gameTrends.length > 0 && (
        <div className={cardSmClass}>
          <SectionHeader
            icon={<ChartBar className="w-5 h-5 text-purple-400" />}
            title={t('stats.player.chart.game_trends')}
          />
          <div className="space-y-3">
            {gameTrends.map(({ name, count, pct }) => (
              <div key={name}>
                <div className="flex justify-between mb-1">
                  <span className={valueClass + " text-sm truncate max-w-[75%]"}>{name}</span>
                  <span className={labelClass}>{count} {t('stats.player.chart.game_trends.plays')}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity (only for global stats) */}
      {!selectedPlayer && (
        <div className={cardSmClass}>
          <SectionHeader
            icon={<Clock className="w-5 h-5 text-blue-400" />}
            title={t('stats.player.activity.title')}
          />
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

    </div>
  );
}
