import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/__tests__/mocks/server';
import { useApiReachable } from '@/shared/hooks/useApiReachable';

describe('useApiReachable', () => {
  it('isReachable is true when /api/v1/health returns 200', async () => {
    server.use(http.get('/api/v1/health', () => HttpResponse.json({ ok: true }), { once: true }));
    const { result } = renderHook(() => useApiReachable());
    await waitFor(() => expect(result.current.isReachable).toBe(true));
  });

  it('isReachable is false when fetch throws (network error)', async () => {
    server.use(http.get('/api/v1/health', () => HttpResponse.error(), { once: true }));
    const { result } = renderHook(() => useApiReachable());
    await waitFor(() => expect(result.current.isReachable).toBe(false));
  });

  it('isReachable is false when /api/v1/health returns non-200', async () => {
    server.use(http.get('/api/v1/health', () => new HttpResponse(null, { status: 503 }), { once: true }));
    const { result } = renderHook(() => useApiReachable());
    await waitFor(() => expect(result.current.isReachable).toBe(false));
  });

  it('triggerRetry re-checks reachability', async () => {
    server.use(
      http.get('/api/v1/health', () => HttpResponse.error(), { once: true }),
      http.get('/api/v1/health', () => HttpResponse.json({ ok: true }), { once: true }),
    );
    const { result } = renderHook(() => useApiReachable());
    await waitFor(() => expect(result.current.isReachable).toBe(false));
    await act(async () => { result.current.triggerRetry(); });
    await waitFor(() => expect(result.current.isReachable).toBe(true));
  });
});
