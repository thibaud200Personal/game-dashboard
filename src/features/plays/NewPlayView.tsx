import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { ArrowLeft, Play, Users, Trophy, Timer, Target, Plus, Trash } from '@phosphor-icons/react';
import { PlayerAvatar } from '@/shared/components/InitialAvatar';
import { Game, Player } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';
import { gameModeColors, type GameMode } from '@/shared/theme/gameModeColors';

type SessionType = GameMode;

interface NewGameViewProps {
  selectedGameId: string
  setSelectedGameId: (id: string) => void
  sessionType: SessionType
  setSessionType: (type: SessionType) => void
  selectedPlayers: number[]
  playerScores: {[key: number]: number}
  winnerId: string
  setWinnerId: (id: string) => void
  duration: string
  setDuration: (duration: string) => void
  notes: string
  setNotes: (notes: string) => void
  isSubmitting: boolean
  objectives: Array<{id: string, text: string, completed: boolean, points: number}>
  setObjectives: (objectives: Array<{id: string, text: string, completed: boolean, points: number}>) => void
  teamScore: number
  setTeamScore: (score: number) => void
  difficultyLevel: string
  setDifficultyLevel: (level: string) => void
  teamSuccess: boolean
  setTeamSuccess: (success: boolean) => void
  selectedGame: Game | null
  maxPlayersReached: boolean
  competitiveWinnerMissing: boolean
  winnerScoreInvalid: boolean
  durationMissing: boolean
  handlePlayerToggle: (playerId: number) => void
  handleScoreChange: (playerId: number, value: string) => void
  canSubmit: () => boolean
  handleSubmit: () => Promise<{ success: boolean }>
  addObjective: () => void
  addPresetObjectives: () => void
  updateObjective: (id: string, field: string, value: string | number | boolean) => void
  removeObjective: (id: string) => void
  calculateTeamScore: () => number
  games: Game[]
  players: Player[]
  onNavigation: (view: string) => void
  requestNavigation: (target: string) => void
  showLeaveDialog: boolean
  confirmLeave: () => void
  cancelLeave: () => void
  currentView: string
}

interface TeamScoringBlockProps {
  successLabel: string;
  scoreLabel: string;
  teamSuccess: boolean;
  setTeamSuccess: (v: boolean) => void;
  teamScore: number;
  setTeamScore: (v: number) => void;
  hintLost: string;
}

function TeamScoringBlock({ successLabel, scoreLabel, teamSuccess, setTeamSuccess, teamScore, setTeamScore, hintLost }: TeamScoringBlockProps) {
  return (
    <>
      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
        <Checkbox
          checked={teamSuccess}
          onCheckedChange={(checked) => setTeamSuccess(!!checked)}
          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
        />
        <Label className="text-foreground font-medium">{successLabel}</Label>
      </div>
      <div>
        <Label className="text-muted-foreground">{scoreLabel}</Label>
        <Input
          type="number"
          placeholder="0"
          value={teamScore}
          onChange={(e) => setTeamScore(parseInt(e.target.value) || 0)}
        />
        {!teamSuccess && (
          <p className="text-xs text-muted-foreground mt-1">{hintLost}</p>
        )}
      </div>
    </>
  );
}

export default function NewGameView({
  selectedGameId,
  setSelectedGameId,
  sessionType,
  setSessionType,
  selectedPlayers,
  playerScores,
  winnerId,
  setWinnerId,
  duration,
  setDuration,
  notes,
  setNotes,
  isSubmitting,
  objectives,
  setObjectives: _setObjectives,
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
  addObjective,
  addPresetObjectives,
  updateObjective,
  removeObjective,
  calculateTeamScore,
  games,
  players,
  requestNavigation,
  showLeaveDialog,
  confirmLeave,
  cancelLeave,
  onNavigation,
  currentView: _currentView,
}: NewGameViewProps) {
  const { t } = useLabels();
  const safeGames = games || [];
  const safePlayers = players || [];
  const safeSelectedPlayers = selectedPlayers || [];

  const onSubmit = async () => {
    const result = await handleSubmit();
    if (result.success) onNavigation('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800 text-foreground">
      <div className="container mx-auto px-4 py-6 pb-32 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => requestNavigation('dashboard')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{t('sessions.new.title')}</h1>
        </div>

        {/* Game Setup */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Play className="w-5 h-5" />
              {t('sessions.setup.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">{t('sessions.setup.game.label')}</Label>
                <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('sessions.setup.game.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {safeGames.map(game => (
                      <SelectItem key={game.game_id} value={game.game_id.toString()}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGame && (
                <div>
                  <Label className="text-muted-foreground">{t('sessions.setup.type.label')}</Label>
                  <Select value={sessionType} onValueChange={(value: 'competitive' | 'cooperative' | 'campaign' | 'hybrid') => setSessionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedGame.supports_competitive && (
                        <SelectItem value="competitive">{t('sessions.setup.type.competitive')}</SelectItem>
                      )}
                      {selectedGame.supports_cooperative && (
                        <SelectItem value="cooperative">{t('sessions.setup.type.cooperative')}</SelectItem>
                      )}
                      {selectedGame.supports_campaign && (
                        <SelectItem value="campaign">{t('sessions.setup.type.campaign')}</SelectItem>
                      )}
                      {selectedGame.supports_hybrid && (
                        <SelectItem value="hybrid">{t('sessions.setup.type.hybrid')}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {selectedGame && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">{selectedGame.name}</strong> • {selectedGame.min_players}-{selectedGame.max_players} {t('games.card.players')}
                  {selectedGame.duration && ` • ${selectedGame.duration}`}
                </p>
                {selectedGame.description && (
                  <p className="text-muted-foreground text-sm mt-2">{selectedGame.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedGame.supports_competitive && (
                    <span className={`px-2 py-1 text-xs rounded ${gameModeColors.competitive.bg}`}>{t('games.card.modes.competitive')}</span>
                  )}
                  {selectedGame.supports_cooperative && (
                    <span className={`px-2 py-1 text-xs rounded ${gameModeColors.cooperative.bg}`}>{t('games.card.modes.cooperative')}</span>
                  )}
                  {selectedGame.supports_campaign && (
                    <span className={`px-2 py-1 text-xs rounded ${gameModeColors.campaign.bg}`}>{t('games.card.modes.campaign')}</span>
                  )}
                  {selectedGame.supports_hybrid && (
                    <span className={`px-2 py-1 text-xs rounded ${gameModeColors.hybrid.bg}`}>{t('games.card.modes.hybrid')}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Selection */}
        {selectedGame && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5" />
                {t('sessions.players.title')}
              </CardTitle>
              {safeSelectedPlayers.length < (selectedGame?.min_players ?? 1) && (
                <p className="text-orange-500 dark:text-orange-400 text-sm mt-1">
                  {t('sessions.players.min_required')
                    .replace('{min}', String(selectedGame.min_players))
                    .replace('{count}', String(safeSelectedPlayers.length))}
                </p>
              )}
              {maxPlayersReached && (
                <p className="text-destructive text-sm mt-1">
                  {t('sessions.players.max_reached').replace('{max}', String(selectedGame.max_players))}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safePlayers.map(player => {
                  const isSelected = safeSelectedPlayers.includes(player.player_id);
                  const isDisabled = maxPlayersReached && !isSelected;
                  return (
                    <div key={player.player_id} className={`flex items-center space-x-3 p-3 bg-muted/30 rounded-lg transition-opacity${isDisabled ? ' opacity-40' : ''}`}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handlePlayerToggle(player.player_id)}
                        disabled={isDisabled}
                        className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <PlayerAvatar name={player.player_name} url={player.avatar} className="w-8 h-8 text-xs flex-shrink-0" />
                        <div>
                          <p className="text-foreground font-medium">{player.player_name}</p>
                          <p className="text-muted-foreground text-sm">{player.stats}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cooperative Scoring */}
        {selectedPlayers.length > 0 && sessionType === 'cooperative' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="w-5 h-5" />
                {t('sessions.cooperative.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t('sessions.cooperative.difficulty.label')}</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{t('plays.form.difficulty.easy')}</SelectItem>
                    <SelectItem value="normal">{t('plays.form.difficulty.normal')}</SelectItem>
                    <SelectItem value="hard">{t('plays.form.difficulty.hard')}</SelectItem>
                    <SelectItem value="expert">{t('plays.form.difficulty.expert')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TeamScoringBlock
                successLabel={t('sessions.cooperative.team_success')}
                scoreLabel={t('sessions.cooperative.team_score.label')}
                teamSuccess={teamSuccess}
                setTeamSuccess={setTeamSuccess}
                teamScore={teamScore}
                setTeamScore={setTeamScore}
                hintLost={t('sessions.cooperative.team_success.hint_score')}
              />

              {/* Objectives */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-muted-foreground">{t('sessions.cooperative.objectives.label')}</Label>
                  <div className="flex gap-2">
                    {objectives.length === 0 && (
                      <Button onClick={addPresetObjectives} size="sm" variant="outline">
                        <Target className="w-4 h-4 mr-1" />
                        {t('sessions.cooperative.objectives.add_common')}
                      </Button>
                    )}
                    <Button onClick={addObjective} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      {t('sessions.cooperative.objectives.add_custom')}
                    </Button>
                  </div>
                </div>

                {objectives.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{t('sessions.cooperative.objectives.empty')}</p>
                    <p className="text-xs mt-1">{t('sessions.objectives.hint')}</p>
                  </div>
                )}

                {objectives.map((objective) => (
                  <div key={objective.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={objective.completed}
                        onCheckedChange={(checked) => updateObjective(objective.id, 'completed', !!checked)}
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 flex-shrink-0"
                      />
                      <Input
                        placeholder={t('sessions.cooperative.objectives.description_placeholder')}
                        value={objective.text}
                        onChange={(e) => updateObjective(objective.id, 'text', e.target.value)}
                        className="flex-1 min-w-0"
                      />
                      <Input
                        type="number"
                        placeholder="0"
                        value={objective.points}
                        onChange={(e) => updateObjective(objective.id, 'points', parseInt(e.target.value) || 0)}
                        className="w-16 flex-shrink-0"
                      />
                      <span className="text-muted-foreground text-sm flex-shrink-0">{t('sessions.cooperative.objectives.pts')}</span>
                      <Button
                        onClick={() => removeObjective(objective.id)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto flex-shrink-0"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {objectives.length > 0 && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('sessions.objectives.total_score')}</span>
                      <span className="text-foreground font-semibold">{calculateTeamScore()} {t('sessions.cooperative.objectives.pts')}</span>
                    </div>
                    <div className="text-muted-foreground text-sm mt-1">
                      {t('sessions.cooperative.objectives.progress')
                        .replace('{count}', String(objectives.filter(obj => obj.completed).length))
                        .replace('{total}', String(objectives.length))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competitive Scoring */}
        {selectedPlayers.length > 0 && sessionType === 'competitive' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Trophy className="w-5 h-5" />
                {t('sessions.competitive.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={winnerId} onValueChange={setWinnerId} className="space-y-3">
                {safeSelectedPlayers.map(playerId => {
                  const player = safePlayers.find(p => p.player_id === playerId);
                  if (!player) return null;
                  return (
                    <div key={playerId} className="flex items-center gap-4">
                      <RadioGroupItem value={playerId.toString()} id={`winner-${playerId}`} />
                      <Label htmlFor={`winner-${playerId}`} className="flex-1 flex items-center gap-3 cursor-pointer">
                        <PlayerAvatar name={player.player_name} url={player.avatar} className="w-8 h-8 text-xs flex-shrink-0" />
                        <span className="text-foreground font-medium">{player.player_name}</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder="Score"
                        min={0}
                        max={999}
                        value={playerScores[playerId] || ''}
                        onChange={(e) => handleScoreChange(playerId, e.target.value)}
                        className="w-20"
                      />
                    </div>
                  );
                })}
                <div className="flex items-center gap-4 pt-1 border-t border-border">
                  <RadioGroupItem value="" id="winner-none" />
                  <Label htmlFor="winner-none" className="text-muted-foreground cursor-pointer">
                    {t('sessions.competitive.no_winner')}
                  </Label>
                </div>
              </RadioGroup>
              {competitiveWinnerMissing && (
                <p className="text-orange-500 dark:text-orange-400 text-xs mt-2">{t('sessions.competitive.winner_missing')}</p>
              )}
              {winnerScoreInvalid && (
                <p className="text-orange-500 dark:text-orange-400 text-xs mt-2">{t('sessions.competitive.score_invalid')}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hybrid Scoring */}
        {selectedPlayers.length > 0 && sessionType === 'hybrid' && (
          <>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5" />
                  {t('sessions.hybrid.team.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TeamScoringBlock
                  successLabel={t('sessions.hybrid.team.completed')}
                  scoreLabel={t('sessions.hybrid.team.score')}
                  teamSuccess={teamSuccess}
                  setTeamSuccess={setTeamSuccess}
                  teamScore={teamScore}
                  setTeamScore={setTeamScore}
                  hintLost={t('sessions.cooperative.team_success.hint_score')}
                />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Trophy className="w-5 h-5" />
                  {t('sessions.hybrid.individual.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {safeSelectedPlayers.map(playerId => {
                  const player = safePlayers.find(p => p.player_id === playerId);
                  if (!player) return null;
                  return (
                    <div key={playerId} className="flex items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <PlayerAvatar name={player.player_name} url={player.avatar} className="w-8 h-8 text-xs flex-shrink-0" />
                        <span className="text-foreground font-medium">{player.player_name}</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="Score"
                        min={0}
                        max={999}
                        value={playerScores[playerId] || ''}
                        onChange={(e) => handleScoreChange(playerId, e.target.value)}
                        className="w-20"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}

        {/* Session Details */}
        {selectedPlayers.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Timer className="w-5 h-5" />
                {t('sessions.details.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="duration" className="text-muted-foreground">
                    {t('sessions.details.duration.label')}
                    <span aria-hidden="true" className="text-destructive ml-0.5">*</span>
                  </Label>
                  {durationMissing && (
                    <span className="text-destructive text-xs">{t('sessions.details.duration.required')}</span>
                  )}
                </div>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={durationMissing ? 'border-destructive' : ''}
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-muted-foreground">{t('sessions.details.notes.label')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('sessions.details.notes.placeholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button onClick={() => requestNavigation('dashboard')} variant="outline" className="flex-1">
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit() || isSubmitting}
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            {isSubmitting ? t('sessions.submit.loading') : t('sessions.submit')}
          </Button>
        </div>
      </div>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={(open) => !open && cancelLeave()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sessions.leave.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('sessions.leave.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeave}>{t('sessions.leave.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>{t('sessions.leave.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
