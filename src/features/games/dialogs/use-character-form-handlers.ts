import type { GameFormData, GameCharacter } from '../../../../shared/types/index';

export function useCharacterFormHandlers(
  formData: GameFormData,
  onFormDataChange: (patch: Partial<GameFormData>) => void
) {
  const handleUpdateCharacter = (index: number, field: keyof GameCharacter, value: GameCharacter[keyof GameCharacter]) => {
    const updated = [...(formData.characters || [])];
    updated[index] = { ...updated[index], [field]: value };
    onFormDataChange({ characters: updated });
  };

  const handleAddCharacter = () => onFormDataChange({
    characters: [...(formData.characters || []), { character_key: Date.now().toString(), name: '', description: '', abilities: [] }],
  });

  const handleRemoveCharacter = (idx: number) => onFormDataChange({
    characters: (formData.characters || []).filter((_, i) => i !== idx),
  });

  return { handleUpdateCharacter, handleAddCharacter, handleRemoveCharacter };
}
