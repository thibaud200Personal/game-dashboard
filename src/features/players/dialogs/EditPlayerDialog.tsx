import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { PlayerFormData } from '@/types';

interface EditPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PlayerFormData;
  setFormData: (data: PlayerFormData) => void;
  onUpdate: () => void;
  onCancel: () => void;
  darkMode: boolean;
  serverError?: string | null;
}

interface ValidationErrors {
  player_name?: string;
  pseudo?: string;
  avatar?: string;
}

const AVATAR_URL_PATTERN = /^https?:\/\/.+/i;

function validatePlayerForm(formData: PlayerFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formData.player_name.trim()) {
    errors.player_name = 'Le nom du joueur est requis';
  } else if (formData.player_name.trim().length < 2) {
    errors.player_name = 'Le nom doit contenir au moins 2 caractères';
  } else if (formData.player_name.trim().length > 50) {
    errors.player_name = 'Le nom ne peut pas dépasser 50 caractères';
  }

  if (!formData.pseudo.trim()) {
    errors.pseudo = 'Le pseudo est requis';
  } else if (formData.pseudo.trim().length < 2) {
    errors.pseudo = 'Le pseudo doit contenir au moins 2 caractères';
  } else if (formData.pseudo.trim().length > 50) {
    errors.pseudo = 'Le pseudo ne peut pas dépasser 50 caractères';
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

export function EditPlayerDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onUpdate,
  onCancel,
  darkMode = true,
  serverError
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
            <Label htmlFor="edit_player_name" className={darkMode ? "text-white" : "text-blue-700"}>Nom *</Label>
            <Input
              id="edit_player_name"
              name="edit_player_name"
              value={formData.player_name}
              onChange={(e) => handleInputChange('player_name', e.target.value)}
              className={getInputClass('player_name', errors, darkMode)}
              placeholder="Prénom ou nom complet"
            />
            {errors.player_name && <p className="text-red-400 text-sm mt-1">{errors.player_name}</p>}
          </div>
          <div>
            <Label htmlFor="edit_pseudo" className={darkMode ? "text-white" : "text-blue-700"}>Pseudo *</Label>
            <Input
              id="edit_pseudo"
              name="edit_pseudo"
              value={formData.pseudo}
              onChange={(e) => handleInputChange('pseudo', e.target.value)}
              className={getInputClass('pseudo', errors, darkMode)}
              placeholder="Identifiant unique"
            />
            {errors.pseudo && <p className="text-red-400 text-sm mt-1">{errors.pseudo}</p>}
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
          {serverError && (
            <p className="text-red-400 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">{serverError}</p>
          )}
          <div className="flex gap-4">
            <Button onClick={handleUpdate} className="flex-1">Mettre à jour</Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
