// src/__tests__/hooks/usePlayersPage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlayersPage } from '@/features/players/usePlayersPage';
import { createHookWrapper } from '@/__tests__/utils/test-utils';
import { mockPlayers } from '@/__tests__/fixtures';

vi.mock('@/shared/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

const wrapper = createHookWrapper('/players');

describe('usePlayersPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('charge les joueurs au montage', async () => {
    const { result } = renderHook(() => usePlayersPage(), { wrapper });
    await waitFor(() => expect(result.current.players.length).toBeGreaterThan(0));
    expect(result.current.players[0].player_name).toBe('Alice');
  });

  it('filtre par searchQuery', async () => {
    const { result } = renderHook(() => usePlayersPage(), { wrapper });
    await waitFor(() => expect(result.current.players.length).toBe(2));
    act(() => result.current.setSearchQuery('bob'));
    expect(result.current.players).toHaveLength(1);
    expect(result.current.players[0].player_name).toBe('Bob');
  });

  it('handleAddDialogOpen(true) ouvre le dialog', () => {
    const { result } = renderHook(() => usePlayersPage(), { wrapper });
    act(() => result.current.handleAddDialogOpen(true));
    expect(result.current.isAddDialogOpen).toBe(true);
  });

  it('handleAddDialogOpen(false) ferme et nettoie addPlayerError', async () => {
    const { result } = renderHook(() => usePlayersPage(), { wrapper });
    act(() => {
      result.current.handleAddDialogOpen(true);
      result.current.setFormData({ player_name: 'Alice', pseudo: 'alice42', avatar: '', favorite_game: '' });
    });
    await act(async () => { await result.current.handleAddPlayer(); });
    expect(result.current.addPlayerError).toBeTruthy();
    act(() => result.current.handleAddDialogOpen(false));
    expect(result.current.addPlayerError).toBeNull();
    expect(result.current.isAddDialogOpen).toBe(false);
  });

  it('handleAddPlayer — pseudo dupliqué → addPlayerError défini', async () => {
    const { result } = renderHook(() => usePlayersPage(), { wrapper });
    act(() => {
      result.current.setFormData({ player_name: 'Alice', pseudo: 'alice42', avatar: '', favorite_game: '' });
    });
    await act(async () => { await result.current.handleAddPlayer(); });
    expect(result.current.addPlayerError).toBe('Ce pseudo est déjà utilisé par un autre joueur.');
  });

  it('handleAddPlayer — succès → dialog fermé, erreur nulle', async () => {
    const { result } = renderHook(() => usePlayersPage(), { wrapper });
    act(() => {
      result.current.handleAddDialogOpen(true);
      result.current.setFormData({ player_name: 'Charlie', pseudo: 'charlie99', avatar: '', favorite_game: '' });
    });
    await act(async () => { await result.current.handleAddPlayer(); });
    expect(result.current.addPlayerError).toBeNull();
    expect(result.current.isAddDialogOpen).toBe(false);
  });

  it('handleEditPlayer peuple le formulaire', async () => {
    const { result } = renderHook(() => usePlayersPage(), { wrapper });
    await waitFor(() => expect(result.current.players.length).toBeGreaterThan(0));
    act(() => result.current.handleEditPlayer(mockPlayers[0] as any));
    expect(result.current.formData.player_name).toBe('Alice');
    expect(result.current.isEditDialogOpen).toBe(true);
  });

  it("handleDeletePlayer appelle l'API sans bloquer", async () => {
    const { result } = renderHook(() => usePlayersPage(), { wrapper });
    await waitFor(() => expect(result.current.players.length).toBeGreaterThan(0));
    await act(async () => result.current.handleDeletePlayer(1));
    // Pas d'erreur levée
  });
});
