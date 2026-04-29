import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const STORAGE_KEY = 'locale';
const DEFAULT_LOCALE = 'en';

interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [locale, setLocaleState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCALE
  );

  const setLocale = useCallback((newLocale: string) => {
    localStorage.setItem(STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
    queryClient.invalidateQueries({ queryKey: ['labels'] });
  }, [queryClient]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocaleContext(): LocaleContextValue {
  return useContext(LocaleContext);
}

