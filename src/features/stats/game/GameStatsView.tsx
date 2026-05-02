import React from 'react';
import {
  TrendUp,
  Users,
  Clock,
  Star,
  ChartBar,
  Calendar,
  Trophy,
  Target
} from '@phosphor-icons/react';
import { Game, Player } from '@/types';
import { useGameStatsPage } from './useGameStatsPage';
import { getMedalClass } from '@/shared/utils/gameHelpers';
import { useLabels } from '@/shared/hooks/useLabels';
import { gameModeColors, gameModeFallback, type GameMode } from '@/shared/theme/gameModeColors';
import { PlayerAvatar } from '@/shared/components/InitialAvatar';
import SectionHeader from '@/shared/components/SectionHeader';
import StatCard from '@/shared/components/StatCard';

interface GameStatsViewProps {
  selectedGame: Game | null
  setSelectedGame: (game: Game | null) => void
  gameStats: ReturnType<typeof useGameStatsPage>['gameStats']
  games: Game[]
  players: Player[]
}
export default function GameStatsView({
  selectedGame,
  setSelectedGame,
  gameStats,
  games,
  players,
}: GameStatsViewProps) {
  const { t } = useLabels();

  if (!gameStats) {
    return (
      <div className="space-y-6">
        <div className="text-center text-slate-500 dark:text-white/60">{t('stats.game.no_data')}</div>
      </div>
    );
  }

  const labelClass = "text-slate-500 dark:text-white/60 text-sm";
  const titleClass = "text-2xl font-bold text-slate-900 dark:text-white";
  const cardClass = "bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-6 border border-slate-300 dark:border-white/20 shadow-xl";
  const valueClass = "text-slate-900 dark:text-white";
  const subLabelClass = "text-slate-400 dark:text-white/60 text-xs";
  const progressBgClass = "w-full bg-slate-200 dark:bg-white/10 rounded-full h-2";

  const isGlobalStats = gameStats.isGlobalStats;

  return (
    <div className="space-y-6">
      {/* Main stats card */}
      <div className={cardClass}>
        <div className="flex items-center space-x-4 mb-6">
          {isGlobalStats ? (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <ChartBar className="w-8 h-8 text-white" />
            </div>
          ) : selectedGame?.image ? (
            <img
              src={selectedGame.image}
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <ChartBar className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h2 className={titleClass}>
              {isGlobalStats ? t('stats.game.all_title') : selectedGame?.name}
            </h2>
            <p className={labelClass}>
              {isGlobalStats
                ? `Overview across ${games.length} games`
                : `${selectedGame?.category} • ${selectedGame?.players} players`}
            </p>
            {!isGlobalStats && selectedGame?.bgg_rating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className={labelClass}>{selectedGame.bgg_rating}/10</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />} value={String(gameStats.totalSessions)} label={t('stats.game.stat.sessions')} />
          <StatCard icon={<Users className="w-8 h-8 text-green-400 mx-auto mb-2" />} value={gameStats.averagePlayerCount.toFixed(1)} label={t('stats.game.stat.avg_players')} />
          <StatCard icon={<Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />} value={`${Math.round(gameStats.averageSessionTime)}m`} label={t('stats.game.stat.avg_duration')} />
          <StatCard icon={<Target className="w-8 h-8 text-orange-400 mx-auto mb-2" />} value={gameStats.averageScore.toFixed(0)} label={t('stats.game.stat.avg_score')} />
        </div>
        {!isGlobalStats && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => setSelectedGame(null)}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg transition-colors text-center text-slate-900 dark:text-white"
            >
              {t('stats.game.back_to_all')}
            </button>
          </div>
        )}
      </div>

      {/* Game Selector - only in global stats mode */}
      {isGlobalStats && (
        <div className={cardClass}>
          <SectionHeader title={t('stats.game.select.title')} />
          <div className="grid grid-cols-1 gap-3">
            {games.map((game) => {
              const gameSessions = gameStats.gamePopularity[game.name] || 0;
              return (
                <button
                  key={game.game_id}
                  onClick={() => setSelectedGame(game)}
                  className="flex items-center space-x-3 p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors text-left"
                >
                  {game.image ? (
                    <img
                      src={game.image}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <ChartBar className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className={`${valueClass} font-medium`}>{game.name}</div>
                    <div className={labelClass}>{gameSessions} {t('stats.game.sessions_label')}</div>
                  </div>
                  <ChartBar className="w-5 h-5 text-primary" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Popularity - only in global stats mode */}
      {isGlobalStats && (
        <div className={cardClass}>
          <SectionHeader
            icon={<ChartBar className="w-5 h-5" />}
            title={t('stats.game.popularity.title')}
          />
          <div className="space-y-3">
            {Object.entries(gameStats.gamePopularity)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([gameName, sessions]) => {
                const maxSessions = Math.max(...Object.values(gameStats.gamePopularity).map(v => v as number));
                const percentage = maxSessions > 0 ? ((sessions as number) / maxSessions) * 100 : 0;
                return (
                  <div key={gameName} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={valueClass}>{gameName}</span>
                      <span className={labelClass}>{sessions as number} {t('stats.game.sessions_label')}</span>
                    </div>
                    <div className={progressBgClass}>
                      <div className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Score Trend */}
      <div className={cardClass}>
        <SectionHeader
          icon={<TrendUp className="w-5 h-5" />}
          title={t('stats.game.score_trend.title')}
        />
        <div className="h-32 flex items-end space-x-2">
          {gameStats.performanceTrend.map((score: number, index: number) => {
            const maxScore = Math.max(...gameStats.performanceTrend);
            const height = maxScore > 0 ? (score / maxScore) * 100 : 0;
            return (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-primary/50 to-primary rounded-t-lg transition-all duration-300 hover:from-primary hover:to-primary/80"
                style={{ height: `${height}%`, minHeight: '8px' }}
                title={`Average Score: ${score}`}
              />
            );
          })}
        </div>
        <div className={`${labelClass} text-center mt-2`}>{t('stats.game.score_trend.subtitle')}</div>
      </div>

      {/* Session Types Distribution */}
      <div className={cardClass}>
        <SectionHeader
          icon={<ChartBar className="w-5 h-5 text-secondary" />}
          title={t('stats.game.session_types.title')}
        />
        <div className="space-y-3">
          {Object.entries(gameStats.sessionTypes).map(([type, count]) => {
            const percentage = (count as number / gameStats.totalSessions) * 100;
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{type}</span>
                  <span>{count as number} sessions ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${(gameModeColors[type as GameMode] ?? gameModeFallback).gradient} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Player Count Distribution */}
      <div className={cardClass}>
        <SectionHeader
          icon={<ChartBar className="w-5 h-5 text-accent" />}
          title={t('stats.game.player_dist.title')}
        />
        <div className="space-y-3">
          {Object.entries(gameStats.playerCountDistribution)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([count, sessions]) => {
              const percentage = (sessions as number / gameStats.totalSessions) * 100;
              return (
                <div key={count} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{count} {t('stats.game.player_dist.label')}</span>
                    <span>{sessions as number} sessions ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className={progressBgClass}>
                    <div className="bg-gradient-to-r from-accent to-accent/60 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Winners */}
      <div className={cardClass}>
        <SectionHeader
          icon={<Trophy className="w-5 h-5 text-yellow-400" />}
          title={t('stats.game.top_winners.title')}
        />
        <div className="space-y-3">
          {gameStats.topWinners.map((winner, index: number) => (
            <div key={winner.player?.player_id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getMedalClass(index)}`}>
                {index + 1}
              </div>
              <PlayerAvatar name={winner.player?.player_name ?? ''} url={winner.player?.avatar} className="w-10 h-10 text-xs" />
              <div className="flex-1">
                <div className={`${valueClass} font-medium`}>{winner.player?.player_name}</div>
                <div className={labelClass}>{winner.wins} {t('stats.game.top_winners.wins')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className={cardClass}>
        <SectionHeader
          icon={<Calendar className="w-5 h-5 text-accent" />}
          title={t('stats.game.recent.title')}
        />
        <div className="space-y-3">
          {gameStats.recentSessions.map((session, index: number) => {
            const winner = players.find(p => p.player_id === session.winner_player_id);
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <div className={`w-3 h-3 rounded-full ${(gameModeColors[session.play_type as GameMode] ?? gameModeFallback).dot}`} />
                <div className="flex-1">
                  <div className={`${valueClass} font-medium capitalize`}>{session.play_type}</div>
                  <div className={labelClass}>
                    {session.date.toLocaleDateString()} • {session.player_count} players • {session.duration_minutes}min
                  </div>
                  {winner && <div className={labelClass}>{t('stats.game.recent.winner')} {winner.player_name}</div>}
                </div>
                <div className="text-right">
                  <div className={`${valueClass} text-sm font-medium`}>{session.average_score.toFixed(0)}</div>
                  <div className={subLabelClass}>{t('stats.game.recent.avg_score')}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
