import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Plus, Link } from '@phosphor-icons/react';
import BGGSearch from '@/features/bgg/BGGSearch';
import GameForm, { useCharacterFormHandlers } from './GameForm';
import { useLabels } from '@/shared/hooks/useLabels';
import type { GameValidationErrors, BGGGame } from '../../../../shared/types/index.d.ts';

export default function AddGameDialog({ isOpen, onOpenChange, formData, onFormDataChange, onAddGame, onResetForm, isBGGSearchOpen, onBGGSearchToggle, onBGGGameSelect }: any) {
  const [errors, setErrors] = useState<GameValidationErrors>({});
  const { t } = useLabels();
  const { handleUpdateCharacter, handleAddCharacter, handleRemoveCharacter } = useCharacterFormHandlers(formData, onFormDataChange);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { onOpenChange(v); if(!v) onResetForm(); }}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Ajouter un jeu</Button></DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Ajouter un nouveau jeu</DialogTitle></DialogHeader>

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

        <Button className="w-full mt-4 bg-teal-600" onClick={onAddGame}>Enregistrer le jeu</Button>
      </DialogContent>
    </Dialog>
  );
}
