import React, { useState, useEffect } from 'react';
import ApiService from '@/services/ApiService';
import Dashboard from '@/components/Dashboard';
import PlayersPage from '@/components/PlayersPage';
import GamesPage from '@/components/GamesPage';
import SettingsPage from '@/components/SettingsPage';
import StatsPage from '@/components/StatsPage';
import NewGamePage from '@/components/NewGamePage';
import GameDetailPage from '@/components/GameDetailPage';
import GameExpansionsPage from '@/components/GameExpansionsPage';
import GameCharactersPage from '@/components/GameCharactersPage';
import BottomNavigation from '@/components/BottomNavigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Player, Game } from '@/types';


export default function App() {
  // Mode sombre par défaut
  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const [stats, setStats] = useState<{ loading: boolean; error: any }>({
    loading: true,
    error: null
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [navigationContext, setNavigationContext] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playersData, gamesData] = await Promise.all([
          ApiService.getAllPlayers(),
          ApiService.getAllGames()
        ]);
        setPlayers(playersData);
        setGames(gamesData);
        setStats({ loading: false, error: null });
      } catch (err) {
        setStats(s => ({ ...s, loading: false, error: err as any }));
      }
    };
    loadData();
  }, []);

  const handleNavigation = (view: string, id?: number, source?: string) => {
    setCurrentView(view);
    
    // Enhanced context setting for stats
    if (view === 'stats') {
      // Determine which tab to show based on source or current context
      let initialTab: 'players' | 'games' = 'players';
      if (source === 'games' || currentView === 'games') {
        initialTab = 'games';
      } else if (source === 'players' || currentView === 'players') {
        initialTab = 'players';
      }
      setNavigationContext({ id, source, initialTab });
    } else {
      setNavigationContext({ id, source });
    }
  };

  // Handler functions for data management
  const handleAddPlayer = async (playerData: Omit<Player, 'player_id' | 'stats' | 'games_played' | 'wins' | 'total_score' | 'average_score' | 'created_at'>) => {
    const created = await ApiService.createPlayer(playerData);
    setPlayers(prev => [...prev, created]);
  };

  const handleUpdatePlayer = async (playerId: number, playerData: Partial<Player>) => {
    const updated = await ApiService.updatePlayer(playerId, playerData);
    setPlayers(prev => prev.map(p => p.player_id === playerId ? updated : p));
  };

  const handleDeletePlayer = async (playerId: number) => {
    await ApiService.deletePlayer(playerId);
    setPlayers(prev => prev.filter(p => p.player_id !== playerId));
  };

  const handleAddGame = async (gameData: Omit<Game, 'game_id' | 'created_at' | 'expansions' | 'characters' | 'players'>) => {
    const created = await ApiService.createGame(gameData);
    setGames(prev => [...prev, { ...created, expansions: [], characters: [], players: `${created.min_players}-${created.max_players}` }]);
  };

  const handleUpdateGame = async (gameId: number, gameData: Partial<Game>) => {
    const updated = await ApiService.updateGame(gameId, gameData);
    setGames(prev => prev.map(g => g.game_id === gameId ? { ...g, ...updated } : g));
  };

  const handleDeleteGame = async (gameId: number) => {
    await ApiService.deleteGame(gameId);
    setGames(prev => prev.filter(g => g.game_id !== gameId));
  };

  const handleCreateSession = async (sessionData: any) => {
    await ApiService.createSession(sessionData);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            stats={{ ...stats, playersCount: players.length, gamesCount: games.length }}
            recentPlayers={players?.slice(0, 3) || []}
            recentGames={games?.slice(0, 3) || []}
            currentView={currentView}
            onNavigation={handleNavigation}
            darkMode={darkMode}
          />
        );
      case 'players':
        return (
          <PlayersPage
            players={players}
            onNavigation={handleNavigation}
            onAddPlayer={handleAddPlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onDeletePlayer={handleDeletePlayer}
            currentView={currentView}
            darkMode={darkMode}
          />
        );
      case 'games':
        return (
          <GamesPage
            games={games}
            onNavigation={handleNavigation}
            onAddGame={handleAddGame}
            onUpdateGame={handleUpdateGame}
            onDeleteGame={handleDeleteGame}
            darkMode={darkMode}
          />
        );
      case 'settings':
        return <SettingsPage onNavigation={handleNavigation} currentView={currentView} darkMode={darkMode} setDarkMode={setDarkMode} />;
      case 'player-stats':
      case 'game-stats':
      case 'stats':
        return (
          <StatsPage 
            players={players} 
            games={games}
            _currentView={currentView}
            onNavigation={handleNavigation}
            selectedPlayerId={navigationContext?.id}
            selectedGameId={navigationContext?.id}
            navigationContext={navigationContext}
            darkMode={darkMode}
          />
        );
      case 'new-game':
        return (
          <NewGamePage
            games={games}
            players={players}
            currentView={currentView}
            onNavigation={handleNavigation}
            onCreateSession={handleCreateSession}
          />
        );
      case 'game-detail':
        {
          const game = games?.find(g => g.game_id === navigationContext?.id);
          return game ? (
            <GameDetailPage 
              game={game} 
              currentView={currentView}
              onNavigation={handleNavigation}
              darkMode={darkMode}
            />
          ) : null;
        }
      case 'game-expansions':
        {
          const expansionGame = games?.find(g => g.game_id === navigationContext?.id);
          return expansionGame ? (
            <GameExpansionsPage 
              game={expansionGame} 
              onNavigation={handleNavigation} 
              navigationSource={navigationContext?.source}
              onAddExpansion={(data: any) => ApiService.createExpansion(data)}
              onUpdateExpansion={(id: number, data: any) => ApiService.updateExpansion(id, data)}
              onDeleteExpansion={(id: number) => ApiService.deleteExpansion(id)}
            />
          ) : null;
        }
      case 'game-characters':
        {
          const characterGame = games?.find(g => g.game_id === navigationContext?.id);
          return characterGame ? (
            <GameCharactersPage 
              game={characterGame} 
              onNavigation={handleNavigation} 
              navigationSource={navigationContext?.source}
              onAddCharacter={(data: any) => ApiService.createCharacter(data)}
              onUpdateCharacter={(id: number, data: any) => ApiService.updateCharacter(id, data)}
              onDeleteCharacter={(id: number) => ApiService.deleteCharacter(id)}
            />
          ) : null;
        }
      default:
        return (
          <Dashboard
            stats={stats}
            recentPlayers={players?.slice(0, 3) || []}
            recentGames={games?.slice(0, 3) || []}
            currentView={currentView}
            onNavigation={handleNavigation}
            darkMode={darkMode}
          />
        );
    }
  };

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Chargement du dashboard...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={darkMode ? "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white" : "min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900"}>
        {renderCurrentView()}
        <BottomNavigation currentView={currentView} onNavigation={handleNavigation} />
      </div>
    </TooltipProvider>
  );
}