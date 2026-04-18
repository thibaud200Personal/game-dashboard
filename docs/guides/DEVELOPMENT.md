# Guide de développement

Ce document détaille les patterns d'architecture, les conventions et les bonnes pratiques. Lire aussi `docs/architecture/FRONTEND.md` et `docs/architecture/BACKEND.md`.

## 1. Principes fondamentaux

### TDD — Tests avant le code

Pour toute feature ou bugfix :
1. Écrire le test qui décrit le comportement attendu (il doit échouer)
2. Écrire le code minimal pour le faire passer
3. Refactorer

Les tests sont la documentation exécutable du comportement attendu.

### Zéro `any`

`strict: true` dans tous les tsconfig. Aucun `any` autorisé.

```ts
// ✅ Correct — payload sans champs auto-générés
async createPlayer(data: Omit<Player, 'player_id' | 'created_at'>): Promise<Player>

// ✅ Correct — valeur mixte
const handleChange = (field: keyof FormData, value: string | number | boolean) => {}

// ✅ Correct — type inféré depuis un hook
type GameStats = ReturnType<typeof useGameStatsPage>['gameStats']

// ❌ Interdit
async createPlayer(data: any): Promise<any>
```

Exception documentée : middleware d'erreur Express 5 (`error: any`) — convention Express imposée par la signature à 4 paramètres.

## 2. Pattern Container/Presenter (feature-based)

Chaque feature est organisée en : `<Nom>Page.tsx` (container) + `<Nom>View.tsx` (presenter) + `use<Nom>Page.ts` (hook), co-localisés dans `src/features/<nom>/`.

```
features/games/
  GamesPage.tsx (container)        GamesPageView.tsx (presenter)
  ─────────────────────────        ─────────────────────────────
  useGamesPage() hook         →    Props uniquement
  logique + état                   JSX pur
  appels API via hooks             aucun useQuery / useMutation
```

Un composant `View` qui fait un appel API est une erreur de placement — déplacer la logique dans le hook.

**Règle d'isolation** : une feature n'importe jamais depuis une autre feature. Exception : `features/bgg/` est importable par `features/games/` et `features/settings/`.

## 3. State management — React Query

React Query est la **seule** source de vérité pour les données serveur. Pas de `useState` pour des données qui viennent du backend.

```ts
// features/players/usePlayersPage.ts
export function usePlayersPage() {
  const { data: players = [], isLoading } = useQuery({
    queryKey: queryKeys.players.all,
    queryFn: playerApi.getAll,
  })

  const addPlayer = useMutation({
    mutationFn: playerApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.players.all }),
  })

  // État local uniquement pour UI (search, dialog open state)
  const [search, setSearch] = useState('')

  return { players, isLoading, addPlayer, search, setSearch }
}
```

**Toujours utiliser `queryKeys`** — jamais de clés en dur dans les hooks.

## 4. Dialogs modulaires

Chaque dialog :
- Gère son propre état de formulaire interne
- Communique via `open`, `onOpenChange`, `onSubmit` / `onAdd` / `onDelete`
- Ne fait pas d'appels API directement — les mutations sont passées en props ou appelées via callback

```ts
interface AddPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: PlayerFormData) => void
}
```

### Dialogs de suppression — pattern trigger prop

```tsx
<DeletePlayerDialog
  playerName={player.player_name}
  onDelete={() => handleDelete(player.player_id)}
  trigger={
    <button className="...">
      <Trash className="w-4 h-4" />
    </button>
  }
/>
```

`AlertDialogTrigger asChild` clone le child direct. Passer un `<button>` ou un `DropdownMenuItem` avec `onSelect={e => e.preventDefault()}`. Jamais un composant Radix composite.

## 5. Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composants | PascalCase | `GameCard.tsx` |
| Vues | PascalCase + `View` | `GamesPageView.tsx` |
| Hooks | camelCase + `use` | `useGamesPage.ts` |
| Services/Repos | PascalCase + suffixe | `PlayerRepository.ts` |
| Types | PascalCase | `Player` |
| Variables | camelCase | `gameList` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_PLAYERS` |

## 6. Types partagés — `shared/types`

### Architecture

`shared/types/index.d.ts` est le **fichier de déclaration TypeScript écrit à la main** — il n'est pas généré par `tsc`.

```
shared/types/
├── index.d.ts      ← source de vérité, édité directement
├── index.js        ← compagnon vide (require runtime pour CommonJS)
└── index.d.ts.map  ← sourcemap (référence index.ts, fichier source non conservé)
```

Les deux consommateurs l'importent via l'alias `@shared/types` :
- **Backend** (`tsconfig.json` → `"@shared/*": ["../shared/*"]`) — résout vers `index.d.ts`
- **Frontend** (`src/types/index.ts`) — réexporte depuis `../../shared/types`

### Pourquoi un `.d.ts` hand-written ?

Le fichier `.ts` source original a été compilé puis non conservé. Le `.d.ts` fait maintenant office de source de vérité. C'est une pratique TypeScript valide (les `.d.ts` peuvent être écrits manuellement) et sans risque ici :
- Le backend a `rootDir: "./"` → ne peut pas compiler ni écraser `../shared/types/index.d.ts`
- Le frontend a `noEmit: true` → ne génère rien

### Modifier ou ajouter un type

Éditer directement `shared/types/index.d.ts` — **aucune étape de build**.

```ts
// shared/types/index.d.ts
export interface MonNouveauType {
  id: number
  name: string
}
```

Puis importer via `@/types` côté frontend ou `@shared/types` côté backend.

## 7. Organisation des imports


```ts
// 1. React
import React, { useState, useCallback } from 'react'
// 2. Bibliothèques externes
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/components/ui/button'
// 3. Imports internes absolus
import { Player } from '@/types'
import { playerApi } from '@/features/players/playerApi'
import { queryKeys } from '@/shared/services/api/queryKeys'
// 4. Imports relatifs (dans la même feature uniquement)
import './Component.css'
```

## 8. Internationalisation — useLabels + t()

Tous les textes affichés passent par `useLabels`. Les labels sont stockés en BDD (table `labels`) et chargés via `GET /api/v1/labels?locale=<locale>`.

```tsx
// Dans n'importe quel composant
const { t } = useLabels()
<h1>{t('games.page.title')}</h1>
```

**Règle** : aucune chaîne visible par l'utilisateur en dur dans le JSX.

**Ajouter un label :**
1. Ajouter la clé dans `src/shared/i18n/en.json` (fallback offline)
2. Créer une migration SQL : `INSERT OR IGNORE INTO labels (key, locale, value) VALUES ...` pour chaque locale (`en`, `fr`, etc.)

**Changer de langue :** via `setLocale()` de `LocaleContext` — invalide le cache `['labels']` sans refresh.

Les valeurs stockées en BDD (`Beginner`, `competitive`, etc.) sont toujours en anglais. Leur traduction pour l'affichage se fait via `t()` avec une clé dédiée, ou via les maps dans `shared/utils/formatters.ts`.

## 9. Backend — pattern Repository/Service

### Repository : requêtes SQL uniquement

```ts
// repositories/PlayerRepository.ts
export class PlayerRepository {
  constructor(private db: DatabaseConnection) {}

  findAll(): Player[] {
    return this.db.prepare('SELECT * FROM player_statistics').all() as Player[]
  }
}
```

### Service : logique métier + transactions

```ts
// services/PlayService.ts — transactions confinées au service
createPlay(payload: CreatePlayRequest): GamePlay {
  return this.db.transaction(() => {
    const playId = this.playRepo.insertPlay(payload)
    this.playRepo.insertPlayPlayers(playId, payload.players)
    return this.playRepo.findById(playId)!
  })()
}
```

### Route : HTTP uniquement

```ts
// routes/players.ts
router.post('/', validateBody(CreatePlayerSchema), async (req, res) => {
  const player = await playerService.createPlayer(req.body)
  res.status(201).json(player)
})
```

## 10. Migrations BDD

Créer un fichier numéroté dans `backend/database/migrations/` :

```sql
-- 007_add_favorite_category.sql
ALTER TABLE players ADD COLUMN favorite_category TEXT;
```

Le runner applique automatiquement les migrations non encore appliquées au démarrage. Ne jamais modifier un fichier de migration déjà appliqué — créer un nouveau fichier.

## 10. CSS — packages invisibles au grep TS

Ces packages sont importés via `@import` dans les fichiers CSS, pas en TypeScript :
- `tw-animate-css` → `src/index.css`
- `@radix-ui/colors` → `src/styles/theme.css`

Ne pas les supprimer sur la seule base d'un grep TypeScript.

## 11. Performance

- `useMemo` / `useCallback` sur les valeurs/fonctions coûteuses passées en props
- `React.memo` sur les composants de liste (`GameCard`, `PlayerCard`)
- `React.lazy` + `Suspense` pour le lazy loading des pages
- Les vues SQL (`player_statistics`, `game_statistics`) évitent les requêtes N+1

## 12. Responsive design

L'app supporte trois breakpoints :
- **Mobile** : `BottomNavigation`, menus contextuels, layout colonne
- **Tablette** : layout hybride
- **Desktop** : actions directes, tooltips, layout multi-colonnes

`use-mobile.ts` expose `isMobile`. Les composants utilisent des classes Tailwind conditionnelles. La logique de navigation (React Router) est indépendante du breakpoint.
