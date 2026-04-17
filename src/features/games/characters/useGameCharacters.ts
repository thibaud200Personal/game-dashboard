import React, { useState } from 'react';
import { toast } from 'sonner';
import { GameCharacter, Game } from '@/types';

export interface UseGameCharactersProps {
  game: Game;
  onNavigation: (view: string, gameId?: number, source?: string) => void;
  navigationSource?: string;
  onAddCharacter: (gameId: number, characterData: Omit<GameCharacter, 'character_id' | 'game_id'>) => Promise<GameCharacter>;
  onUpdateCharacter: (characterId: number, characterData: Omit<GameCharacter, 'character_id' | 'game_id'>) => Promise<void>;
  onDeleteCharacter: (characterId: number) => Promise<void>;
  embedded?: boolean;
}

export function useGameCharacters(props: UseGameCharactersProps) {
  const {
    game,
    onNavigation,
    navigationSource = 'games',
    onAddCharacter,
    onUpdateCharacter,
    onDeleteCharacter,
    embedded = false
  } = props;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<GameCharacter | null>(null);
  const [deleteCharacterId, setDeleteCharacterId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    character_key: '',
    name: '',
    description: '',
    avatar: '',
    abilities: ''
  });

  const resetForm = () => {
    setFormData({
      character_key: '',
      name: '',
      description: '',
      avatar: '',
      abilities: ''
    });
  };

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.character_key.trim()) {
      toast.error('Le nom et la clé du personnage sont requis');
      return;
    }

    try {
      const characterData = {
        character_key: formData.character_key.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        avatar: formData.avatar.trim() || undefined,
        abilities: formData.abilities ? formData.abilities.split(',').map(a => a.trim()).filter(a => a) : []
      };

      await onAddCharacter(game.game_id, characterData);
      toast.success('Personnage ajouté avec succès');
      setIsAddDialogOpen(false);
      resetForm();
    } catch {
      // Error handling would use proper logging in production
      toast.error('Erreur lors de l\'ajout du personnage');
    }
  };

  const handleEditCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCharacter || !formData.name.trim() || !formData.character_key.trim()) {
      toast.error('Le nom et la clé du personnage sont requis');
      return;
    }

    try {
      const characterData = {
        character_key: formData.character_key.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        avatar: formData.avatar.trim() || undefined,
        abilities: formData.abilities ? formData.abilities.split(',').map(a => a.trim()).filter(a => a) : []
      };

      await onUpdateCharacter(editingCharacter.character_id!, characterData);
      toast.success('Personnage modifié avec succès');
      setEditingCharacter(null);
      resetForm();
    } catch {
      // Error handling would use proper logging in production
      toast.error('Erreur lors de la modification du personnage');
    }
  };

  const handleDeleteCharacter = async (characterId: number) => {
    try {
      await onDeleteCharacter(characterId);
      toast.success('Personnage supprimé avec succès');
    } catch {
      // Error handling would use proper logging in production
      toast.error('Erreur lors de la suppression du personnage');
    }
  };

  const openEditDialog = (character: GameCharacter) => {
    setEditingCharacter(character);
    setFormData({
      character_key: character.character_key,
      name: character.name,
      description: character.description || '',
      avatar: character.avatar || '',
      abilities: character.abilities?.join(', ') || ''
    });
  };

  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setEditingCharacter(null);
    resetForm();
  };

  const handleNavigation = {
    back: () => {
      if (navigationSource === 'game-detail') {
        onNavigation('game-detail', game.game_id);
      } else {
        onNavigation('games');
      }
    },
    dashboard: () => onNavigation('dashboard'),
    players: () => onNavigation('players'),
    games: () => onNavigation('games'),
    settings: () => onNavigation('settings')
  };

  return {
    // State
    isAddDialogOpen,
    editingCharacter,
    deleteCharacterId,
    formData,
    
    // Computed
    characters: game.characters || [],

    // Handlers
    setIsAddDialogOpen,
    setDeleteCharacterId,
    setFormData,
    handleAddCharacter,
    handleEditCharacter,
    handleDeleteCharacter,
    openEditDialog,
    closeDialogs,
    resetForm,
    handleNavigation,

    // Props
    game,
    embedded,
    navigationSource
  };
}