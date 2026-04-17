import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGamesPage } from '@/features/games/useGamesPage';
import { mockGames } from '@/shared/__tests__/utils/test-utils';

vi.mock('@/features/games/gameApi', () => ({
  gameApi: {
    getAll:          vi.fn(),
    create:          vi.fn(),
    update:          vi.fn(),
    delete:          vi.fn(),
    addExpansion:    vi.fn(),
    deleteExpansion: vi.fn(),
    addCharacter:    vi.fn(),
    deleteCharacter: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useGamesPage', async () => {
  const { gameApi } = await import('@/features/games/gameApi');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(gameApi.getAll).mockResolvedValue(mockGames as any);
    vi.mocked(gameApi.create).mockResolvedValue({ game_id: 99, name: 'Test Game' } as any);
    vi.mocked(gameApi.update).mockResolvedValue({} as any);
    vi.mocked(gameApi.delete).mockResolvedValue(undefined);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGamesPage(), { wrapper });
    expect(result.current.searchQuery).toBe('');
    expect(result.current.categoryFilter).toBe('all');
    expect(result.current.difficultyFilter).toBe('all');
    expect(result.current.isAddDialogOpen).toBe(false);
    expect(result.current.isEditDialogOpen).toBe(false);
    expect(result.current.formData).toBeDefined();
  });

  it('should handle search query changes', () => {
    const { result } = renderHook(() => useGamesPage(), { wrapper });
    act(() => { result.current.setSearchQuery('wingspan'); });
    expect(result.current.searchQuery).toBe('wingspan');
  });

  it('should handle category filter changes', () => {
    const { result } = renderHook(() => useGamesPage(), { wrapper });
    act(() => { result.current.setCategoryFilter('strategy'); });
    expect(result.current.categoryFilter).toBe('strategy');
  });

  it('should handle dialog state changes', () => {
    const { result } = renderHook(() => useGamesPage(), { wrapper });
    act(() => { result.current.handleAddDialogOpen(true); });
    expect(result.current.isAddDialogOpen).toBe(true);
    act(() => { result.current.handleEditDialogOpen(true); });
    expect(result.current.isEditDialogOpen).toBe(true);
  });

  it('should reset form data', () => {
    const { result } = renderHook(() => useGamesPage(), { wrapper });
    act(() => { result.current.resetForm(); });
    expect(result.current.formData.name).toBe('');
  });

  it('handleBGGSearch — bgg_id déjà dans la collection → addGameError défini', async () => {
    const { result } = renderHook(() => useGamesPage(), { wrapper });
    await waitFor(() => expect(result.current.games.length).toBeGreaterThan(0));
    act(() => {
      result.current.handleBGGSearch({ id: 266192, name: 'Wingspan' } as any);
    });
    expect(result.current.addGameError).toBe('Ce jeu est déjà dans votre collection.');
  });

  it("handleBGGSearch — bgg_id nouveau → pas d'addGameError", async () => {
    const { result } = renderHook(() => useGamesPage(), { wrapper });
    await waitFor(() => expect(result.current.games.length).toBeGreaterThan(0));
    act(() => {
      result.current.handleBGGSearch({ id: 999999, name: 'New Game' } as any);
    });
    expect(result.current.addGameError).toBeNull();
  });

  it('handleAddGame — erreur duplicate_game → addGameError défini, dialog reste ouverte', async () => {
    vi.mocked(gameApi.create).mockRejectedValueOnce(new Error('duplicate_game'));
    const { result } = renderHook(() => useGamesPage(), { wrapper });

    act(() => {
      result.current.handleAddDialogOpen(true);
      result.current.setFormData({ ...result.current.formData, name: 'Wingspan' });
    });
    await act(async () => { await result.current.handleAddGame(); });

    expect(result.current.addGameError).toBe('Ce jeu est déjà dans votre collection.');
    expect(result.current.isAddDialogOpen).toBe(true);
  });

  it('handleAddGame — erreur générique → message générique', async () => {
    vi.mocked(gameApi.create).mockRejectedValueOnce(new Error('network_error'));
    const { result } = renderHook(() => useGamesPage(), { wrapper });

    act(() => {
      result.current.setFormData({ ...result.current.formData, name: 'Wingspan' });
    });
    await act(async () => { await result.current.handleAddGame(); });

    expect(result.current.addGameError).toBe('Une erreur est survenue. Veuillez réessayer.');
  });

  it('handleAddDialogOpen(false) — clear addGameError', async () => {
    vi.mocked(gameApi.create).mockRejectedValueOnce(new Error('duplicate_game'));
    const { result } = renderHook(() => useGamesPage(), { wrapper });

    act(() => {
      result.current.handleAddDialogOpen(true);
      result.current.setFormData({ ...result.current.formData, name: 'Wingspan' });
    });
    await act(async () => { await result.current.handleAddGame(); });
    expect(result.current.addGameError).toBeTruthy();

    act(() => { result.current.handleAddDialogOpen(false); });
    expect(result.current.addGameError).toBeNull();
  });
});
