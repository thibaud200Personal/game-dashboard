import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { ArrowLeft, Plus, PencilSimple, Trash, User, Lightning } from '@phosphor-icons/react';
import { useGameCharacters, UseGameCharactersProps } from './useGameCharacters';
import { AddCharacterDialog, EditCharacterDialog, DeleteCharacterDialog } from './dialogs/CharacterDialogs';
import { useLabels } from '@/shared/hooks/useLabels';

export default function GameCharactersView(props: UseGameCharactersProps & { darkMode: boolean }) {
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
    darkMode
  } = props;

  const { t } = useLabels();

  // Classes dynamiques pour le thème
  const bgHeader = darkMode ? 'bg-slate-800/50 border-b border-slate-700/50' : 'bg-slate-100 border-b border-slate-200';
  const textHeader = darkMode ? 'text-white' : 'text-slate-900';
  const btnBack = darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-700/50 p-2' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200 p-2';

  return (
    <div className={darkMode ? 'bg-slate-900 min-h-screen' : 'bg-gradient-to-br from-slate-100 to-slate-300 min-h-screen'}>
      {/* Header - Only show when not embedded */}
      {!embedded && (
      <div className={bgHeader}>
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigation(navigationSource === 'game-detail' ? 'game-detail' : 'games', game.game_id)}
                  className={btnBack}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{navigationSource === 'game-detail' ? t('character.view.back_to_detail') : t('character.view.back_to_games')}</p>
              </TooltipContent>
            </Tooltip>
            <div className={darkMode ? 'h-6 w-px bg-slate-600 hidden md:block' : 'h-6 w-px bg-slate-300 hidden md:block'}></div>
            <h1 className={`text-lg md:text-xl font-semibold flex-1 truncate ${textHeader}`}>
              <span className={darkMode ? "text-white" : "text-slate-900"}>{t('character.view.title')} - {game.name}</span>
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  className={darkMode ? 'border-slate-600 bg-slate-800 text-white hover:bg-slate-700' : 'bg-teal-500 hover:bg-teal-600 text-white'}
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
            <Card key={character.character_id} className={darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}>
              <CardHeader className="pb-3 md:pb-6">
                <div className="flex items-center gap-3">
                  {character.avatar ? (
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-white text-base md:text-lg">{character.name}</CardTitle>
                    <p className="text-slate-400 text-sm">{character.character_key}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {character.description && (
                  <p className="text-slate-300 text-sm">{character.description}</p>
                )}

                {character.abilities && character.abilities.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Lightning className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{t('character.form.abilities.label')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {character.abilities.map((ability, index) => (
                        <span
                          key={index}
                          className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
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
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 flex-1"
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
                        className="border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-600"
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
  <Card className={darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}>
          <CardContent className="text-center py-12">
            <p className="text-slate-400 mb-4">{t('character.view.empty')}</p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('character.view.add_first')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddCharacterDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddCharacter}
        darkMode={darkMode}
      />

      <EditCharacterDialog
        isOpen={!!editingCharacter}
        onOpenChange={(open) => !open && closeDialogs()}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditCharacter}
        darkMode={darkMode}
      />

      <DeleteCharacterDialog
        isOpen={!!deleteCharacterId}
        onOpenChange={(open) => !open && setDeleteCharacterId(null)}
        characterName={characters.find(c => c.character_id === deleteCharacterId)?.name || ''}
        onConfirm={() => handleDeleteCharacter(deleteCharacterId!)}
        darkMode={darkMode}
      />

      {/* Bottom Navigation - Mobile Only - Only show when not embedded */}
      {!embedded && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <div className={darkMode ? "bg-slate-800 border-t border-slate-700 px-4 py-3" : "bg-slate-100 border-t border-slate-300 px-4 py-3"}>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigation(navigationSource === 'game-detail' ? 'game-detail' : 'games', game.game_id)}
                className="text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.buttons.back')}
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className={darkMode ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-teal-500 hover:bg-teal-600 text-white"}
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
