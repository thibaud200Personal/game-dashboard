import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/__tests__/mocks/server';
import { gameApi } from '../gameApi';

const EXISTING_BGG_ID = 174430;

describe('Détection doublon jeu', () => {
  it('create — bgg_id unique → succès', async () => {
    const result = await gameApi.create({ name: 'Terraforming Mars', bgg_id: 167791 } as any);
    expect(result).toMatchObject({ game_id: 99 });
  });

  it('create — bgg_id déjà existant → throw duplicate_game', async () => {
    server.use(
      http.post('/api/v1/games', async ({ request }) => {
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

    await expect(
      gameApi.create({ name: 'Gloomhaven', bgg_id: EXISTING_BGG_ID } as any)
    ).rejects.toThrow('duplicate_game');
  });
});
