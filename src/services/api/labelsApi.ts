import type { LocaleInfo } from '@/types';

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const labelsApi = {
  fetchLabels: (locale: string): Promise<Record<string, string>> =>
    request<Record<string, string>>(`/api/v1/labels?locale=${encodeURIComponent(locale)}`),

  fetchLocales: (): Promise<LocaleInfo[]> =>
    request<LocaleInfo[]>('/api/v1/labels/locales'),
};
