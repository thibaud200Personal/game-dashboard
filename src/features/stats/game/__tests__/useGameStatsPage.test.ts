// src/__tests__/hooks/useGameStatsPage.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStatsPage } from '@/features/stats/game/useGameStatsPage';
import { mockGames, mockPlayers } from '@/shared/__tests__/fixtures';

describe('useGameStatsPage', () => {
  it('initialise avec selectedGame=null (stats globales)', () => {
    const { result } = renderHook(() => useGameStatsPage(mockGames as any, mockPlayers as any));
    expect(result.current.selectedGame).toBeNull();
    expect(result.current.gameStats.isGlobalStats).toBe(true);
  });

  it('sélectionner un jeu filtre les stats', () => {
    const { result } = renderHook(() => useGameStatsPage(mockGames as any, mockPlayers as any));
    act(() => result.current.setSelectedGame(mockGames[0] as any));
    expect(result.current.selectedGame?.name).toBe('Wingspan');
    expect(result.current.gameStats.isGlobalStats).toBe(false);
  });

  it('gameStats.totalSessions est un nombre', () => {
    const { result } = renderHook(() => useGameStatsPage(mockGames as any, mockPlayers as any));
    expect(typeof result.current.gameStats.totalSessions).toBe('number');
  });

  it('setSelectedPeriod met à jour la période', () => {
    const { result } = renderHook(() => useGameStatsPage(mockGames as any, mockPlayers as any));
    act(() => result.current.setSelectedPeriod('year'));
    expect(result.current.selectedPeriod).toBe('year');
  });

  it('selectedGameId initial pré-sélectionne le jeu', () => {
    const { result } = renderHook(() => useGameStatsPage(mockGames as any, mockPlayers as any, 1));
    expect(result.current.selectedGame?.game_id).toBe(1);
  });
});
