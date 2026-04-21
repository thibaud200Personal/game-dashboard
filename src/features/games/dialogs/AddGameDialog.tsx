import React, { useState } from 'react';
import {
  Plus,
  Link,
  Trash,
  Sword,
  Shield,
  Crown,
  Target
} from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import BGGSearch from '@/features/bgg/BGGSearch';
import type { BGGGame } from '@/types';

import { GameExpansion, GameCharacter } from '@/types';
import { withUpdatedAbility, withRemovedAbility, formatExpansion } from '@/shared/utils/gameHelpers';
import { useLabels } from '@/shared/hooks/useLabels';

interface FormData {
  name: string
  image: string
  min_players: number
  max_players: number
  description: string
  duration: string
  difficulty: string
  category: string
  year_published: number
  publisher: string
  designer: string
  bgg_rating: number
  weight: number
  age_min: number
  expansions: GameExpansion[]
  characters: GameCharacter[]
  has_expansion: boolean
  has_characters: boolean
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  bgg_id?: number
  thumbnail?: string
  playing_time?: number
  min_playtime?: number
  max_playtime?: number
  categories?: string[]
  mechanics?: string[]
  families?: string[]
  is_expansion?: boolean
}

interface ValidationErrors {
  name?: string;
  image?: string;
  min_players?: string;
  max_players?: string;
  duration?: string;
  category?: string;
  designer?: string;
  publisher?: string;
  year_published?: string;
  bgg_rating?: string;
  weight?: string;
  age_min?: string;
}

interface AddGameDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: FormData
  onFormDataChange: (data: Partial<FormData>) => void
  onBGGGameSelect: (circle: BGGGame) => void
  onAddGame: () => void
  onResetForm: () => void
  isBGGSearchOpen: boolean
  onBGGSearchToggle: (open: boolean) => void
  serverError?: string | null
  disabled?: boolean
}

export default function AddGameDialog({
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onBGGGameSelect,
  onAddGame,
  onResetForm,
  isBGGSearchOpen,
  onBGGSearchToggle,
  serverError,
  disabled
}: AddGameDialogProps) {
  const { t } = useLabels();
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Game name validation (required)
    if (!formData.name.trim()) {
      newErrors.name = t('games.form.validation.name_required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('games.form.validation.name_min');
    }

    // Image URL validation (if provided)
    if (formData.image && formData.image.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(formData.image.trim())) {
        newErrors.image = t('games.form.validation.image_url');
      }
    }

    // Players validation
    if (formData.min_players < 1) {
      newErrors.min_players = t('games.form.validation.min_players');
    }
    if (formData.max_players < 1) {
      newErrors.max_players = t('games.form.validation.max_players_min');
    }
    if (formData.max_players < formData.min_players) {
      newErrors.max_players = t('games.form.validation.max_players_range');
    }

    // Age validation
    if (formData.age_min < 1 || formData.age_min > 99) {
      newErrors.age_min = t('games.form.validation.age');
    }

    // Year validation
    const currentYear = new Date().getFullYear();
    if (formData.year_published < 1800 || formData.year_published > currentYear + 5) {
      newErrors.year_published = `${t('games.form.validation.year')} ${currentYear + 5}`;
    }

    // BGG Rating validation
    if (formData.bgg_rating < 0 || formData.bgg_rating > 10) {
      newErrors.bgg_rating = t('games.form.validation.bgg_rating');
    }

    // Weight validation
    if (formData.weight < 0 || formData.weight > 5) {
      newErrors.weight = t('games.form.validation.weight');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGame = () => {
    if (validateForm()) {
      onAddGame();
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    onFormDataChange({ [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const setFormData = (updater: (prev: FormData) => FormData) => {
    const newData = updater(formData);
    onFormDataChange(newData);
  };

  const addCharacter = () => {
    setFormData(prev => ({
      ...prev,
      characters: [
        ...(prev.characters || []),
        {
          character_key: `character-${Date.now()}`,
          name: '',
          description: '',
          abilities: ['']
        }
      ]
    }));
  };

  const updateCharacter = (index: number, field: keyof GameCharacter, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      characters: (prev.characters || []).map((char, i) => 
        i === index ? { ...char, [field]: value } : char
      )
    }));
  };

  const removeCharacter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      characters: (prev.characters || []).filter((_, i) => i !== index)
    }));
  };

  const addAbility = (charIndex: number) => {
    setFormData(prev => ({
      ...prev,
      characters: (prev.characters || []).map((char, i) => 
        i === charIndex ? { ...char, abilities: [...(char.abilities || []), ''] } : char
      )
    }));
  };

  const updateAbility = (charIndex: number, abilityIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      characters: withUpdatedAbility(prev.characters || [], charIndex, abilityIndex, value)
    }));
  };

  const removeAbility = (charIndex: number, abilityIndex: number) => {
    setFormData(prev => ({
      ...prev,
      characters: withRemovedAbility(prev.characters || [], charIndex, abilityIndex)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        onResetForm();
        onBGGSearchToggle(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button aria-label="Open add game dialog" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('games.add_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('games.add_dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              onClick={() => onBGGSearchToggle(true)}
              variant="outline" 
              className="border-teal-600 text-teal-400 hover:bg-teal-600/20"
            >
              <Link className="w-4 h-4 mr-2" />
              {t('games.form.bgg_search')}
            </Button>
          </div>

          {isBGGSearchOpen && (
            <div className="p-4 bg-muted rounded-lg border border-border">
              <BGGSearch 
                onGameSelect={(bggGame) => {
                  onFormDataChange({
                    name: bggGame.name || '',
                    image: bggGame.image || '',
                    year_published: bggGame.year_published || new Date().getFullYear(),
                    publisher: bggGame.publishers?.[0] || '',
                    designer: bggGame.designers?.[0] || '',
                    bgg_rating: bggGame.rating || 0,
                    weight: bggGame.weight || 0,
                    min_players: bggGame.min_players || 1,
                    max_players: bggGame.max_players || 1,
                    duration: bggGame.playing_time ? `${bggGame.playing_time} min` : '',
                    playing_time: bggGame.playing_time ?? undefined,
                    age_min: bggGame.min_age || 1,
                    bgg_id: bggGame.id || undefined,
                    thumbnail: bggGame.thumbnail || '',
                    min_playtime: bggGame.min_playtime ?? undefined,
                    max_playtime: bggGame.max_playtime ?? undefined,
                    category: bggGame.categories?.[0] || '',
                    categories: bggGame.categories || [],
                    mechanics: bggGame.mechanics || [],
                    is_expansion: bggGame.is_expansion ?? false,
                  });
                  onBGGGameSelect(bggGame);
                  onBGGSearchToggle(false);
                }}
                onClose={() => onBGGSearchToggle(false)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="game-name">{t('games.form.name.label')} *</Label>
            <Input
              id="game-name"
              name="game-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              placeholder={t('games.form.name.placeholder')}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="game-image">{t('games.form.image.label')}</Label>
            <Input
              id="game-image"
              name="game-image"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              className={errors.image ? 'border-red-500' : ''}
              placeholder="https://..."
            />
            {errors.image && (
              <p className="text-red-400 text-sm mt-1">{errors.image}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-game-thumbnail">{t('games.form.thumbnail.label')}</Label>
            <Input
              id="edit-game-thumbnail"
              value={formData.thumbnail || ''}
              onChange={(e) => onFormDataChange({ thumbnail: e.target.value })}
              className=""
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-players">{t('games.form.min_players.label')} *</Label>
              <Input
                id="min-players"
                name="min-players"
                type="number"
                min="1"
                value={formData.min_players}
                onChange={(e) => handleInputChange('min_players', parseInt(e.target.value) || 1)}
                className={errors.min_players ? 'border-red-500' : ''}
              />
              {errors.min_players && (
                <p className="text-red-400 text-sm mt-1">{errors.min_players}</p>
              )}
            </div>
            <div>
              <Label htmlFor="max-players">{t('games.form.max_players.label')} *</Label>
              <Input
                id="max-players"
                name="max-players"
                type="number"
                min="1"
                value={formData.max_players}
                onChange={(e) => handleInputChange('max_players', parseInt(e.target.value) || 1)}
                className={errors.max_players ? 'border-red-500' : ''}
              />
              {errors.max_players && (
                <p className="text-red-400 text-sm mt-1">{errors.max_players}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">{t('games.form.duration.label')}</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={(e) => onFormDataChange({ duration: e.target.value })}
                className=""
                placeholder="30-60 min"
              />
            </div>
            <div>
              <Label htmlFor="age-min">{t('games.form.age_min.label')}</Label>
              <Input
                id="age-min"
                name="age-min"
                type="number"
                min="1"
                value={formData.age_min}
                onChange={(e) => onFormDataChange({ age_min: parseInt(e.target.value) || 1 })}
                className=""
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-min-playtime">{t('games.form.min_playtime.label')}</Label>
              <Input
                id="edit-min-playtime"
                type="number"
                min="0"
                value={formData.min_playtime ?? ''}
                onChange={(e) => onFormDataChange({ min_playtime: parseInt(e.target.value) || undefined })}
                className=""
                placeholder="—"
              />
            </div>
            <div>
              <Label htmlFor="edit-playing-time">{t('games.form.playing_time.label')}</Label>
              <Input
                id="edit-playing-time"
                type="number"
                min="0"
                value={formData.playing_time ?? ''}
                onChange={(e) => onFormDataChange({ playing_time: parseInt(e.target.value) || undefined })}
                className=""
                placeholder="—"
              />
            </div>
            <div>
              <Label htmlFor="edit-max-playtime">{t('games.form.max_playtime.label')}</Label>
              <Input
                id="edit-max-playtime"
                type="number"
                min="0"
                value={formData.max_playtime ?? ''}
                onChange={(e) => onFormDataChange({ max_playtime: parseInt(e.target.value) || undefined })}
                className=""
                placeholder="—"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">{t('games.form.difficulty.label')}</Label>
              <Select value={formData.difficulty} onValueChange={(value) => onFormDataChange({ difficulty: value })}>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            
            <div>
              <Label>{t('games.form.modes.label')}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="supports-competitive"
                    checked={formData.supports_competitive}
                    onCheckedChange={(checked) => onFormDataChange({ supports_competitive: checked as boolean })}
                    className="border-border"
                  />
                  <Label htmlFor="supports-competitive" className="text-sm flex items-center">
                    <Sword className="w-3 h-3 mr-1 text-red-400" />
                    {t('games.card.modes.competitive')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supports-cooperative"
                    checked={formData.supports_cooperative}
                    onCheckedChange={(checked) => onFormDataChange({ supports_cooperative: checked as boolean })}
                    className="border-border"
                  />
                  <Label htmlFor="supports-cooperative" className="text-sm flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-blue-400" />
                    {t('games.card.modes.cooperative')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supports-campaign"
                    checked={formData.supports_campaign}
                    onCheckedChange={(checked) => onFormDataChange({ supports_campaign: checked as boolean })}
                    className="border-border"
                  />
                  <Label htmlFor="supports-campaign" className="text-sm flex items-center">
                    <Crown className="w-3 h-3 mr-1 text-purple-400" />
                    {t('games.card.modes.campaign')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supports-hybrid"
                    checked={formData.supports_hybrid}
                    onCheckedChange={(checked) => onFormDataChange({ supports_hybrid: checked as boolean })}
                    className="border-border"
                  />
                  <Label htmlFor="supports-hybrid" className="text-sm flex items-center">
                    <Target className="w-3 h-3 mr-1 text-orange-400" />
                    {t('games.card.modes.hybrid')}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="category">{t('games.form.category.label')}</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => onFormDataChange({ category: e.target.value })}
              className=""
              placeholder={t('games.form.category.placeholder')}
            />
          </div>
          <div>
            <Label htmlFor="edit-categories">{t('games.form.categories.label')}</Label>
            <Input
              id="edit-categories"
              value={(formData.categories || []).join(', ')}
              onChange={(e) => onFormDataChange({
                categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className=""
              placeholder={t('games.form.categories.placeholder')}
            />
          </div>
          <div>
            <Label htmlFor="edit-mechanics">{t('games.form.mechanics.label')}</Label>
            <Input
              id="edit-mechanics"
              value={(formData.mechanics || []).join(', ')}
              onChange={(e) => onFormDataChange({
                mechanics: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className=""
              placeholder={t('games.form.mechanics.placeholder')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="designer">{t('games.form.designer.label')}</Label>
              <Input
                id="designer"
                name="designer"
                value={formData.designer}
                onChange={(e) => onFormDataChange({ designer: e.target.value })}
                className=""
                placeholder={t('games.form.designer.placeholder')}
              />
            </div>
            <div>
              <Label htmlFor="publisher">{t('games.form.publisher.label')}</Label>
              <Input
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={(e) => onFormDataChange({ publisher: e.target.value })}
                className=""
                placeholder={t('games.form.publisher.placeholder')}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year-published">{t('games.form.year.label')}</Label>
              <Input
                id="year-published"
                name="year-published"
                type="number"
                min="1800"
                max="2030"
                value={formData.year_published}
                onChange={(e) => onFormDataChange({ year_published: parseInt(e.target.value) || new Date().getFullYear() })}
                className=""
              />
            </div>
            <div>
              <Label htmlFor="bgg-rating">{t('games.form.bgg_rating.label')}</Label>
              <Input
                id="bgg-rating"
                name="bgg-rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.bgg_rating}
                onChange={(e) => onFormDataChange({ bgg_rating: parseFloat(e.target.value) || 0 })}
                className=""
              />
            </div>
            <div>
              <Label htmlFor="weight">{t('games.form.weight.label')}</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.weight}
                onChange={(e) => onFormDataChange({ weight: parseFloat(e.target.value) || 0 })}
                className=""
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">{t('games.form.description.label')}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              className=""
              placeholder={t('games.form.description.placeholder')}
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center gap-6 mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_expansion"
                  checked={formData.has_expansion}
                  onCheckedChange={(checked) => onFormDataChange({ has_expansion: !!checked, ...(checked ? { is_expansion: false } : {}) })}
                />
                <Label htmlFor="has_expansion">{t('games.form.has_expansion_checkbox.label')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_expansion"
                  checked={formData.is_expansion ?? false}
                  onCheckedChange={(checked) => onFormDataChange({ is_expansion: !!checked, ...(checked ? { has_expansion: false } : {}) })}
                />
                <Label htmlFor="is_expansion">{t('games.form.is_expansion_checkbox.label')}</Label>
              </div>
            </div>
            {/* Expansions Display - show if checkbox is checked */}
            {formData.has_expansion && (
              <div className="space-y-2">
                <Label>{t('games.form.expansions.label')}</Label>
                <Textarea
                  id="expansions-list"
                  name="expansions-list"
                  value={(formData.expansions || []).map(formatExpansion).join(', ')}
                  onChange={(e) => {
                    // Parse the textarea content back to expansions array
                    const expansionTexts = e.target.value.split(',').map(text => text.trim()).filter(text => text);
                    const parsedExpansions = expansionTexts.map((text, index) => {
                      const match = text.match(/^([^(]+)\((\d{4})\)$/);
                      if (match) {
                        return {
                          expansion_id: index,
                          name: match[1].trim(),
                          year_published: parseInt(match[2])
                        };
                      } else {
                        return {
                          expansion_id: index,
                          name: text,
                          year_published: 0
                        };
                      }
                    });
                    
                    onFormDataChange({ expansions: parsedExpansions });
                  }}
                  placeholder="Extension 1 (2023), Extension 2 (2024), ..."
                  className=""
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Characters Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="has_character"
                checked={formData.has_characters}
                onCheckedChange={(checked) => onFormDataChange({ has_characters: !!checked })}
              />
              <Label htmlFor="has_character">Has character roles</Label>
            </div>
            {formData.has_characters && (
              <div>
                <div className="flex items-center justify-between">
                  <Label>Characters/Roles</Label>
                  <Button 
                    type="button"
                    onClick={addCharacter}
                    variant="outline"
                    className=""
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Character
                  </Button>
                </div>
                {(formData.characters || []).map((character, charIndex) => (
              <div key={charIndex} className="p-3 bg-muted rounded-lg border border-border space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={character.name}
                    onChange={(e) => updateCharacter(charIndex, 'name', e.target.value)}
                    placeholder={t('games.form.characters.name.placeholder')}
                    className=""
                  />
                  <Button
                    type="button"
                    onClick={() => removeCharacter(charIndex)}
                    aria-label="Remove character"
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
                <Input
                  value={character.description}
                  onChange={(e) => updateCharacter(charIndex, 'description', e.target.value)}
                  placeholder={t('games.form.character.description.placeholder')}
                  className=""
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t('games.form.characters.abilities.label')}</Label>
                    <Button
                      type="button"
                      onClick={() => addAbility(charIndex)}
                      variant="outline"
                      className="h-6 text-xs"
                    >
                      <Plus className="w-2 h-2 mr-1" />
                      {t('games.form.character.add_ability')}
                    </Button>
                  </div>
                  {(character.abilities || []).map((ability, abilityIndex) => (
                    <div key={abilityIndex} className="flex space-x-1">
                      <Input
                        value={ability}
                        onChange={(e) => updateAbility(charIndex, abilityIndex, e.target.value)}
                        placeholder={t('games.form.characters.ability.placeholder')}
                        className="text-xs"
                      />
                      <Button
                        type="button"
                        onClick={() => removeAbility(charIndex, abilityIndex)}
                        aria-label="Remove ability"
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                      >
                        <Trash className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
              </div>
            )}
          </div>

          {serverError && (
            <p className="text-red-400 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">{serverError}</p>
          )}
          <Button onClick={handleAddGame} disabled={!!disabled} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {t('games.add_dialog.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}