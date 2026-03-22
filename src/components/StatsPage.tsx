import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, TrendUp } from '@phosphor-icons/react';
import PlayerStatsPage from './PlayerStatsPage';
import GameStatsPage from './GameStatsPage';
import { Player, Game } from '@/types';

interface StatsPageProps {
  players: Player[];
  games: Game[];
  onNavigation: (view: string, id?: number, source?: string) => void;
  _currentView: string;
  selectedPlayerId?: number;
  selectedGameId?: number;
  navigationContext?: {
    id?: number;
    source?: string;
    initialTab?: 'players' | 'games';
  };
  darkMode: boolean;
}

export default function StatsPage({
  players,
  games,
  onNavigation,
  _currentView,
  selectedPlayerId,
  selectedGameId,
  navigationContext,
  darkMode
}: StatsPageProps) {
  // Determine initial tab based on navigation context
  let initialTab: 'players' | 'games' = 'players';
  if (navigationContext?.initialTab) {
    initialTab = navigationContext.initialTab;
  } else if (selectedGameId || navigationContext?.source === 'games') {
    initialTab = 'games';
  } else if (navigationContext?.source === 'players') {
    initialTab = 'players';
  }

  const [activeTab, setActiveTab] = useState<'players' | 'games'>(initialTab);

  // Update active tab when navigation context changes
  useEffect(() => {
    let newTab: 'players' | 'games' = 'players';
    if (navigationContext?.initialTab) {
      newTab = navigationContext.initialTab;
    } else if (selectedGameId || navigationContext?.source === 'games') {
      newTab = 'games';
    } else if (navigationContext?.source === 'players') {
      newTab = 'players';
    }
    setActiveTab(newTab);
  }, [navigationContext, selectedGameId, selectedPlayerId]);

  const handleBackNavigation = () => {
    // Go back to the appropriate page based on context
    if (navigationContext?.source === 'players') {
      onNavigation('players');
    } else if (navigationContext?.source === 'games') {
      onNavigation('games');
    } else if (selectedPlayerId) {
      onNavigation('players');
    } else if (selectedGameId) {
      onNavigation('games');
    } else {
      onNavigation('dashboard');
    }
  };

  // Classes dynamiques cohérentes avec Dashboard
  const mainClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white"
    : "min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900";
  const tabActiveClass = darkMode
    ? "bg-teal-600 text-white"
    : "bg-teal-300 text-slate-900";
  const tabInactiveClass = darkMode
    ? "bg-white/10 text-white/80 hover:bg-white/20"
    : "bg-slate-100 text-slate-500 hover:bg-slate-200";

  return (
    <div className={mainClass}>
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackNavigation}
            className={darkMode ? "p-2 hover:bg-white/10 rounded-lg transition-colors" : "p-2 hover:bg-slate-200 rounded-lg transition-colors"}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={darkMode ? "text-2xl font-bold text-white" : "text-2xl font-bold text-slate-900"}>Statistics</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'players'
                ? tabActiveClass
                : tabInactiveClass
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Player Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'games'
                ? tabActiveClass
                : tabInactiveClass
            }`}
          >
            <TrendUp className="w-5 h-5" />
            <span>Game Stats</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'players' ? (
          <div className="px-4 space-y-6 pb-32">
              <PlayerStatsPage
                players={players}
                games={games}
                onNavigation={onNavigation}
                currentView="player-stats"
                selectedPlayerId={navigationContext?.source === 'players' ? navigationContext?.id : selectedPlayerId}
                darkMode={darkMode}
              />
          </div>
        ) : (
          <div className="px-4 space-y-6 pb-32">
              <GameStatsPage
                games={games}
                players={players}
                onNavigation={onNavigation}
                currentView="game-stats"
                selectedCircleId={navigationContext?.source === 'games' ? navigationContext?.id : selectedGameId}
                darkMode={darkMode}
              />
          </div>
        )}
      </div>
    </div>
  );
}