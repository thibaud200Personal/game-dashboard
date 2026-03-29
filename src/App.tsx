import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import ApiService from '@/services/ApiService';
import BottomNavigation from '@/components/BottomNavigation';
import LoginPage from '@/components/LoginPage';

const Dashboard = lazy(() => import('@/components/Dashboard'));
const PlayersPage = lazy(() => import('@/components/PlayersPage'));
const GamesPage = lazy(() => import('@/components/GamesPage'));
const SettingsPage = lazy(() => import('@/components/SettingsPage'));
const StatsPage = lazy(() => import('@/components/StatsPage'));
const NewGamePage = lazy(() => import('@/components/NewGamePage'));
const GameDetailPage = lazy(() => import('@/components/GameDetailPage'));
const GameExpansionsPage = lazy(() => import('@/components/GameExpansionsPage'));
const GameCharactersPage = lazy(() => import('@/components/GameCharactersPage'));
import { TooltipProvider } from '@/components/ui/tooltip';
import { Player, Game, CreateSessionPayload } from '@/types';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(ApiService.isAuthenticated());

  // Mode sombre par défaut
  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const [stats, setStats] = useState<{ loading: boolean; error: string | null }>({
    loading: true,
    error: null
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [navigationContext, setNavigationContext] = useState<{ id?: number; source?: string; initialTab?: 'players' | 'games' } | undefined>(undefined);

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
        const message = err instanceof Error ? err.message : String(err);
        if (message === 'UNAUTHORIZED') {
          setIsAuthenticated(false);
          setStats({ loading: false, error: null });
          return;
        }
        setStats(s => ({ ...s, loading: false, error: message }));
      }
    };
    loadData();
  }, []);

  const handleLogout = useCallback(() => {
    ApiService.logout();
    setIsAuthenticated(false);
  }, []);

  const handleNavigation = useCallback((view: string, id?: number, source?: string) => {
    setCurrentView(view);
    if (view === 'stats') {
      let initialTab: 'players' | 'games' = 'players';
      if (source === 'games' || currentView === 'games') {
        initialTab = 'games';
      }
      setNavigationContext({ id, source, initialTab });
    } else {
      setNavigationContext({ id, source });
    }
  }, [currentView]);

  // Handler functions for data management
  const handleAddPlayer = useCallback(async (playerData: { player_name: string; avatar?: string; favorite_game?: string }) => {
    const created = await ApiService.createPlayer(playerData);
    setPlayers(prev => [...prev, created]);
  }, []);

  const handleUpdatePlayer = useCallback(async (playerId: number, playerData: Partial<Player>) => {
    const updated = await ApiService.updatePlayer(playerId, playerData);
    setPlayers(prev => prev.map(p => p.player_id === playerId ? updated : p));
  }, []);

  const handleDeletePlayer = useCallback(async (playerId: number) => {
    await ApiService.deletePlayer(playerId);
    setPlayers(prev => prev.filter(p => p.player_id !== playerId));
  }, []);

  const handleAddGame = useCallback(async (gameData: Omit<Game, 'game_id' | 'created_at' | 'expansions' | 'characters' | 'players'>) => {
    try {
      const created = await ApiService.createGame(gameData);
      setGames(prev => [...prev, { ...created, expansions: [], characters: [], players: `${created.min_players}-${created.max_players}` }]);
      toast.success('Jeu ajouté avec succès');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'duplicate_game') throw err;
      toast.error('Erreur lors de l\'ajout du jeu');
    }
  }, []);

  const handleUpdateGame = useCallback(async (gameId: number, gameData: Partial<Game>) => {
    try {
      const updated = await ApiService.updateGame(gameId, gameData);
      setGames(prev => prev.map(g => g.game_id === gameId ? { ...g, ...updated } : g));
      toast.success('Jeu modifié avec succès');
    } catch {
      toast.error('Erreur lors de la modification du jeu');
    }
  }, []);

  const handleDeleteGame = useCallback(async (gameId: number) => {
    await ApiService.deleteGame(gameId);
    setGames(prev => prev.filter(g => g.game_id !== gameId));
  }, []);

  const handleCreateSession = useCallback(async (sessionData: CreateSessionPayload) => {
    await ApiService.createSession(sessionData);
  }, []);

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
        return <SettingsPage onNavigation={handleNavigation} currentView={currentView} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} />;
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
              onAddExpansion={(gameId, data) => ApiService.createExpansion({ ...data, game_id: gameId })}
              onUpdateExpansion={(id, data) => ApiService.updateExpansion(id, data).then(() => undefined)}
              onDeleteExpansion={(id) => ApiService.deleteExpansion(id)}
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
              onAddCharacter={(gameId, data) => ApiService.createCharacter({ ...data, game_id: gameId })}
              onUpdateCharacter={(id, data) => ApiService.updateCharacter(id, data).then(() => undefined)}
              onDeleteCharacter={(id) => ApiService.deleteCharacter(id)}
            />
          ) : null;
        }
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg opacity-60">Chargement...</div></div>}>
          {renderCurrentView()}
        </Suspense>
        <BottomNavigation currentView={currentView} onNavigation={handleNavigation} />
      </div>
    </TooltipProvider>
  );
}