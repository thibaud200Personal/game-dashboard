import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Users, TrendUp } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { playerApi } from '@/services/api/playerApi';
import { gameApi } from '@/services/api/gameApi';
import { queryKeys } from '@/services/api/queryKeys';
import { useNavigationAdapter } from '@/hooks/useNavigationAdapter';
import PlayerStatsPage from './PlayerStatsPage';
import GameStatsPage from './GameStatsPage';

export default function StatsPage() {
  const [searchParams] = useSearchParams();
  const onNavigation = useNavigationAdapter();

  const idParam  = searchParams.get('id');
  const srcParam = searchParams.get('src') as 'players' | 'games' | null;

  const selectedId = idParam ? parseInt(idParam) : undefined;
  const selectedPlayerId = srcParam === 'players' ? selectedId : undefined;
  const selectedGameId   = srcParam === 'games'   ? selectedId : undefined;

  const { data: players = [] } = useQuery({
    queryKey: queryKeys.players.all,
    queryFn: playerApi.getAll,
  });

  const { data: games = [] } = useQuery({
    queryKey: queryKeys.games.all,
    queryFn: gameApi.getAll,
  });

  const resolveTab = (): 'players' | 'games' => {
    if (srcParam === 'games' || selectedGameId != null) return 'games';
    return 'players';
  };

  const [activeTab, setActiveTab] = useState<'players' | 'games'>(resolveTab);

  useEffect(() => {
    setActiveTab(resolveTab());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcParam, selectedGameId, selectedPlayerId]);

  const handleBackNavigation = () => {
    if (srcParam === 'players') onNavigation('players');
    else if (srcParam === 'games') onNavigation('games');
    else if (selectedPlayerId != null) onNavigation('players');
    else if (selectedGameId != null) onNavigation('games');
    else onNavigation('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackNavigation}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Statistics</h1>
          <div className="w-10" />
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'players' ? 'bg-teal-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Player Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'games' ? 'bg-teal-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <TrendUp className="w-5 h-5" />
            <span>Game Stats</span>
          </button>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'players' ? (
          <div className="px-4 space-y-6 pb-32">
            <PlayerStatsPage
              players={players}
              games={games}
              onNavigation={onNavigation}
              currentView="player-stats"
              selectedPlayerId={selectedPlayerId}
              darkMode={true}
            />
          </div>
        ) : (
          <div className="px-4 space-y-6 pb-32">
            <GameStatsPage
              games={games}
              players={players}
              onNavigation={onNavigation}
              currentView="game-stats"
              selectedCircleId={selectedGameId}
              darkMode={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
