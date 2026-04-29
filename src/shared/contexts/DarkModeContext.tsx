import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'darkMode';

interface DarkModeContextValue {
  darkMode: boolean;
  toggleDarkMode: (enabled: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextValue>({
  darkMode: true,
  toggleDarkMode: () => {},
});

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode: setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDarkMode(): DarkModeContextValue {
  return useContext(DarkModeContext);
}
