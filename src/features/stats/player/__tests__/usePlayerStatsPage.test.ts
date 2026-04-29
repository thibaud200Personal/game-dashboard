// src/__tests__/hooks/usePlayerStatsPage.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePlayerStatsPage } from '@/features/stats/player/usePlayerStatsPage';
import { mockPlayers, mockGames } from '@/shared/__tests__/fixtures';

describe('usePlayerStatsPage', () => {
  it('retourne tous les joueurs sans filtre', () => {
    const { result } = renderHook(() => usePlayerStatsPage(mockPlayers as any, mockGames as any));
    expect(result.current.displayPlayers).toHaveLength(2);
  });

  it('filtre sur un joueur spécifique via selectedPlayerId', () => {
    const { result } = renderHook(() => usePlayerStatsPage(mockPlayers as any, mockGames as any, 1));
    expect(result.current.displayPlayers).toHaveLength(1);
    expect(result.current.displayPlayers[0].player_name).toBe('Alice');
  });

  it('stats.totalPlayers correspond au nombre de joueurs affichés', () => {
    const { result } = renderHook(() => usePlayerStatsPage(mockPlayers as any, mockGames as any));
    expect(result.current.stats.totalPlayers).toBe(2);
  });

  it('topPlayers trié par total_score décroissant', () => {
    const { result } = renderHook(() => usePlayerStatsPage(mockPlayers as any, mockGames as any));
    const scores = result.current.topPlayers.map((p: any) => p.total_score);
    expect(scores[0]).toBeGreaterThanOrEqual(scores[scores.length - 1]);
  });

  it('selectedPlayer est null sans selectedPlayerId', () => {
    const { result } = renderHook(() => usePlayerStatsPage(mockPlayers as any, mockGames as any));
    expect(result.current.selectedPlayer).toBeNull();
  });

  it('recentActivity absent du hook (géré par PlayerStatsPage)', () => {
    const { result } = renderHook(() => usePlayerStatsPage(mockPlayers as any, mockGames as any));
    expect(result.current).not.toHaveProperty('recentActivity');
  });
});
