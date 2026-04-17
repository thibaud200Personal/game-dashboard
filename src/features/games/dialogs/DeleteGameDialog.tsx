import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/shared/components/ui/alert-dialog';

import { Game } from '@/types';

interface DeleteGameDialogProps {
  game: Game
  onDeleteGame: (gameId: number) => void
  trigger: React.ReactNode
}

export default function DeleteGameDialog({
  game,
  onDeleteGame,
  trigger
}: DeleteGameDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Game</AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            Are you sure you want to delete "{game.name}"? This action cannot be undone and will also remove all associated expansions and characters.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onDeleteGame(game.game_id)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}