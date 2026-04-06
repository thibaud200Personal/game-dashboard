import { describe, it, expect } from 'vitest';
import { bggApiService } from '@/services/bggApi';
import type { BGGSearchResult, BGGGame } from '@/types';

// MSW handlers définis dans src/__tests__/mocks/server.ts
// - GET /api/v1/bgg/search?q=wingspan → [{ bgg_id: 266192, name: 'Wingspan', ... }]
// - GET /api/v1/bgg/game/266192       → mockWingspan (BGGGame complet)
// - GET /api/v1/bgg/game/999999999    → 404

describe('BGG API Service — searchGames', () => {
  it('retourne un tableau de BGGSearchResult', async () => {
    const results: BGGSearchResult[] = await bggApiService.searchGames('wingspan');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('chaque résultat a la structure BGGSearchResult', async () => {
    const results = await bggApiService.searchGames('wingspan');
    const r = results[0];
    expect(r).toHaveProperty('bgg_id');
    expect(r).toHaveProperty('name');
    expect(r).toHaveProperty('is_expansion');
    expect(typeof r.bgg_id).toBe('number');
    expect(typeof r.name).toBe('string');
    expect(typeof r.is_expansion).toBe('boolean');
  });

  it('retourne [] pour une query sans résultat', async () => {
    const results = await bggApiService.searchGames('zzznomatch');
    expect(results).toEqual([]);
  });
});

describe('BGG API Service — getGameDetails', () => {
  it('retourne un BGGGame complet pour un ID valide', async () => {
    const game: BGGGame = await bggApiService.getGameDetails(266192);
    expect(game).toBeDefined();
    expect(game.id).toBe(266192);
    expect(game.name).toBe('Wingspan');
    expect(game).toHaveProperty('min_players');
    expect(game).toHaveProperty('max_players');
    expect(game).toHaveProperty('expansions');
    expect(game).toHaveProperty('characters');
    expect(Array.isArray(game.expansions)).toBe(true);
    expect(Array.isArray(game.characters)).toBe(true);
  });

  it('lève une erreur pour un ID inconnu (404)', async () => {
    await expect(bggApiService.getGameDetails(999999999)).rejects.toThrow();
  });
});
