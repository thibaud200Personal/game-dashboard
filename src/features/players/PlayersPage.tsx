import React from 'react';
import { PlayersPageView } from './PlayersPageView';
import { usePlayersPage } from './usePlayersPage';

export default function PlayersPage() {
  const logic = usePlayersPage();
  return <PlayersPageView {...logic} darkMode={true} />;
}
