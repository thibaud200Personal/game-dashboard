import React, { useState } from 'react';
import { Game, BGGGame, GameExpansion, GameCharacter, GameFormData } from '@/types';
import { useGamesPage, GamesPageData } from '@/hooks/useGamesPage';
import { GamesPageView } from '@/views/GamesPageView';

interface GamesPageProps {
  games: Game[];
  onNavigation: (view: string, gameId?: number, source?: string) => void;
  onAddGame: (game: Omit<Game, 'game_id' | 'players'>) => void;
  onUpdateGame: (gameId: number, game: Partial<Game>) => void;
  onDeleteGame: (gameId: number) => void;
  onAddExpansion?: (gameId: number, expansion: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => void;
  onUpdateExpansion?: (expansionId: number, expansion: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => void;
  onDeleteExpansion?: (expansionId: number) => void;
  onAddCharacter?: (gameId: number, character: Omit<GameCharacter, 'character_id' | 'game_id'>) => void;
  onUpdateCharacter?: (characterId: number, character: Omit<GameCharacter, 'character_id' | 'game_id'>) => void;
  onDeleteCharacter?: (characterId: number) => void;
  currentView?: string;
  darkMode: boolean;
}

export default function GamesPage({
  games: gamesProp,
  onNavigation: onNavigationProp,
  onAddGame,
  onUpdateGame,
  onDeleteGame,
  onAddExpansion,
  onUpdateExpansion,
  onDeleteExpansion,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  currentView: currentViewProp,
  darkMode
}: GamesPageProps) {
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [isBGGSearchOpen, setIsBGGSearchOpen] = useState(false);

  // Prepare data for the hook
  const hookData: GamesPageData = {
    games: gamesProp,
    onNavigation: onNavigationProp,
    onAddGame,
    onUpdateGame,
    onDeleteGame,
    onAddExpansion: onAddExpansion || (() => {}),
    onUpdateExpansion: onUpdateExpansion || (() => {}),
    onDeleteExpansion: onDeleteExpansion || (() => {}),
    onAddCharacter: onAddCharacter || (() => {}),
    onUpdateCharacter: onUpdateCharacter || (() => {}),
    onDeleteCharacter: onDeleteCharacter || (() => {}),
    currentView: currentViewProp
  };

  const {
    games: filteredGames,
    totalGames,
    averageRating,
    formData,
    editingGame,
    isAddDialogOpen,
    isEditDialogOpen,
    searchQuery,
    setSearchQuery,
    handleAddDialogOpen,
    handleEditDialogOpen,
    handleAddGame,
    handleEditGame,
    handleUpdateGame,
    handleDeleteGame,
    handleBGGSearch,
    resetForm,
    setFormData
  } = useGamesPage(hookData);

  const handleFormDataChange = (newData: Partial<GameFormData & { expansions: GameExpansion[]; characters: GameCharacter[] }>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleBGGGameSelect = (bggGame: BGGGame) => {
    handleBGGSearch(bggGame);
    setIsBGGSearchOpen(false);
  };

  const onAddDialogToggle = () => {
    handleAddDialogOpen(!isAddDialogOpen);
  };

  return (
    <GamesPageView
      games={filteredGames}
      currentView={currentViewProp || 'games'}
      totalGames={totalGames}
      averageRating={averageRating}
      formData={formData}
      editingGame={editingGame}
      isAddDialogOpen={isAddDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      isBGGSearchOpen={isBGGSearchOpen}
      expandedGame={expandedGame}
      searchQuery={searchQuery}
      onNavigation={onNavigationProp}
      onSearchChange={setSearchQuery}
      onAddDialogToggle={onAddDialogToggle}
      onFormDataChange={handleFormDataChange}
      onBGGGameSelect={handleBGGGameSelect}
      onAddGame={handleAddGame}
      onResetForm={resetForm}
      onEditGame={handleEditGame}
      onUpdateGame={handleUpdateGame}
      onDeleteGame={handleDeleteGame}
      setBGGSearchOpen={setIsBGGSearchOpen}
      setExpandedGame={setExpandedGame}
      setEditDialogOpen={handleEditDialogOpen}
      darkMode={!!darkMode}
    />
  );
}
