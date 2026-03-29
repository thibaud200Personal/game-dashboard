import React from 'react';
import {
  Star,
  Plus,
  ArrowLeft,
  MagnifyingGlass,
  Trash,
  Users,
  PencilSimple,
  Eye,
  Clock,
  Target,
  Calendar,
  Shield,
  Sword,
  Crown,
  CaretDown,
  CaretUp,
  ChartLineUp,
  DotsThree
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Game, BGGGame, GameExpansion, GameCharacter, GameFormData } from '@/types';
import { AddGameDialog, EditGameDialog, DeleteGameDialog } from '@/components/dialogs';
import { Card, CardContent } from '@/components/ui/card';
import { getDifficultyColor, formatExpansion, getCredit, getGameCardStyles } from '@/utils/gameHelpers';

interface GamesPageViewProps {
  games: Game[];
  currentView: string;
  totalGames: number;
  averageRating: number;
  formData: GameFormData & { expansions: GameExpansion[]; characters: GameCharacter[] };
  editingGame: Game | null;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isBGGSearchOpen: boolean;
  expandedGame: number | null;
  searchQuery: string;
  onNavigation: (view: string, gameId?: number, source?: string) => void;
  onSearchChange: (query: string) => void;
  onAddDialogToggle: () => void;
  onFormDataChange: (data: Partial<GameFormData & { expansions: GameExpansion[]; characters: GameCharacter[] }>) => void;
  onBGGGameSelect: (bggGame: BGGGame) => void;
  onAddGame: () => void;
  onResetForm: () => void;
  onEditGame: (game: Game) => void;
  onUpdateGame: () => void;
  onDeleteGame: (gameId: number) => void;
  setBGGSearchOpen: (open: boolean) => void;
  setExpandedGame: (gameId: number | null) => void;
  setEditDialogOpen: (open: boolean) => void;
  darkMode: boolean;
  addGameError?: string | null;
}


function getGameModesBadges(game: Game): React.ReactElement[] {
  const modes: React.ReactElement[] = [];
  if (game.supports_competitive) {
    modes.push(
      <Badge key="competitive" variant="outline" className="border-red-400/30 text-red-400 text-xs">
        <Sword className="w-3 h-3 mr-1" />Compétitif
      </Badge>
    );
  }
  if (game.supports_cooperative) {
    modes.push(
      <Badge key="cooperative" variant="outline" className="border-blue-400/30 text-blue-400 text-xs">
        <Shield className="w-3 h-3 mr-1" />Coopératif
      </Badge>
    );
  }
  if (game.supports_campaign) {
    modes.push(
      <Badge key="campaign" variant="outline" className="border-purple-400/30 text-purple-400 text-xs">
        <Crown className="w-3 h-3 mr-1" />Campagne
      </Badge>
    );
  }
  if (game.supports_hybrid) {
    modes.push(
      <Badge key="hybrid" variant="outline" className="border-orange-400/30 text-orange-400 text-xs">
        <Target className="w-3 h-3 mr-1" />Hybride
      </Badge>
    );
  }
  return modes;
}


function getWeightStars(weight: number): React.ReactElement[] {
  const stars = Math.round(weight);
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
  ));
}

function CharacterRow({ character }: { character: GameCharacter }) {
  return (
    <div className="text-xs text-white/70 bg-white/5 rounded p-2">
      <div className="font-medium">{character.name}</div>
      {character.description && <div className="text-white/50 mb-1">{character.description}</div>}
      {character.abilities && character.abilities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {character.abilities.filter(a => a.trim()).map((ability, index) => (
            <Badge key={index} variant="outline" className="border-orange-500/30 text-orange-200 text-xs h-5">{ability}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandedDetails({ game }: { game: Game }) {
  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
      {game.expansions && game.expansions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-1">Expansions</h4>
          <Textarea
            value={(game.expansions || []).map(formatExpansion).join(', ')}
            readOnly
            placeholder="Format: Extension 1 (2023), Extension 2 (2024), ..."
            className="min-h-[60px] bg-white/5 border-white/10 text-white text-xs resize-none"
          />
        </div>
      )}
      {game.characters && game.characters.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-orange-300 mb-1">Characters/Roles</h4>
          <div className="space-y-1">
            {game.characters.map(character => (
              <CharacterRow key={character.character_key} character={character} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface GameCardProps {
  game: Game;
  expandedGame: number | null;
  setExpandedGame: (id: number | null) => void;
  onNavigation: (view: string, id?: number, source?: string) => void;
  onEditGame: (game: Game) => void;
  onDeleteGame: (id: number) => void;
  darkMode: boolean;
  cardClass: string;
  titleClass: string;
  descClass: string;
}


const GameCard = React.memo(function GameCard({ game, expandedGame, setExpandedGame, onNavigation, onEditGame, onDeleteGame, darkMode, cardClass, titleClass, descClass }: GameCardProps) {
  const { ghostBtn: ghostBtnClass, meta: metaClass, credit: creditClass, dropdownItem: dropdownItemClass } = getGameCardStyles(darkMode);

  return (
    <Card className={cardClass}>
      <CardContent className="p-0">
        <div className="flex">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative">
            {(game.thumbnail || game.image) ? (
              <>
                <img
                  src={game.thumbnail || game.image}
                  alt={game.name}
                  className="w-full h-full object-cover rounded-l-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="absolute inset-0 rounded-l-lg bg-slate-700 items-center justify-center">
                  <span className="text-white/40 text-2xl font-bold">{game.name.charAt(0).toUpperCase()}</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full rounded-l-lg bg-slate-700 flex items-center justify-center">
                <span className="text-white/40 text-2xl font-bold">{game.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-3 sm:p-4 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className={titleClass + " mb-1 truncate"}>{game.name}</h3>
                <p className={descClass + " mb-2 line-clamp-2"}>{game.description}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className={darkMode ? "bg-teal-600/20 text-teal-300 text-xs" : "bg-teal-100 text-teal-700 text-xs"}>
                    {game.category}
                  </Badge>
                  {getGameModesBadges(game)}
                  <Badge variant="outline" className={darkMode ? "border-white/20 text-white/60 text-xs" : "border-slate-300 text-slate-500 text-xs"}>
                    {game.min_players === game.max_players ? `${game.min_players}` : `${game.min_players}-${game.max_players}`} players
                  </Badge>
                  <Badge variant="outline" className={darkMode ? "border-white/20 text-white/60 text-xs" : "border-slate-300 text-slate-500 text-xs"}>
                    <Clock className="w-3 h-3 mr-1" />
                    {game.duration}
                  </Badge>
                  <Badge variant="outline" className={`border-white/20 text-xs ${getDifficultyColor(game.difficulty)} ${!darkMode ? 'border-slate-300 text-slate-500' : ''}`}>
                    <Target className="w-3 h-3 mr-1" />
                    {game.difficulty}
                  </Badge>
                </div>

                <div className={metaClass}>
                  {(game.year_published ?? 0) > 0 && (
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{game.year_published}</span>
                    </span>
                  )}
                  {game.bgg_rating > 0 && (
                    <span className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{game.bgg_rating.toFixed(1)}</span>
                    </span>
                  )}
                  {game.weight > 0 && (
                    <div className="flex items-center space-x-1">
                      <span>Weight:</span>
                      <div className="flex">{getWeightStars(game.weight)}</div>
                    </div>
                  )}
                </div>

                {(game.designer !== 'Unknown' || game.publisher !== 'Unknown') && (
                  <div className={creditClass}>{getCredit(game)}</div>
                )}

                {(game.expansions?.length > 0 || game.characters?.length > 0) && (
                  <div className="mt-2 flex items-center space-x-2 text-xs">
                    {game.expansions?.length > 0 && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                        {game.expansions.length} expansion{game.expansions.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {game.characters?.length > 0 && (
                      <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                        {game.characters.length} character{game.characters.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedGame(expandedGame === game.game_id ? null : game.game_id);
                      }}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {expandedGame === game.game_id ? <CaretUp className="w-4 h-4" /> : <CaretDown className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {expandedGame === game.game_id && <ExpandedDetails game={game} />}
              </div>

              {/* Actions */}
              <div className="ml-2 flex-shrink-0">
                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => onNavigation('game-detail', game.game_id, 'games')} className={`p-2 rounded-lg transition-colors ${ghostBtnClass}`} aria-label="View game details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>View Details</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => onNavigation('stats', game.game_id, 'games')} className="p-2 hover:bg-teal-500/20 rounded-lg transition-colors text-teal-400 hover:text-teal-300" aria-label="View game stats">
                        <ChartLineUp className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>View Game Stats</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => onEditGame(game)} className={`p-2 rounded-lg transition-colors ${ghostBtnClass}`} aria-label="Edit game">
                        <PencilSimple className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit Game</p></TooltipContent>
                  </Tooltip>
                  <DeleteGameDialog
                    game={game}
                    onDeleteGame={onDeleteGame}
                    trigger={
                      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300" aria-label="Delete game">
                        <Trash className="w-4 h-4" />
                      </button>
                    }
                  />
                </div>

                {/* Mobile Actions */}
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 border border-white/20 shadow-lg" aria-label="Game options menu">
                        <DotsThree className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                      <DropdownMenuItem onClick={() => onNavigation('game-detail', game.game_id, 'games')} className={`cursor-pointer ${dropdownItemClass}`}>
                        <Eye className="w-4 h-4 mr-2" />View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigation('stats', game.game_id, 'games')} className="hover:bg-teal-500/20 cursor-pointer text-teal-400">
                        <ChartLineUp className="w-4 h-4 mr-2" />View Stats
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditGame(game)} className={`cursor-pointer ${dropdownItemClass}`}>
                        <PencilSimple className="w-4 h-4 mr-2" />Edit Game
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigation('game-expansions', game.game_id, 'games')} className={`cursor-pointer ${dropdownItemClass}`}>
                        <Crown className="w-4 h-4 mr-2" />Manage Expansions
                      </DropdownMenuItem>
                      {(game.has_characters || game.characters?.length > 0) && (
                        <DropdownMenuItem onClick={() => onNavigation('game-characters', game.game_id, 'games')} className={`cursor-pointer ${dropdownItemClass}`}>
                          <Users className="w-4 h-4 mr-2" />Manage Characters
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-slate-600" />
                      <DeleteGameDialog
                        game={game}
                        onDeleteGame={onDeleteGame}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={`cursor-pointer ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}>
                            <Trash className="w-4 h-4 mr-2" />Delete Game
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export function GamesPageView(props: GamesPageViewProps) {
  const {
    games,
    totalGames,
    averageRating,
    formData,
    isAddDialogOpen,
    isBGGSearchOpen,
    expandedGame,
    searchQuery,
    onNavigation,
    onSearchChange,
    onAddDialogToggle,
    onFormDataChange,
    onBGGGameSelect,
    onAddGame,
    onResetForm,
    onEditGame,
    onUpdateGame,
    onDeleteGame,
    setBGGSearchOpen,
    setExpandedGame,
    darkMode
  } = props;

  const safeGames = games || [];
  const mainClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white"
    : "min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900";
  const cardClass = darkMode
    ? "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl"
    : "bg-white rounded-2xl p-4 border border-slate-300 shadow-xl";
  const titleClass = darkMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-900";
  const descClass = darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm";
  const statCardClass = `${darkMode ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'} backdrop-blur-md rounded-xl p-3 text-center border`;
  const statSubClass = darkMode ? "text-xs text-white/80" : "text-xs text-slate-500";

  return (
    <div className={mainClass}>
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => onNavigation('dashboard')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Games</h1>
          <div className="flex space-x-2">
            <button onClick={() => onNavigation('stats', undefined, 'games')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChartLineUp className="w-6 h-6" />
            </button>
            <AddGameDialog
              isOpen={isAddDialogOpen}
              onOpenChange={onAddDialogToggle}
              formData={formData}
              onFormDataChange={onFormDataChange}
              onBGGGameSelect={onBGGGameSelect}
              onAddGame={onAddGame}
              onResetForm={onResetForm}
              isBGGSearchOpen={isBGGSearchOpen}
              onBGGSearchToggle={setBGGSearchOpen}
              darkMode={darkMode}
              serverError={props.addGameError}
            />
            <EditGameDialog
              isOpen={props.isEditDialogOpen}
              onOpenChange={props.setEditDialogOpen}
              formData={formData}
              onFormDataChange={onFormDataChange}
              onUpdateGame={onUpdateGame}
              onResetForm={onResetForm}
              editingGame={props.editingGame}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
          <Input
            id="games-search"
            name="games-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search games, designers, publishers..."
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>

        {/* Games Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={statCardClass}>
            <div className={darkMode ? "text-2xl font-bold text-emerald-400" : "text-2xl font-bold text-emerald-700"}>{totalGames}</div>
            <div className={statSubClass}>Total Games</div>
          </div>
          <div className={statCardClass}>
            <div className={darkMode ? "text-2xl font-bold text-blue-400" : "text-2xl font-bold text-blue-700"}>
              {[...new Set(safeGames.map(g => g.category || 'Unknown'))].length}
            </div>
            <div className={statSubClass}>Categories</div>
          </div>
          <div className={statCardClass}>
            <div className={darkMode ? "text-2xl font-bold text-purple-400" : "text-2xl font-bold text-purple-700"}>
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </div>
            <div className={statSubClass}>Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="px-4 pb-32">
        <div className="grid grid-cols-1 gap-4">
          {safeGames.map((game) => (
            <GameCard
              key={game.game_id}
              game={game}
              expandedGame={expandedGame}
              setExpandedGame={setExpandedGame}
              onNavigation={onNavigation}
              onEditGame={onEditGame}
              onDeleteGame={onDeleteGame}
              darkMode={darkMode}
              cardClass={cardClass}
              titleClass={titleClass}
              descClass={descClass}
            />
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No games found</p>
          </div>
        )}
      </div>

      {/* Floating Add Game Button */}
      <button
        onClick={onAddDialogToggle}
        className={
          `fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center z-50 ` +
          (darkMode
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
            : 'bg-gradient-to-r from-emerald-200 to-emerald-400 hover:from-emerald-300 hover:to-emerald-500 border border-emerald-400')
        }
        aria-label="Add new game"
      >
        <Plus className={darkMode ? "w-6 h-6 text-white" : "w-6 h-6 text-emerald-700"} />
      </button>
    </div>
  );
}
