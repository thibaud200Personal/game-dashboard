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
} from '@/shared/components/ui/dropdown-menu';
import { ArrowLeft, Users, Clock, Star, Barbell, Calendar, Buildings, User, DotsThree, Crown, GameController, CaretRight } from '@phosphor-icons/react';
import GameExpansionsPage from '../expansions/GameExpansionsPage';
import GameCharactersPage from '../characters/GameCharactersPage';
import { UseGameDetailProps } from './useGameDetail';
import { Game, GameExpansion, GameCharacter } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';

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
}

export default function GameDetailView({
  game,
  activeTab,
  gameTypes,
  handleNavigation,
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
}: GameDetailViewProps) {
  const { t } = useLabels();

  const expansionPageProps = {
    game, onNavigation, navigationSource,
    onAddExpansion: onAddExpansion!,
    onUpdateExpansion: onUpdateExpansion!,
    onDeleteExpansion: onDeleteExpansion!,
    embedded: true as const,
  };

  const characterPageProps = {
    game, onNavigation, navigationSource,
    onAddCharacter: onAddCharacter!,
    onUpdateCharacter: onUpdateCharacter!,
    onDeleteCharacter: onDeleteCharacter!,
    embedded: true as const,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNavigation.back}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted p-2"
                >
                  <ArrowLeft className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">{t('game.detail.back')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('expansion.view.back_to_games')}</p>
              </TooltipContent>
            </Tooltip>
            <div className="h-6 w-px bg-border hidden md:block"></div>
            <h1 className="text-lg md:text-xl font-semibold text-foreground flex-1 truncate">{game.name}</h1>

            {/* Mobile Context Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted p-2">
                        <DotsThree className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('game.detail.more_options')}</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleNavigation.expansions}>
                    <Crown className="w-4 h-4 mr-2" />
                    {t('game.detail.manage_expansions')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleNavigation.characters}>
                    <User className="w-4 h-4 mr-2" />
                    {t('game.detail.manage_characters')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              {t('game.detail.tab.overview')}
            </TabsTrigger>
            <TabsTrigger value="expansions">
              {t('expansion.view.title')} ({game.expansions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="characters">
              {t('character.view.title')} ({game.characters?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 pb-32 md:pb-0">
            <GameOverview game={game} gameTypes={gameTypes} onNavigation={onNavigation} />
          </TabsContent>

          <TabsContent value="expansions" className="mt-6 pb-32 md:pb-0">
            {hasExpansionHandlers && <GameExpansionsPage {...expansionPageProps} />}
          </TabsContent>

          <TabsContent value="characters" className="mt-6 pb-32 md:pb-0">
            {hasCharacterHandlers && <GameCharactersPage {...characterPageProps} />}
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}

interface GameOverviewProps {
  game: Game;
  gameTypes: string[];
  onNavigation: (view: string, gameId?: number, source?: string) => void;
}

function GameOverview({ game, gameTypes, onNavigation }: GameOverviewProps) {
  const { t } = useLabels();

  return (
    <div>
      {/* Game Overview Card */}
      <Card className="bg-card border-border mb-6 md:mb-8">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Game Image */}
            <div className="flex-shrink-0 self-center md:self-start">
              {game.image ? (
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-border"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-lg border border-border flex items-center justify-center">
                  <GameController className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">{game.name}</h2>
                  {game.description && (
                    <p className="text-muted-foreground mb-4 text-sm md:text-base max-w-2xl">{game.description}</p>
                  )}
                </div>
                {game.bgg_rating && (
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-3 py-1 rounded-full self-start">
                    <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                    <span className="font-medium text-sm">{game.bgg_rating}/10</span>
                  </div>
                )}
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">{game.min_players}-{game.max_players} {t('games.card.players')}</span>
                </div>
                {game.duration && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm">{game.duration}</span>
                  </div>
                )}
                {game.weight && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Barbell className="w-4 h-4 text-primary" />
                    <span className="text-sm">{t('game.detail.weight_complexity')} {game.weight}/5</span>
                  </div>
                )}
                {game.year_published && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm">{game.year_published}</span>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
                {game.publisher && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Buildings className="w-4 h-4 text-primary" />
                    <span className="text-sm">{game.publisher}</span>
                  </div>
                )}
                {game.designer && (
                  <div className="flex items-center gap-2 text-muted-foreground">
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
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                      {game.category}
                    </Badge>
                  )}
                  {game.difficulty && (
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
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
        <Card
          className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onNavigation('game-expansions', game.game_id, 'game-detail')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                {t('expansion.view.title')} ({game.expansions?.length || 0})
              </CardTitle>
              <CaretRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {game.expansions && game.expansions.length > 0 ? (
              <div className="space-y-3">
                {game.expansions.slice(0, 3).map((expansion: GameExpansion) => (
                  <div key={expansion.expansion_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="text-foreground font-medium">{expansion.name}</h4>
                      {expansion.year_published && (
                        <p className="text-muted-foreground text-sm">{expansion.year_published}</p>
                      )}
                    </div>
                  </div>
                ))}
                {game.expansions.length > 3 && (
                  <p className="text-muted-foreground text-sm text-center">
                    {game.expansions.length - 3} {t('game.detail.more_items')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t('game.detail.no_expansions')}</p>
            )}
          </CardContent>
        </Card>

        {/* Characters Preview */}
        <Card
          className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onNavigation('game-characters', game.game_id, 'game-detail')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t('character.view.title')} ({game.characters?.length || 0})
              </CardTitle>
              <CaretRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {game.characters && game.characters.length > 0 ? (
              <div className="space-y-3">
                {game.characters.slice(0, 3).map((character: GameCharacter) => (
                  <div key={character.character_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {character.avatar ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-foreground font-medium">{character.name}</h4>
                      {character.description && (
                        <p className="text-muted-foreground text-sm">{character.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {game.characters.length > 3 && (
                  <p className="text-muted-foreground text-sm text-center">
                    {game.characters.length - 3} {t('game.detail.more_items')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t('game.detail.no_characters')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
