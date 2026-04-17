import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLabels } from '@/shared/hooks/useLabels';
import { createHookWrapper } from '@/__tests__/utils/test-utils';

vi.mock('@/shared/services/api/labelsApi', () => ({
  labelsApi: {
    fetchLabels: vi.fn(),
    fetchLocales: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useLocale', () => ({
  useLocale: () => ['en', vi.fn()],
  getStoredLocale: () => 'en',
}));

const wrapper = createHookWrapper('/');

describe('useLabels', () => {
  beforeEach(() => vi.clearAllMocks());

  it('t() returns the value from the API response', async () => {
    const { labelsApi } = await import('@/shared/services/api/labelsApi');
    vi.mocked(labelsApi.fetchLabels).mockResolvedValue({
      'games.page.title': 'Games',
      'common.buttons.save': 'Save',
    });
    const { result } = renderHook(() => useLabels(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.t('games.page.title')).toBe('Games');
  });

  it('t() returns fallback string when key is missing', async () => {
    const { labelsApi } = await import('@/shared/services/api/labelsApi');
    vi.mocked(labelsApi.fetchLabels).mockResolvedValue({});
    const { result } = renderHook(() => useLabels(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.t('missing.key', 'Default')).toBe('Default');
  });

  it('t() returns key name when key missing and no fallback provided', async () => {
    const { labelsApi } = await import('@/shared/services/api/labelsApi');
    vi.mocked(labelsApi.fetchLabels).mockResolvedValue({});
    const { result } = renderHook(() => useLabels(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.t('missing.key')).toBe('missing.key');
  });

  it('falls back to en.json when API call fails', async () => {
    const { labelsApi } = await import('@/shared/services/api/labelsApi');
    vi.mocked(labelsApi.fetchLabels).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useLabels(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // en.json has games.page.title = "Games"
    expect(result.current.t('games.page.title')).toBe('Games');
  });
});
