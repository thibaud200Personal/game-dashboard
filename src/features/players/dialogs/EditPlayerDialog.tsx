import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { PlayerFormData } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';

interface EditPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PlayerFormData;
  setFormData: (data: PlayerFormData) => void;
  onUpdate: () => void;
  onCancel: () => void;
  serverError?: string | null;
}

interface ValidationErrors {
  player_name?: string;
  pseudo?: string;
  avatar?: string;
}

const AVATAR_URL_PATTERN = /^https?:\/\/.+/i;

export function EditPlayerDialog({
  isOpen, onOpenChange, formData, setFormData,
  onUpdate, onCancel, serverError,
}: EditPlayerDialogProps) {
  const { t } = useLabels();
  const [errors, setErrors] = useState<ValidationErrors>({});

  function validate(data: PlayerFormData): ValidationErrors {
    const errs: ValidationErrors = {};
    if (!data.player_name.trim())
      errs.player_name = t('players.form.validation.name_required');
    else if (data.player_name.trim().length < 2)
      errs.player_name = t('players.form.validation.name_min');
    else if (data.player_name.trim().length > 50)
      errs.player_name = t('players.form.validation.name_max');

    if (!data.pseudo.trim())
      errs.pseudo = t('players.form.validation.pseudo_required');
    else if (data.pseudo.trim().length < 2)
      errs.pseudo = t('players.form.validation.pseudo_min');
    else if (data.pseudo.trim().length > 50)
      errs.pseudo = t('players.form.validation.pseudo_max');

    if (data.avatar?.trim() && !AVATAR_URL_PATTERN.test(data.avatar.trim()))
      errs.avatar = t('players.form.validation.avatar_url');

    return errs;
  }

  const handleUpdate = () => {
    const newErrors = validate(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) onUpdate();
  };

  const handleChange = (field: keyof PlayerFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof ValidationErrors])
      setErrors({ ...errors, [field]: undefined });
  };

  const inputClass = (field: keyof ValidationErrors) =>
    errors[field] ? 'border-destructive' : '';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('players.edit_dialog.title')}</DialogTitle>
          <DialogDescription>{t('players.edit_dialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit_player_name">{t('players.form.name.label')} *</Label>
            <Input
              id="edit_player_name"
              value={formData.player_name}
              onChange={(e) => handleChange('player_name', e.target.value)}
              className={inputClass('player_name')}
              placeholder={t('players.form.name.placeholder')}
            />
            {errors.player_name && <p className="text-destructive text-sm mt-1">{errors.player_name}</p>}
          </div>
          <div>
            <Label htmlFor="edit_pseudo">{t('players.form.pseudo.label')} *</Label>
            <Input
              id="edit_pseudo"
              value={formData.pseudo}
              onChange={(e) => handleChange('pseudo', e.target.value)}
              className={inputClass('pseudo')}
              placeholder={t('players.form.pseudo.placeholder')}
            />
            {errors.pseudo && <p className="text-destructive text-sm mt-1">{errors.pseudo}</p>}
          </div>
          <div>
            <Label htmlFor="edit_avatar">{t('players.form.avatar.label')}</Label>
            <Input
              id="edit_avatar"
              value={formData.avatar}
              onChange={(e) => handleChange('avatar', e.target.value)}
              className={inputClass('avatar')}
              placeholder={t('players.form.avatar.placeholder')}
            />
            {errors.avatar && <p className="text-destructive text-sm mt-1">{errors.avatar}</p>}
          </div>
          <div>
            <Label htmlFor="edit_favorite_game">{t('players.form.favorite_game.label')}</Label>
            <Input
              id="edit_favorite_game"
              value={formData.favorite_game}
              onChange={(e) => handleChange('favorite_game', e.target.value)}
              placeholder={t('players.form.favorite_game.placeholder')}
            />
          </div>
          {serverError && (
            <p className="text-destructive text-sm p-2 bg-destructive/10 rounded border border-destructive/20">
              {serverError}
            </p>
          )}
          <div className="flex gap-4">
            <Button onClick={handleUpdate} className="flex-1">{t('players.form.buttons.update')}</Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">{t('common.buttons.cancel')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
