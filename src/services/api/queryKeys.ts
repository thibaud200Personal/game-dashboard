export const queryKeys = {
  players: {
    all: ['players'] as const,
    detail: (id: number) => ['players', id] as const,
  },
  games: {
    all: ['games'] as const,
    detail: (id: number) => ['games', id] as const,
  },
  sessions: {
    all: ['sessions'] as const,
  },
  stats: {
    dashboard: ['stats', 'dashboard'] as const,
    players: ['stats', 'players'] as const,
    player: (id: number) => ['stats', 'players', id] as const,
    games: ['stats', 'games'] as const,
    game: (id: number) => ['stats', 'games', id] as const,
  },
  bgg: {
    search: (q: string) => ['bgg', 'search', q] as const,
    importStatus: ['bgg', 'import-status'] as const,
  },
} as const
