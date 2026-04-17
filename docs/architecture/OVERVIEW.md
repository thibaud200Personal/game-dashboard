# Architecture — Vue d'ensemble

## Stack technique (avril 2026)

| Couche | Technologie | Version |
|---|---|---|
| Runtime | Node.js | 24 LTS |
| Frontend | React + TypeScript | 19 / 5.9 |
| Build | Vite + SWC | 8 |
| Backend | Express | 5 |
| Base de données | SQLite (better-sqlite3) | 12.2 |
| Validation | Zod | 4 |
| State serveur | TanStack Query (React Query) | v5 |
| Forms | React Hook Form | — |
| UI | shadcn/ui + Tailwind CSS | 4 |
| Tests | Vitest + React Testing Library + MSW | — |

## Vue globale

```
┌─────────────────────────────────────────────────┐
│                   Navigateur                     │
│  React 19 + React Router + React Query           │
│  Tailwind CSS + shadcn/ui                        │
│  Responsive : mobile / tablette / desktop        │
└──────────────┬──────────────────────────────────┘
               │ HTTPS  /api/v1/*
               │ JWT (cookie HttpOnly web / Bearer Android)
┌──────────────▼──────────────────────────────────┐
│              Backend Express 5                   │
│  Routes → Services → Repositories               │
│  Zod validation · JWT auth · pino logging        │
│  Rate limiting · Helmet · OpenAPI docs           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│              SQLite (better-sqlite3)             │
│  9 tables + 2 vues SQL + catalogue BGG           │
│  Migrations numérotées (schema_version)          │
└─────────────────────────────────────────────────┘
```

## Principes fondamentaux

### Source de vérité unique
- **Types** : `shared/types/index.ts` — importé par frontend ET backend
- **Données** : React Query côté client, vues SQL côté BDD
- **Styles** : `tailwind.config.js` + `theme.json`

### Séparation des responsabilités
- Frontend ne contient aucune logique métier (tout dans les services)
- Backend ne connaît pas le type de client (web ou Android)
- Chaque couche a une responsabilité unique et testable

### Sécurité par défaut
- JWT signé côté backend, stocké en cookie HttpOnly côté web
- Zod valide body, paramètres de route ET query strings
- Helmet sur tous les endpoints
- Erreurs masquées en production

## Organisation du monorepo

```
game-dashboard/
├── shared/                  ← types et utilitaires partagés front/back
│   ├── types/index.ts
│   └── utils/formatters.ts
├── src/                     ← frontend React
├── backend/                 ← API Express
├── docs/                    ← documentation
├── .env.example             ← template variables d'environnement
├── docker-compose.yml
└── Dockerfile
```

## Flux de données

```
Composant React
  → useQuery / useMutation (React Query)
  → api/playerApi.ts (fetch HTTP)
  → Express route /api/v1/players
  → PlayerService (logique métier)
  → PlayerRepository (requête SQL)
  → SQLite
  → réponse JSON
  → React Query cache
  → composant re-render
```

## Multi-client (web + Android futur)

Le backend est un **API first-class**, pas "le backend de ce site". Il sert indifféremment :
- Le frontend web (cookie HttpOnly)
- Une app Android future (header `Authorization: Bearer`)
- Tout autre client HTTP

Le versioning `/api/v1/` permet des évolutions sans breaking change.

## Documentation

| Document | Contenu |
|---|---|
| `docs/architecture/FRONTEND.md` | Architecture frontend détaillée |
| `docs/architecture/BACKEND.md` | Architecture backend détaillée |
| `docs/architecture/DATABASE.md` | Schéma BDD, vues SQL, migrations |
| `docs/architecture/DATA_MAPPING.md` | Interfaces TypeScript ↔ tables BDD |
| `docs/guides/CONTRIBUTING.md` | Onboarding nouveau développeur |
| `docs/guides/DEVELOPMENT.md` | Patterns et conventions de code |
| `docs/guides/DEPLOYMENT.md` | Docker, variables d'environnement |
| `docs/security/SECURITY.md` | Modèle de menace, JWT, pratiques |
| `docs/decisions/` | Architecture Decision Records |
