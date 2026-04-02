import React from 'react';
import { useNewGamePage } from '@/hooks/useNewGamePage';
import NewGameView from '@/views/NewGameView';

export default function NewGamePage() {
  const hookData = useNewGamePage();

  return (
    <NewGameView
      {...hookData}
      currentView="new-game"
      darkMode={true}
    />
  );
}
