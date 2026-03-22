import { useState } from 'react';
import { Game, Player, CreateSessionPayload } from '@/types';

export const useNewGamePage = (
  games: Game[],
  players: Player[],
  onCreateSession: (sessionData: CreateSessionPayload) => Promise<void>
) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [sessionType, setSessionType] = useState<'competitive' | 'cooperative' | 'campaign' | 'hybrid'>('competitive');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [playerScores, setPlayerScores] = useState<{[key: number]: number}>({});
  const [winnerId, setWinnerId] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cooperative scoring state
  const [objectives, setObjectives] = useState<Array<{id: string, text: string, completed: boolean, points: number}>>([]);
  const [teamScore, setTeamScore] = useState<number>(0);
  const [difficultyLevel, setDifficultyLevel] = useState<string>('normal');
  const [teamSuccess, setTeamSuccess] = useState<boolean>(false);

  const selectedGame = games.find(g => g.game_id.toString() === selectedGameId) || null;

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const handleScoreChange = (playerId: number, value: string) => {
    setPlayerScores(prev => ({
      ...prev,
      [playerId]: parseInt(value) || 0
    }));
  };

  // Cooperative scoring handlers
  const addObjective = () => {
    const newObjective = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      points: 0
    };
    setObjectives([...objectives, newObjective]);
  };

  const addPresetObjectives = () => {
    const commonObjectives = [
      { id: Date.now().toString(), text: 'Complete primary mission', completed: false, points: 50 },
      { id: (Date.now() + 1).toString(), text: 'No player eliminated', completed: false, points: 20 },
      { id: (Date.now() + 2).toString(), text: 'Finish within time limit', completed: false, points: 30 },
      { id: (Date.now() + 3).toString(), text: 'Collect all bonus items', completed: false, points: 25 }
    ];
    setObjectives([...objectives, ...commonObjectives]);
  };

  const updateObjective = (id: string, field: string, value: string | number | boolean) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === id ? { ...obj, [field]: value } : obj
    ));
  };

  const removeObjective = (id: string) => {
    setObjectives(prev => prev.filter(obj => obj.id !== id));
  };

  const calculateTeamScore = () => {
    const completedObjectives = objectives.filter(obj => obj.completed);
    const totalPoints = completedObjectives.reduce((sum, obj) => sum + obj.points, 0);
    setTeamScore(totalPoints);
    return totalPoints;
  };

  const canSubmit = (): boolean => {
    const hasValidGame = Boolean(selectedGameId && 
           selectedPlayers.length >= (selectedGame?.min_players || 1) &&
           selectedPlayers.length <= (selectedGame?.max_players || 8));
    
    if (!hasValidGame) return false;
    
    // Additional validation for cooperative mode
    if (sessionType === 'cooperative') {
      // At least one objective or a team score should be set
      const hasObjectives = objectives.length > 0;
      const hasTeamScore = teamScore > 0;
      return hasObjectives || hasTeamScore;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedGame || !onCreateSession) return;

    setIsSubmitting(true);
    try {
      const sessionData = {
        game_id: parseInt(selectedGameId),
        session_date: new Date(),
        duration_minutes: duration ? parseInt(duration) : null,
        winner_player_id: winnerId ? parseInt(winnerId) : null,
        session_type: sessionType,
        notes: notes || null,
        players: selectedPlayers.map(playerId => ({
          player_id: playerId,
          score: playerScores[playerId] || 0,
          is_winner: winnerId === playerId.toString()
        })),
        // Cooperative scoring data
        ...(sessionType === 'cooperative' && {
          team_score: teamScore,
          team_success: teamSuccess,
          difficulty_level: difficultyLevel,
          objectives: objectives.map(obj => ({
            description: obj.text,
            completed: obj.completed,
            points: obj.points
          }))
        })
      };

      await onCreateSession(sessionData);
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
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

  return {
    // State
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
    
    // Cooperative scoring state
    objectives,
    setObjectives,
    teamScore,
    setTeamScore,
    difficultyLevel,
    setDifficultyLevel,
    teamSuccess,
    setTeamSuccess,
    
    // Computed
    selectedGame,
    
    // Methods
    handlePlayerToggle,
    handleScoreChange,
    canSubmit,
    handleSubmit,
    resetForm,
    
    // Cooperative scoring methods
    addObjective,
    addPresetObjectives,
    updateObjective,
    removeObjective,
    calculateTeamScore
  };
};