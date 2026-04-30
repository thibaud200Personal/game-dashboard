import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Link } from '@phosphor-icons/react';
import BGGSearch from '@/features/bgg/BGGSearch';
import GameForm from './GameForm';
import { useCharacterFormHandlers } from './use-character-form-handlers';
import { useLabels } from '@/shared/hooks/useLabels';
import type { GameValidationErrors, BGGGame } from '../../../../shared/types/index';

interface EditGameDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  onFormDataChange: (data: any) => void;
  onUpdateGame: () => void;
  onResetForm?: () => void;
  editingGame?: any;
  serverError?: string | null;
  isBGGSearchOpen: boolean;
  onBGGSearchToggle: (open: boolean) => void;
  onBGGGameSelect: (game: BGGGame) => void;
}

export default function EditGameDialog({ isOpen, onOpenChange, formData, onFormDataChange, onUpdateGame, isBGGSearchOpen, onBGGSearchToggle, onBGGGameSelect }: EditGameDialogProps) {
  const { t } = useLabels();
  const errors: GameValidationErrors = {};
  const { handleUpdateCharacter, handleAddCharacter, handleRemoveCharacter } = useCharacterFormHandlers(formData, onFormDataChange);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Modifier : {formData.name}</DialogTitle></DialogHeader>

        <Button variant="outline" className="w-full mb-4 border-teal-600" onClick={() => onBGGSearchToggle(true)}>
          <Link className="mr-2 h-4 w-4" /> {t('games.form.bgg_search')}
        </Button>

        {isBGGSearchOpen && (
          <BGGSearch
            onGameSelect={(game: BGGGame) => onBGGGameSelect(game)}
            onClose={() => onBGGSearchToggle(false)}
          />
        )}

        <GameForm
          formData={formData} errors={errors}
          onChange={(f, v) => onFormDataChange({ [f]: v })}
          onCharacterChange={handleUpdateCharacter}
          onAddCharacter={handleAddCharacter}
          onRemoveCharacter={handleRemoveCharacter}
        />

        <Button className="w-full mt-4 bg-orange-600" onClick={onUpdateGame}>Mettre à jour</Button>
      </DialogContent>
    </Dialog>
  );
}
