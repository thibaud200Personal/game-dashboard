import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import apiService from '@/services/ApiService';

const EXISTING_BGG_ID = 174430;

const server = setupServer(
  http.post('http://localhost:3001/api/games', async ({ request }) => {
    const body = await request.json() as { bgg_id?: number };
    if (body.bgg_id === EXISTING_BGG_ID) {
      return HttpResponse.json(
        { error: 'duplicate_game', message: 'Ce jeu est déjà dans votre collection' },
        { status: 409 }
      );
    }
    return HttpResponse.json({ game_id: 99, name: 'Gloomhaven', bgg_id: body.bgg_id }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Détection doublon jeu', () => {
  it('createGame — bgg_id unique → succès', async () => {
    const result = await apiService.createGame({ name: 'Terraforming Mars', bgg_id: 167791 } as any);
    expect(result).toMatchObject({ game_id: 99 });
  });

  it('createGame — bgg_id déjà existant → throw duplicate_game', async () => {
    await expect(
      apiService.createGame({ name: 'Gloomhaven', bgg_id: EXISTING_BGG_ID } as any)
    ).rejects.toThrow('duplicate_game');
  });
});
