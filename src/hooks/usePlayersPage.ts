import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playerApi } from '../services/api/playerApi'
import { queryKeys } from '../services/api/queryKeys'
import { useNavigationAdapter } from './useNavigationAdapter'
import type { Player, PlayerStatistics } from '@/types'
import type { PlayerFormData } from '@/types'

export const usePlayersPage = () => {
  const onNavigation = useNavigationAdapter()
  const queryClient = useQueryClient()

  const { data: players = [], isLoading } = useQuery<PlayerStatistics[]>({
    queryKey: queryKeys.players.all,
    queryFn: playerApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: playerApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.players.all }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof playerApi.update>[1] }) =>
      playerApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.players.all }),
  })

  const deleteMutation = useMutation({
    mutationFn: playerApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.players.all }),
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null)
  const [updatePlayerError, setUpdatePlayerError] = useState<string | null>(null)

  const emptyForm: PlayerFormData = {
    player_name: '',
    pseudo: '',
    avatar: '',
    favorite_game: '',
  }
  const [formData, setFormData] = useState<PlayerFormData>(emptyForm)

  const filteredPlayers = players.filter(p =>
    p.player_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalGamesPlayed = players.reduce((sum, p) => sum + (p.games_played ?? 0), 0)
  const totalWins = players.reduce((sum, p) => sum + (p.wins ?? 0), 0)

  const resetForm = () => setFormData(emptyForm)

  const handleAddDialogOpen = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) { resetForm(); setAddPlayerError(null) }
  }

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) { resetForm(); setEditingPlayer(null); setUpdatePlayerError(null) }
  }

  const handleAddPlayer = async () => {
    if (!formData.player_name.trim()) return
    setAddPlayerError(null)
    try {
      await createMutation.mutateAsync({
        player_name: formData.player_name,
        pseudo: formData.pseudo.trim() || formData.player_name,
        avatar: formData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        favorite_game: formData.favorite_game || 'None',
      })
      resetForm()
      setIsAddDialogOpen(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown'
      setAddPlayerError(
        msg === 'duplicate_pseudo'
          ? 'Ce pseudo est déjà utilisé par un autre joueur.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      )
    }
  }

  const handleEditPlayer = useCallback((player: Player) => {
    setEditingPlayer(player)
    setFormData({
      player_name: player.player_name,
      pseudo: player.pseudo || player.player_name,
      avatar: player.avatar || '',
      favorite_game: player.favorite_game,
    })
    setIsEditDialogOpen(true)
  }, [])

  const handleUpdatePlayer = async () => {
    if (!editingPlayer || !formData.player_name.trim()) return
    setUpdatePlayerError(null)
    try {
      await updateMutation.mutateAsync({
        id: editingPlayer.player_id,
        data: {
          player_name: formData.player_name,
          pseudo: formData.pseudo.trim() || formData.player_name,
          avatar: formData.avatar || undefined,
          favorite_game: formData.favorite_game || 'None',
        },
      })
      resetForm()
      setEditingPlayer(null)
      setIsEditDialogOpen(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown'
      setUpdatePlayerError(
        msg === 'duplicate_pseudo'
          ? 'Ce pseudo est déjà utilisé par un autre joueur.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      )
    }
  }

  const handleDeletePlayer = useCallback((playerId: number) => {
    deleteMutation.mutate(playerId)
  }, [deleteMutation])

  const handleViewPlayerStats = useCallback((playerId: number) => {
    onNavigation('stats', playerId, 'players')
  }, [onNavigation])

  return {
    players: filteredPlayers,
    isLoading,
    totalPlayers: players.length,
    totalGamesPlayed,
    totalWins,
    formData,
    setFormData,
    editingPlayer,
    isAddDialogOpen,
    isEditDialogOpen,
    addPlayerError,
    updatePlayerError,
    searchQuery,
    setSearchQuery,
    handleBackClick: () => onNavigation('dashboard'),
    handlePlayerStatsClick: () => onNavigation('players'),
    handleAddDialogOpen,
    handleEditDialogOpen,
    handleAddPlayer,
    handleEditPlayer,
    handleUpdatePlayer,
    handleDeletePlayer,
    handleViewPlayerStats,
    resetForm,
    onNavigation,
  }
}
