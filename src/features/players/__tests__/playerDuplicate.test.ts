import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/__tests__/mocks/server';
import { playerApi } from '../playerApi';

describe('Détection doublon pseudo joueur', () => {
  it('create — pseudo unique → succès', async () => {
    const result = await playerApi.create({
      player_name: 'Charlie',
      pseudo: 'charlie99',
      avatar: '',
      favorite_game: '',
    } as any);
    expect(result).toMatchObject({ player_id: expect.any(Number) });
  });

  it('create — pseudo déjà existant → throw duplicate_pseudo', async () => {
    server.use(
      http.post('/api/v1/players', async ({ request }) => {
        const body = await request.json() as { pseudo?: string };
        if (body.pseudo === 'alice42') {
          return HttpResponse.json(
            { error: 'duplicate_pseudo', message: 'Ce pseudo est déjà utilisé par un autre joueur' },
            { status: 409 }
          );
        }
        return HttpResponse.json({ player_id: 99, player_name: 'Test', pseudo: body.pseudo }, { status: 201 });
      })
    );

    await expect(
      playerApi.create({ player_name: 'Alice 2', pseudo: 'alice42', avatar: '', favorite_game: '' } as any)
    ).rejects.toThrow('duplicate_pseudo');
  });

  it('update — pseudo déjà existant → throw duplicate_pseudo', async () => {
    server.use(
      http.put('/api/v1/players/:id', async ({ request }) => {
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

    await expect(
      playerApi.update(2, { pseudo: 'alice42' } as any)
    ).rejects.toThrow('duplicate_pseudo');
  });

  it('update — pseudo unique → succès', async () => {
    const result = await playerApi.update(2, { pseudo: 'bob_new' } as any);
    expect(result).toMatchObject({ player_id: expect.any(Number) });
  });
});
