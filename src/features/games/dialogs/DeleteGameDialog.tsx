import React from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Game } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';

interface DeleteGameDialogProps {
  game: Game
  onDeleteGame: (gameId: number) => void
  trigger: React.ReactNode
}

export default function DeleteGameDialog({ game, onDeleteGame, trigger }: DeleteGameDialogProps) {
  const { t } = useLabels();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('games.delete_dialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {game.name && <><strong>"{game.name}"</strong> — </>}
            {t('games.delete_dialog.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.buttons.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDeleteGame(game.game_id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('common.buttons.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}