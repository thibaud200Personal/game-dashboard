import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/__tests__/mocks/server';

describe('request() — cas nominaux', () => {
  beforeEach(() => vi.resetModules());

  it('retourne les données JSON sur 200', async () => {
    server.use(
      http.get('/api/test', () => HttpResponse.json({ ok: true }), { once: true })
    );
    const { request } = await import('@/shared/services/api/request');
    const data = await request<{ ok: boolean }>('/api/test');
    expect(data.ok).toBe(true);
  });

  it('retourne undefined sur 204', async () => {
    server.use(
      http.get('/api/test', () => new HttpResponse(null, { status: 204 }), { once: true })
    );
    const { request } = await import('@/shared/services/api/request');
    const data = await request('/api/test');
    expect(data).toBeUndefined();
  });

  it('throw sur erreur non-401', async () => {
    server.use(
      http.get('/api/test', () => HttpResponse.json({ error: 'Not found' }, { status: 404 }), { once: true })
    );
    const { request } = await import('@/shared/services/api/request');
    await expect(request('/api/test')).rejects.toThrow('Not found');
  });
});

describe('request() — intercepteur 401', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    // Restore window.location to a valid object so subsequent tests can use fetch with relative URLs
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/', assign: vi.fn(), replace: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  it('401 → appelle /auth/refresh → retry → retourne données', async () => {
    server.use(
      http.get('/api/test', () => new HttpResponse(null, { status: 401 }), { once: true }),
      http.post('/api/v1/auth/refresh', () => HttpResponse.json({ role: 'admin' }), { once: true }),
      http.get('/api/test', () => HttpResponse.json({ ok: true }), { once: true }),
    );
    const { request } = await import('@/shared/services/api/request');
    const data = await request<{ ok: boolean }>('/api/test');
    expect(data.ok).toBe(true);
  });

  it('401 + refresh 401 → redirect /login', async () => {
    let redirectedTo = '';
    const locationMock = { _href: 'http://localhost/' };
    Object.defineProperty(locationMock, 'href', {
      get() { return this._href; },
      set(v: string) { redirectedTo = v; this._href = v; },
    });
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
    });

    server.use(
      http.get('/api/test', () => new HttpResponse(null, { status: 401 }), { once: true }),
      http.post('/api/v1/auth/refresh', () => new HttpResponse(null, { status: 401 }), { once: true }),
    );

    const { request } = await import('@/shared/services/api/request');
    await expect(request('/api/test')).rejects.toThrow();
    expect(redirectedTo).toBe('/login');
  });

  it('deux 401 simultanés → un seul appel /auth/refresh', async () => {
    let refreshCount = 0;
    server.use(
      http.get('/api/test', () => new HttpResponse(null, { status: 401 })),
      http.post('/api/v1/auth/refresh', () => {
        refreshCount++;
        return HttpResponse.json({ role: 'admin' });
      }),
    );

    const { request } = await import('@/shared/services/api/request');
    await Promise.allSettled([request('/api/test'), request('/api/test')]);
    expect(refreshCount).toBe(1);
  });
});
