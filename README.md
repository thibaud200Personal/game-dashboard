# Board Game Dashboard

Web application for tracking scores and managing a board game collection.

## Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Forms | React Hook Form + Zod |
| Charts | Recharts 3 + D3 |
| Backend | Express 5 + Node.js |
| Database | SQLite (better-sqlite3) |
| Testing | Vitest + React Testing Library + MSW |

## Features

- **Players** — CRUD, statistics (plays, wins, scores), avatars
- **Games** — CRUD, automatic import from BoardGameGeek, 4 modes (competitive / cooperative / campaign / hybrid)
- **Expansions & Characters** — management per game, avatars, abilities
- **Plays** — play recording, scoring, history
- **Statistics** — global dashboard, stats per player and per game
- **BGG Search** — search and import from the BoardGameGeek API

## Running the Project

### Frontend

```bash
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run init-db    # initialize the SQLite database
npm run dev        # http://localhost:3001
```

### Tests

```bash
npm test               # watch mode
npm run test:run       # one-shot
npm run test:coverage  # with coverage
```

## Structure

```
boardgame-dashboard/
├── src/
│   ├── features/        # Co-located features (container + view + hook + api + dialogs)
│   │   ├── auth/        # LoginPage
│   │   ├── bgg/         # BGGSearch + bggApi
│   │   ├── dashboard/   # Dashboard
│   │   ├── games/       # GamesPage + detail/ + expansions/ + characters/
│   │   ├── players/     # PlayersPage + dialogs
│   │   ├── plays/       # NewPlayPage + playApi
│   │   ├── settings/    # SettingsPage
│   │   └── stats/       # StatsPage shell + game/ + player/
│   ├── shared/          # Cross-cutting modules (2+ features)
│   │   ├── components/  # Layout, BottomNavigation
│   │   ├── components/ui/ # shadcn/ui components (do not edit manually)
│   │   ├── contexts/    # AuthContext
│   │   ├── services/api/ # request, queryKeys, authApi, labelsApi, statsApi
│   │   ├── hooks/       # useLabels, useLocale, useApiReachable, etc.
│   │   └── i18n/        # en.json (offline fallback)
│   └── types/           # Re-exports from shared/types only
│
└── backend/
    ├── server.ts
    ├── routes/          # HTTP handlers per domain
    ├── services/        # Business logic
    ├── repositories/    # SQL queries per entity
    ├── database/        # DatabaseConnection + migrations/
    └── validation/      # Zod schemas + middleware
```

## Documentation

| File | Content |
|---------|---------|
| `docs/architecture/OVERVIEW.md` | Full-stack architecture overview |
| `docs/architecture/FRONTEND.md` | Frontend architecture, patterns, conventions |
| `docs/architecture/BACKEND.md` | Backend architecture deep-dive |
| `docs/architecture/DATABASE.md` | Database schema, SQL views, migrations |
| `docs/architecture/DATA_MAPPING.md` | TypeScript interfaces ↔ DB tables |
| `docs/guides/CONTRIBUTING.md` | Developer onboarding, conventions, checklists |
| `docs/guides/DEVELOPMENT.md` | Patterns and code conventions |
| `docs/guides/DEPLOYMENT.md` | Docker, environment variables |
| `docs/security/SECURITY.md` | Threat model, JWT, security practices |
| `docs/decisions/` | Architecture Decision Records |
| `ROADMAP.md` | Roadmap and progress status |

## Database

12 tables: `players`, `games`, `game_expansions`, `game_characters`, `game_plays`, `players_play`, `bgg_catalog`, `bgg_catalog_language`, `labels`, `refresh_tokens`, `log_import`, `schema_version`
2 SQL views: `player_statistics`, `game_statistics`

See `docs/architecture/DATABASE.md` for the full schema.
