import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameApi } from './gameApi';
import { queryKeys } from '@/shared/services/api/queryKeys';
import { useNavigationAdapter } from '@/shared/hooks/useNavigationAdapter';
import type { Game, GameExpansion, GameCharacter } from '@/types';
import type { GameFormData, BGGGame } from '@/types';

type FormState = GameFormData & { expansions: GameExpansion[]; characters: GameCharacter[] }

const emptyForm: FormState = {
  name: '',
  description: '',
  image: '',
  thumbnail: '',
  min_players: 1,
  max_players: 4,
  duration: '',
  playing_time: undefined,
  min_playtime: undefined,
  max_playtime: undefined,
  difficulty: '',
  category: '',
  categories: [],
  mechanics: [],
  year_published: new Date().getFullYear(),
  publisher: '',
  designer: '',
  bgg_rating: 0,
  weight: 0,
  age_min: 8,
  supports_cooperative: false,
  supports_competitive: true,
  supports_campaign: false,
  supports_hybrid: false,
  has_expansion: false,
  has_characters: false,
  is_expansion: false,
  bgg_id: undefined,
  expansions: [],
  characters: [],
};

export const useGamesPage = () => {
  const onNavigation = useNavigationAdapter();
  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: queryKeys.games.all,
    queryFn: gameApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: gameApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games.all }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof gameApi.update>[1] }) =>
      gameApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: gameApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games.all }),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addGameError, setAddGameError] = useState<string | null>(null);
  const [updateGameError, setUpdateGameError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [formData, setFormData] = useState<FormState>(emptyForm);

  const filteredAndSortedGames = useMemo(() => {
    const filtered = games.filter(game => {
      const matchesSearch =
        (game.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || game.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'year') cmp = (a.year_published || 0) - (b.year_published || 0);
      else if (sortBy === 'rating') cmp = (a.bgg_rating || 0) - (b.bgg_rating || 0);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [games, searchQuery, categoryFilter, difficultyFilter, sortBy, sortOrder]);

  const categories = useMemo(
    () => [...new Set(games.map(g => g.category).filter(Boolean))].sort() as string[],
    [games]
  );

  const difficulties = useMemo(
    () => [...new Set(games.map(g => g.difficulty).filter(Boolean))].sort() as string[],
    [games]
  );

  const averageRating =
    games.length > 0
      ? games.reduce((sum, g) => sum + (g.bgg_rating || 0), 0) / games.length
      : 0;

  const resetForm = () => setFormData(emptyForm);

  const handleAddDialogOpen = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) { resetForm(); setAddGameError(null); }
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) { resetForm(); setEditingGame(null); setUpdateGameError(null); }
  };

  const handleAddGame = async () => {
    if (!formData.name.trim()) return;
    setAddGameError(null);
    try {
      await createMutation.mutateAsync({
        ...formData,
        image: formData.image || undefined,
        thumbnail: formData.thumbnail || undefined,
      } as Parameters<typeof gameApi.create>[0]);
      resetForm();
      setIsAddDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      setAddGameError(
        msg === 'duplicate_game'
          ? 'duplicate_game'
          : 'error'
      );
    }
  };

  const handleEditGame = useCallback((game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description || '',
      image: game.image || '',
      thumbnail: game.thumbnail || '',
      min_players: game.min_players,
      max_players: game.max_players,
      duration: game.duration || '',
      playing_time: game.playing_time ?? undefined,
      min_playtime: game.min_playtime ?? undefined,
      max_playtime: game.max_playtime ?? undefined,
      difficulty: game.difficulty || '',
      category: game.category || '',
      categories: game.categories || [],
      mechanics: game.mechanics || [],
      year_published: game.year_published || new Date().getFullYear(),
      publisher: game.publisher || '',
      designer: game.designer || '',
      bgg_rating: game.bgg_rating || 0,
      weight: game.weight || 0,
      age_min: game.age_min || 8,
      supports_cooperative: game.supports_cooperative,
      supports_competitive: game.supports_competitive,
      supports_campaign: game.supports_campaign,
      supports_hybrid: game.supports_hybrid,
      has_expansion: game.has_expansion,
      has_characters: game.has_characters,
      is_expansion: game.is_expansion,
      bgg_id: game.bgg_id,
      expansions: game.expansions || [],
      characters: game.characters || [],
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateGame = async () => {
    if (!editingGame || !formData.name.trim()) return;
    setUpdateGameError(null);
    try {
      await updateMutation.mutateAsync({
        id: editingGame.game_id,
        data: {
          ...formData,
          players: `${formData.min_players}-${formData.max_players}`,
        },
      });
      resetForm();
      setEditingGame(null);
      setIsEditDialogOpen(false);
    } catch {
      setUpdateGameError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleDeleteGame = useCallback((gameId: number) => {
    deleteMutation.mutate(gameId);
  }, [deleteMutation]);

  const handleBGGSearch = (bggGame: BGGGame) => {
    if (bggGame.id && games.some(g => g.bgg_id === bggGame.id)) {
      setAddGameError('duplicate_game');
    } else {
      setAddGameError(null);
    }
    setFormData(prev => ({
      ...prev,
      name: bggGame.name,
      description: bggGame.description || '',
      image: bggGame.image || bggGame.thumbnail || '',
      thumbnail: bggGame.thumbnail || '',
      min_players: bggGame.min_players || 1,
      max_players: bggGame.max_players || 4,
      duration: bggGame.playing_time ? `${bggGame.playing_time} min` : '',
      playing_time: bggGame.playing_time ?? undefined,
      min_playtime: bggGame.min_playtime ?? undefined,
      max_playtime: bggGame.max_playtime ?? undefined,
      year_published: bggGame.year_published || new Date().getFullYear(),
      publisher: bggGame.publishers?.[0] || '',
      designer: bggGame.designers?.[0] || '',
      bgg_rating: bggGame.rating || 0,
      weight: bggGame.weight || 0,
      difficulty: bggGame.difficulty || '',
      age_min: bggGame.min_age || 8,
      bgg_id: bggGame.id,
      category: bggGame.categories?.[0] || '',
      categories: bggGame.categories || [],
      mechanics: bggGame.mechanics || [],
      has_expansion: (bggGame.expansions?.length || 0) > 0,
      has_characters: false,
      is_expansion: bggGame.is_expansion ?? false,
      expansions: bggGame.expansions || [],
      characters: [],
      supports_competitive: bggGame.supports_competitive ?? true,
      supports_cooperative: bggGame.supports_cooperative ?? false,
      supports_campaign: bggGame.supports_campaign ?? false,
      supports_hybrid: bggGame.supports_hybrid ?? false,
    }));
  };

  const addGameErrorMessage =
    addGameError === 'duplicate_game' ? 'Ce jeu est déjà dans votre collection.' :
    addGameError === 'error' ? 'Une erreur est survenue. Veuillez réessayer.' :
    null;

  return {
    games: filteredAndSortedGames,
    isLoading,
    totalGames: games.length,
    averageRating,
    categories,
    difficulties,
    formData,
    setFormData,
    editingGame,
    isAddDialogOpen,
    isEditDialogOpen,
    addGameError: addGameErrorMessage,
    isAddDuplicate: addGameError === 'duplicate_game',
    updateGameError,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
    handleBackClick: () => onNavigation('dashboard'),
    handleAddDialogOpen,
    handleEditDialogOpen,
    handleAddGame,
    handleEditGame,
    handleUpdateGame,
    handleDeleteGame,
    handleBGGSearch,
    resetForm,
    onNavigation,
  };
};
