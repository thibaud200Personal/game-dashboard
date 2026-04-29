import React, { useState } from 'react';
import { toast } from 'sonner';
import { GameExpansion, Game } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';

export interface UseGameExpansionsProps {
  game: Game;
  onNavigation: (view: string, gameId?: number, source?: string) => void;
  navigationSource?: string;
  onAddExpansion: (gameId: number, expansionData: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => Promise<GameExpansion>;
  onUpdateExpansion: (expansionId: number, expansionData: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => Promise<void>;
  onDeleteExpansion: (expansionId: number) => Promise<void>;
  embedded?: boolean;
}

export function useGameExpansions(props: UseGameExpansionsProps) {
  const { t } = useLabels();
  const {
    game,
    navigationSource = 'games',
    onAddExpansion,
    onUpdateExpansion,
    onDeleteExpansion,
    embedded = false
  } = props;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpansion, setEditingExpansion] = useState<GameExpansion | null>(null);
  const [deleteExpansionId, setDeleteExpansionId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    year_published: '',
    description: '',
    bgg_expansion_id: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      year_published: '',
      description: '',
      bgg_expansion_id: ''
    });
  };

  const handleAddExpansion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t('expansion.toast.name_required'));
      return;
    }

    try {
      const expansionData = {
        name: formData.name.trim(),
        year_published: formData.year_published ? parseInt(formData.year_published) : undefined,
        description: formData.description.trim() || undefined,
        bgg_expansion_id: formData.bgg_expansion_id ? parseInt(formData.bgg_expansion_id) : undefined
      };

      await onAddExpansion(game.game_id, expansionData);
      toast.success(t('expansion.toast.added'));
      setIsAddDialogOpen(false);
      resetForm();
    } catch {
      toast.error(t('expansion.toast.add_error'));
    }
  };

  const handleEditExpansion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingExpansion || !formData.name.trim()) {
      toast.error(t('expansion.toast.name_required'));
      return;
    }

    try {
      const expansionData = {
        name: formData.name.trim(),
        year_published: formData.year_published ? parseInt(formData.year_published) : undefined,
        description: formData.description.trim() || undefined,
        bgg_expansion_id: formData.bgg_expansion_id ? parseInt(formData.bgg_expansion_id) : undefined
      };

      await onUpdateExpansion(editingExpansion.expansion_id!, expansionData);
      toast.success(t('expansion.toast.updated'));
      setEditingExpansion(null);
      resetForm();
    } catch {
      toast.error(t('expansion.toast.update_error'));
    }
  };

  const handleDeleteExpansion = async (expansionId: number) => {
    try {
      await onDeleteExpansion(expansionId);
      toast.success(t('expansion.toast.deleted'));
    } catch {
      toast.error(t('expansion.toast.delete_error'));
    }
  };

  const openEditDialog = (expansion: GameExpansion) => {
    setEditingExpansion(expansion);
    setFormData({
      name: expansion.name,
      year_published: expansion.year_published?.toString() || '',
      description: expansion.description || '',
      bgg_expansion_id: expansion.bgg_expansion_id?.toString() || ''
    });
  };

  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setEditingExpansion(null);
    resetForm();
  };

  return {
    // State
    isAddDialogOpen,
    editingExpansion,
    deleteExpansionId,
    formData,
    
    // Computed
    expansions: game.expansions || [],

    // Handlers
    setIsAddDialogOpen,
    setDeleteExpansionId,
    setFormData,
    handleAddExpansion,
    handleEditExpansion,
    handleDeleteExpansion,
    openEditDialog,
    closeDialogs,
    resetForm,

    // Props
    game,
    embedded,
    navigationSource
  };
}