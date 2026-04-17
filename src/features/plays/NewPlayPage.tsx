import React from 'react';
import { useNewGamePage } from './useNewPlayPage';
import NewGameView from './NewPlayView';

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
