import React, { useState } from 'react';
import { useGamesPage } from './useGamesPage';
import { GamesPageView } from './GamesPageView';
import type { BGGGame, GameExpansion, GameCharacter, GameFormData } from '@/types';

export default function GamesPage() {
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [isBGGSearchOpen, setIsBGGSearchOpen] = useState(false);

  const {
    games,
    totalGames,
    averageRating,
    formData,
    editingGame,
    isAddDialogOpen,
    isEditDialogOpen,
    addGameError,
    isAddDuplicate,
    updateGameError,
    searchQuery,
    setSearchQuery,
    handleAddDialogOpen,
    handleEditDialogOpen,
    handleAddGame,
    handleEditGame,
    handleUpdateGame,
    handleDeleteGame,
    handleBGGSearch,
    handleEditBGGSearch,
    isEditBGGSearchOpen,
    setIsEditBGGSearchOpen,
    resetForm,
    setFormData,
    onNavigation,
  } = useGamesPage();

  const handleFormDataChange = (
    newData: Partial<GameFormData & { expansions: GameExpansion[]; characters: GameCharacter[] }>
  ) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleBGGGameSelect = (bggGame: BGGGame) => {
    handleBGGSearch(bggGame);
    setIsBGGSearchOpen(false);
  };

  return (
    <GamesPageView
      games={games}
      currentView="games"
      totalGames={totalGames}
      averageRating={averageRating}
      formData={formData}
      editingGame={editingGame}
      isAddDialogOpen={isAddDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      isBGGSearchOpen={isBGGSearchOpen}
      isEditBGGSearchOpen={isEditBGGSearchOpen}
      onEditBGGGameSelect={handleEditBGGSearch}
      setEditBGGSearchOpen={setIsEditBGGSearchOpen}
      expandedGame={expandedGame}
      searchQuery={searchQuery}
      onNavigation={onNavigation}
      onSearchChange={setSearchQuery}
      onAddDialogToggle={() => handleAddDialogOpen(!isAddDialogOpen)}
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
      addGameError={addGameError}
      isAddDuplicate={isAddDuplicate}
      updateGameError={updateGameError}
    />
  );
}
