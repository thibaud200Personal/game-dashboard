import React from 'react';
import {
  ArrowLeft,
  Plus,
  MagnifyingGlass,
  Users,
  TrendUp,
  PencilSimple,
  Trash,
  ChartLineUp,
  DotsThreeVertical
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddPlayerDialog, EditPlayerDialog, DeletePlayerDialog } from '@/components/dialogs';
import { Player, PlayerFormData } from '@/types';

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
  darkMode: boolean;
}

interface PlayerCardProps {
  player: Player;
  darkMode: boolean;
  onViewStats: (id: number) => void;
  onEdit: (player: Player) => void;
  onDelete: (id: number) => void;
}

const PlayerCard = React.memo(function PlayerCard({ player, darkMode, onViewStats, onEdit, onDelete }: PlayerCardProps) {
  const cardClass = darkMode
    ? "bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl"
    : "bg-white rounded-xl p-4 border border-slate-200 shadow-xl";
  const nameClass = darkMode ? "font-semibold text-white" : "font-semibold text-slate-900";
  const statsClass = darkMode ? "text-white/60 text-sm" : "text-slate-500 text-sm";
  const metaClass = darkMode ? "text-white/40 text-xs" : "text-slate-400 text-xs";
  const ghostBtnClass = darkMode ? "text-white/60 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100";
  const deleteBtnClass = darkMode ? "p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300" : "p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700";
  const dropdownClass = darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-700";
  const dropdownItemClass = darkMode ? "hover:bg-slate-700 text-white" : "hover:bg-slate-100 text-slate-700";
  const dropdownDeleteClass = darkMode ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-100 text-red-600";

  return (
    <div className={cardClass}>
      <div className="flex items-center space-x-4">
        <img
          src={player.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
          alt={player.player_name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className={nameClass}>{player.player_name}</div>
          <div className={statsClass}>{player.stats || `${player.total_score} pts`}</div>
          <div className={metaClass}>
            {player.games_played} games • {player.wins} wins • Avg: {player.average_score}
          </div>
        </div>
        {/* Actions - Desktop */}
        <div className="hidden sm:flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onViewStats(player.player_id)} className={ghostBtnClass} aria-label="View player stats">
            <ChartLineUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(player)} className={ghostBtnClass} aria-label="Edit player">
            <PencilSimple className="w-4 h-4" />
          </Button>
          <DeletePlayerDialog
            playerName={player.player_name}
            onDelete={() => onDelete(player.player_id)}
            trigger={
              <button className={deleteBtnClass} aria-label="Delete player">
                <Trash className="w-4 h-4" />
              </button>
            }
          />
        </div>
        {/* Actions - Mobile */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <DotsThreeVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={dropdownClass}>
              <DropdownMenuItem onClick={() => onViewStats(player.player_id)} className={dropdownItemClass}>
                <ChartLineUp className="w-4 h-4 mr-2" />
                View Stats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(player)} className={dropdownItemClass}>
                <PencilSimple className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DeletePlayerDialog
                playerName={player.player_name}
                onDelete={() => onDelete(player.player_id)}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={dropdownDeleteClass}>
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
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
  const safePlayers = props.players || [];
  const darkMode = props.darkMode;
  const statCardClass = darkMode ? "bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20" : "bg-slate-50 backdrop-blur-md rounded-xl p-3 border border-slate-200";
  const subLabelClass = darkMode ? "text-xs text-white/60" : "text-xs text-slate-500";

  return (
    <div className={darkMode ? "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white" : "min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900"}>
      {/* Header */}
      <div className={darkMode ? "px-4 pt-8 pb-6" : "px-4 pt-8 pb-6 bg-slate-50 border-b border-slate-200"}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={props.handleBackClick}
            className={darkMode ? "p-2 hover:bg-white/10 rounded-lg transition-colors" : "p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={darkMode ? "text-2xl font-bold" : "text-2xl font-bold text-slate-900"}>Players</h1>
          <div className="flex space-x-2">
            <button
              onClick={props.handlePlayerStatsClick}
              className={darkMode ? "p-2 hover:bg-white/10 rounded-lg transition-colors" : "p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"}
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
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={statCardClass}>
            <div className="text-center">
              <div className={darkMode ? "text-lg font-bold" : "text-lg font-bold text-emerald-700"}>{props.totalPlayers}</div>
              <div className={subLabelClass}>Players</div>
            </div>
          </div>
          <div className={statCardClass}>
            <div className="text-center">
              <div className={darkMode ? "text-lg font-bold" : "text-lg font-bold text-blue-700"}>{props.totalGamesPlayed}</div>
              <div className={subLabelClass}>Games</div>
            </div>
          </div>
          <div className={statCardClass}>
            <div className="text-center">
              <div className={darkMode ? "text-lg font-bold" : "text-lg font-bold text-purple-700"}>{props.totalWins}</div>
              <div className={subLabelClass}>Wins</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlass className={darkMode ? "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" : "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500"} />
          <Input
            placeholder="Search players..."
            value={props.searchQuery}
            onChange={(e) => props.setSearchQuery(e.target.value)}
            className={darkMode ? "pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60" : "pl-10 bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-500"}
          />
        </div>
      </div>

      {/* Players List */}
      <div className="px-4 space-y-3 pb-32">
        {safePlayers.map((player) => (
          <PlayerCard
            key={player.player_id}
            player={player}
            darkMode={darkMode}
            onViewStats={props.handleViewPlayerStats}
            onEdit={props.handleEditPlayer}
            onDelete={props.handleDeletePlayer}
          />
        ))}

        {props.players.length === 0 && (
          <div className="text-center py-8">
            <Users className={darkMode ? "w-16 h-16 mx-auto mb-4 text-white/20" : "w-16 h-16 mx-auto mb-4 text-slate-300"} />
            <div className={darkMode ? "text-white/60 mb-4" : "text-slate-500 mb-4"}>No players found</div>
            <Button
              onClick={() => props.handleAddDialogOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Player
            </Button>
          </div>
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
        darkMode={darkMode}
      />
    </div>
  );
}
