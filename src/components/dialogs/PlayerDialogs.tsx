import React, { useState } from 'react';
import { Plus, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlayerFormData } from '@/types';

interface ValidationErrors {
  player_name?: string;
  avatar?: string;
}

// Add Player Dialog Component
interface AddPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PlayerFormData;
  setFormData: (data: PlayerFormData) => void;
  onAdd: () => void;
  onCancel: () => void;
  darkMode?: boolean;
}

export function AddPlayerDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onAdd,
  onCancel,
  darkMode = true
}: AddPlayerDialogProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.player_name.trim()) {
      newErrors.player_name = 'Player name is required';
    } else if (formData.player_name.trim().length < 2) {
      newErrors.player_name = 'Player name must be at least 2 characters long';
    }

    if (formData.avatar && formData.avatar.trim()) {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
      if (!urlPattern.test(formData.avatar.trim())) {
        newErrors.avatar = 'Please enter a valid image URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (validateForm()) {
      onAdd();
    }
  };

  const handleInputChange = (field: keyof PlayerFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof ValidationErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className={darkMode ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700" : "bg-gradient-to-r from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400 text-blue-700"}>
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={darkMode ? "bg-slate-800 border-white/20" : "bg-white border-slate-200 text-slate-900"}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : "text-blue-700"}>Add New Player</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="player_name" className={darkMode ? "text-white" : "text-blue-700"}>Player Name *</Label>
            <Input
              id="player_name"
              value={formData.player_name}
              onChange={(e) => handleInputChange('player_name', e.target.value)}
              className={darkMode ? `bg-white/10 border-white/20 text-white ${errors.player_name ? 'border-red-500' : ''}` : `bg-slate-100 border-slate-300 text-slate-900 ${errors.player_name ? 'border-red-500' : ''}`}
              placeholder="Enter player name"
            />
            {errors.player_name && (
              <p className="text-red-400 text-sm mt-1">{errors.player_name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="avatar" className={darkMode ? "text-white" : "text-blue-700"}>Avatar URL</Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              className={darkMode ? `bg-white/10 border-white/20 text-white ${errors.avatar ? 'border-red-500' : ''}` : `bg-slate-100 border-slate-300 text-slate-900 ${errors.avatar ? 'border-red-500' : ''}`}
              placeholder="https://example.com/avatar.jpg (optional)"
            />
            {errors.avatar && (
              <p className="text-red-400 text-sm mt-1">{errors.avatar}</p>
            )}
          </div>
          <div>
            <Label htmlFor="favorite_game" className={darkMode ? "text-white" : "text-blue-700"}>Favorite Game</Label>
            <Input
              id="favorite_game"
              value={formData.favorite_game}
              onChange={(e) => handleInputChange('favorite_game', e.target.value)}
              className={darkMode ? "bg-white/10 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}
              placeholder="Enter favorite game (optional)"
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleAdd} className="flex-1">
              Add Player
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit Player Dialog Component
interface EditPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PlayerFormData;
  setFormData: (data: PlayerFormData) => void;
  onUpdate: () => void;
  onCancel: () => void;
  darkMode?: boolean;
}

export function EditPlayerDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onUpdate,
  onCancel,
  darkMode = true
}: EditPlayerDialogProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.player_name.trim()) {
      newErrors.player_name = 'Player name is required';
    } else if (formData.player_name.trim().length < 2) {
      newErrors.player_name = 'Player name must be at least 2 characters long';
    }

    if (formData.avatar && formData.avatar.trim()) {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
      if (!urlPattern.test(formData.avatar.trim())) {
        newErrors.avatar = 'Please enter a valid image URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (validateForm()) {
      onUpdate();
    }
  };

  const handleInputChange = (field: keyof PlayerFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof ValidationErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={darkMode ? "bg-slate-800 border-white/20" : "bg-white border-slate-200 text-slate-900"}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : "text-blue-700"}>Edit Player</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit_player_name" className={darkMode ? "text-white" : "text-blue-700"}>Player Name *</Label>
            <Input
              id="edit_player_name"
              value={formData.player_name}
              onChange={(e) => handleInputChange('player_name', e.target.value)}
              className={darkMode ? `bg-white/10 border-white/20 text-white ${errors.player_name ? 'border-red-500' : ''}` : `bg-slate-100 border-slate-300 text-slate-900 ${errors.player_name ? 'border-red-500' : ''}`}
              placeholder="Enter player name"
            />
            {errors.player_name && (
              <p className="text-red-400 text-sm mt-1">{errors.player_name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit_avatar" className={darkMode ? "text-white" : "text-blue-700"}>Avatar URL</Label>
            <Input
              id="edit_avatar"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              className={darkMode ? `bg-white/10 border-white/20 text-white ${errors.avatar ? 'border-red-500' : ''}` : `bg-slate-100 border-slate-300 text-slate-900 ${errors.avatar ? 'border-red-500' : ''}`}
              placeholder="https://example.com/avatar.jpg (optional)"
            />
            {errors.avatar && (
              <p className="text-red-400 text-sm mt-1">{errors.avatar}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit_favorite_game" className={darkMode ? "text-white" : "text-blue-700"}>Favorite Game</Label>
            <Input
              id="edit_favorite_game"
              value={formData.favorite_game}
              onChange={(e) => handleInputChange('favorite_game', e.target.value)}
              className={darkMode ? "bg-white/10 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}
              placeholder="Enter favorite game"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit_games_played" className={darkMode ? "text-white" : "text-blue-700"}>Games Played</Label>
              <Input
                id="edit_games_played"
                type="number"
                value={formData.games_played || 0}
                onChange={(e) => handleInputChange('games_played', parseInt(e.target.value) || 0)}
                className={darkMode ? "bg-white/10 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="edit_wins" className={darkMode ? "text-white" : "text-blue-700"}>Wins</Label>
              <Input
                id="edit_wins"
                type="number"
                value={formData.wins || 0}
                onChange={(e) => handleInputChange('wins', parseInt(e.target.value) || 0)}
                className={darkMode ? "bg-white/10 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="edit_total_score" className={darkMode ? "text-white" : "text-blue-700"}>Total Score</Label>
              <Input
                id="edit_total_score"
                type="number"
                value={formData.total_score || 0}
                onChange={(e) => handleInputChange('total_score', parseInt(e.target.value) || 0)}
                className={darkMode ? "bg-white/10 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleUpdate} className="flex-1">
              Update Player
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

