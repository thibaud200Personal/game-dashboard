import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gameApi } from '../services/api/gameApi';
import { playerApi } from '../services/api/playerApi';
import { playApi } from '../services/api/playApi';
import { queryKeys } from '../services/api/queryKeys';
import { useNavigationAdapter } from './useNavigationAdapter';
import type { CreatePlayPayload } from '@/types';

export const useNewGamePage = () => {
  const onNavigation = useNavigationAdapter();
  const queryClient = useQueryClient();

  const { data: games = [] } = useQuery({
    queryKey: queryKeys.games.all,
    queryFn: gameApi.getAll,
  });

  const { data: players = [] } = useQuery({
    queryKey: queryKeys.players.all,
    queryFn: playerApi.getAll,
  });

  const createSession = useMutation({
    mutationFn: playApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plays.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });

  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [sessionType, setSessionType] = useState<'competitive' | 'cooperative' | 'campaign' | 'hybrid'>('competitive');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [playerScores, setPlayerScores] = useState<Record<number, number>>({});
  const [winnerId, setWinnerId] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [objectives, setObjectives] = useState<Array<{ id: string; text: string; completed: boolean; points: number }>>([]);
  const [teamScore, setTeamScore] = useState<number>(0);
  const [difficultyLevel, setDifficultyLevel] = useState<string>('normal');
  const [teamSuccess, setTeamSuccess] = useState<boolean>(false);

  const selectedGame = games.find(g => g.game_id.toString() === selectedGameId) || null;
  const maxPlayersReached = selectedGame !== null && selectedPlayers.length >= selectedGame.max_players;

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const handleScoreChange = (playerId: number, value: string) => {
    const parsed = parseInt(value) || 0;
    setPlayerScores(prev => ({ ...prev, [playerId]: Math.min(999, Math.max(0, parsed)) }));
  };

  const addObjective = () => {
    setObjectives(prev => [...prev, { id: Date.now().toString(), text: '', completed: false, points: 0 }]);
  };

  const addPresetObjectives = () => {
    const presets = [
      { id: Date.now().toString(),       text: 'Complete primary mission', completed: false, points: 50 },
      { id: (Date.now() + 1).toString(), text: 'No player eliminated',     completed: false, points: 20 },
      { id: (Date.now() + 2).toString(), text: 'Finish within time limit', completed: false, points: 30 },
      { id: (Date.now() + 3).toString(), text: 'Collect all bonus items',  completed: false, points: 25 },
    ];
    setObjectives(prev => [...prev, ...presets]);
  };

  const updateObjective = (id: string, field: string, value: string | number | boolean) => {
    setObjectives(prev => prev.map(obj => obj.id === id ? { ...obj, [field]: value } : obj));
  };

  const removeObjective = (id: string) => {
    setObjectives(prev => prev.filter(obj => obj.id !== id));
  };

  const calculateTeamScore = () => {
    const total = objectives.filter(o => o.completed).reduce((sum, o) => sum + o.points, 0);
    setTeamScore(total);
    return total;
  };

  const competitiveWinnerMissing = sessionType === 'competitive' && selectedPlayers.length > 0 && winnerId === '';
  const winnerScoreInvalid = sessionType === 'competitive' && winnerId !== '' && (playerScores[parseInt(winnerId)] ?? 0) === 0;
  const durationMissing = duration === '';

  const canSubmit = (): boolean => {
    const hasValidGame = Boolean(
      selectedGameId &&
      selectedPlayers.length >= (selectedGame?.min_players || 1) &&
      selectedPlayers.length <= (selectedGame?.max_players || 8)
    );
    if (!hasValidGame) return false;
    if (durationMissing) return false;
    if (sessionType === 'cooperative') return objectives.length > 0 || teamScore > 0;
    if (sessionType === 'competitive' && (competitiveWinnerMissing || winnerScoreInvalid)) return false;
    if (sessionType === 'hybrid') {
      const winnerValid = winnerId !== '' && (playerScores[parseInt(winnerId)] ?? 0) > 0;
      return winnerValid || teamSuccess || teamScore > 0;
    }
    return true; // campaign : game + joueurs + durée suffisent
  };

  const resetForm = () => {
    setSelectedGameId('');
    setSessionType('competitive');
    setSelectedPlayers([]);
    setPlayerScores({});
    setWinnerId('');
    setDuration('');
    setNotes('');
    setObjectives([]);
    setTeamScore(0);
    setDifficultyLevel('normal');
    setTeamSuccess(false);
  };

  const handleSubmit = async (): Promise<{ success: boolean }> => {
    if (!selectedGame) return { success: false };
    setIsSubmitting(true);
    try {
      const payload: CreatePlayPayload = {
        game_id: parseInt(selectedGameId),
        play_date: new Date(),
        duration_minutes: duration ? parseInt(duration) : null,
        winner_player_id: winnerId ? parseInt(winnerId) : null,
        play_type: sessionType,
        notes: notes || null,
        players: selectedPlayers.map(playerId => ({
          player_id: playerId,
          score: playerScores[playerId] || 0,
          is_winner: winnerId === playerId.toString(),
        })),
      };
      await createSession.mutateAsync({
        game_id: payload.game_id,
        play_date: payload.play_date?.toISOString(),
        duration_minutes: payload.duration_minutes ?? undefined,
        winner_player_id: payload.winner_player_id ?? undefined,
        play_type: payload.play_type,
        notes: payload.notes ?? undefined,
        players: payload.players,
      });
      toast.success('Game play created successfully!');
      resetForm();
      return { success: true };
    } catch {
      toast.error('Failed to create game play');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    games,
    players,
    selectedGameId,
    setSelectedGameId,
    sessionType,
    setSessionType,
    selectedPlayers,
    setSelectedPlayers,
    playerScores,
    setPlayerScores,
    winnerId,
    setWinnerId,
    duration,
    setDuration,
    notes,
    setNotes,
    isSubmitting,
    objectives,
    setObjectives,
    teamScore,
    setTeamScore,
    difficultyLevel,
    setDifficultyLevel,
    teamSuccess,
    setTeamSuccess,
    selectedGame,
    maxPlayersReached,
    competitiveWinnerMissing,
    winnerScoreInvalid,
    durationMissing,
    handlePlayerToggle,
    handleScoreChange,
    canSubmit,
    handleSubmit,
    resetForm,
    addObjective,
    addPresetObjectives,
    updateObjective,
    removeObjective,
    calculateTeamScore,
    onNavigation,
  };
};
