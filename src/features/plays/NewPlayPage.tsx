import React from 'react';
import { useNewGamePage } from './useNewPlayPage';
import NewGameView from './NewPlayView';
import { useDarkMode } from '@/shared/contexts/DarkModeContext';

export default function NewGamePage() {
  const hookData = useNewGamePage();
  const { darkMode } = useDarkMode();

  return (
    <NewGameView
      {...hookData}
      currentView="new-game"
      darkMode={darkMode}
    />
  );
}
