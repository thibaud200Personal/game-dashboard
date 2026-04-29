import React from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { useLabels } from '@/shared/hooks/useLabels';

interface DeletePlayerDialogProps {
  playerName: string;
  onDelete: () => void;
  trigger: React.ReactNode;
}

export function DeletePlayerDialog({ playerName, onDelete, trigger }: DeletePlayerDialogProps) {
  const { t } = useLabels();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('players.delete_dialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {playerName && <><strong>"{playerName}"</strong> — </>}
            {t('players.delete_dialog.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.buttons.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('common.buttons.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
