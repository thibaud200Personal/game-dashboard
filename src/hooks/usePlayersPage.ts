import { useState, useEffect, useCallback } from 'react';
import { Player, NavigationHandler, PlayerFormData } from '@/types';

export interface PlayersPageData {
  players: Player[];
  onNavigation: NavigationHandler;
  onAddPlayer: (player: Omit<Player, 'player_id' | 'stats' | 'games_played' | 'wins' | 'total_score' | 'average_score' | 'created_at'>) => void;
  onUpdatePlayer: (playerId: number, player: Partial<Player>) => void;
  onDeletePlayer: (playerId: number) => void;
  currentView?: string;
}

export const usePlayersPage = (data: PlayersPageData) => {
  const { players, onNavigation, onAddPlayer, onUpdatePlayer, onDeletePlayer, currentView = 'players' } = data;

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);
  const [updatePlayerError, setUpdatePlayerError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [formData, setFormData] = useState<PlayerFormData>({
    player_name: '',
    pseudo: '',
    avatar: '',
    favorite_game: '',
    total_score: 0,
    games_played: 0,
    wins: 0
  });

  // Check mobile viewport
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(timeoutId); };
  }, []);

  // Computed values
  const filteredPlayers = players.filter(player =>
    player.player_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGamesPlayed = players.reduce((sum, p) => sum + (p.games_played ?? 0), 0);
  const totalWins = players.reduce((sum, p) => sum + (p.wins ?? 0), 0);

  // Form management
  const resetForm = () => {
    setFormData({
      player_name: '',
      pseudo: '',
      avatar: '',
      favorite_game: '',
      total_score: 0,
      games_played: 0,
      wins: 0
    });
  };

  // Navigation handlers
  const handleBackClick = () => {
    onNavigation('dashboard');
  };

  const handlePlayerStatsClick = () => {
    onNavigation('player-stats');
  };

  // Dialog handlers
  const handleAddDialogOpen = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      resetForm();
      setAddPlayerError(null);
    }
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      resetForm();
      setEditingPlayer(null);
      setUpdatePlayerError(null);
    }
  };

  // Player actions
  const handleAddPlayer = async () => {
    if (!formData.player_name.trim()) return;
    setAddPlayerError(null);
    try {
      await onAddPlayer({
        player_name: formData.player_name,
        pseudo: formData.pseudo.trim() || formData.player_name,
        avatar: formData.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
        favorite_game: formData.favorite_game || 'None',
      });
      resetForm();
      setIsAddDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      setAddPlayerError(
        msg === 'duplicate_pseudo'
          ? 'Ce pseudo est déjà utilisé par un autre joueur.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      );
    }
  };

  const handleEditPlayer = useCallback((player: Player) => {
    setEditingPlayer(player);
    setFormData({
      player_name: player.player_name,
      pseudo: player.pseudo || player.player_name,
      avatar: player.avatar || '',
      favorite_game: player.favorite_game,
      total_score: player.total_score,
      games_played: player.games_played,
      wins: player.wins
    });
    setIsEditDialogOpen(true);
  }, [setEditingPlayer, setFormData, setIsEditDialogOpen]);

  const handleUpdatePlayer = async () => {
    if (!editingPlayer || !formData.player_name.trim()) return;
    setUpdatePlayerError(null);
    try {
      const averageScore = formData.games_played > 0 ? formData.total_score / formData.games_played : 0;
      const now = new Date();
      await onUpdatePlayer(editingPlayer.player_id, {
        ...formData,
        average_score: averageScore,
        updated_at: now
      });
      resetForm();
      setEditingPlayer(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      setUpdatePlayerError(
        msg === 'duplicate_pseudo'
          ? 'Ce pseudo est déjà utilisé par un autre joueur.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      );
    }
  };

  const handleDeletePlayer = useCallback((playerId: number) => {
    onDeletePlayer(playerId);
  }, [onDeletePlayer]);

  const handleViewPlayerStats = useCallback((playerId: number) => {
    onNavigation('stats', playerId, 'players');
  }, [onNavigation]);

  return {
    // Data
    players: filteredPlayers,
    currentView,
    
    // Computed
    totalPlayers: players.length,
    totalGamesPlayed,
    totalWins,
    isMobile,
    
    // Form state
    formData,
    setFormData,
    editingPlayer,
    
    // Dialog state
    isAddDialogOpen,
    isEditDialogOpen,
    addPlayerError,
    updatePlayerError,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Handlers
    handleBackClick,
    handlePlayerStatsClick,
    handleAddDialogOpen,
    handleEditDialogOpen,
    handleAddPlayer,
    handleEditPlayer,
    handleUpdatePlayer,
    handleDeletePlayer,
    handleViewPlayerStats,
    resetForm,
    onNavigation
  };
};