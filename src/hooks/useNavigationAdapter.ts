import { useNavigate } from 'react-router-dom'
import type { NavigationHandler } from '@/types'

/**
 * Translates legacy view-name navigation (onNavigation('games', id)) to React Router paths.
 * Keeps existing view components working without changes.
 */
export function useNavigationAdapter(): NavigationHandler {
  const navigate = useNavigate()

  return (view: string, id?: number, _source?: string) => {
    switch (view) {
      case 'dashboard': navigate('/'); break
      case 'players':   navigate('/players'); break
      case 'games':     navigate('/games'); break
      case 'new-game':  navigate('/sessions/new'); break
      case 'stats':     navigate(id != null ? `/stats?id=${id}&src=${_source ?? ''}` : '/stats'); break
      case 'player-stats': navigate(`/stats?id=${id}&src=players`); break
      case 'game-stats':   navigate(`/stats?id=${id}&src=games`); break
      case 'settings':  navigate('/settings'); break
      case 'game-detail':     navigate(`/games/${id}`); break
      case 'game-expansions': navigate(`/games/${id}/expansions`); break
      case 'game-characters': navigate(`/games/${id}/characters`); break
      case 'back':      navigate(-1); break
      default: navigate('/')
    }
  }
}
