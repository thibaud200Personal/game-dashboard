import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

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
