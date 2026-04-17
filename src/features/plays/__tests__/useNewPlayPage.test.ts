// src/__tests__/hooks/useNewGamePage.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNewGamePage } from '@/features/plays/useNewPlayPage';
import { createHookWrapper } from '@/shared/__tests__/utils/test-utils';

vi.mock('@/shared/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

// Sonner toast ne doit pas lever d'erreur en jsdom
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const wrapper = createHookWrapper('/plays/new');

describe('useNewGamePage', () => {
  it('charge les jeux et les joueurs', async () => {
    const { result } = renderHook(() => useNewGamePage(), { wrapper });
    await waitFor(() => expect(result.current.games.length).toBeGreaterThan(0));
    expect(result.current.players.length).toBeGreaterThan(0);
  });

  it('sélectionner un jeu met à jour selectedGame', async () => {
    const { result } = renderHook(() => useNewGamePage(), { wrapper });
    await waitFor(() => expect(result.current.games.length).toBeGreaterThan(0));
    act(() => result.current.setSelectedGameId('1'));
    expect(result.current.selectedGame?.name).toBe('Wingspan');
  });

  it('handlePlayerToggle ajoute et retire un joueur', () => {
    const { result } = renderHook(() => useNewGamePage(), { wrapper });
    act(() => result.current.handlePlayerToggle(1));
    expect(result.current.selectedPlayers).toContain(1);
    act(() => result.current.handlePlayerToggle(1));
    expect(result.current.selectedPlayers).not.toContain(1);
  });

  it('canSubmit est false sans jeu sélectionné', () => {
    const { result } = renderHook(() => useNewGamePage(), { wrapper });
    expect(result.current.canSubmit()).toBe(false);
  });

  it('resetForm vide tous les champs', async () => {
    const { result } = renderHook(() => useNewGamePage(), { wrapper });
    await waitFor(() => expect(result.current.games.length).toBeGreaterThan(0));
    act(() => {
      result.current.setSelectedGameId('1');
      result.current.handlePlayerToggle(1);
      result.current.setDuration('60');
    });
    act(() => result.current.resetForm());
    expect(result.current.selectedGameId).toBe('');
    expect(result.current.selectedPlayers).toHaveLength(0);
    expect(result.current.duration).toBe('');
  });

  it('handleSubmit crée la session si canSubmit', async () => {
    const { result } = renderHook(() => useNewGamePage(), { wrapper });
    await waitFor(() => expect(result.current.games.length).toBeGreaterThan(0));
    act(() => {
      result.current.setSelectedGameId('1');
      result.current.handlePlayerToggle(1);
      result.current.setWinnerId('1');
      result.current.handleScoreChange(1, '50');
      result.current.setDuration('60');
    });
    const res = await act(async () => result.current.handleSubmit());
    expect(res.success).toBe(true);
  });
});
