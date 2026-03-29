import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamesPage } from '@/hooks/useGamesPage';
import { mockGames, mockPlayers } from '@/__tests__/utils/test-utils';

// Mock des dépendances
vi.mock('@/hooks/use-mobile', () => ({
  useMobile: () => ({ isMobile: false })
}));

describe('useGamesPage', () => {
  const defaultProps = {
    games: mockGames,
    players: mockPlayers,
    onAddGame: vi.fn(),
    onEditGame: vi.fn(),
    onUpdateGame: vi.fn(),
    onDeleteGame: vi.fn(),
    onNavigation: vi.fn(),
    onAddExpansion: vi.fn(),
    onEditExpansion: vi.fn(),
    onUpdateExpansion: vi.fn(),
    onDeleteExpansion: vi.fn(),
    onAddCharacter: vi.fn(),
    onEditCharacter: vi.fn(),
    onUpdateCharacter: vi.fn(),
    onDeleteCharacter: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    expect(result.current.searchQuery).toBe('');
    expect(result.current.categoryFilter).toBe('all'); // Hook initializes with 'all'
    expect(result.current.difficultyFilter).toBe('all'); // Hook initializes with 'all'
    expect(result.current.isAddDialogOpen).toBe(false);
    expect(result.current.isEditDialogOpen).toBe(false);
    expect(result.current.formData).toBeDefined();
  });

  it('should handle search query changes', () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    act(() => {
      result.current.setSearchQuery('wingspan');
    });

    expect(result.current.searchQuery).toBe('wingspan');
  });

  it('should handle category filter changes', () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    act(() => {
      result.current.setCategoryFilter('strategy');
    });

    expect(result.current.categoryFilter).toBe('strategy');
  });

  it('should handle dialog state changes', () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    act(() => {
      result.current.handleAddDialogOpen(true);
    });

    expect(result.current.isAddDialogOpen).toBe(true);

    act(() => {
      result.current.handleEditDialogOpen(true);
    });

    expect(result.current.isEditDialogOpen).toBe(true);
  });

  it('should call onAddGame when adding a game', async () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    // Set valid form data first
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        name: 'Test Game'
      });
    });

    await act(async () => {
      await result.current.handleAddGame();
    });

    expect(defaultProps.onAddGame).toHaveBeenCalled();
  });

  it('should filter games by search query', () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    act(() => {
      result.current.setSearchQuery('wingspan');
    });

    expect(result.current.games).toHaveLength(1);
    expect(result.current.games[0].name).toBe('Wingspan');
  });

  it('should reset form data', () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData.name).toBe('');
  });

  it('handleAddGame — erreur duplicate_game → addGameError défini, dialog reste ouverte', async () => {
    const onAddGame = vi.fn().mockRejectedValue(new Error('duplicate_game'));
    const { result } = renderHook(() => useGamesPage({ ...defaultProps, onAddGame }));

    act(() => {
      result.current.handleAddDialogOpen(true);
      result.current.setFormData({ ...result.current.formData, name: 'Wingspan' });
    });

    await act(async () => {
      await result.current.handleAddGame();
    });

    expect(result.current.addGameError).toBe('Ce jeu est déjà dans votre collection.');
    expect(result.current.isAddDialogOpen).toBe(true);
  });

  it('handleAddGame — erreur générique → message générique', async () => {
    const onAddGame = vi.fn().mockRejectedValue(new Error('network_error'));
    const { result } = renderHook(() => useGamesPage({ ...defaultProps, onAddGame }));

    act(() => {
      result.current.setFormData({ ...result.current.formData, name: 'Wingspan' });
    });

    await act(async () => {
      await result.current.handleAddGame();
    });

    expect(result.current.addGameError).toBe('Une erreur est survenue. Veuillez réessayer.');
  });

  it('handleBGGSearch — bgg_id déjà dans la collection → addGameError défini', () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    act(() => {
      result.current.handleBGGSearch({ id: 266192, name: 'Wingspan' } as any);
    });

    expect(result.current.addGameError).toBe('Ce jeu est déjà dans votre collection.');
  });

  it('handleBGGSearch — bgg_id nouveau → pas d\'addGameError', () => {
    const { result } = renderHook(() => useGamesPage(defaultProps));

    act(() => {
      result.current.handleBGGSearch({ id: 999999, name: 'New Game' } as any);
    });

    expect(result.current.addGameError).toBeNull();
  });

  it('handleAddDialogOpen(false) — clear addGameError', async () => {
    const onAddGame = vi.fn().mockRejectedValue(new Error('duplicate_game'));
    const { result } = renderHook(() => useGamesPage({ ...defaultProps, onAddGame }));

    act(() => {
      result.current.handleAddDialogOpen(true);
      result.current.setFormData({ ...result.current.formData, name: 'Wingspan' });
    });
    await act(async () => {
      await result.current.handleAddGame();
    });
    expect(result.current.addGameError).toBeTruthy();

    act(() => {
      result.current.handleAddDialogOpen(false);
    });
    expect(result.current.addGameError).toBeNull();
  });
});