import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { playerApi } from '../services/api/playerApi'
import { gameApi } from '../services/api/gameApi'
import { statsApi } from '../services/api/statsApi'
import { queryKeys } from '../services/api/queryKeys'
import { useNavigationAdapter } from './useNavigationAdapter'

export const useDashboard = () => {
  const onNavigation = useNavigationAdapter()

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: queryKeys.players.all,
    queryFn: playerApi.getAll,
  })

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: queryKeys.games.all,
    queryFn: gameApi.getAll,
  })

  const { data: dashboard, isLoading: dashLoading, isError } = useQuery({
    queryKey: queryKeys.stats.dashboard,
    queryFn: statsApi.getDashboard,
  })

  const loading = playersLoading || gamesLoading || dashLoading
  const stats = {
    playersCount: players.length,
    gamesCount: games.length,
    loading,
    error: isError ? 'Failed to load stats' : null,
  }

  const recentPlayers = useMemo(() => players.slice(0, 3), [players])
  const recentGames   = useMemo(() => games.slice(0, 3), [games])
  const hasPlayers    = recentPlayers.length > 0
  const hasGames      = recentGames.length > 0

  return {
    stats,
    recentPlayers,
    recentGames,
    hasPlayers,
    hasGames,
    dashboard,
    onNavigation,
    handleBackClick:       () => onNavigation('back'),
    handleSettingsClick:   () => onNavigation('settings'),
    handlePlayersClick:    () => onNavigation('players'),
    handleGamesClick:      () => onNavigation('games'),
    handlePlayerStatsClick: (id: number) => onNavigation('stats', id, 'players'),
    handleGameStatsClick:   (id: number) => onNavigation('stats', id, 'games'),
    handleNewGameClick:    () => onNavigation('new-game'),
    handleActivityClick:   () => {},
  }
}

// Legacy type alias kept for views that reference it
export type DashboardStats = ReturnType<typeof useDashboard>['stats']
