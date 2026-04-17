# Board Game Dashboard

Application web de suivi de scores et de gestion de collection de jeux de société.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Formulaires | React Hook Form + Zod |
| Graphiques | Recharts 3 + D3 |
| Backend | Express 5 + Node.js |
| Base de données | SQLite (better-sqlite3) |
| Tests | Vitest + React Testing Library + MSW |

## Fonctionnalités

- **Joueurs** — CRUD, statistiques (parties, victoires, scores), avatars
- **Jeux** — CRUD, import automatique depuis BoardGameGeek, 4 modes (compétitif / coopératif / campagne / hybride)
- **Extensions & Personnages** — gestion par jeu, avatars, capacités
- **Parties (Plays)** — enregistrement des parties, scoring, historique
- **Statistiques** — dashboard global, stats par joueur et par jeu
- **BGG Search** — recherche et import depuis l'API BoardGameGeek

## Lancer le projet

### Frontend

```bash
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run init-db    # initialise la base SQLite
npm run dev        # http://localhost:3001
```

### Tests

```bash
npm test               # mode watch
npm run test:run       # one-shot
npm run test:coverage  # avec couverture
```

## Structure

```
game-dashboard/
├── src/
│   ├── features/        # Features co-localisées (container + view + hook + api + dialogs)
│   │   ├── auth/        # LoginPage
│   │   ├── bgg/         # BGGSearch + bggApi
│   │   ├── dashboard/   # Dashboard
│   │   ├── games/       # GamesPage + detail/ + expansions/ + characters/
│   │   ├── players/     # PlayersPage + dialogs
│   │   ├── plays/       # NewPlayPage + playApi
│   │   ├── settings/    # SettingsPage
│   │   └── stats/       # StatsPage shell + game/ + player/
│   ├── shared/          # Modules transversaux (2+ features)
│   │   ├── components/  # Layout, BottomNavigation
│   │   ├── components/ui/ # Composants shadcn/ui (ne pas éditer manuellement)
│   │   ├── contexts/    # AuthContext
│   │   ├── services/api/ # request, queryKeys, authApi, labelsApi, statsApi
│   │   ├── hooks/       # useLabels, useLocale, useApiReachable, etc.
│   │   └── i18n/        # en.json (fallback offline)
│   └── types/           # Réexporte shared/types uniquement
│
└── backend/
    ├── server.ts
    ├── routes/          # Handlers HTTP par domaine
    ├── services/        # Logique métier
    ├── repositories/    # Requêtes SQL par entité
    ├── database/        # DatabaseConnection + migrations/
    └── validation/      # Schémas Zod + middleware
```

## Documentation

| Fichier | Contenu |
|---------|---------|
| `src/docs/ARCHITECTURE.md` | Architecture frontend, patterns, conventions |
| `src/docs/DEVELOPMENT_GUIDE.md` | Guide de développement, ajout de pages/hooks |
| `src/docs/DATA_MAPPING.md` | Correspondance interfaces TypeScript ↔ tables BDD |
| `src/docs/NAVIGATION_CONTEXT.md` | Système de navigation contextuelle |
| `src/docs/TROUBLESHOOTING.md` | Problèmes courants et solutions |
| `backend/README.md` | Endpoints API et setup backend |
| `backend/database/database-structure.md` | Schéma BDD détaillé |
| `ROADMAP.md` | Feuille de route et état d'avancement |

## Base de données

6 tables : `players`, `games`, `game_expansions`, `game_characters`, `game_sessions`, `session_players`
2 vues SQL : `player_statistics`, `game_statistics`

Voir `backend/database/database-structure.md` pour le schéma complet.
