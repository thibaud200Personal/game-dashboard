// src/__tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import {
  mockPlayers, mockGames, mockSessions,
  mockDashboard, mockGameStats,
} from '@/shared/__tests__/fixtures';
import enLabels from '@/shared/i18n/en.json';

// BGG game full details (used by BGGService / bggApi tests)
const mockWingspan = {
  id: 266192, name: 'Wingspan',
  description: 'Wingspan is a competitive, medium-weight, card-driven, engine-building board game.',
  image: 'https://cf.geekdo-images.com/test-large.jpg',
  thumbnail: 'https://cf.geekdo-images.com/test.jpg',
  min_players: 1, max_players: 5, playing_time: 70,
  min_playtime: 40, max_playtime: 70, min_age: 10,
  year_published: 2019, designers: ['Elizabeth Hargrave'],
  publishers: ['Stonemaier Games'], categories: ['Animals'],
  mechanics: ['Action Retrieval'], families: [],
  rating: 8.1, weight: 2.44, difficulty: 'Intermediate',
  expansions: [], characters: [],
  supports_cooperative: false, supports_competitive: true,
  supports_campaign: false, supports_hybrid: false, is_expansion: false,
};

export const handlers = [
  // ── Labels ────────────────────────────────────────────────────────────────
  // Only en.json is available as a test fixture — FR labels come from the DB at runtime.
  http.get('/api/v1/labels', ({ request }) => {
    const locale = new URL(request.url).searchParams.get('locale');
    return locale === 'fr'
      ? HttpResponse.json({}, { status: 404 })
      : HttpResponse.json(enLabels);
  }),

  // ── Auth ──────────────────────────────────────────────────────────────────
  http.get('/api/v1/auth/me', () => HttpResponse.json({ role: 'admin' })),

  // ── Players ───────────────────────────────────────────────────────────────
  http.get('/api/v1/players', () => HttpResponse.json(mockPlayers)),
  http.post('/api/v1/players', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    if (body.pseudo === 'alice42') {
      return HttpResponse.json({ error: 'duplicate_pseudo' }, { status: 409 });
    }
    return HttpResponse.json(
      { player_id: 99, player_name: body.player_name, pseudo: body.pseudo },
      { status: 201 }
    );
  }),
  http.put('/api/v1/players/:id', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    if (body.pseudo === 'alice42') {
      return HttpResponse.json({ error: 'duplicate_pseudo' }, { status: 409 });
    }
    return HttpResponse.json({ player_id: 1, ...body });
  }),
  http.delete('/api/v1/players/:id', () => new HttpResponse(null, { status: 204 })),

  // ── Games ─────────────────────────────────────────────────────────────────
  http.get('/api/v1/games', () => HttpResponse.json(mockGames)),
  http.post('/api/v1/games', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ game_id: 99, ...body, expansions: [], characters: [] }, { status: 201 });
  }),
  http.put('/api/v1/games/:id', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ game_id: 1, ...mockGames[0], ...body });
  }),
  http.delete('/api/v1/games/:id', () => new HttpResponse(null, { status: 204 })),
  http.post('/api/v1/games/:id/expansions', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ expansion_id: 99, game_id: 1, ...body }, { status: 201 });
  }),

  // ── Plays ─────────────────────────────────────────────────────────────────
  http.get('/api/v1/plays', () => HttpResponse.json(mockSessions)),
  http.post('/api/v1/plays', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ play_id: 99, ...body }, { status: 201 });
  }),
  http.delete('/api/v1/plays/:id', () => new HttpResponse(null, { status: 204 })),

  // ── Stats ─────────────────────────────────────────────────────────────────
  http.get('/api/v1/stats/dashboard', () => HttpResponse.json(mockDashboard)),
  http.get('/api/v1/stats/players', () => HttpResponse.json(mockPlayers)),
  http.get('/api/v1/stats/players/:id', ({ params }) => {
    const p = mockPlayers.find(p => p.player_id === Number(params.id));
    return p ? HttpResponse.json(p) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  http.get('/api/v1/stats/games', () => HttpResponse.json(mockGameStats)),
  http.get('/api/v1/stats/games/:id', ({ params }) => {
    const g = mockGameStats.find(g => g.game_id === Number(params.id));
    return g ? HttpResponse.json(g) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),

  // ── BGG ───────────────────────────────────────────────────────────────────
  http.get('/api/v1/bgg/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    if (!q || q.includes('zzz') || q.includes('nonexistent')) return HttpResponse.json([]);
    return HttpResponse.json([
      { bgg_id: 266192, name: 'Wingspan', year_published: 2019, is_expansion: false, thumbnail: '' },
    ]);
  }),
  http.get('/api/v1/bgg/game/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    if (id === 266192) return HttpResponse.json(mockWingspan);
    return HttpResponse.json({ error: 'Game not found on BGG' }, { status: 404 });
  }),

  // ── Legacy handlers (kept for backward compat with existing tests) ────────
  http.get('http://localhost:3001/api/players', () => HttpResponse.json(mockPlayers)),
  http.get('http://localhost:3001/api/games', () => HttpResponse.json(mockGames)),
];
