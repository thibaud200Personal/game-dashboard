import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/shared/components/ui/dropdown-menu';
import { ArrowLeft, Users, Clock, Star, Barbell, Calendar, Buildings, User, DotsThree, Crown, TrendUp, Gear, GameController } from '@phosphor-icons/react';
import GameExpansionsPage from '@/components/GameExpansionsPage';
import GameCharactersPage from '@/components/GameCharactersPage';
import { UseGameDetailProps } from '@/hooks/games/useGameDetail';
import { Game, GameExpansion, GameCharacter } from '@/types';

interface GameDetailViewProps extends UseGameDetailProps {
  activeTab: string;
  gameTypes: string[];
  handleNavigation: {
    dashboard: () => void;
    players: () => void;
    games: () => void;
    settings: () => void;
    back: () => void;
    expansions: () => void;
    characters: () => void;
  };
  tabHandlers: {
    setOverview: () => void;
    setExpansions: () => void;
    setCharacters: () => void;
  };
  setActiveTab: (tab: string) => void;
  hasExpansionHandlers: boolean;
  hasCharacterHandlers: boolean;
  darkMode: boolean;
}

export default function GameDetailView({
  game,
  activeTab,
  gameTypes,
  handleNavigation,
  tabHandlers,
  setActiveTab,
  hasExpansionHandlers,
  hasCharacterHandlers,
  navigationSource,
  onAddExpansion,
  onUpdateExpansion,
  onDeleteExpansion,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onNavigation,
  darkMode
}: GameDetailViewProps) {
  return (
    <div className={darkMode ? "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800" : "min-h-screen bg-gradient-to-br from-slate-100 to-slate-300"}>
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
    <div className={darkMode ? "max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4" : "max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 bg-white border-b border-slate-200"}>
          <div className="flex items-center gap-3 md:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNavigation.back}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-2"
                >
                  <ArrowLeft className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Retour aux jeux</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to Games List</p>
              </TooltipContent>
            </Tooltip>
            <div className="h-6 w-px bg-slate-600 hidden md:block"></div>
            <h1 className="text-lg md:text-xl font-semibold text-white flex-1 truncate">{game.name}</h1>
            <h1 className={darkMode ? "text-lg md:text-xl font-semibold text-white flex-1 truncate" : "text-lg md:text-xl font-semibold text-slate-900 flex-1 truncate"}>{game.name}</h1>
            
            {/* Mobile Context Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 p-2">
                        <DotsThree className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More Options</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className={darkMode ? "bg-slate-800 border-slate-700 text-white w-56" : "bg-white border-slate-200 text-slate-900 w-56"}>
                  <DropdownMenuItem 
                    onClick={tabHandlers.setOverview}
                    className="hover:bg-slate-700 focus:bg-slate-700"
                  >
                    <GameController className="w-4 h-4 mr-2" />
                    Vue générale
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={tabHandlers.setExpansions}
                    className="hover:bg-slate-700 focus:bg-slate-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Extensions ({game.expansions?.length || 0})
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={tabHandlers.setCharacters}
                    className="hover:bg-slate-700 focus:bg-slate-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Personnages ({game.characters?.length || 0})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-600" />
                  <DropdownMenuItem 
                    onClick={handleNavigation.expansions}
                    className="hover:bg-slate-700 focus:bg-slate-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Gérer les extensions
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleNavigation.characters}
                    className="hover:bg-slate-700 focus:bg-slate-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Gérer les personnages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Desktop Layout with Tabs */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={darkMode ? "grid w-full grid-cols-3 bg-slate-800/50 border-slate-700/50" : "grid w-full grid-cols-3 bg-white border-slate-200"}>
              <TabsTrigger 
                value="overview" 
                className={darkMode ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-white" : "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-900"}
              >
                Vue générale
              </TabsTrigger>
              <TabsTrigger 
                value="expansions" 
                className={darkMode ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-white" : "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-900"}
              >
                Extensions ({game.expansions?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="characters" 
                className={darkMode ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-white" : "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-900"}
              >
                Personnages ({game.characters?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <GameOverview game={game} gameTypes={gameTypes} onNavigation={onNavigation} darkMode={darkMode} />
            </TabsContent>

            <TabsContent value="expansions" className="mt-6">
              {hasExpansionHandlers && (
                <GameExpansionsPage
                  game={game}
                  onNavigation={onNavigation}
                  navigationSource={navigationSource}
                  onAddExpansion={onAddExpansion!}
                  onUpdateExpansion={onUpdateExpansion!}
                  onDeleteExpansion={onDeleteExpansion!}
                  embedded={true}
                  darkMode={darkMode}
                />
              )}
            </TabsContent>

            <TabsContent value="characters" className="mt-6">
              {hasCharacterHandlers && (
                <GameCharactersPage
                  game={game}
                  onNavigation={onNavigation}
                  navigationSource={navigationSource}
                  onAddCharacter={onAddCharacter!}
                  onUpdateCharacter={onUpdateCharacter!}
                  onDeleteCharacter={onDeleteCharacter!}
                  embedded={true}
                  darkMode={darkMode}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile Layout - Show current tab content */}
        <div className="md:hidden pb-32">
          {activeTab === 'overview' && <GameOverview game={game} gameTypes={gameTypes} onNavigation={onNavigation} darkMode={darkMode} />}
          {activeTab === 'expansions' && hasExpansionHandlers && (
            <GameExpansionsPage
              game={game}
              onNavigation={onNavigation}
              navigationSource={navigationSource}
              onAddExpansion={onAddExpansion!}
              onUpdateExpansion={onUpdateExpansion!}
              onDeleteExpansion={onDeleteExpansion!}
              embedded={true}
              darkMode={darkMode}
            />
          )}
          {activeTab === 'characters' && hasCharacterHandlers && (
            <GameCharactersPage
              game={game}
              onNavigation={onNavigation}
              navigationSource={navigationSource}
              onAddCharacter={onAddCharacter!}
              onUpdateCharacter={onUpdateCharacter!}
              onDeleteCharacter={onDeleteCharacter!}
              embedded={true}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-md border-t border-white/10 md:hidden">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={handleNavigation.dashboard}
            className="flex flex-col items-center p-3 transition-colors text-white/60 hover:text-white"
          >
            <TrendUp className="w-6 h-6 mb-1" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button
            onClick={handleNavigation.players}
            className="flex flex-col items-center p-3 transition-colors text-white/60 hover:text-white"
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs">Players</span>
          </button>
          <button
            onClick={handleNavigation.games}
            className="flex flex-col items-center p-3 transition-colors text-primary"
          >
            <GameController className="w-6 h-6 mb-1" />
            <span className="text-xs">Games</span>
          </button>
          <button
            onClick={handleNavigation.settings}
            className="flex flex-col items-center p-3 transition-colors text-white/60 hover:text-white"
          >
            <Gear className="w-6 h-6 mb-1" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface GameOverviewProps {
  game: Game;
  gameTypes: string[];
  onNavigation: (view: string, gameId?: number, source?: string) => void;
  darkMode: boolean;
}

function GameOverview({ game, gameTypes, onNavigation, darkMode }: GameOverviewProps) {
  return (
    <div className={darkMode ? "" : "bg-white text-slate-900"}>
      {/* Game Overview Card */}
      <Card className="bg-slate-800/50 border-slate-700/50 mb-6 md:mb-8">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Game Image */}
            <div className="flex-shrink-0 self-center md:self-start">
              {game.image ? (
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-slate-600"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center justify-center">
                  <GameController className="w-8 h-8 md:w-12 md:h-12 text-slate-400" />
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{game.name}</h2>
                  {game.description && (
                    <p className="text-slate-300 mb-4 text-sm md:text-base max-w-2xl">{game.description}</p>
                  )}
                </div>
                {game.bgg_rating && (
                  <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full self-start">
                    <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                    <span className="font-medium text-sm">{game.bgg_rating}/10</span>
                  </div>
                )}
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">{game.min_players}-{game.max_players} joueurs</span>
                </div>
                {game.duration && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm">{game.duration}</span>
                  </div>
                )}
                {game.weight && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Barbell className="w-4 h-4 text-primary" />
                    <span className="text-sm">Complexité {game.weight}/5</span>
                  </div>
                )}
                {game.year_published && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm">{game.year_published}</span>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
                {game.publisher && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Buildings className="w-4 h-4 text-primary" />
                    <span className="text-sm">{game.publisher}</span>
                  </div>
                )}
                {game.designer && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm">{game.designer}</span>
                  </div>
                )}
              </div>

              {/* Game Types */}
              {gameTypes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {gameTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="bg-primary/20 text-primary text-xs">
                      {type}
                    </Badge>
                  ))}
                  {game.category && (
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {game.category}
                    </Badge>
                  )}
                  {game.difficulty && (
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {game.difficulty}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Overview of Extensions and Characters - Desktop Only */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Extensions Preview */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Extensions ({game.expansions?.length || 0})
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigation('game-expansions', game.game_id, 'game-detail')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 text-xs"
              >
                Gérer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {game.expansions && game.expansions.length > 0 ? (
              <div className="space-y-3">
                {game.expansions.slice(0, 3).map((expansion: GameExpansion) => (
                  <div key={expansion.expansion_id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{expansion.name}</h4>
                      {expansion.year_published && (
                        <p className="text-slate-400 text-sm">{expansion.year_published}</p>
                      )}
                    </div>
                  </div>
                ))}
                {game.expansions.length > 3 && (
                  <p className="text-slate-400 text-sm text-center">
                    et {game.expansions.length - 3} autre(s)...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Aucune extension ajoutée.</p>
            )}
          </CardContent>
        </Card>

        {/* Characters Preview */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personnages ({game.characters?.length || 0})
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigation('game-characters', game.game_id, 'game-detail')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 text-xs"
              >
                Gérer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {game.characters && game.characters.length > 0 ? (
              <div className="space-y-3">
                {game.characters.slice(0, 3).map((character: GameCharacter) => (
                  <div key={character.character_id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    {character.avatar ? (
                      <img 
                        src={character.avatar} 
                        alt={character.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-white font-medium">{character.name}</h4>
                      {character.description && (
                        <p className="text-slate-400 text-sm">{character.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {game.characters.length > 3 && (
                  <p className="text-slate-400 text-sm text-center">
                    et {game.characters.length - 3} autre(s)...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Aucun personnage ajouté.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}