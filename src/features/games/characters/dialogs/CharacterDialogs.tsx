// Gestion des extensions de jeux
import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useLabels } from '@/shared/hooks/useLabels';
import { BaseFormDialog, BaseDeleteDialog } from '../../../../shared/components/dialogs/generic-dialogs';
import { FormActions, useFormHandler } from '../../../../shared/components/dialogs/form-utils';

/** @public */
export interface CharacterFormData {
  name: string;
  character_key: string;
  avatar: string;
  description: string;
  abilities: string;
}

/** @public */
export function CharacterDialog({ mode, isOpen, onOpenChange, formData, setFormData, onSubmit }: any) {
  const { t } = useLabels();
  const onFieldChange = useFormHandler(setFormData);

  return (
    <BaseFormDialog 
      mode={mode} 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      titleKey={`character.dialog.${mode}.title`}
      descriptionKey={`character.dialog.${mode}.description`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('character.form.name.label')}</Label>
          <Input id="name" name="name" value={formData.name} onChange={onFieldChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="character_key">{t('character.form.key.label')}</Label>
          <Input id="character_key" name="character_key" value={formData.character_key} onChange={onFieldChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">{t('character.form.avatar.label')}</Label>
          <Input id="avatar" name="avatar" type="url" value={formData.avatar} onChange={onFieldChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('character.form.description.label')}</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={onFieldChange} className="min-h-[80px]" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="abilities">{t('character.form.abilities.label')}</Label>
          <Textarea id="abilities" name="abilities" value={formData.abilities} onChange={onFieldChange} className="min-h-[80px]" />
        </div>

        <FormActions mode={mode} onCancel={() => onOpenChange(false)} />
      </form>
    </BaseFormDialog>
  );
}

export function DeleteCharacterDialog(props: any) {
  return (
    <BaseDeleteDialog 
      {...props}
      titleKey="character.dialog.delete.title"
      descriptionKey="character.dialog.delete.description"
      itemName={props.characterName}
    />
  );
}