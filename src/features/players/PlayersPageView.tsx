import React from 'react';
import {
  ArrowLeft,
  Plus,
  MagnifyingGlass,
  Users,
  TrendUp,
  Trophy,
  PencilSimple,
  Trash,
  DotsThreeVertical
} from '@phosphor-icons/react';
import { PlayerAvatar } from '@/shared/components/InitialAvatar';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { AddPlayerDialog, EditPlayerDialog, DeletePlayerDialog } from './dialogs';
import { Player, PlayerFormData } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';
import EmptyState from '@/shared/components/EmptyState';

interface PlayersPageViewProps {
  players: Player[];
  currentView: string;
  totalPlayers: number;
  totalGamesPlayed: number;
  totalWins: number;
  isMobile: boolean;
  formData: PlayerFormData;
  setFormData: (data: PlayerFormData) => void;
  editingPlayer: Player | null;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleBackClick: () => void;
  handlePlayerStatsClick: () => void;
  handleAddDialogOpen: (open: boolean) => void;
  handleEditDialogOpen: (open: boolean) => void;
  handleAddPlayer: () => void;
  handleEditPlayer: (player: Player) => void;
  handleUpdatePlayer: () => void;
  handleDeletePlayer: (playerId: number) => void;
  handleViewPlayerStats: (playerId: number) => void;
  resetForm: () => void;
  onNavigation: (view: string, id?: number) => void;
}

interface PlayerCardProps {
  player: Player;
  onViewStats: (id: number) => void;
  onEdit: (player: Player) => void;
  onDelete: (id: number) => void;
}

const PlayerCard = React.memo(function PlayerCard({ player, onViewStats, onEdit, onDelete }: PlayerCardProps) {
  const { t } = useLabels();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onViewStats(player.player_id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewStats(player.player_id)}
      className="bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-xl p-4 border border-slate-200 dark:border-white/20 shadow-xl cursor-pointer hover:border-primary/50 transition-colors"
      aria-label={`${player.player_name} — ${t('players.card.view_stats')}`}
    >
      <div className="flex items-center space-x-4">
        <PlayerAvatar name={player.player_name} url={player.avatar} className="w-12 h-12 flex-shrink-0 text-sm" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 dark:text-white">{player.player_name}</div>
          {player.pseudo && player.pseudo !== player.player_name && (
            <div className="text-xs text-slate-400 dark:text-white/40">@{player.pseudo}</div>
          )}
          <div className="text-slate-500 dark:text-white/60 text-sm">{player.stats || `${player.total_score} pts`}</div>
          <div className="text-slate-400 dark:text-white/40 text-xs">
            {player.games_played} {t('players.card.games')} • {player.wins} {t('players.card.wins')} • {t('players.card.avg')} {player.average_score}
          </div>
        </div>
        {/* Actions - Desktop */}
        <div className="hidden sm:flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(player)} className="text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Edit player">
            <PencilSimple className="w-4 h-4" />
          </Button>
          <DeletePlayerDialog
            playerName={player.player_name}
            onDelete={() => onDelete(player.player_id)}
            trigger={
              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" aria-label="Delete player">
                <Trash className="w-4 h-4" />
              </button>
            }
          />
        </div>
        {/* Actions - Mobile */}
        <div className="sm:hidden" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11">
                <DotsThreeVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white">
              <DropdownMenuItem onClick={() => onEdit(player)} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-white">
                <PencilSimple className="w-4 h-4 mr-2" />
                {t('players.card.menu.edit')}
              </DropdownMenuItem>
              <DeletePlayerDialog
                playerName={player.player_name}
                onDelete={() => onDelete(player.player_id)}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400">
                    <Trash className="w-4 h-4 mr-2" />
                    {t('players.card.menu.delete')}
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

export function PlayersPageView(props: PlayersPageViewProps) {
  const { t } = useLabels();
  const safePlayers = props.players || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 bg-slate-50 dark:bg-transparent border-b border-slate-200 dark:border-transparent">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={props.handleBackClick}
            aria-label="Go back"
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-600 dark:text-white hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('players.page.title')}</h1>
          <div className="flex space-x-2">
            <button
              onClick={props.handlePlayerStatsClick}
              aria-label="View players stats"
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-600 dark:text-white hover:text-slate-900 dark:hover:text-white"
            >
              <TrendUp className="w-6 h-6" />
            </button>
            <AddPlayerDialog
              isOpen={props.isAddDialogOpen}
              onOpenChange={props.handleAddDialogOpen}
              formData={props.formData}
              setFormData={props.setFormData}
              onAdd={props.handleAddPlayer}
              onCancel={() => {
                props.resetForm();
                props.handleAddDialogOpen(false);
              }}
              serverError={props.addPlayerError}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-white/10 dark:backdrop-blur-md rounded-xl p-3 border border-slate-200 dark:border-white/20">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-white">{props.totalPlayers}</div>
              <div className="text-xs text-slate-500 dark:text-white/60">{t('players.stats.total')}</div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-white/10 dark:backdrop-blur-md rounded-xl p-3 border border-slate-200 dark:border-white/20">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-700 dark:text-white">{props.totalGamesPlayed}</div>
              <div className="text-xs text-slate-500 dark:text-white/60">{t('players.stats.games')}</div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-white/10 dark:backdrop-blur-md rounded-xl p-3 border border-slate-200 dark:border-white/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{props.totalWins}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-white/60">{t('players.stats.wins')}</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-white/60" />
          <Input
            placeholder={t('players.search.placeholder')}
            value={props.searchQuery}
            onChange={(e) => props.setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Players List */}
      <div className="px-4 space-y-3 pb-32">
        {safePlayers.map((player) => (
          <PlayerCard
            key={player.player_id}
            player={player}
            onViewStats={props.handleViewPlayerStats}
            onEdit={props.handleEditPlayer}
            onDelete={props.handleDeletePlayer}
          />
        ))}

        {props.players.length === 0 && (
          <EmptyState
            icon={<Users />}
            title={t('players.empty.title')}
            description={t('players.empty.description')}
            action={
              <Button
                onClick={() => props.handleAddDialogOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('players.empty.add_first')}
              </Button>
            }
          />
        )}
      </div>

      {/* Floating Add Player Button */}
      <button
        onClick={() => props.handleAddDialogOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center z-50 hover:from-teal-600 hover:to-teal-700"
        aria-label="Add new player"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Edit Player Dialog */}
      <EditPlayerDialog
        isOpen={props.isEditDialogOpen}
        onOpenChange={props.handleEditDialogOpen}
        formData={props.formData}
        setFormData={props.setFormData}
        onUpdate={props.handleUpdatePlayer}
        onCancel={() => {
          props.resetForm();
          props.handleEditDialogOpen(false);
        }}
        serverError={props.updatePlayerError}
      />
    </div>
  );
}
