import React, { useState } from 'react';
import { toast } from 'sonner';
import { GameCharacter, Game } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';

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
  const { t } = useLabels();
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
      toast.error(t('character.toast.name_key_required'));
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
      toast.success(t('character.toast.added'));
      setIsAddDialogOpen(false);
      resetForm();
    } catch {
      toast.error(t('character.toast.add_error'));
    }
  };

  const handleEditCharacter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCharacter || !formData.name.trim() || !formData.character_key.trim()) {
      toast.error(t('character.toast.name_key_required'));
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
      toast.success(t('character.toast.updated'));
      setEditingCharacter(null);
      resetForm();
    } catch {
      toast.error(t('character.toast.update_error'));
    }
  };

  const handleDeleteCharacter = async (characterId: number) => {
    try {
      await onDeleteCharacter(characterId);
      toast.success(t('character.toast.deleted'));
    } catch {
      toast.error(t('character.toast.delete_error'));
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

    // Props
    game,
    embedded,
    navigationSource
  };
}