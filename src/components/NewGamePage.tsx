import React from 'react';
import { toast } from 'sonner';
import { useNewGamePage } from '@/hooks/useNewGamePage';
import NewGameView from '@/views/NewGameView';
import { Game, Player, CreateSessionPayload } from '@/types';

interface NewGamePageProps {
  games: Game[]
  players: Player[]
  onNavigation: (view: string) => void
  currentView: string
  onCreateSession: (sessionData: CreateSessionPayload) => Promise<void>
  darkMode?: boolean
}

export default function NewGamePage({
  games,
  players,
  onNavigation,
  currentView,
  onCreateSession,
  darkMode = true
}: NewGamePageProps) {
  const hookData = useNewGamePage(games, players, onCreateSession);

  const handleSubmitWithToast = async (): Promise<{ success: boolean }> => {
    try {
      const result = await hookData.handleSubmit();
      if (result && result.success) {
        toast.success('Game session created successfully!');
        hookData.resetForm();
        return result;
      }
      throw new Error('Failed to create session');
    } catch (error) {
      toast.error('Failed to create game session');
      throw error;
    }
  };

  return (
    <NewGameView
      {...hookData}
      handleSubmit={handleSubmitWithToast}
      games={games}
      players={players}
      onNavigation={onNavigation}
      currentView={currentView}
      darkMode={darkMode}
    />
  );
}