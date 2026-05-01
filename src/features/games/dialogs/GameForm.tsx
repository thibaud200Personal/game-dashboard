import React from 'react';
import { Plus, Trash, Sword, Shield, Crown, Target } from '@phosphor-icons/react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { gameModeColors } from '@/shared/theme/gameModeColors';
import { useLabels } from '@/shared/hooks/useLabels';

import type { GameFormData, GameValidationErrors, GameCharacter, GameExpansion } from '../../../../shared/types/index';

interface GameFormProps {
  formData: GameFormData;
  errors: GameValidationErrors;
  onChange: (field: keyof GameFormData, value: GameFormData[keyof GameFormData]) => void;
  onCharacterChange: (index: number, field: keyof GameCharacter, value: GameCharacter[keyof GameCharacter]) => void;
  onAddCharacter: () => void;
  onRemoveCharacter: (index: number) => void;
}

function formatExpansion(exp: GameExpansion): string {
  return exp.year_published ? `${exp.name} (${exp.year_published})` : exp.name;
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
    <div className="space-y-4 py-2">

      {/* Name */}
      <div>
        <Label htmlFor="name">{t('games.form.name.label')} *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          className={errors.name ? 'border-destructive' : ''}
          placeholder={t('games.form.name.placeholder')}
        />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Image + Thumbnail */}
      <div>
        <Label htmlFor="image">{t('games.form.image.label')}</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => onChange('image', e.target.value)}
          className={errors.image ? 'border-destructive' : ''}
          placeholder="https://..."
        />
        {errors.image && <p className="text-destructive text-xs mt-1">{errors.image}</p>}
      </div>
      <div>
        <Label htmlFor="thumbnail">{t('games.form.thumbnail.label')}</Label>
        <Input
          id="thumbnail"
          value={formData.thumbnail ?? ''}
          onChange={(e) => onChange('thumbnail', e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Players */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t('games.form.min_players.label')}</Label>
          <Input
            type="number"
            min="1"
            value={formData.min_players}
            onChange={(e) => onChange('min_players', parseInt(e.target.value) || 1)}
            className={errors.min_players ? 'border-destructive' : ''}
          />
          {errors.min_players && <p className="text-destructive text-xs mt-1">{errors.min_players}</p>}
        </div>
        <div>
          <Label>{t('games.form.max_players.label')}</Label>
          <Input
            type="number"
            min="1"
            value={formData.max_players}
            onChange={(e) => onChange('max_players', parseInt(e.target.value) || 1)}
            className={errors.max_players ? 'border-destructive' : ''}
          />
          {errors.max_players && <p className="text-destructive text-xs mt-1">{errors.max_players}</p>}
        </div>
      </div>

      {/* Duration + Age */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">{t('games.form.duration.label')}</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            placeholder={t('games.form.duration.placeholder')}
          />
        </div>
        <div>
          <Label htmlFor="age_min">{t('games.form.age_min.label')}</Label>
          <Input
            id="age_min"
            type="number"
            min="1"
            value={formData.age_min}
            onChange={(e) => onChange('age_min', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      {/* Playtime min / recommended / max */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="min_playtime">{t('games.form.min_playtime.label')}</Label>
          <Input
            id="min_playtime"
            type="number"
            min="0"
            value={formData.min_playtime ?? ''}
            onChange={(e) => onChange('min_playtime', parseInt(e.target.value) || undefined)}
            placeholder="—"
          />
        </div>
        <div>
          <Label htmlFor="playing_time">{t('games.form.playing_time.label')}</Label>
          <Input
            id="playing_time"
            type="number"
            min="0"
            value={formData.playing_time ?? ''}
            onChange={(e) => onChange('playing_time', parseInt(e.target.value) || undefined)}
            placeholder="—"
          />
        </div>
        <div>
          <Label htmlFor="max_playtime">{t('games.form.max_playtime.label')}</Label>
          <Input
            id="max_playtime"
            type="number"
            min="0"
            value={formData.max_playtime ?? ''}
            onChange={(e) => onChange('max_playtime', parseInt(e.target.value) || undefined)}
            placeholder="—"
          />
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <Label>{t('games.form.difficulty.label')}</Label>
        <Select value={formData.difficulty} onValueChange={(v) => onChange('difficulty', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">{t('games.form.difficulty.beginner')}</SelectItem>
            <SelectItem value="Intermediate">{t('games.form.difficulty.intermediate')}</SelectItem>
            <SelectItem value="Expert">{t('games.form.difficulty.expert')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Game Modes */}
      <div className="p-4 rounded-xl border bg-card/50 space-y-3">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('games.form.modes.label')}</Label>
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

      {/* Category / Categories / Mechanics */}
      <div>
        <Label htmlFor="category">{t('games.form.category.label')}</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
          placeholder={t('games.form.category.placeholder')}
        />
      </div>
      <div>
        <Label htmlFor="categories">{t('games.form.categories.label')}</Label>
        <Input
          id="categories"
          value={(formData.categories ?? []).join(', ')}
          onChange={(e) => onChange('categories', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          placeholder={t('games.form.categories.placeholder')}
        />
      </div>
      <div>
        <Label htmlFor="mechanics">{t('games.form.mechanics.label')}</Label>
        <Input
          id="mechanics"
          value={(formData.mechanics ?? []).join(', ')}
          onChange={(e) => onChange('mechanics', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          placeholder={t('games.form.mechanics.placeholder')}
        />
      </div>

      {/* Designer + Publisher */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="designer">{t('games.form.designer.label')}</Label>
          <Input
            id="designer"
            value={formData.designer}
            onChange={(e) => onChange('designer', e.target.value)}
            placeholder={t('games.form.designer.placeholder')}
          />
        </div>
        <div>
          <Label htmlFor="publisher">{t('games.form.publisher.label')}</Label>
          <Input
            id="publisher"
            value={formData.publisher}
            onChange={(e) => onChange('publisher', e.target.value)}
            placeholder={t('games.form.publisher.placeholder')}
          />
        </div>
      </div>

      {/* Year + BGG Rating + Weight */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="year_published">{t('games.form.year.label')}</Label>
          <Input
            id="year_published"
            type="number"
            min="1800"
            max="2030"
            value={formData.year_published}
            onChange={(e) => onChange('year_published', parseInt(e.target.value) || new Date().getFullYear())}
            className={errors.year_published ? 'border-destructive' : ''}
          />
          {errors.year_published && <p className="text-destructive text-xs mt-1">{errors.year_published}</p>}
        </div>
        <div>
          <Label htmlFor="bgg_rating">{t('games.form.bgg_rating.label')}</Label>
          <Input
            id="bgg_rating"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.bgg_rating}
            onChange={(e) => onChange('bgg_rating', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="weight">{t('games.form.weight.label')}</Label>
          <Input
            id="weight"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.weight}
            onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">{t('games.form.description.label')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder={t('games.form.description.placeholder')}
          rows={3}
        />
      </div>

      {/* Has expansion / Is expansion */}
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

      {/* Expansions list */}
      {formData.has_expansion && (
        <div>
          <Label>{t('games.form.expansions.label')}</Label>
          <Textarea
            value={(formData.expansions ?? []).map(formatExpansion).join(', ')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((text, idx) => {
                const t = text.trim();
                const match = t.match(/^(.+)\((\d{4})\)$/);
                return match
                  ? { expansion_id: idx, name: match[1].trim(), year_published: parseInt(match[2]) }
                  : { expansion_id: idx, name: t, year_published: 0 };
              }).filter((e) => e.name);
              onChange('expansions', parsed);
            }}
            placeholder={t('games.form.expansions.placeholder')}
            rows={3}
          />
        </div>
      )}

      {/* Has characters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="has_char" checked={formData.has_characters} onCheckedChange={(v) => onChange('has_characters', !!v)} />
            <Label htmlFor="has_char">{t('games.form.has_characters.label')}</Label>
          </div>
          {formData.has_characters && (
            <Button type="button" variant="outline" size="sm" onClick={onAddCharacter}>
              <Plus className="mr-1 h-3 w-3" /> {t('common.buttons.add')}
            </Button>
          )}
        </div>

        {formData.has_characters && formData.characters?.map((char, idx) => (
          <div key={char.character_key || idx} className="relative p-3 border rounded-lg bg-muted/30">
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive" onClick={() => onRemoveCharacter(idx)}>
              <Trash size={14} />
            </Button>
            <Input
              className="mb-2 h-8"
              placeholder={t('character.form.name.placeholder')}
              value={char.name}
              onChange={(e) => onCharacterChange(idx, 'name', e.target.value)}
            />
            <Textarea
              className="text-xs"
              placeholder={t('character.form.description.placeholder')}
              value={char.description}
              onChange={(e) => onCharacterChange(idx, 'description', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
