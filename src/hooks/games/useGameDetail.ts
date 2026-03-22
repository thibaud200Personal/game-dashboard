import { useState } from 'react';
import { Game, GameExpansion, GameCharacter } from '@/types';

export interface UseGameDetailProps {
  game: Game;
  onNavigation: (view: string, gameId?: number, source?: string) => void;
  navigationSource?: string;
  onAddExpansion?: (gameId: number, expansionData: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => Promise<GameExpansion>;
  onUpdateExpansion?: (expansionId: number, expansionData: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => Promise<void>;
  onDeleteExpansion?: (expansionId: number) => Promise<void>;
  onAddCharacter?: (gameId: number, characterData: Omit<GameCharacter, 'character_id' | 'game_id'>) => Promise<GameCharacter>;
  onUpdateCharacter?: (characterId: number, characterData: Omit<GameCharacter, 'character_id' | 'game_id'>) => Promise<void>;
  onDeleteCharacter?: (characterId: number) => Promise<void>;
}

export function useGameDetail(props: UseGameDetailProps) {
  const {
    game,
    onNavigation,
    navigationSource = 'games',
    onAddExpansion,
    onUpdateExpansion,
    onDeleteExpansion,
    onAddCharacter,
    onUpdateCharacter,
    onDeleteCharacter
  } = props;

  const [activeTab, setActiveTab] = useState('overview');

  const gameTypes: string[] = [];
  if (game.supports_competitive) gameTypes.push('Compétitif');
  if (game.supports_cooperative) gameTypes.push('Coopératif');
  if (game.supports_campaign) gameTypes.push('Campagne');
  if (game.supports_hybrid) gameTypes.push('Hybride');

  const handleNavigation = {
    dashboard: () => onNavigation('dashboard'),
    players: () => onNavigation('players'),
    games: () => onNavigation('games'),
    settings: () => onNavigation('settings'),
    back: () => onNavigation('games'),
    expansions: () => onNavigation('game-expansions', game.game_id, 'game-detail'),
    characters: () => onNavigation('game-characters', game.game_id, 'game-detail')
  };

  const tabHandlers = {
    setOverview: () => setActiveTab('overview'),
    setExpansions: () => setActiveTab('expansions'),
    setCharacters: () => setActiveTab('characters')
  };

  const hasExpansionHandlers = !!(onAddExpansion && onUpdateExpansion && onDeleteExpansion);
  const hasCharacterHandlers = !!(onAddCharacter && onUpdateCharacter && onDeleteCharacter);

  return {
    // State
    activeTab,
    gameTypes,

    // Computed
    hasExpansionHandlers,
    hasCharacterHandlers,

    // Handlers
    handleNavigation,
    tabHandlers,
    setActiveTab,

    // Props pass-through
    game,
    navigationSource,
    onAddExpansion,
    onUpdateExpansion,
    onDeleteExpansion,
    onAddCharacter,
    onUpdateCharacter,
    onDeleteCharacter,
    onNavigation
  };
}