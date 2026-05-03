# Architecture — Overview

## Tech Stack (April 2026)

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 24 LTS |
| Frontend | React + TypeScript | 19 / 5.9 |
| Build | Vite + SWC | 8 |
| Backend | Express | 5 |
| Database | SQLite (better-sqlite3) | 12.2 |
| Validation | Zod | 4 |
| Server state | TanStack Query (React Query) | v5 |
| Forms | React Hook Form | — |
| UI | shadcn/ui + Tailwind CSS | 4 |
| Testing | Vitest + React Testing Library + MSW | — |

## 🧱 High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  React 19 + React Router + React Query           │
│  Tailwind CSS + shadcn/ui                        │
│  Responsive: mobile / tablet / desktop           │
└──────────────┬──────────────────────────────────┘
               │ HTTPS  /api/v1/*
               │ JWT (HttpOnly cookie web / Bearer Android)
┌──────────────▼──────────────────────────────────┐
│              Express 5 Backend                   │
│  Routes → Services → Repositories               │
│  Zod validation · JWT auth · pino logging        │
│  Rate limiting · Helmet · OpenAPI docs           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│              SQLite (better-sqlite3)             │
│  9 tables + 2 SQL views + BGG catalog            │
│  Numbered migrations (schema_version)            │
└─────────────────────────────────────────────────┘
```

---

## Core Principles

### Single Source of Truth
- **Types**: `shared/types/index.d.ts` — imported by both frontend AND backend (see [note](#shared-types))
- **Data**: React Query on the client, SQL views on the DB
- **Styles**: `tailwind.config.js` + `theme.json`

### Separation of Concerns
- Frontend contains no business logic (all in services)
- Backend is client-agnostic (web or Android)
- Each layer has a single, testable responsibility

### Security by Default
- JWT signed on the backend, stored in HttpOnly cookie on the web
- Zod validates body, route parameters, AND query strings
- Helmet on all endpoints
- Errors masked in production

## Data Flow

```
React Component
  → useQuery / useMutation (React Query)
  → api/playerApi.ts (HTTP fetch)
  → Express route /api/v1/players
  → PlayerService (business logic)
  → PlayerRepository (SQL query)
  → SQLite
  → JSON response
  → React Query cache
  → component re-render
```
## 📂 Project Structure

```
boardgame-dashboard/
├── src/
│   ├── features/        # Feature-based architecture (UI + logic co-located)
│   │   ├── auth/
│   │   ├── bgg/
│   │   ├── dashboard/
│   │   ├── games/
│   │   ├── players/
│   │   ├── plays/
│   │   ├── settings/
│   │   └── stats/
│   ├── shared/          # Shared utilities (API, hooks, UI, contexts)
│   └── types/           # Shared TypeScript types
│
└── backend/
    ├── server.ts
    ├── routes/          # API endpoints
    ├── services/        # Business logic
    ├── repositories/    # Database layer (SQL)
    ├── database/        # Migrations + connection
    └── validation/      # Zod schemas
```

## Multi-Client (web + future Android)

The backend is a **first-class API**, not "the backend for this website". It serves equally:
- The web frontend (HttpOnly cookie)
- A future Android app (`Authorization: Bearer` header)
- Any other HTTP client

The `/api/v1/` versioning allows evolution without breaking changes.

## Documentation

| Document | Content |
|---|---|
| [docs/architecture/FRONTEND.md](docs/architecture/FRONTEND.md) | Frontend design patterns |
| [docs/architecture/BACKEND.md](docs/architecture/BACKEND.md) | Backend architecture |
| [docs/architecture/DATABASE.md](docs/architecture/DATABASE.md) | DB schema + views |
| [docs/architecture/DATA_MAPPING.md](docs/architecture/DATA_MAPPING.md) | TS ↔ SQL mapping |

### 🧑‍💻 Development Guides
| File | Description |
|------|-------------|
| [docs/guides/CONTRIBUTING.md](docs/guides/CONTRIBUTING.md) | Contribution guide |
| [docs/guides/DEVELOPMENT.md](docs/guides/DEVELOPMENT.md) | Coding standards |
| [docs/guides/DEPLOYMENT.md](docs/guides/DEPLOYMENT.md) | Docker & environment setup |
| [docs/security/SECURITY.md](docs/security/SECURITY.md) | Security model |

### 📈 Project Tracking
| File | Description |
|------|-------------|
| [ROADMAP.md](ROADMAP.md) | Development roadmap |
