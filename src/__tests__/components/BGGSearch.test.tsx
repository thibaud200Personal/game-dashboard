import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BGGSearch from '../../components/BGGSearch';
import * as bggApi from '../../services/bggApi';

// Mock du service BGG API
vi.mock('../../services/bggApi');
const mockedBggApi = vi.mocked(bggApi);

describe('BGGSearch', () => {
  const mockOnGameSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input and button', () => {
    render(<BGGSearch onGameSelect={mockOnGameSelect} onClose={mockOnClose} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name or enter bgg id/i)).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    const user = userEvent.setup();
    render(<BGGSearch onGameSelect={mockOnGameSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'Catan');
    
    expect(searchInput).toHaveValue('Catan');
  });

  it('should perform search on Enter key press', async () => {
    const mockSearchResults = [
      {
        id: '13',
        name: 'Catan',
        year: 1995,
        thumbnail: 'https://example.com/catan.jpg'
      }
    ];

    mockedBggApi.bggApiService = {
      searchGames: vi.fn().mockResolvedValue(mockSearchResults),
      getGameDetails: vi.fn()
    } as any;

    const user = userEvent.setup();
    render(<BGGSearch onGameSelect={mockOnGameSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByRole('textbox');
    
    await user.type(searchInput, 'Catan');
    await user.keyboard('{Enter}');
    
    expect(mockedBggApi.bggApiService.searchGames).toHaveBeenCalledWith('Catan');
    
    await waitFor(() => {
      expect(screen.getByText('Catan')).toBeInTheDocument();
    });
  });

  it('should enable button when there is text', async () => {
    const user = userEvent.setup();
    render(<BGGSearch onGameSelect={mockOnGameSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByRole('textbox');
    const searchButton = screen.getByRole('button');
    
    // Button should be disabled initially
    expect(searchButton).toBeDisabled();
    
    // Type some text
    await user.type(searchInput, 'Catan');
    
    // Button should now be enabled
    expect(searchButton).not.toBeDisabled();
  });

  it('should display searching state', async () => {
    // Mock une promesse qui ne se résout pas immédiatement
    let resolveSearch: any;
    const searchPromise = new Promise((resolve) => {
      resolveSearch = resolve;
    });

    mockedBggApi.bggApiService = {
      searchGames: vi.fn().mockReturnValue(searchPromise),
      getGameDetails: vi.fn()
    } as any;

    const user = userEvent.setup();
    render(<BGGSearch onGameSelect={mockOnGameSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByRole('textbox');
    
    // Wrap user interactions in act
    await act(async () => {
      await user.type(searchInput, 'Catan');
      await user.keyboard('{Enter}');
    });
    
    // Vérifier que l'input est désactivé pendant la recherche
    expect(screen.getByRole('textbox')).toBeDisabled();
    
    // Vérifier qu'il y a une icône qui tourne (animation de chargement)
    const spinningIcon = document.querySelector('.animate-spin');
    expect(spinningIcon).toBeInTheDocument();
    
    // Resolve la promesse pour nettoyer
    act(() => {
      resolveSearch([]);
    });
  });

  it('should handle search errors gracefully', async () => {
    mockedBggApi.bggApiService = {
      searchGames: vi.fn().mockRejectedValue(new Error('API Error')),
      getGameDetails: vi.fn()
    } as any;

    const user = userEvent.setup();
    render(<BGGSearch onGameSelect={mockOnGameSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(searchInput, 'Catan');
      await user.keyboard('{Enter}');
    });
    
    await waitFor(() => {
      expect(screen.getByText(/failed.*search/i)).toBeInTheDocument();
    });
  });
});