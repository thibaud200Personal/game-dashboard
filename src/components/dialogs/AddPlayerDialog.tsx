import React, { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlayerFormData } from '@/types';

interface AddPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PlayerFormData;
  setFormData: (data: PlayerFormData) => void;
  onAdd: () => void;
  onCancel: () => void;
  darkMode: boolean;
}

interface ValidationErrors {
  player_name?: string;
  avatar?: string;
}

const AVATAR_URL_PATTERN = /^https?:\/\/[^(]+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

function validateAddPlayerForm(formData: PlayerFormData): ValidationErrors {
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

  return errors;
}

function getInputClass(field: keyof ValidationErrors, errors: ValidationErrors, darkMode: boolean): string {
  const hasError = !!errors[field];
  if (darkMode) {
    return `bg-white/10 border-white/20 text-white${hasError ? ' border-red-500' : ''}`;
  }
  return `bg-slate-100 border-slate-300 text-slate-900${hasError ? ' border-red-500' : ''}`;
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

  const handleAdd = () => {
    const newErrors = validateAddPlayerForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
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
          <DialogDescription className={darkMode ? "text-white/70" : "text-slate-500"}>
            Create a new player profile by filling out the form below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="player_name" className={darkMode ? "text-white" : "text-blue-700"}>Player Name *</Label>
            <Input
              id="player_name"
              name="player_name"
              value={formData.player_name}
              onChange={(e) => handleInputChange('player_name', e.target.value)}
              className={getInputClass('player_name', errors, darkMode)}
              placeholder="Enter player name"
            />
            {errors.player_name && <p className="text-red-400 text-sm mt-1">{errors.player_name}</p>}
          </div>
          <div>
            <Label htmlFor="avatar" className={darkMode ? "text-white" : "text-blue-700"}>Avatar URL</Label>
            <Input
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              className={getInputClass('avatar', errors, darkMode)}
              placeholder="https://example.com/avatar.jpg (optional)"
            />
            {errors.avatar && <p className="text-red-400 text-sm mt-1">{errors.avatar}</p>}
          </div>
          <div>
            <Label htmlFor="favorite_game" className={darkMode ? "text-white" : "text-blue-700"}>Favorite Game</Label>
            <Input
              id="favorite_game"
              name="favorite_game"
              value={formData.favorite_game}
              onChange={(e) => handleInputChange('favorite_game', e.target.value)}
              className={darkMode ? "bg-white/10 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}
              placeholder="Enter favorite game (optional)"
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleAdd} className="flex-1">Add Player</Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
