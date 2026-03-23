# Sprint 3 — Thème Sombre/Clair (Persistance)

## Problème
`darkMode` est géré comme state local dans `App.tsx` et propagé manuellement en prop à chaque composant. La préférence est perdue au rechargement de la page (aucun localStorage).

## État actuel

### `src/App.tsx` (lignes 19–26)
```typescript
const [darkMode, setDarkMode] = useState(true); // toujours dark au démarrage
useEffect(() => {
  document.body.classList.toggle('dark', darkMode);
}, [darkMode]);
```
`darkMode` et `setDarkMode` sont passés manuellement en props à : Dashboard, PlayersPage, GamesPage, SettingsPage, StatsPage, GameDetailPage.

### `src/views/SettingsPageView.tsx` (lignes 96–108)
```tsx
<Switch checked={props.darkMode} onCheckedChange={props.handleDarkModeChange} />
```
Toggle UI existe et fonctionne — mais la préférence est perdue au reload.

### `src/hooks/useSettingsPage.ts` (lignes 34–37)
```typescript
const handleDarkModeChange = (enabled: boolean) => {
  setDarkMode(enabled); // appelle le setter du parent
};
```

## Ce qui manque

### 1. `src/contexts/ThemeContext.tsx` (nouveau fichier)
```typescript
interface ThemeContextValue {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextValue>(...);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light'; // default dark
  });

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return <ThemeContext.Provider value={{ darkMode, setDarkMode }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
```

### 2. `src/App.tsx`
- Supprimer `useState(darkMode)` et `useEffect` pour classList
- Wrapper le rendu avec `<ThemeProvider>`
- Supprimer le passage de `darkMode` / `setDarkMode` en props à chaque page
- Chaque page appelle `useTheme()` directement si elle en a besoin

### 3. Pages consommant `darkMode` en prop
Remplacer `props.darkMode` par `const { darkMode } = useTheme()` dans :
- `src/views/SettingsPageView.tsx`
- `src/hooks/useSettingsPage.ts`
- Et tout composant qui reçoit `darkMode` en prop

## Fichiers à modifier
- `src/App.tsx`
- `src/contexts/ThemeContext.tsx` (créer)
- `src/views/SettingsPageView.tsx`
- `src/hooks/useSettingsPage.ts`
- Pages utilisant `darkMode` en prop (audit nécessaire)

## Estimation
2-3 jours
