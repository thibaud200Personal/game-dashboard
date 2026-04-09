// src/__tests__/hooks/useDashboard.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from '@/hooks/useDashboard';
import { createHookWrapper } from '@/__tests__/utils/test-utils';

vi.mock('@/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

const wrapper = createHookWrapper('/');

describe('useDashboard', () => {
  it('charge les joueurs et les jeux', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    await waitFor(() => expect(result.current.stats.loading).toBe(false));
    expect(result.current.stats.playersCount).toBe(2);
    expect(result.current.stats.gamesCount).toBe(2);
    expect(result.current.stats.error).toBeNull();
  });

  it('dashboard contient les compteurs globaux', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    await waitFor(() => expect(result.current.dashboard).toBeDefined());
    expect(result.current.dashboard?.total_sessions).toBe(1);
    expect(result.current.dashboard?.average_session_duration).toBe(70);
  });

  it('recentPlayers retourne au max 3 joueurs', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    await waitFor(() => expect(result.current.stats.loading).toBe(false));
    expect(result.current.recentPlayers.length).toBeLessThanOrEqual(3);
  });

  it('recentGames retourne au max 3 jeux', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    await waitFor(() => expect(result.current.stats.loading).toBe(false));
    expect(result.current.recentGames.length).toBeLessThanOrEqual(3);
  });
});
