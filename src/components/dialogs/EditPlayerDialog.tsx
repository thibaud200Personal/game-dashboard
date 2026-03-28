import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlayerFormData } from '@/types';

interface EditPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PlayerFormData;
  setFormData: (data: PlayerFormData) => void;
  onUpdate: () => void;
  onCancel: () => void;
  darkMode: boolean;
}

interface ValidationErrors {
  player_name?: string;
  avatar?: string;
  games_played?: string;
  wins?: string;
  total_score?: string;
}

const AVATAR_URL_PATTERN = /^https?:\/\/[^(]+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

function validatePlayerForm(formData: PlayerFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formData.player_name.trim()) {
    errors.player_name = 'Player name is required';
  } else if (formData.player_name.trim().length < 2) {
    errors.player_name = 'Player name must be at least 2 characters long';
  } else if (formData.player_name.trim().length > 50) {
    errors.player_name = 'Player name must be less than 50 characters';
  }

  if (formData.avatar?.trim() && !AVATAR_URL_PATTERN.test(formData.avatar.trim())) {
    errors.avatar = 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)';
  }

  if (formData.games_played < 0) {
    errors.games_played = 'Games played cannot be negative';
  }

  if (formData.wins < 0) {
    errors.wins = 'Wins cannot be negative';
  } else if (formData.wins > formData.games_played) {
    errors.wins = 'Wins cannot exceed games played';
  }

  if (formData.total_score < 0) {
    errors.total_score = 'Total score cannot be negative';
  }

  return errors;
}

function getInputClass(field: keyof ValidationErrors, errors: ValidationErrors, darkMode: boolean): string {
  const hasError = !!errors[field];
  if (darkMode) {
    return `bg-white/10 border-white/20 text-white${hasError ? ' border-red-500' : ''}`;
  }
  return `bg-slate-100 border-slate-300 text-slate-900${hasError ? ' border-red-500' : ''}`;
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

  const handleUpdate = () => {
    const newErrors = validatePlayerForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
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
          <DialogDescription className={darkMode ? "text-white/70" : "text-slate-500"}>
            Update player information and statistics.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit_player_name" className={darkMode ? "text-white" : "text-blue-700"}>Player Name *</Label>
            <Input
              id="edit_player_name"
              name="edit_player_name"
              value={formData.player_name}
              onChange={(e) => handleInputChange('player_name', e.target.value)}
              className={getInputClass('player_name', errors, darkMode)}
              placeholder="Enter player name"
            />
            {errors.player_name && <p className="text-red-400 text-sm mt-1">{errors.player_name}</p>}
          </div>
          <div>
            <Label htmlFor="edit_avatar" className={darkMode ? "text-white" : "text-blue-700"}>Avatar URL</Label>
            <Input
              id="edit_avatar"
              name="edit_avatar"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              className={getInputClass('avatar', errors, darkMode)}
              placeholder="https://example.com/avatar.jpg"
            />
            {errors.avatar && <p className="text-red-400 text-sm mt-1">{errors.avatar}</p>}
          </div>
          <div>
            <Label htmlFor="edit_favorite_game" className={darkMode ? "text-white" : "text-blue-700"}>Favorite Game</Label>
            <Input
              id="edit_favorite_game"
              name="edit_favorite_game"
              value={formData.favorite_game}
              onChange={(e) => handleInputChange('favorite_game', e.target.value)}
              className={darkMode ? "bg-white/10 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}
              placeholder="Enter favorite game"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_games_played" className={darkMode ? "text-white" : "text-blue-700"}>Games Played</Label>
              <Input
                id="edit_games_played"
                type="number"
                min="0"
                value={formData.games_played}
                onChange={(e) => handleInputChange('games_played', parseInt(e.target.value) || 0)}
                className={getInputClass('games_played', errors, darkMode)}
              />
              {errors.games_played && <p className="text-red-400 text-sm mt-1">{errors.games_played}</p>}
            </div>
            <div>
              <Label htmlFor="edit_wins" className={darkMode ? "text-white" : "text-blue-700"}>Wins</Label>
              <Input
                id="edit_wins"
                type="number"
                min="0"
                value={formData.wins}
                onChange={(e) => handleInputChange('wins', parseInt(e.target.value) || 0)}
                className={getInputClass('wins', errors, darkMode)}
              />
              {errors.wins && <p className="text-red-400 text-sm mt-1">{errors.wins}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="edit_total_score" className={darkMode ? "text-white" : "text-blue-700"}>Total Score</Label>
            <Input
              id="edit_total_score"
              type="number"
              min="0"
              value={formData.total_score}
              onChange={(e) => handleInputChange('total_score', parseInt(e.target.value) || 0)}
              className={getInputClass('total_score', errors, darkMode)}
            />
            {errors.total_score && <p className="text-red-400 text-sm mt-1">{errors.total_score}</p>}
          </div>
          <div className="flex gap-4">
            <Button onClick={handleUpdate} className="flex-1">
              Update Player
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
