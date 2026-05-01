import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Plus, Link } from '@phosphor-icons/react';
import BGGSearch from '@/features/bgg/BGGSearch';
import GameForm from './GameForm';
import { useCharacterFormHandlers } from './use-character-form-handlers';
import { useLabels } from '@/shared/hooks/useLabels';
import type { GameValidationErrors, BGGGame } from '../../../../shared/types/index.d.ts';

export default function AddGameDialog({ isOpen, onOpenChange, formData, onFormDataChange, onAddGame, onResetForm, isBGGSearchOpen, onBGGSearchToggle, onBGGGameSelect }: any) {
  const errors: GameValidationErrors = {};
  const { t } = useLabels();
  const { handleUpdateCharacter, handleAddCharacter, handleRemoveCharacter } = useCharacterFormHandlers(formData, onFormDataChange);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { onOpenChange(v); if(!v) onResetForm(); }}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> {t('games.add_dialog.title')}</Button></DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('games.add_dialog.title')}</DialogTitle>
          <DialogDescription>{t('games.add_dialog.description')}</DialogDescription>
        </DialogHeader>

        <Button variant="outline" className="w-full mb-4 border-teal-600" onClick={() => onBGGSearchToggle(true)}>
          <Link className="mr-2 h-4 w-4" /> {t('games.form.bgg_search')}
        </Button>

        {isBGGSearchOpen && <BGGSearch onGameSelect={(game: BGGGame) => { onBGGGameSelect(game); onBGGSearchToggle(false); }} onClose={() => onBGGSearchToggle(false)}/>}

        <GameForm
          formData={formData} errors={errors}
          onChange={(f, v) => onFormDataChange({ [f]: v })}
          onCharacterChange={handleUpdateCharacter}
          onAddCharacter={handleAddCharacter}
          onRemoveCharacter={handleRemoveCharacter}
        />

        <Button className="w-full mt-4" onClick={onAddGame}>{t('games.add_dialog.submit')}</Button>
      </DialogContent>
    </Dialog>
  );
}
