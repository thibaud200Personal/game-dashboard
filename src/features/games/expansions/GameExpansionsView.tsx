import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { ArrowLeft, Plus, PencilSimple, Trash, Calendar } from '@phosphor-icons/react';
import { useGameExpansions, UseGameExpansionsProps } from './useGameExpansions';
import { AddExpansionDialog, EditExpansionDialog, DeleteExpansionDialog } from './dialogs/ExpansionDialogs';
import { GameExpansion } from '@/types';
import { getContentClass } from '@/shared/utils/gameHelpers';
import { useLabels } from '@/shared/hooks/useLabels';

interface ExpansionCardProps {
  expansion: GameExpansion;
  darkMode: boolean;
  onEdit: (expansion: GameExpansion) => void;
  onDelete: (id: number) => void;
}

function ExpansionCard({ expansion, darkMode, onEdit, onDelete }: ExpansionCardProps) {
  const { t } = useLabels();
  const cardClass = darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200';
  const titleClass = darkMode ? 'text-white text-base md:text-lg' : 'text-slate-900 text-base md:text-lg';
  const rowClass = darkMode ? 'flex items-center gap-2 text-slate-300' : 'flex items-center gap-2 text-slate-700';
  const calClass = darkMode ? 'w-4 h-4 text-primary' : 'w-4 h-4 text-slate-700';
  const descClass = darkMode ? 'text-slate-300 text-sm' : 'text-slate-700 text-sm';
  const bggClass = darkMode ? 'text-slate-400 text-xs' : 'text-slate-500 text-xs';
  const editBtnClass = darkMode
    ? 'border-slate-600 bg-slate-800 text-white hover:bg-slate-700 flex-1'
    : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100 flex-1';
  const deleteBtnClass = darkMode
    ? 'border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-600'
    : 'border-red-300 text-red-600 hover:bg-red-100 hover:border-red-600';

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className={titleClass}>{expansion.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {expansion.year_published && (
          <div className={rowClass}>
            <Calendar className={calClass} />
            <span className="text-sm">{expansion.year_published}</span>
          </div>
        )}
        {expansion.description && (
          <p className={descClass}>{expansion.description}</p>
        )}
        {expansion.bgg_expansion_id && (
          <p className={bggClass}>BGG ID: {expansion.bgg_expansion_id}</p>
        )}
        <div className="flex gap-2 pt-2 md:pt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => onEdit(expansion)} className={editBtnClass}>
                <PencilSimple className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t('common.buttons.edit')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{t('expansion.tooltip.edit')}</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => onDelete(expansion.expansion_id!)} className={deleteBtnClass}>
                <Trash className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{t('expansion.tooltip.delete')}</p></TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}


export default function GameExpansionsView(props: UseGameExpansionsProps & { darkMode: boolean }) {
  const {
    isAddDialogOpen,
    editingExpansion,
    deleteExpansionId,
    formData,
    expansions,
    setIsAddDialogOpen,
    setDeleteExpansionId,
    setFormData,
    openEditDialog,
    closeDialogs,
    handleAddExpansion,
    handleEditExpansion,
    handleDeleteExpansion
  } = useGameExpansions(props);
  const { game, onNavigation, navigationSource, embedded = false, darkMode } = props;
  const { t } = useLabels();

  const backTarget = navigationSource === 'game-detail' ? 'game-detail' : 'games';
  const wrapperClass = darkMode ? 'bg-slate-900 min-h-screen' : 'bg-gradient-to-br from-slate-100 to-slate-300 min-h-screen';
  const headerClass = darkMode ? "bg-slate-800/50 border-b border-slate-700/50" : "bg-white border-b border-slate-200";
  const contentClass = getContentClass(embedded, darkMode);
  const cardClass = darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200';

  return (
    <div className={wrapperClass}>
      {/* Header - Only show when not embedded */}
      {!embedded && (
        <div className={headerClass}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigation(backTarget, game.game_id)}
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50 p-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{navigationSource === 'game-detail' ? t('expansion.view.back_to_detail') : t('expansion.view.back_to_games')}</p>
                </TooltipContent>
              </Tooltip>
              <div className="h-6 w-px bg-slate-600 hidden md:block"></div>
              <h1 className="text-lg md:text-xl font-semibold text-white flex-1 truncate">
                <span className={darkMode ? "text-white" : "text-slate-900"}>{t('expansion.view.title')} - {game.name}</span>
              </h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className={darkMode ? "bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base" : "bg-teal-500 hover:bg-teal-600 text-white text-sm md:text-base"}
                  >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">{t('expansion.view.add_new')}</span>
                    <span className="md:hidden">{t('common.buttons.add')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('expansion.tooltip.add')}</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={contentClass}>
        {embedded && (
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">{t('expansion.view.title')} ({expansions.length})</h2>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">{t('common.buttons.add')}</span>
            </Button>
          </div>
        )}

        {expansions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {expansions.map((expansion) => (
              <ExpansionCard
                key={expansion.expansion_id}
                expansion={expansion}
                darkMode={darkMode}
                onEdit={openEditDialog}
                onDelete={setDeleteExpansionId}
              />
            ))}
          </div>
        ) : (
          <Card className={cardClass}>
            <CardContent className="text-center py-12">
              <p className={darkMode ? 'text-slate-400 mb-4' : 'text-slate-500 mb-4'}>{t('expansion.view.empty')}</p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className={darkMode ? 'border-slate-600 bg-slate-800 text-white hover:bg-slate-700' : 'bg-teal-500 hover:bg-teal-600 text-white'}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('expansion.view.add_first')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <AddExpansionDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddExpansion}
        darkMode={darkMode}
      />
      <EditExpansionDialog
        isOpen={!!editingExpansion}
        onOpenChange={(open) => !open && closeDialogs()}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditExpansion}
        darkMode={darkMode}
      />
      <DeleteExpansionDialog
        isOpen={!!deleteExpansionId}
        onOpenChange={(open) => !open && setDeleteExpansionId(null)}
        expansionName={expansions.find(e => e.expansion_id === deleteExpansionId)?.name || ''}
        onConfirm={() => handleDeleteExpansion(deleteExpansionId!)}
        darkMode={darkMode}
      />

      {/* Bottom Navigation - Mobile Only - Only show when not embedded */}
      {!embedded && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <div className={darkMode ? 'bg-slate-800 border-t border-slate-700 px-4 py-3' : 'bg-slate-100 border-t border-slate-300 px-4 py-3'}>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigation(backTarget, game.game_id)}
                className={darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.buttons.back')}
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('common.buttons.add')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
