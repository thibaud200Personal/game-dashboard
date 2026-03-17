import React, { useState, useEffect } from 'react';
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

// Mock data (extended with all required fields)
const mockData = {
  playersCount: 426,
  gamesCount: 324,
  players: [
    {
      player_id: 1,
      player_name: 'Jane',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      stats: '2,100 pts',
      games_played: 15,
      wins: 8,
      total_score: 2100,
      average_score: 140,
      created_at: new Date(),
      favorite_game: 'Strategy Pro'
    },
    {
      player_id: 2,
      player_name: 'Nexus',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      stats: '1,850 pts',
      games_played: 12,
      wins: 5,
      total_score: 1850,
      average_score: 154,
      created_at: new Date(),
      favorite_game: 'Battle Arena'
    },
    {
      player_id: 3,
      player_name: 'Maya',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      stats: '1,620 pts',
      games_played: 10,
      wins: 4,
      total_score: 1620,
      average_score: 162,
      created_at: new Date(),
      favorite_game: 'Mind Games'
    }
  ],
  games: [
    {
      game_id: 1,
      name: 'Strategy Pro',
      description: 'A deep strategy game',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=150&h=150&fit=crop',
      min_players: 2,
      max_players: 4,
      duration: '90-120 minutes',
      difficulty: 'Medium',
      category: 'Strategy',
      year_published: 2020,
      publisher: 'Game Co',
      designer: 'John Doe',
      bgg_rating: 7.5,
      weight: 3.2,
      age_min: 12,
      supports_cooperative: false,
      supports_competitive: true,
      supports_campaign: false,
      supports_hybrid: false,
      has_expansion: true,
      has_characters: false,
      created_at: new Date(),
      expansions: [],
      characters: [],
      players: '2-4'
    },
    {
      game_id: 2,
      name: 'Battle Arena',
      description: 'Epic combat game',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&h=150&fit=crop',
      min_players: 3,
      max_players: 6,
      duration: '60-90 minutes',
      difficulty: 'Easy',
      category: 'Combat',
      year_published: 2019,
      publisher: 'Arena Games',
      designer: 'Jane Smith',
      bgg_rating: 6.8,
      weight: 2.1,
      age_min: 10,
      supports_cooperative: false,
      supports_competitive: true,
      supports_campaign: false,
      supports_hybrid: false,
      has_expansion: false,
      has_characters: true,
      created_at: new Date(),
      expansions: [],
      characters: [],
      players: '3-6'
    },
    {
      game_id: 3,
      name: 'Mind Games',
      description: 'Brain teasing puzzles',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=150&h=150&fit=crop',
      min_players: 2,
      max_players: 8,
      duration: '30-45 minutes',
      difficulty: 'Hard',
      category: 'Puzzle',
      year_published: 2021,
      publisher: 'Mind Co',
      designer: 'Alice Johnson',
      bgg_rating: 8.2,
      weight: 4.0,
      age_min: 14,
      supports_cooperative: true,
      supports_competitive: true,
      supports_campaign: false,
      supports_hybrid: true,
      has_expansion: false,
      has_characters: false,
      created_at: new Date(),
      expansions: [],
      characters: [],
      players: '2-8'
    },
    {
      game_id: 4,
      name: 'Pandemic Legacy',
      description: 'Save the world together in this cooperative game',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop',
      min_players: 2,
      max_players: 4,
      duration: '60-90 minutes',
      difficulty: 'Medium',
      category: 'Cooperative',
      year_published: 2015,
      publisher: 'Z-Man Games',
      designer: 'Matt Leacock',
      bgg_rating: 8.6,
      weight: 2.8,
      age_min: 13,
      supports_cooperative: true,
      supports_competitive: false,
      supports_campaign: true,
      supports_hybrid: false,
      has_expansion: true,
      has_characters: true,
      created_at: new Date(),
      expansions: [],
      characters: [],
      players: '2-4'
    }
  ]
};

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

  const [stats, setStats] = useState({
    playersCount: 0,
    gamesCount: 0,
    loading: true,
    error: null
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [navigationContext, setNavigationContext] = useState<any>(null);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        playersCount: mockData.playersCount,
        gamesCount: mockData.gamesCount,
        loading: false,
        error: null
      });
      setPlayers(mockData.players);
      setGames(mockData.games);
    }, 1000);
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
  const handleAddPlayer = (playerData: Omit<Player, 'player_id' | 'stats' | 'games_played' | 'wins' | 'total_score' | 'average_score' | 'created_at'>) => {
    const newPlayer: Player = {
      ...playerData,
      player_id: Math.max(...(players?.map(p => p.player_id) || [0]), 0) + 1,
      stats: '0 pts',
      games_played: 0,
      wins: 0,
      total_score: 0,
      average_score: 0,
      created_at: new Date()
    };
    setPlayers([...(players || []), newPlayer]);
  };

  const handleUpdatePlayer = (playerId: number, playerData: Partial<Player>) => {
    setPlayers((players || []).map(p => p.player_id === playerId ? { ...p, ...playerData } : p));
  };

  const handleDeletePlayer = (playerId: number) => {
    setPlayers((players || []).filter(p => p.player_id !== playerId));
  };

  const handleAddGame = (gameData: Omit<Game, 'game_id' | 'created_at' | 'expansions' | 'characters' | 'players'>) => {
    const newGame: Game = {
      ...gameData,
      game_id: Math.max(...(games?.map(g => g.game_id) || [0]), 0) + 1,
      created_at: new Date(),
      expansions: [],
      characters: [],
      players: `${gameData.min_players}-${gameData.max_players}`
    };
    setGames([...(games || []), newGame]);
  };

  const handleUpdateGame = (gameId: number, gameData: Partial<Game>) => {
    setGames((games || []).map(g => g.game_id === gameId ? { ...g, ...gameData } : g));
  };

  const handleDeleteGame = (gameId: number) => {
    setGames((games || []).filter(g => g.game_id !== gameId));
  };

  const handleCreateSession = async (_sessionData: any) => {
    // Implementation for creating game sessions
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
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
              onAddExpansion={async () => ({ expansion_id: 1, name: 'Test', year_published: 2023 })}
              onUpdateExpansion={async () => {}}
              onDeleteExpansion={async () => {}}
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
              onAddCharacter={async () => ({ character_id: 1, character_key: 'test', name: 'Test', description: 'Test', abilities: [] })}
              onUpdateCharacter={async () => {}}
              onDeleteCharacter={async () => {}}
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