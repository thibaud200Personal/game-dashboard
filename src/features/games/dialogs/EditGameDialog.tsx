import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import GameForm, { useCharacterFormHandlers } from './GameForm';
import type { GameValidationErrors } from '../../../../shared/types/index';

export default function EditGameDialog({ isOpen, onOpenChange, formData, onFormDataChange, onUpdateGame }: any) {
  const [errors, setErrors] = useState<GameValidationErrors>({});
  const { handleUpdateCharacter, handleAddCharacter, handleRemoveCharacter } = useCharacterFormHandlers(formData, onFormDataChange);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Modifier : {formData.name}</DialogTitle></DialogHeader>

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
