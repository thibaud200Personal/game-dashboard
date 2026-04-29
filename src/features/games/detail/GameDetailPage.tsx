import React from 'react';
import { useGameDetail, UseGameDetailProps } from './useGameDetail';
import GameDetailView from './GameDetailView';

interface GameDetailPageProps extends UseGameDetailProps {
  currentView: string;
}

export default function GameDetailPage(props: GameDetailPageProps) {
  const hookData = useGameDetail(props);
  return <GameDetailView {...hookData} />;
}
