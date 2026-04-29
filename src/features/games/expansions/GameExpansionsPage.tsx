import React from 'react';
import GameExpansionsView from './GameExpansionsView';
import { Game, GameExpansion } from '@/types';

interface GameExpansionsPageProps {
  game: Game
  onNavigation: (view: string, gameId?: number, source?: string) => void
  navigationSource?: string
  onAddExpansion: (gameId: number, expansionData: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => Promise<GameExpansion>
  onUpdateExpansion: (expansionId: number, expansionData: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => Promise<void>
  onDeleteExpansion: (expansionId: number) => Promise<void>
  embedded?: boolean;
}

export default function GameExpansionsPage(props: GameExpansionsPageProps) {
  return <GameExpansionsView {...props} />;
}
