import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const mockWingspan = {
  id: 266192,
  name: 'Wingspan',
  description: 'Wingspan is a competitive, medium-weight, card-driven, engine-building board game.',
  image: 'https://cf.geekdo-images.com/test-large.jpg',
  thumbnail: 'https://cf.geekdo-images.com/test.jpg',
  min_players: 1,
  max_players: 5,
  playing_time: 70,
  min_playtime: 40,
  max_playtime: 70,
  min_age: 10,
  year_published: 2019,
  designers: ['Elizabeth Hargrave'],
  publishers: ['Stonemaier Games'],
  categories: ['Animals'],
  mechanics: ['Action Retrieval'],
  families: [],
  rating: 8.1,
  weight: 2.44,
  difficulty: 'Intermediate',
  expansions: [],
  characters: [],
  supports_cooperative: false,
  supports_competitive: true,
  supports_campaign: false,
  supports_hybrid: false,
  is_expansion: false,
};

export const handlers = [
  // BGG search proxy — backend route
  http.get('http://localhost:3001/api/bgg/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    if (!q) return HttpResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    if (q.includes('zzz') || q.includes('nonexistent')) return HttpResponse.json([]);
    return HttpResponse.json([
      { id: 266192, name: 'Wingspan', year_published: 2019, type: 'boardgame' }
    ]);
  }),

  // BGG game details proxy — backend route
  http.get('http://localhost:3001/api/bgg/game/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    if (id === 266192) return HttpResponse.json(mockWingspan);
    return HttpResponse.json({ error: 'Game not found on BGG' }, { status: 404 });
  }),

  // Mock API locale pour les tests
  http.get('http://localhost:3001/api/players', () => {
    return HttpResponse.json([
      { id: 1, name: 'Alice', email: 'alice@test.com' },
      { id: 2, name: 'Bob', email: 'bob@test.com' }
    ]);
  }),

  http.get('http://localhost:3001/api/games', () => {
    return HttpResponse.json([
      { id: 1, name: 'Wingspan', bgg_id: 266192, min_players: 1, max_players: 5 }
    ]);
  }),
];

// Setup server avec les handlers
export const server = setupServer(...handlers);