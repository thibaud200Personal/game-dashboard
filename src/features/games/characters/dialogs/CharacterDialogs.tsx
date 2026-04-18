import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';
import { useLabels } from '@/shared/hooks/useLabels';

interface CharacterFormData {
  name: string;
  character_key: string;
  avatar: string;
  description: string;
  abilities: string;
}

interface CharacterFormProps {
  formData: CharacterFormData;
  setFormData: (data: CharacterFormData | ((prev: CharacterFormData) => CharacterFormData)) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText: string;
  cancelText: string;
}

const CharacterForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitText,
  cancelText,
}: CharacterFormProps) => {
  const { t } = useLabels();
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">{t('character.form.name.label')}</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData((prev: CharacterFormData) => ({ ...prev, name: e.target.value }))}
          className="bg-slate-700/50 border-slate-600 text-white"
          placeholder={t('character.form.name.placeholder')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="character_key" className="text-white">{t('character.form.key.label')}</Label>
        <Input
          id="character_key"
          name="character_key"
          value={formData.character_key}
          onChange={(e) => setFormData((prev: CharacterFormData) => ({ ...prev, character_key: e.target.value }))}
          className="bg-slate-700/50 border-slate-600 text-white"
          placeholder={t('character.form.key.placeholder')}
          required
        />
        <p className="text-slate-400 text-xs">{t('character.form.key.hint')}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar" className="text-white">{t('character.form.avatar.label')}</Label>
        <Input
          id="avatar"
          name="avatar"
          value={formData.avatar}
          onChange={(e) => setFormData((prev: CharacterFormData) => ({ ...prev, avatar: e.target.value }))}
          className="bg-slate-700/50 border-slate-600 text-white"
          placeholder="https://example.com/avatar.jpg"
          type="url"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">{t('character.form.description.label')}</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData((prev: CharacterFormData) => ({ ...prev, description: e.target.value }))}
          className="bg-slate-700/50 border-slate-600 text-white min-h-[80px]"
          placeholder={t('character.form.description.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="abilities" className="text-white">{t('character.form.abilities.label')}</Label>
        <Textarea
          id="abilities"
          name="abilities"
          value={formData.abilities}
          onChange={(e) => setFormData((prev: CharacterFormData) => ({ ...prev, abilities: e.target.value }))}
          className="bg-slate-700/50 border-slate-600 text-white min-h-[80px]"
          placeholder={t('character.form.abilities.placeholder')}
        />
        <p className="text-slate-400 text-xs">{t('character.form.abilities.hint')}</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
        >
          {cancelText}
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {submitText}
        </Button>
      </div>
    </form>
  );
};

interface AddCharacterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CharacterFormData;
  setFormData: (data: CharacterFormData | ((prev: CharacterFormData) => CharacterFormData)) => void;
  onSubmit: (e: React.FormEvent) => void;
  darkMode: boolean;
}

export function AddCharacterDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  darkMode
}: AddCharacterDialogProps) {
  const { t } = useLabels();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={darkMode ? "bg-slate-800 border-slate-700 max-w-md mx-4" : "bg-white border-slate-200 max-w-md mx-4"} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : "text-slate-900"}>{t('character.dialog.add.title')}</DialogTitle>
          <DialogDescription className={darkMode ? "text-white/70" : "text-slate-700/70"}>
            {t('character.dialog.add.description')}
          </DialogDescription>
        </DialogHeader>
        <CharacterForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          submitText={t('common.buttons.add')}
          cancelText={t('common.buttons.cancel')}
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditCharacterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CharacterFormData;
  setFormData: (data: CharacterFormData | ((prev: CharacterFormData) => CharacterFormData)) => void;
  onSubmit: (e: React.FormEvent) => void;
  darkMode: boolean;
}

export function EditCharacterDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  darkMode
}: EditCharacterDialogProps) {
  const { t } = useLabels();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={darkMode ? "bg-slate-800 border-slate-700 max-w-md mx-4" : "bg-white border-slate-200 max-w-md mx-4"} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : "text-slate-900"}>{t('character.dialog.edit.title')}</DialogTitle>
          <DialogDescription className={darkMode ? "text-white/70" : "text-slate-700/70"}>
            {t('character.dialog.edit.description')}
          </DialogDescription>
        </DialogHeader>
        <CharacterForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          submitText={t('common.buttons.edit')}
          cancelText={t('common.buttons.cancel')}
        />
      </DialogContent>
    </Dialog>
  );
}

interface DeleteCharacterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  characterName: string;
  onConfirm: () => void;
  darkMode: boolean;
}

export function DeleteCharacterDialog({
  isOpen,
  onOpenChange,
  characterName,
  onConfirm,
  darkMode
}: DeleteCharacterDialogProps) {
  const { t } = useLabels();
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className={darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}>
        <AlertDialogHeader>
          <AlertDialogTitle className={darkMode ? "text-white" : "text-slate-900"}>{t('character.dialog.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription className={darkMode ? "text-slate-300" : "text-slate-700"}>
            {characterName && <><strong>"{characterName}"</strong> — </>}
            {t('character.dialog.delete.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700/50" : "border-slate-300 text-slate-700 hover:bg-slate-100"}>
            {t('common.buttons.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {t('common.buttons.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
