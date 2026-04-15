import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const STORAGE_KEY = 'locale';
const DEFAULT_LOCALE = 'en';

export function getStoredLocale(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCALE;
}

export function useLocale(): [string, (locale: string) => void] {
  const queryClient = useQueryClient();
  const locale = getStoredLocale();

  const setLocale = useCallback((newLocale: string) => {
    localStorage.setItem(STORAGE_KEY, newLocale);
    queryClient.invalidateQueries({ queryKey: ['labels'] });
  }, [queryClient]);

  return [locale, setLocale];
}
