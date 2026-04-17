import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

// Mock de l'interface MobileHook pour les tests
interface MockMobileHook {
  isMobile: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  );
};

// Fonction de render personnalisée avec providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };

// Utilitaires pour les tests
export const createMockNavigation = () => {
  const mockNavigation = vi.fn();
  return {
    onNavigation: mockNavigation,
    mockNavigation
  };
};

export const createMockMobile = (isMobile = false): MockMobileHook => ({
  isMobile
});

// Mock data communes
export const mockPlayers = [
  {
    player_id: 1,
    player_name: 'Alice',
    pseudo: 'alice42',
    avatar: 'avatar1.jpg',
    games_played: 10,
    wins: 5,
    total_score: 100,
    average_score: 10,
    win_percentage: 50,
    created_at: new Date('2024-01-01'),
    favorite_game: 'Wingspan'
  },
  {
    player_id: 2,
    player_name: 'Bob',
    pseudo: 'bob_gamer',
    avatar: 'avatar2.jpg',
    games_played: 5,
    wins: 2,
    total_score: 50,
    average_score: 10,
    win_percentage: 40,
    created_at: new Date('2024-01-02'),
    favorite_game: 'Azul'
  }
];

export const mockGames = [
  {
    game_id: 1,
    name: 'Wingspan',
    bgg_id: 266192,
    description: 'A beautiful bird-themed strategy game',
    image: 'wingspan.jpg',
    min_players: 1,
    max_players: 5,
    duration: '70 min',
    difficulty: 'Medium',
    category: 'Strategy',
    year_published: 2019,
    publisher: 'Stonemaier Games',
    designer: 'Elizabeth Hargrave',
    bgg_rating: 8.1,
    weight: 2.44,
    age_min: 10,
    supports_cooperative: false,
    supports_competitive: true,
    supports_campaign: false,
    supports_hybrid: false,
    has_expansion: true,
    has_characters: false,
    created_at: new Date('2024-01-01'),
    expansions: [],
    characters: [],
    players: '1-5'
  },
  {
    game_id: 2,
    name: 'Azul',
    bgg_id: 230802,
    description: 'A tile-laying strategy game',
    image: 'azul.jpg',
    min_players: 2,
    max_players: 4,
    duration: '45 min',
    difficulty: 'Easy',
    category: 'Abstract',
    year_published: 2017,
    publisher: 'Plan B Games',
    designer: 'Michael Kiesling',
    bgg_rating: 7.8,
    weight: 1.8,
    age_min: 8,
    supports_cooperative: false,
    supports_competitive: true,
    supports_campaign: false,
    supports_hybrid: false,
    has_expansion: true,
    has_characters: false,
    created_at: new Date('2024-01-02'),
    expansions: [],
    characters: [],
    players: '2-4'
  }
];

/** Rend un composant Page avec MemoryRouter + QueryClient frais + TooltipProvider. */
export function renderPage(ui: React.ReactElement, initialPath = '/') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <TooltipProvider>
          {ui}
        </TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

/** Wrapper pour renderHook avec QueryClient + MemoryRouter. */
export function createHookWrapper(initialPath = '/') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[initialPath]}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export const mockBGGGameData = {
  id: 266192,
  name: 'Wingspan',
  thumbnail: 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__thumb/img/test.jpg',
  description: 'Wingspan is a competitive, medium-weight, card-driven...',
  year_published: 2019,
  min_players: 1,
  max_players: 5,
  playing_time: 70,
  min_playtime: 40,
  max_playtime: 70,
  min_age: 10,
  categories: ['Animals'],
  mechanics: ['Action Retrieval'],
  average_rating: 8.1,
  average_weight: 2.44
};