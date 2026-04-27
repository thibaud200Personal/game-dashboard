import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { ArrowLeft, Plus, PencilSimple, Trash, Calendar } from '@phosphor-icons/react';
import { useGameExpansions, UseGameExpansionsProps } from './useGameExpansions';
import { ExpansionDialog, DeleteExpansionDialog } from './dialogs/ExpansionDialogs';
import MobileDetailNav from '@/shared/components/MobileDetailNav';
import { GameExpansion } from '@/types';
import { getContentClass } from '@/shared/utils/gameHelpers';
import { useLabels } from '@/shared/hooks/useLabels';

interface ExpansionCardProps {
  expansion: GameExpansion;
  onEdit: (expansion: GameExpansion) => void;
  onDelete: (id: number) => void;
}

function ExpansionCard({ expansion, onEdit, onDelete }: ExpansionCardProps) {
  const { t } = useLabels();

  return (
    <Card className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-slate-900 dark:text-white text-base md:text-lg">{expansion.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {expansion.year_published && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm">{expansion.year_published}</span>
          </div>
        )}
        {expansion.description && (
          <p className="text-slate-600 dark:text-slate-300 text-sm">{expansion.description}</p>
        )}
        {expansion.bgg_expansion_id && (
          <p className="text-slate-500 dark:text-slate-400 text-xs">BGG ID: {expansion.bgg_expansion_id}</p>
        )}
        <div className="flex gap-2 pt-2 md:pt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(expansion)}
                className="flex-1"
              >
                <PencilSimple className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t('common.buttons.edit')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{t('expansion.tooltip.edit')}</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(expansion.expansion_id!)}
                className="border-red-300 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-600/10 hover:border-red-600"
              >
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


export default function GameExpansionsView(props: UseGameExpansionsProps) {
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
  const { game, onNavigation, navigationSource, embedded = false } = props;
  const { t } = useLabels();

  const backTarget = navigationSource === 'game-detail' ? 'game-detail' : 'games';
  const contentClass = getContentClass(embedded);

  return (
    <div className={embedded ? '' : 'bg-gradient-to-br from-slate-100 to-slate-300 dark:bg-slate-900 dark:bg-none min-h-screen'}>
      {/* Header - Only show when not embedded */}
      {!embedded && (
        <div className="bg-white border-b border-slate-200 dark:bg-slate-800/50 dark:border-b dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigation(backTarget, game.game_id)}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50 p-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{navigationSource === 'game-detail' ? t('expansion.view.back_to_detail') : t('expansion.view.back_to_games')}</p>
                </TooltipContent>
              </Tooltip>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 hidden md:block"></div>
              <h1 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white flex-1 truncate">
                {t('expansion.view.title')} - {game.name}
              </h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="text-sm md:text-base"
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
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{t('expansion.view.title')} ({expansions.length})</h2>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="text-sm"
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
                onEdit={openEditDialog}
                onDelete={setDeleteExpansionId}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 mb-4">{t('expansion.view.empty')}</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('expansion.view.add_first')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <ExpansionDialog
        mode="add"
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddExpansion}
      />
      <ExpansionDialog
        mode="edit"
        isOpen={!!editingExpansion}
        onOpenChange={(open) => !open && closeDialogs()}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditExpansion}
      />
      <DeleteExpansionDialog
        isOpen={!!deleteExpansionId}
        onOpenChange={(open) => !open && setDeleteExpansionId(null)}
        expansionName={expansions.find(e => e.expansion_id === deleteExpansionId)?.name || ''}
        onConfirm={() => handleDeleteExpansion(deleteExpansionId!)}
      />

      <MobileDetailNav
        embedded={embedded}
        onBack={() => onNavigation(backTarget, game.game_id)}
        onAdd={() => setIsAddDialogOpen(true)}
      />
    </div>
  );
}
