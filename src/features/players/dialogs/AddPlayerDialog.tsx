import React, { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { PlayerFormData } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';

interface AddPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PlayerFormData;
  setFormData: (data: PlayerFormData) => void;
  onAdd: () => void;
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

function validateAddPlayerForm(formData: PlayerFormData, t: (key: string) => string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formData.player_name.trim()) {
    errors.player_name = t('players.form.validation.name_required');
  } else if (formData.player_name.trim().length < 2) {
    errors.player_name = t('players.form.validation.name_min');
  } else if (formData.player_name.trim().length > 50) {
    errors.player_name = t('players.form.validation.name_max');
  }

  const pseudoVal = formData.pseudo.trim();
  if (pseudoVal.length > 0 && pseudoVal.length < 2) {
    errors.pseudo = t('players.form.validation.pseudo_min');
  } else if (pseudoVal.length > 50) {
    errors.pseudo = t('players.form.validation.pseudo_max');
  }

  if (formData.avatar?.trim() && !AVATAR_URL_PATTERN.test(formData.avatar.trim())) {
    errors.avatar = t('players.form.validation.avatar_url');
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
  darkMode = true,
  serverError
}: AddPlayerDialogProps) {
  const { t } = useLabels();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pseudoTouched, setPseudoTouched] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) setPseudoTouched(false);
    onOpenChange(open);
  };

  const handleAdd = () => {
    const newErrors = validateAddPlayerForm(formData, t);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onAdd();
    }
  };

  const handleNameChange = (value: string) => {
    const update: Partial<PlayerFormData> = { player_name: value };
    if (!pseudoTouched) update.pseudo = value;
    setFormData({ ...formData, ...update });
    if (errors.player_name) setErrors({ ...errors, player_name: undefined });
  };

  const handlePseudoChange = (value: string) => {
    setPseudoTouched(true);
    setFormData({ ...formData, pseudo: value });
    if (errors.pseudo) setErrors({ ...errors, pseudo: undefined });
  };

  const handleInputChange = (field: keyof PlayerFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof ValidationErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button aria-label="Open add player dialog" className={darkMode ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700" : "bg-gradient-to-r from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400 text-blue-700"}>
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={darkMode ? "bg-slate-800 border-white/20" : "bg-white border-slate-200 text-slate-900"}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : "text-blue-700"}>{t('players.add_dialog.title')}</DialogTitle>
          <DialogDescription className={darkMode ? "text-white/70" : "text-slate-500"}>
            Create a new player profile by filling out the form below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="player_name" className={darkMode ? "text-white" : "text-blue-700"}>Nom *</Label>
            <Input
              id="player_name"
              name="player_name"
              value={formData.player_name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={getInputClass('player_name', errors, darkMode)}
              placeholder="Prénom ou nom complet"
            />
            {errors.player_name && <p className="text-red-400 text-sm mt-1">{errors.player_name}</p>}
          </div>
          <div>
            <Label htmlFor="pseudo" className={darkMode ? "text-white" : "text-blue-700"}>Pseudo *</Label>
            <Input
              id="pseudo"
              name="pseudo"
              value={formData.pseudo}
              onChange={(e) => handlePseudoChange(e.target.value)}
              className={getInputClass('pseudo', errors, darkMode)}
              placeholder="Identifiant unique"
            />
            {errors.pseudo && <p className="text-red-400 text-sm mt-1">{errors.pseudo}</p>}
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
            <Label htmlFor="favorite_game" className={darkMode ? "text-white" : "text-blue-700"}>{t('players.form.favorite_game.label')}</Label>
            <Input
              id="favorite_game"
              name="favorite_game"
              value={formData.favorite_game}
              onChange={(e) => handleInputChange('favorite_game', e.target.value)}
              className={darkMode ? "bg-white/10 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"}
              placeholder={t('players.form.favorite_game.placeholder')}
            />
          </div>
          {serverError && (
            <p className="text-red-400 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">{serverError}</p>
          )}
          <div className="flex gap-4">
            <Button onClick={handleAdd} className="flex-1">{t('common.buttons.add')}</Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">{t('common.buttons.cancel')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
