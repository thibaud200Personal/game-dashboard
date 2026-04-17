import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLocales } from '@/shared/hooks/useLocales';
import { createHookWrapper } from '@/__tests__/utils/test-utils';

vi.mock('@/shared/services/api/labelsApi', () => ({
  labelsApi: {
    fetchLabels: vi.fn(),
    fetchLocales: vi.fn(),
  },
}));

describe('useLocales', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns locale list from API when reachable', async () => {
    const { labelsApi } = await import('@/shared/services/api/labelsApi');
    vi.mocked(labelsApi.fetchLocales).mockResolvedValue([
      { locale: 'en', name: 'English' },
      { locale: 'fr', name: 'Français' },
    ]);
    const { result } = renderHook(() => useLocales(true), { wrapper: createHookWrapper('/') });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.locales).toHaveLength(2);
    expect(result.current.locales[0].locale).toBe('en');
  });

  it('returns empty array and does not fetch when not reachable', async () => {
    const { labelsApi } = await import('@/shared/services/api/labelsApi');
    vi.mocked(labelsApi.fetchLocales).mockResolvedValue([]);
    const { result } = renderHook(() => useLocales(false), { wrapper: createHookWrapper('/') });
    expect(result.current.locales).toEqual([]);
    expect(labelsApi.fetchLocales).not.toHaveBeenCalled();
  });
});
