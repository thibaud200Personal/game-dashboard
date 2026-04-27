import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { ArrowLeft, Plus, PencilSimple, Trash, User, Lightning } from '@phosphor-icons/react';
import { useGameCharacters, UseGameCharactersProps } from './useGameCharacters';
import { CharacterDialog, DeleteCharacterDialog } from './dialogs/CharacterDialogs';
import MobileDetailNav from '@/shared/components/MobileDetailNav';
import { useLabels } from '@/shared/hooks/useLabels';

export default function GameCharactersView(props: UseGameCharactersProps) {
  const {
    isAddDialogOpen,
    editingCharacter,
    deleteCharacterId,
    formData,
    characters,
    setIsAddDialogOpen,
    setDeleteCharacterId,
    setFormData,
    openEditDialog,
    closeDialogs,
    handleAddCharacter,
    handleEditCharacter,
    handleDeleteCharacter
  } = useGameCharacters(props);

  const {
    game,
    onNavigation,
    navigationSource,
    embedded = false,
  } = props;

  const { t } = useLabels();

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
                    onClick={() => onNavigation(navigationSource === 'game-detail' ? 'game-detail' : 'games', game.game_id)}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50 p-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{navigationSource === 'game-detail' ? t('character.view.back_to_detail') : t('character.view.back_to_games')}</p>
                </TooltipContent>
              </Tooltip>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 hidden md:block"></div>
              <h1 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white flex-1 truncate">
                {t('character.view.title')} - {game.name}
              </h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="w-5 h-5 mr-1" /> {t('common.buttons.add')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('character.dialog.add.title')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {characters.map((character) => (
            <Card key={character.character_id} className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
              <CardHeader className="pb-3 md:pb-6">
                <div className="flex items-center gap-3">
                  {character.avatar ? (
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-slate-900 dark:text-white text-base md:text-lg">{character.name}</CardTitle>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{character.character_key}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {character.description && (
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{character.description}</p>
                )}

                {character.abilities && character.abilities.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Lightning className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{t('character.form.abilities.label')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {character.abilities.map((ability, index) => (
                        <span
                          key={index}
                          className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded"
                        >
                          {ability}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 md:pt-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(character)}
                        className="flex-1"
                      >
                        <PencilSimple className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">{t('common.buttons.edit')}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('character.tooltip.edit')}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteCharacterId(character.character_id!)}
                        className="border-red-300 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-600/10 hover:border-red-600"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('character.tooltip.delete')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
          <CardContent className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t('character.view.empty')}</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('character.view.add_first')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CharacterDialog
        mode="add"
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddCharacter}
      />

      <CharacterDialog
        mode="edit"
        isOpen={!!editingCharacter}
        onOpenChange={(open) => !open && closeDialogs()}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditCharacter}
      />

      <DeleteCharacterDialog
        isOpen={!!deleteCharacterId}
        onOpenChange={(open) => !open && setDeleteCharacterId(null)}
        characterName={characters.find(c => c.character_id === deleteCharacterId)?.name || ''}
        onConfirm={() => handleDeleteCharacter(deleteCharacterId!)}
      />

      <MobileDetailNav
        embedded={embedded}
        onBack={() => onNavigation(navigationSource === 'game-detail' ? 'game-detail' : 'games', game.game_id)}
        onAdd={() => setIsAddDialogOpen(true)}
      />
    </div>
  );
}
