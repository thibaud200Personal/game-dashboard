import React from 'react';
import {
  Plus,
  Trash,
  Sword,
  Shield,
  Crown,
  Target
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { Game, GameExpansion, GameCharacter } from '@/types';
import { withUpdatedAbility, withRemovedAbility } from '@/utils/gameHelpers';

interface FormData {
  name: string
  image: string
  min_players: number
  max_players: number
  description: string
  duration: string
  playing_time?: number
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
  is_expansion?: boolean
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  bgg_id?: number
  thumbnail?: string
  min_playtime?: number
  max_playtime?: number
  categories?: string[]
  mechanics?: string[]
}

interface EditGameDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingGame: Game | null
  formData: FormData
  onFormDataChange: (data: Partial<FormData>) => void
  onUpdateGame: () => void
  onResetForm: () => void
  darkMode: boolean
  serverError?: string | null
}

export default function EditGameDialog({
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onUpdateGame,
  onResetForm,
  darkMode,
  serverError
}: EditGameDialogProps) {
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
      }
    }}>
      <DialogContent className={
        `${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} max-w-2xl max-h-[90vh] overflow-y-auto`
      }>
        <DialogHeader>
          <DialogTitle className={darkMode ? 'text-white' : 'text-blue-700'}>Edit Game</DialogTitle>
          <DialogDescription className={darkMode ? 'text-white/70' : 'text-slate-500'}>
            Update game information and details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Champs standards */}
          <div>
            <Label htmlFor="edit-game-name" className={darkMode ? 'text-white' : 'text-blue-700'}>Game Name *</Label>
            <Input
              id="edit-game-name"
              name="edit-game-name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              className={darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}
              placeholder="Enter game name"
            />
          </div>
          <div>
            <Label htmlFor="edit-game-image" className={darkMode ? 'text-white' : 'text-blue-700'}>Image URL</Label>
            <Input
              id="edit-game-image"
              name="edit-game-image"
              value={formData.image}
              onChange={(e) => onFormDataChange({ image: e.target.value })}
              className={darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}
              placeholder="https://..."
            />
          </div>
          {/* Champs BGG */}
          <div>
            <Label htmlFor="edit-game-thumbnail" className={darkMode ? 'text-white' : 'text-blue-700'}>Thumbnail URL</Label>
            <Input
              id="edit-game-thumbnail"
              value={formData.thumbnail || ''}
              onChange={(e) => onFormDataChange({ thumbnail: e.target.value })}
              className={darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}
              placeholder="https://..."
            />
          </div>
          {/* ...le reste du bloc principal (Game Modes, Expansions, Characters, etc.)... */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-min-players" className={darkMode ? 'text-white' : 'text-blue-700'}>Min Players</Label>
              <Input
                id="edit-min-players"
                name="edit-min-players"
                type="number"
                min="1"
                value={formData.min_players}
                onChange={(e) => onFormDataChange({ min_players: parseInt(e.target.value) || 1 })}
                className={darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}
              />
            </div>
            <div>
              <Label htmlFor="edit-max-players" className={darkMode ? 'text-white' : 'text-blue-700'}>Max Players</Label>
              <Input
                id="edit-max-players"
                name="edit-max-players"
                type="number"
                min="1"
                value={formData.max_players}
                onChange={(e) => onFormDataChange({ max_players: parseInt(e.target.value) || 1 })}
                className={darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-duration">Duration</Label>
              <Input
                id="edit-duration"
                name="edit-duration"
                value={formData.duration}
                onChange={(e) => onFormDataChange({ duration: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="30-60 min"
              />
            </div>
            <div>
              <Label htmlFor="edit-age-min">Min Age</Label>
              <Input
                id="edit-age-min"
                name="edit-age-min"
                type="number"
                min="1"
                value={formData.age_min}
                onChange={(e) => onFormDataChange({ age_min: parseInt(e.target.value) || 1 })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-playing-time">Playing Time</Label>
              <Input
                id="edit-playing-time"
                type="number"
                min="0"
                value={formData.playing_time ?? ''}
                onChange={(e) => onFormDataChange({ playing_time: parseInt(e.target.value) || undefined })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="min"
              />
            </div>
            <div>
              <Label htmlFor="edit-min-playtime">Min Playtime</Label>
              <Input
                id="edit-min-playtime"
                type="number"
                min="0"
                value={formData.min_playtime ?? ''}
                onChange={(e) => onFormDataChange({ min_playtime: parseInt(e.target.value) || undefined })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="min"
              />
            </div>
            <div>
              <Label htmlFor="edit-max-playtime">Max Playtime</Label>
              <Input
                id="edit-max-playtime"
                type="number"
                min="0"
                value={formData.max_playtime ?? ''}
                onChange={(e) => onFormDataChange({ max_playtime: parseInt(e.target.value) || undefined })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="max"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => onFormDataChange({ difficulty: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Game Modes</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-supports-competitive"
                    checked={formData.supports_competitive}
                    onCheckedChange={(checked) => onFormDataChange({ supports_competitive: checked as boolean })}
                    className="border-slate-600"
                  />
                  <Label htmlFor="edit-supports-competitive" className="text-sm flex items-center">
                    <Sword className="w-3 h-3 mr-1 text-red-400" />
                    Compétitif
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-supports-cooperative"
                    checked={formData.supports_cooperative}
                    onCheckedChange={(checked) => onFormDataChange({ supports_cooperative: checked as boolean })}
                    className="border-slate-600"
                  />
                  <Label htmlFor="edit-supports-cooperative" className="text-sm flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-blue-400" />
                    Coopératif
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-supports-campaign"
                    checked={formData.supports_campaign}
                    onCheckedChange={(checked) => onFormDataChange({ supports_campaign: checked as boolean })}
                    className="border-slate-600"
                  />
                  <Label htmlFor="edit-supports-campaign" className="text-sm flex items-center">
                    <Crown className="w-3 h-3 mr-1 text-purple-400" />
                    Campagne
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-supports-hybrid"
                    checked={formData.supports_hybrid}
                    onCheckedChange={(checked) => onFormDataChange({ supports_hybrid: checked as boolean })}
                    className="border-slate-600"
                  />
                  <Label htmlFor="edit-supports-hybrid" className="text-sm flex items-center">
                    <Target className="w-3 h-3 mr-1 text-orange-400" />
                    Hybride
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Input
              id="edit-category"
              value={formData.category}
              onChange={(e) => onFormDataChange({ category: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Strategy, Party, etc."
            />
          </div>
          <div>
            <Label htmlFor="edit-categories">Catégories</Label>
            <Input
              id="edit-categories"
              value={(formData.categories || []).join(', ')}
              onChange={(e) => onFormDataChange({ categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Adventure, Fantasy, ..."
            />
          </div>
          <div>
            <Label htmlFor="edit-mechanics">Mécaniques</Label>
            <Input
              id="edit-mechanics"
              value={(formData.mechanics || []).join(', ')}
              onChange={(e) => onFormDataChange({ mechanics: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Hand Management, Cooperative Game, ..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-designer">Designer</Label>
              <Input
                id="edit-designer"
                value={formData.designer}
                onChange={(e) => onFormDataChange({ designer: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Game designer"
              />
            </div>
            <div>
              <Label htmlFor="edit-publisher">Publisher</Label>
              <Input
                id="edit-publisher"
                value={formData.publisher}
                onChange={(e) => onFormDataChange({ publisher: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Publisher"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-year-published">Year</Label>
              <Input
                id="edit-year-published"
                type="number"
                min="1800"
                max="2030"
                value={formData.year_published}
                onChange={(e) => onFormDataChange({ year_published: parseInt(e.target.value) || new Date().getFullYear() })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-bgg-rating">BGG Rating</Label>
              <Input
                id="edit-bgg-rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.bgg_rating}
                onChange={(e) => onFormDataChange({ bgg_rating: parseFloat(e.target.value) || 0 })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-weight">Weight (1-5)</Label>
              <Input
                id="edit-weight"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.weight}
                onChange={(e) => onFormDataChange({ weight: parseFloat(e.target.value) || 0 })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Brief game description"
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-has_expansion"
                  checked={formData.has_expansion}
                  onCheckedChange={(checked) => onFormDataChange({ has_expansion: !!checked })}
                />
                <Label htmlFor="edit-has_expansion">Has expansions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is_expansion"
                  checked={formData.is_expansion ?? false}
                  onCheckedChange={(checked) => onFormDataChange({ is_expansion: !!checked })}
                />
                <Label htmlFor="edit-is_expansion">Est une extension</Label>
              </div>
            </div>
            {/* Expansions Display - show if checkbox is checked */}
            {formData.has_expansion && (
              <div className="space-y-2">
                  <Label>Expansions</Label>
                  <Textarea
                  id="edit-expansion"
                  value={(formData.expansions || [])
                      .map(
                      (exp) =>
                          `${exp.name} (${exp.year_published && exp.year_published > 0 ? exp.year_published : "N/A"})`
                      )
                      .join(", ")}
                  onChange={(e) => {
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
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Extension 1 (2023), Extension 2 (2024), etc..."
                  rows={3}
                  />
              </div>
              )}
          </div>

          {/* Characters Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="edit-has_character"
                checked={formData.has_characters}
                onCheckedChange={(checked) => onFormDataChange({ has_characters: !!checked })}
              />
              <Label htmlFor="edit-has_character">Has character roles</Label>
            </div>
            {formData.has_characters && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Characters/Roles</Label>
                  <Button 
                    type="button"
                    onClick={addCharacter}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Character
                  </Button>
                </div>
                {(formData.characters || []).map((character, charIndex) => (
                  <div key={charIndex} className="p-3 bg-slate-700 rounded-lg border border-slate-600 space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={character.name}
                        onChange={(e) => updateCharacter(charIndex, 'name', e.target.value)}
                        placeholder="Character name"
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                      <Button
                        type="button"
                        onClick={() => removeCharacter(charIndex)}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      value={character.description}
                      onChange={(e) => updateCharacter(charIndex, 'description', e.target.value)}
                      placeholder="Character description"
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Abilities</Label>
                        <Button
                          type="button"
                          onClick={() => addAbility(charIndex)}
                          variant="outline"
                          className="border-slate-500 text-white hover:bg-slate-500 h-6 text-xs"
                        >
                          <Plus className="w-2 h-2 mr-1" />
                          Add Ability
                        </Button>
                      </div>
                      {(character.abilities || []).map((ability, abilityIndex) => (
                        <div key={abilityIndex} className="flex space-x-1">
                          <Input
                            value={ability}
                            onChange={(e) => updateAbility(charIndex, abilityIndex, e.target.value)}
                            placeholder="Ability name"
                            className="bg-slate-600 border-slate-500 text-white text-xs"
                          />
                          <Button
                            type="button"
                            onClick={() => removeAbility(charIndex, abilityIndex)}
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
            <p className="text-red-400 text-sm text-center">{serverError}</p>
          )}
          <Button onClick={onUpdateGame} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Update Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}