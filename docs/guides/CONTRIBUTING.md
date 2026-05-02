# Contributing Guide

## Prerequisites

- Node.js 24 LTS
- npm 10+
- Git

## Local Setup

```bash
# Clone the repo
git clone <repo-url>
cd boardgame-dashboard

# Frontend
npm install

# Backend
cd backend && npm install && cd ..

# Environment variables
cp .env.example .env
# Edit .env: AUTH_JWT_SECRET, ADMIN_PASSWORD, USER_PASSWORD

# Initialize the database
cd backend && npm run init-db && cd ..

# Start both servers
npm run dev          # Frontend: http://localhost:5173
cd backend && npm run dev  # Backend: http://localhost:3001
```

## Project Structure

```
boardgame-dashboard/
├── shared/          → shared types and utilities (front/back)
├── src/             → React frontend
├── backend/         → Express API
├── docs/            → documentation
├── .env.example     → environment variables template
└── Dockerfile
```

## Environment Variables

See `.env.example` for the full list. Required variables:

| Variable | Description | Example |
|---|---|---|
| `AUTH_JWT_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | Administrator password | — |
| `USER_PASSWORD` | Standard user password | — |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:5173` |

Never commit `.env`. Only `.env.example` is versioned.

## Development Workflow

### Branches

- `main` — protected branch, review required
- `feature/<name>` — new features
- `fix/<name>` — bug fixes
- `chore/<name>` — maintenance, dependencies
- `docs/<name>` — documentation only

### PR Process

1. Create a branch from `main`
2. Write tests before code (TDD)
3. Develop the feature
4. Verify all tests pass: `npm run test:run`
5. Verify lint: `npm run lint`
6. Open a PR towards `main`
7. Review required before merge
8. After merge: delete both local AND remote branch

```bash
git push origin --delete my-branch
git branch -d my-branch
```

## TDD Principle

**Tests written before code.**

1. Write the test describing the expected behavior → it fails (red)
2. Write the minimal code to make it pass (green)
3. Refactor without breaking tests (refactor)

Benefit: tests document expected behavior and serve as a safety net for future refactors.

## Code Conventions

### TypeScript

- `strict: true` in all tsconfigs
- Zero `any` — use `unknown`, precise types, or `Omit<T, 'field'>`
- Types imported from `@shared/types` or `@/types` (which re-exports shared)
- Documented exception: Express 5 error middleware (`error: any` — Express convention)

```ts
// ✅ Correct
async createPlayer(data: Omit<Player, 'player_id' | 'created_at'>): Promise<Player>

// ❌ Forbidden
async createPlayer(data: any): Promise<any>
```

### Naming

| Element | Convention | Example |
|---|---|---|
| React components | PascalCase | `GameCard.tsx` |
| Views (presenters) | PascalCase + `View` suffix | `GamesPageView.tsx` |
| Hooks | camelCase + `use` prefix | `useGamesPage.ts` |
| Services/Repositories | PascalCase + suffix | `PlayerRepository.ts` |
| Types | PascalCase | `Player`, `GameSession` |
| Variables | camelCase | `gameList` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PLAYERS` |

### Imports

```ts
// 1. React
import React, { useState } from 'react'
// 2. External libraries
import { useQuery } from '@tanstack/react-query'
// 3. Absolute internal imports
import { Player } from '@/types'
import { playerApi } from '@/features/players/playerApi'
import { queryKeys } from '@/shared/services/api/queryKeys'
// 4. Relative imports
import './Component.css'
```

### Commits

Conventional Commits format:
```
feat: add character selection in session
fix: correct player stats calculation for cooperative sessions
chore: update Vite 8.1
docs: document repository pattern
test: add SessionService integration tests
```

## Adding a Database Field

1. Create a numbered migration file: `backend/database/migrations/00N_description.sql`
2. Add the field in `shared/types/index.ts`
3. Update the Zod schema in `backend/validation/schemas.ts`
4. Update the relevant repository
5. Update `docs/architecture/DATA_MAPPING.md`
6. Write a test verifying the migration applies correctly

## Adding an Endpoint

1. Add the type in `shared/types/index.ts` if needed
2. Create/update the Zod schema in `backend/validation/schemas.ts`
3. Add the method in the repository
4. Add the logic in the service
5. Add the route in `backend/routes/`
6. Register in `server.ts`
7. Write tests (repository + service + route)
8. Update the OpenAPI docs (JSDoc annotations on the route)

## Adding a Frontend Page

The architecture is **feature-based**: each feature is co-located in `src/features/<name>/`.

1. Create the folder `src/features/<name>/`
2. Create the hook `src/features/<name>/use<NamePage>.ts`
3. Create the container `src/features/<name>/<NamePage>.tsx`
4. Create the view `src/features/<name>/<NamePage>View.tsx`
5. If dialogs are needed: create `src/features/<name>/dialogs/`
6. If a new API domain: create `src/features/<name>/<name>Api.ts`
7. Add the route in `src/App.tsx`
8. Add cache keys in `src/shared/services/api/queryKeys.ts`
9. Write tests (hook + component + integration)

**Architecture rules:**
- A feature **never** imports from another feature (exception: `features/bgg/` is importable by `features/games/` and `features/settings/`)
- Any module used by 2+ features → `src/shared/`
- Do not create files in the old `src/components/`, `src/views/`, `src/hooks/` folders (removed)

## Tests

### Commands

```bash
npm run test:run        # One-shot (frontend)
npm test                # Watch mode (frontend)
npm run test:coverage   # Coverage (80% threshold)

cd backend
npm run test:run        # One-shot (backend)
```

### Structure

```
src/shared/__tests__/
├── unit/
│   ├── technical/      → pure functions, utils, formatters
│   └── functional/     → hooks and components
├── integration/        → full flows with MSW
├── fixtures/           → realistic data (Gloomhaven, Wingspan, Catan)
├── mocks/              → MSW handlers + server setup
└── utils/              → test-utils.tsx (render helpers)

backend/__tests__/
├── unit/
│   ├── services/       → services with mocked repositories
│   └── repositories/   → SQL against in-memory SQLite DB
├── integration/        → full HTTP routes (supertest)
└── fixtures/
```

### Rules

- Realistic fixtures — no generic data ("test", "foo", 123)
- Repositories tested against a real in-memory SQLite DB
- Services tested with mocked repositories (dependency injection)
- Each test is independent (no shared state between tests)

## Security

- Never commit secrets (`.env`, tokens, passwords)
- Check `npm audit` before every PR: `npm audit && cd backend && npm audit`
- Report a vulnerability by creating a private issue (not a public PR)

See `docs/security/SECURITY.md` for the full threat model.
