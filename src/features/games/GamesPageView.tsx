import React from 'react';
import {
  Star,
  Plus,
  ArrowLeft,
  MagnifyingGlass,
  GameController,
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
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent
} from '@/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Game, BGGGame, GameExpansion, GameCharacter, GameFormData } from '@/types';
import { AddGameDialog, EditGameDialog, DeleteGameDialog } from './dialogs';
import { Card, CardContent } from '@/shared/components/ui/card';
import { getDifficultyColor, formatExpansion, getCredit, getGameCardStyles } from '@/shared/utils/gameHelpers';
import { useLabels } from '@/shared/hooks/useLabels';
import { gameModeColors, gameModeFallback, type GameMode } from '@/shared/theme/gameModeColors';
import EmptyState from '@/shared/components/EmptyState';

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
  isEditBGGSearchOpen: boolean;
  onEditBGGGameSelect: (bggGame: BGGGame) => void;
  setEditBGGSearchOpen: (open: boolean) => void;
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
  addGameError?: string | null;
  isAddDuplicate?: boolean;
  updateGameError?: string | null;
}


const MODE_ICONS: Record<GameMode, React.ReactElement> = {
  competitive: <Sword className="w-3 h-3 mr-1" />,
  cooperative: <Shield className="w-3 h-3 mr-1" />,
  campaign:    <Crown className="w-3 h-3 mr-1" />,
  hybrid:      <Target className="w-3 h-3 mr-1" />,
};

function getGameModesBadges(game: Game, t: (key: string) => string): React.ReactElement[] {
  return (['competitive', 'cooperative', 'campaign', 'hybrid'] as GameMode[]).flatMap(mode => {
    const prop = `supports_${mode}` as keyof typeof game;
    if (!game[prop]) return [];
    const colors = gameModeColors[mode] ?? gameModeFallback;
    return [
      <Badge key={mode} variant="outline" className={`${colors.badge} text-xs`}>
        {MODE_ICONS[mode]}{t(`games.card.modes.${mode}`)}
      </Badge>
    ];
  });
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

function ExpandedDetails({ game, t }: { game: Game; t: (key: string) => string }) {
  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
      {game.expansions && game.expansions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-1">{t('games.card.section.expansions')}</h4>
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
          <h4 className="text-sm font-medium text-orange-300 mb-1">{t('games.card.section.characters')}</h4>
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
  cardClass: string;
  titleClass: string;
  descClass: string;
  isFirst?: boolean;
}


const GameCard = React.memo(function GameCard({ game, expandedGame, setExpandedGame, onNavigation, onEditGame, onDeleteGame, cardClass, titleClass, descClass, isFirst }: GameCardProps) {
  const { t } = useLabels();
  const { ghostBtn: ghostBtnClass, meta: metaClass, credit: creditClass, dropdownItem: dropdownItemClass } = getGameCardStyles();

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
                  fetchPriority={isFirst ? 'high' : undefined}
                  loading={isFirst ? undefined : 'lazy'}
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
                  {game.is_expansion && (
                    <Badge variant="outline" className="border-amber-600/60 text-amber-700 dark:border-amber-500/40 dark:text-amber-400 text-xs">
                      {t('games.card.expansion')}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-600/20 text-teal-700 dark:text-teal-300 text-xs">
                    {game.category}
                  </Badge>
                  {getGameModesBadges(game, t)}
                  <Badge variant="outline" className="border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/60 text-xs">
                    {game.min_players === game.max_players ? `${game.min_players}` : `${game.min_players}-${game.max_players}`} {t('games.card.players')}
                  </Badge>
                  <Badge variant="outline" className="border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/60 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {game.duration}
                  </Badge>
                  <Badge variant="outline" className={`border-slate-300 dark:border-white/20 text-xs ${getDifficultyColor(game.difficulty)}`}>
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
                      <span>{t('games.card.weight')}</span>
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
                        {game.expansions.length} {game.expansions.length > 1 ? t('games.card.expansion.count_plural') : t('games.card.expansion.count')}
                      </Badge>
                    )}
                    {game.characters?.length > 0 && (
                      <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                        {game.characters.length} {game.characters.length > 1 ? t('games.card.character.count_plural') : t('games.card.character.count')}
                      </Badge>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedGame(expandedGame === game.game_id ? null : game.game_id);
                      }}
                      aria-label={expandedGame === game.game_id ? 'Collapse game details' : 'Expand game details'}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {expandedGame === game.game_id ? <CaretUp className="w-4 h-4" /> : <CaretDown className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {expandedGame === game.game_id && <ExpandedDetails game={game} t={t} />}
              </div>

              {/* Actions */}
              <div className="ml-2 flex-shrink-0">
                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => onNavigation('game-detail', game.game_id, 'games')} className={`p-2.5 rounded-lg transition-colors ${ghostBtnClass}`} aria-label="View game details">
                        <Eye className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('games.tooltip.view_details')}</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => onNavigation('stats', game.game_id, 'games')} className="p-2.5 hover:bg-teal-500/20 rounded-lg transition-colors text-teal-400 hover:text-teal-300" aria-label="View game stats">
                        <ChartLineUp className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('games.tooltip.view_stats')}</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => onEditGame(game)} className={`p-2.5 rounded-lg transition-colors ${ghostBtnClass}`} aria-label="Edit game">
                        <PencilSimple className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('games.tooltip.edit')}</p></TooltipContent>
                  </Tooltip>
                  <DeleteGameDialog
                    game={game}
                    onDeleteGame={onDeleteGame}
                    trigger={
                      <button className="p-2.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300" aria-label="Delete game">
                        <Trash className="w-5 h-5" />
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onNavigation('game-detail', game.game_id, 'games')} className={`cursor-pointer ${dropdownItemClass}`}>
                        <Eye className="w-4 h-4 mr-2" />{t('games.menu.view_details')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigation('stats', game.game_id, 'games')} className="hover:bg-teal-500/20 cursor-pointer text-teal-400">
                        <ChartLineUp className="w-4 h-4 mr-2" />{t('games.menu.view_stats')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditGame(game)} className={`cursor-pointer ${dropdownItemClass}`}>
                        <PencilSimple className="w-4 h-4 mr-2" />{t('games.menu.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigation('game-expansions', game.game_id, 'games')} className={`cursor-pointer ${dropdownItemClass}`}>
                        <Crown className="w-4 h-4 mr-2" />{t('games.menu.expansions')}
                      </DropdownMenuItem>
                      {(game.has_characters || game.characters?.length > 0) && (
                        <DropdownMenuItem onClick={() => onNavigation('game-characters', game.game_id, 'games')} className={`cursor-pointer ${dropdownItemClass}`}>
                          <Users className="w-4 h-4 mr-2" />{t('games.menu.characters')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-slate-600" />
                      <DeleteGameDialog
                        game={game}
                        onDeleteGame={onDeleteGame}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400">
                            <Trash className="w-4 h-4 mr-2" />{t('games.menu.delete')}
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
  const { t } = useLabels();
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
  } = props;

  const safeGames = games || [];
  const mainClass = "min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white";
  const cardClass = "bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-4 border border-slate-300 dark:border-white/20 shadow-xl";
  const titleClass = "text-lg font-semibold text-slate-900 dark:text-white";
  const descClass = "text-slate-500 dark:text-white/60 text-sm";
  const statCardClass = "bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/20 backdrop-blur-md rounded-xl p-3 text-center border";
  const statSubClass = "text-xs text-slate-500 dark:text-white/80";

  return (
    <div className={mainClass}>
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => onNavigation('dashboard')} aria-label="Go back" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('games.page.title')}</h1>
          <div className="flex space-x-2">
            <button onClick={() => onNavigation('stats', undefined, 'games')} aria-label="View games stats" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChartLineUp className="w-6 h-6" />
            </button>
            <div className="hidden md:flex">
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
                serverError={props.addGameError}
                disabled={props.isAddDuplicate}
              />
            </div>
            <EditGameDialog
              isOpen={props.isEditDialogOpen}
              onOpenChange={props.setEditDialogOpen}
              formData={formData}
              onFormDataChange={onFormDataChange}
              onUpdateGame={onUpdateGame}
              onResetForm={onResetForm}
              editingGame={props.editingGame}
              serverError={props.updateGameError}
              isBGGSearchOpen={props.isEditBGGSearchOpen}
              onBGGSearchToggle={props.setEditBGGSearchOpen}
              onBGGGameSelect={props.onEditBGGGameSelect}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="games-search"
            name="games-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('games.search.placeholder')}
            className="pl-10"
          />
        </div>

        {/* Games Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={statCardClass}>
            <div className="text-2xl font-bold text-foreground">{totalGames}</div>
            <div className={statSubClass}>{t('games.stats.total')}</div>
          </div>
          <div className={statCardClass}>
            <div className="text-2xl font-bold text-foreground">
              {[...new Set(safeGames.map(g => g.category || 'Unknown'))].length}
            </div>
            <div className={statSubClass}>{t('games.stats.categories')}</div>
          </div>
          <div className={statCardClass}>
            <div className="text-2xl font-bold text-foreground">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </div>
            <div className={statSubClass}>{t('games.stats.avg_rating')}</div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="px-4 pb-32">
        <div className="grid grid-cols-1 gap-4">
          {safeGames.map((game, index) => (
            <GameCard
              key={game.game_id}
              game={game}
              isFirst={index === 0}
              expandedGame={expandedGame}
              setExpandedGame={setExpandedGame}
              onNavigation={onNavigation}
              onEditGame={onEditGame}
              onDeleteGame={onDeleteGame}
              cardClass={cardClass}
              titleClass={titleClass}
              descClass={descClass}
            />
          ))}
        </div>

        {safeGames.length === 0 && (
          <EmptyState
            icon={<GameController />}
            title={t('games.empty')}
          />
        )}
      </div>

      {/* Floating Add Game Button — mobile only */}
      <button
        onClick={onAddDialogToggle}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center z-50 bg-gradient-to-r from-emerald-200 to-emerald-400 hover:from-emerald-300 hover:to-emerald-500 border border-emerald-400 dark:from-emerald-500 dark:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 dark:border-0"
        aria-label="Add new game"
      >
        <Plus className="w-6 h-6 text-emerald-700 dark:text-white" />
      </button>
    </div>
  );
}
