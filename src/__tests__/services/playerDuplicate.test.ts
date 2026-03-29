import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import apiService from '@/services/ApiService';

const server = setupServer(
  http.post('http://localhost:3001/api/players', async ({ request }) => {
    const body = await request.json() as { pseudo?: string };
    if (body.pseudo === 'alice42') {
      return HttpResponse.json(
        { error: 'duplicate_pseudo', message: 'Ce pseudo est déjà utilisé par un autre joueur' },
        { status: 409 }
      );
    }
    return HttpResponse.json({ player_id: 99, player_name: 'Test', pseudo: body.pseudo }, { status: 201 });
  }),

  http.put('http://localhost:3001/api/players/:id', async ({ request }) => {
    const body = await request.json() as { pseudo?: string };
    if (body.pseudo === 'alice42') {
      return HttpResponse.json(
        { error: 'duplicate_pseudo', message: 'Ce pseudo est déjà utilisé par un autre joueur' },
        { status: 409 }
      );
    }
    return HttpResponse.json({ player_id: 2, player_name: 'Bob', pseudo: body.pseudo });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Détection doublon pseudo joueur', () => {
  it('addPlayer — pseudo unique → succès', async () => {
    const result = await apiService.createPlayer({
      player_name: 'Charlie',
      pseudo: 'charlie99',
      avatar: '',
      favorite_game: '',
    } as any);
    expect(result).toMatchObject({ player_id: 99 });
  });

  it('addPlayer — pseudo déjà existant → throw duplicate_pseudo', async () => {
    await expect(
      apiService.createPlayer({
        player_name: 'Alice 2',
        pseudo: 'alice42',
        avatar: '',
        favorite_game: '',
      } as any)
    ).rejects.toThrow('duplicate_pseudo');
  });

  it('updatePlayer — pseudo déjà existant → throw duplicate_pseudo', async () => {
    await expect(
      apiService.updatePlayer(2, { pseudo: 'alice42' } as any)
    ).rejects.toThrow('duplicate_pseudo');
  });

  it('updatePlayer — pseudo unique → succès', async () => {
    const result = await apiService.updatePlayer(2, { pseudo: 'bob_new' } as any);
    expect(result).toMatchObject({ player_id: 2 });
  });
});
