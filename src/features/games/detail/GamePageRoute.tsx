import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameApi } from '@/features/games/gameApi';
import { queryKeys } from '@/shared/services/api/queryKeys';
import { useNavigationAdapter } from '@/shared/hooks/useNavigationAdapter';
import GameDetailPage from './GameDetailPage';
import GameDetailSkeleton from './GameDetailSkeleton';
import GameExpansionsPage from '../expansions/GameExpansionsPage';
import GameCharactersPage from '../characters/GameCharactersPage';
import type { GameExpansion, GameCharacter } from '@/types';

type SubRoute = 'detail' | 'expansions' | 'characters';

export default function GamePageRoute({ subRoute }: { subRoute: SubRoute }) {
  const { id } = useParams<{ id: string }>();
  const gameId = Number(id);
  const onNavigation = useNavigationAdapter();
  const queryClient = useQueryClient();

  const { data: game, isLoading } = useQuery({
    queryKey: queryKeys.games.detail(gameId),
    queryFn: () => gameApi.getById(gameId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) });

  const addExpansion = useMutation({
    mutationFn: (data: Omit<GameExpansion, 'expansion_id' | 'game_id'>) => gameApi.addExpansion(gameId, data),
    onSuccess: invalidate,
  });
  const deleteExpansion = useMutation({
    mutationFn: (expansionId: number) => gameApi.deleteExpansion(gameId, expansionId),
    onSuccess: invalidate,
  });
  const addCharacter = useMutation({
    mutationFn: (data: Omit<GameCharacter, 'character_id' | 'game_id'>) => gameApi.addCharacter(gameId, data),
    onSuccess: invalidate,
  });
  const deleteCharacter = useMutation({
    mutationFn: (charId: number) => gameApi.deleteCharacter(gameId, charId),
    onSuccess: invalidate,
  });

  if (isLoading) return <GameDetailSkeleton />;
  if (!game) return null;

  const noop = async () => {};
  const base = { game, onNavigation, navigationSource: 'games' };

  if (subRoute === 'expansions') {
    return <GameExpansionsPage
      {...base}
      onAddExpansion={(_, data) => addExpansion.mutateAsync(data)}
      onUpdateExpansion={noop}
      onDeleteExpansion={(expId) => deleteExpansion.mutateAsync(expId)}
    />;
  }

  if (subRoute === 'characters') {
    return <GameCharactersPage
      {...base}
      onAddCharacter={(_, data) => addCharacter.mutateAsync(data)}
      onUpdateCharacter={noop}
      onDeleteCharacter={(charId) => deleteCharacter.mutateAsync(charId)}
    />;
  }

  return <GameDetailPage
    {...base}
    currentView="game-detail"
    onAddExpansion={(_, data) => addExpansion.mutateAsync(data)}
    onUpdateExpansion={noop}
    onDeleteExpansion={(expId) => deleteExpansion.mutateAsync(expId)}
    onAddCharacter={(_, data) => addCharacter.mutateAsync(data)}
    onUpdateCharacter={noop}
    onDeleteCharacter={(charId) => deleteCharacter.mutateAsync(charId)}
  />;
}
