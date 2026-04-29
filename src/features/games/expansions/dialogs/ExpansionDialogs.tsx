import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useLabels } from '@/shared/hooks/useLabels';
import { BaseFormDialog, BaseDeleteDialog } from '../../../../shared/components/dialogs/generic-dialogs';
import { FormActions } from '../../../../shared/components/dialogs/form-utils';
import { useFormHandler } from '../../../../shared/components/dialogs/use-form-handler';

/** @public */
export interface ExpansionFormData {
  name: string;
  year_published: string | number;
  bgg_expansion_id: string | number;
  description: string;
}

interface ExpansionDialogProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ExpansionFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExpansionFormData>>;
  onSubmit: (e: React.FormEvent) => void;
}

/** @public */
export function ExpansionDialog({ mode, isOpen, onOpenChange, formData, setFormData, onSubmit }: ExpansionDialogProps) {
  const { t } = useLabels();
  const onFieldChange = useFormHandler(setFormData);

  return (
    <BaseFormDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      titleKey={`expansion.dialog.${mode}.title`}
      descriptionKey={`expansion.dialog.${mode}.description`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('expansion.form.name.label')}</Label>
          <Input id="name" name="name" value={formData.name} onChange={onFieldChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year_published">{t('expansion.form.year.label')}</Label>
          <Input id="year_published" name="year_published" type="number" value={formData.year_published} onChange={onFieldChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bgg_expansion_id">{t('expansion.form.bgg_id.label')}</Label>
          <Input id="bgg_expansion_id" name="bgg_expansion_id" type="number" value={formData.bgg_expansion_id} onChange={onFieldChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t('games.form.description.label')}</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={onFieldChange} className="min-h-[100px]" />
        </div>
        <FormActions mode={mode} onCancel={() => onOpenChange(false)} />
      </form>
    </BaseFormDialog>
  );
}

interface DeleteExpansionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  expansionName: string;
  onConfirm: () => void;
}

export function DeleteExpansionDialog({ isOpen, onOpenChange, expansionName, onConfirm }: DeleteExpansionDialogProps) {
  return (
    <BaseDeleteDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      titleKey="expansion.dialog.delete.title"
      descriptionKey="expansion.dialog.delete.description"
      itemName={expansionName}
      onConfirm={onConfirm}
    />
  );
}
