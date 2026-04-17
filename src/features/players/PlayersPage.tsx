import React from 'react';
import { PlayersPageView } from './PlayersPageView';
import { usePlayersPage } from './usePlayersPage';
import { useDarkMode } from '@/shared/contexts/DarkModeContext';

export default function PlayersPage() {
  const logic = usePlayersPage();
  const { darkMode } = useDarkMode();
  return <PlayersPageView {...logic} darkMode={darkMode} />;
}
