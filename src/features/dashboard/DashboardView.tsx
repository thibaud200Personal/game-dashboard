import React from 'react';
import {
  GameController,
  TrendUp,
  Gear,
  Plus,
  Play,
  ArrowLeft
} from '@phosphor-icons/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Player, Game, NavigationHandler } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';

interface DashboardViewProps {
  stats: {
    playersCount: number,
    gamesCount: number,
    loading: boolean,
    error: null | string
  },
  recentPlayers: Player[],
  recentGames: Game[],
  currentView: string,
  hasPlayers: boolean,
  hasGames: boolean,
  handleBackClick: () => void,
  handleSettingsClick: () => void,
  handlePlayersClick: () => void,
  handleGamesClick: () => void,
  handlePlayerStatsClick: (playerId: number) => void,
  handleGameStatsClick: (gameId: number) => void,
  handleNewGameClick: () => void,
  handleActivityClick: () => void,
  onNavigation: NavigationHandler,
}

export function DashboardView({
  stats,
  recentPlayers,
  recentGames,
  hasPlayers,
  hasGames,
  handleBackClick,
  handleSettingsClick,
  handlePlayersClick,
  handleGamesClick,
  handlePlayerStatsClick,
  handleGameStatsClick,
  handleNewGameClick,
  handleActivityClick,
  onNavigation: _onNavigation,
}: DashboardViewProps) {
  const { t } = useLabels();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleBackClick}
                aria-label="Go back"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('dashboard.tooltip.back')}</p>
            </TooltipContent>
          </Tooltip>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSettingsClick}
                  aria-label="Settings"
                  className="p-2.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Gear className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('dashboard.tooltip.settings')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Stats circulaires */}
        <div className="flex justify-center space-x-8 mb-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handlePlayersClick}
                aria-label="View all players"
                className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                <div className="text-center">
                  <div className="text-xs text-white/80">{t('players.page.title')}</div>
                  <div className="text-lg font-bold text-white">
                    {stats.playersCount}
                  </div>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('dashboard.tooltip.view_players')}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleGamesClick}
                aria-label="View all games"
                className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                <div className="text-center">
                  <div className="text-xs text-white/80">{t('games.page.title')}</div>
                  <div className="text-lg font-bold text-white">
                    {stats.gamesCount}
                  </div>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('dashboard.tooltip.view_games')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 space-y-6 pb-32">
        {/* Section Joueurs */}
        <div className="bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-4 border border-slate-300 dark:border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('dashboard.section.players')}</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handlePlayersClick}
                  aria-label="View all players"
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <TrendUp className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('dashboard.tooltip.view_players')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {hasPlayers ? (
              recentPlayers.map((player) => (
                <button
                  key={player.player_id}
                  onClick={() => handlePlayerStatsClick(player.player_id)}
                  className="group w-full"
                >
                  <div className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20 hover:shadow-lg hover:scale-105">
                    <img
                      src={player.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full mb-2 mx-auto object-cover"
                      loading="lazy"
                      width={32}
                      height={32}
                    />
                    <div className="text-center">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {player.player_name}
                      </div>
                      <div className="text-slate-500 dark:text-white/70 text-sm">{player.stats}</div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-3 text-center py-4">
                <div className="text-slate-500 dark:text-white/70 text-sm">{t('dashboard.players.empty')}</div>
                <button
                  onClick={handlePlayersClick}
                  className="text-teal-400 hover:text-teal-300 text-sm mt-1 transition-colors"
                >
                  {t('dashboard.players.add_first')}
                </button>
              </div>
            )}
          </div>
          {hasPlayers && (
            <button
              onClick={handlePlayersClick}
              className="mt-3 w-full text-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              {t('dashboard.players.see_all')} ({stats.playersCount}) →
            </button>
          )}
        </div>

        {/* Section Jeux récents */}
        <div className="bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-4 border border-slate-300 dark:border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('dashboard.section.games')}</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleGamesClick}
                  aria-label="View all games"
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <GameController className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('dashboard.tooltip.view_games')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {hasGames ? (
              recentGames.map((game, index) => (
                <button
                  key={game.game_id}
                  onClick={() => handleGameStatsClick(game.game_id)}
                  className="group w-full"
                >
                  <div className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20 hover:shadow-lg hover:scale-105">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-16 object-cover"
                      loading={index === 0 ? undefined : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : undefined}
                    />
                    <div className="p-2">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {game.name}
                      </div>
                      <div className="text-slate-500 dark:text-white/70 text-sm">
                        {game.players} {t('games.card.players')}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-3 text-center py-4">
                <div className="text-slate-500 dark:text-white/70 text-sm">{t('dashboard.games.empty')}</div>
                <button
                  onClick={handleGamesClick}
                  className="text-teal-400 hover:text-teal-300 text-sm mt-1 transition-colors"
                >
                  {t('dashboard.games.add_first')}
                </button>
              </div>
            )}
          </div>
          {hasGames && (
            <button
              onClick={handleGamesClick}
              className="mt-3 w-full text-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              {t('dashboard.games.see_all')} ({stats.gamesCount}) →
            </button>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-4 border border-slate-300 dark:border-white/20 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('dashboard.section.activity')}</h2>
          <div className="text-center py-6">
            <Play className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-slate-500 dark:text-white/70 text-sm">{t('dashboard.activity.empty')}</p>
            <button
              onClick={handleActivityClick}
              className="mt-3 text-teal-400 text-sm hover:text-teal-300 transition-colors"
            >
              {t('dashboard.actions.new_game')} →
            </button>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-col gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleNewGameClick}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-5 flex items-center justify-center gap-3 hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] min-h-[56px]"
              >
                <Play className="w-6 h-6 shrink-0" />
                <span className="font-semibold text-lg">{t('dashboard.actions.new_game')}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('dashboard.actions.new_game.tooltip')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handlePlayersClick}
                className="w-full rounded-2xl p-3 flex items-center justify-center gap-2 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 min-h-[44px]"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="font-medium text-sm">{t('dashboard.actions.add_player')}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('dashboard.actions.add_player.tooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}