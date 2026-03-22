import { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    player_name: '',
    avatar: '',
    favorite_game: '',
    total_score: 0,
    games_played: 0,
    wins: 0
  });

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Computed values
  const filteredPlayers = players.filter(player =>
    player.player_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGamesPlayed = players.reduce((sum, p) => sum + p.games_played, 0);
  const totalWins = players.reduce((sum, p) => sum + p.wins, 0);

  // Form management
  const resetForm = () => {
    setFormData({
      player_name: '',
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
    }
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      resetForm();
      setEditingPlayer(null);
    }
  };

  // Player actions
  const handleAddPlayer = () => {
    if (formData.player_name.trim()) {
      const now = new Date();
      onAddPlayer({
        player_name: formData.player_name,
        avatar: formData.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
        favorite_game: formData.favorite_game || 'None',
        total_score: formData.total_score || 0,
        games_played: formData.games_played || 0,
        wins: formData.wins || 0,
        average_score: 0,
        created_at: now
      } as any);
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      player_name: player.player_name,
      avatar: player.avatar || '',
      favorite_game: player.favorite_game,
      total_score: player.total_score,
      games_played: player.games_played,
      wins: player.wins
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer && formData.player_name.trim()) {
      const averageScore = formData.games_played > 0 ? formData.total_score / formData.games_played : 0;
      const now = new Date();
      onUpdatePlayer(editingPlayer.player_id, {
        ...formData,
        average_score: averageScore,
        updated_at: now
      });
      resetForm();
      setEditingPlayer(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeletePlayer = (playerId: number) => {
    onDeletePlayer(playerId);
  };

  const handleViewPlayerStats = (playerId: number) => {
    onNavigation('stats', playerId, 'players');
  };

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