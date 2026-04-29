import React from 'react';
import { Plus, Trash, Sword, Shield, Crown, Target } from '@phosphor-icons/react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui/button';
import { gameModeColors } from '@/shared/theme/gameModeColors';
import { useLabels } from '@/shared/hooks/useLabels';

import type { GameFormData, GameValidationErrors, GameCharacter } from '../../../../shared/types/index';

// eslint-disable-next-line react-refresh/only-export-components
export function useCharacterFormHandlers(
  formData: GameFormData,
  onFormDataChange: (patch: Partial<GameFormData>) => void
) {
  const handleUpdateCharacter = (index: number, field: keyof GameCharacter, value: any) => {
    const updated = [...(formData.characters || [])];
    updated[index] = { ...updated[index], [field]: value };
    onFormDataChange({ characters: updated });
  };

  const handleAddCharacter = () => onFormDataChange({
    characters: [...(formData.characters || []), { character_key: Date.now().toString(), name: '', description: '', abilities: [] }],
  });

  const handleRemoveCharacter = (idx: number) => onFormDataChange({
    characters: (formData.characters || []).filter((_: any, i: number) => i !== idx),
  });

  return { handleUpdateCharacter, handleAddCharacter, handleRemoveCharacter };
}

interface GameFormProps {
  formData: GameFormData;
  errors: GameValidationErrors;
  onChange: (field: keyof GameFormData, value: any) => void;
  onCharacterChange: (index: number, field: keyof GameCharacter, value: any) => void;
  onAddCharacter: () => void;
  onRemoveCharacter: (index: number) => void;
}

export default function GameForm({ 
  formData, 
  errors, 
  onChange, 
  onCharacterChange, 
  onAddCharacter, 
  onRemoveCharacter 
}: GameFormProps) {
  const { t } = useLabels();

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">{t('games.form.name.label')} *</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => onChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''} 
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('games.form.min_players.label')}</Label>
            <Input type="number" value={formData.min_players} onChange={(e) => onChange('min_players', parseInt(e.target.value))} />
          </div>
          <div>
            <Label>{t('games.form.max_players.label')}</Label>
            <Input type="number" value={formData.max_players} onChange={(e) => onChange('max_players', parseInt(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border bg-card/50 space-y-3">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Modes de jeu</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'supports_competitive', label: 'competitive', icon: Sword, color: gameModeColors.competitive.icon },
            { id: 'supports_cooperative', label: 'cooperative', icon: Shield, color: gameModeColors.cooperative.icon },
            { id: 'supports_campaign', label: 'campaign', icon: Crown, color: gameModeColors.campaign.icon },
            { id: 'supports_hybrid', label: 'hybrid', icon: Target, color: gameModeColors.hybrid.icon },
          ].map((mode) => (
            <div key={mode.id} className="flex items-center space-x-2">
              <Checkbox 
                id={mode.id} 
                checked={!!formData[mode.id as keyof GameFormData]} 
                onCheckedChange={(v) => onChange(mode.id as keyof GameFormData, !!v)} 
              />
              <Label htmlFor={mode.id} className="text-sm flex items-center cursor-pointer">
                <mode.icon className={`w-4 h-4 mr-2 ${mode.color}`} />
                {t(`games.card.modes.${mode.label}`)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_expansion"
            checked={!!formData.has_expansion}
            onCheckedChange={(v) => { onChange('has_expansion', !!v); if (v) onChange('is_expansion', false); }}
          />
          <Label htmlFor="has_expansion">{t('games.form.has_expansion_checkbox.label')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_expansion"
            checked={!!formData.is_expansion}
            onCheckedChange={(v) => { onChange('is_expansion', !!v); if (v) onChange('has_expansion', false); }}
          />
          <Label htmlFor="is_expansion">{t('games.form.is_expansion_checkbox.label')}</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="has_char" checked={formData.has_characters} onCheckedChange={(v) => onChange('has_characters', !!v)} />
            <Label htmlFor="has_char">Possède des personnages</Label>
          </div>
          {formData.has_characters && (
            <Button type="button" variant="outline" size="sm" onClick={onAddCharacter}><Plus className="mr-1 h-3 w-3" /> Ajouter</Button>
          )}
        </div>

        {formData.has_characters && formData.characters?.map((char, idx) => (
          <div key={char.character_key || idx} className="relative p-3 border rounded-lg bg-muted/30">
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 text-red-500" onClick={() => onRemoveCharacter(idx)}><Trash size={14} /></Button>
            <Input className="mb-2 h-8" placeholder="Nom" value={char.name} onChange={(e) => onCharacterChange(idx, 'name', e.target.value)} />
            <Textarea className="text-xs" placeholder="Description" value={char.description} onChange={(e) => onCharacterChange(idx, 'description', e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}