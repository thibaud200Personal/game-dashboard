# 🎲 Board Game Dashboard
A responsive web application for desktop and mobile.
<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue" />
  <img src="https://img.shields.io/badge/Node.js-24-green" />
  <img src="https://img.shields.io/badge/SQLite-Database-lightgrey" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/docker-ready-blue" />
  <img src="https://img.shields.io/badge/tests-Vitest-success" />
</p>

Track board game sessions, manage players, analyze statistics, and import games directly from BoardGameGeek (BGG).

<p align="center">
  <img alt="dashboard" src="https://github.com/user-attachments/assets/4e3d5aae-1502-4ffc-b6b9-17037e8592fa" width="30%"/>
  &nbsp;&nbsp;
  <img alt="GameList" src="https://github.com/user-attachments/assets/85a26993-0eed-4ac6-bb21-9392fd293e7d" width="30%" />
  &nbsp;&nbsp;
  <img alt="dashboard" src="https://github.com/user-attachments/assets/4e3d5aae-1502-4ffc-b6b9-17037e8592fa" width="30%" />
</p>

<p align="center">
  <img alt="session" src="https://github.com/user-attachments/assets/d90da03b-0e17-4e0c-b27b-c95c44565f71" width="30%" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img alt="addGame" src="https://github.com/user-attachments/assets/bd9f2825-e90a-488f-942a-a5b09d95f3ff" width="30%" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img alt="settings" src="https://github.com/user-attachments/assets/7ab256e5-88bb-4a4a-9a43-0efa1cd50e54" width="30%" />
</p>

---

## 🧱 Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Forms | React Hook Form + Zod |
| Charts | Recharts 3 + D3 |
| Backend | Node.js 24 + Express 5 |
| Database | SQLite (better-sqlite3) |
| Testing | Vitest + React Testing Library + MSW |

---

## 🚀 Features

- 👤 **Players** — CRUD, statistics (plays, wins, scores), avatars  
- 🎲 **Games** — CRUD, BGG import, 4 modes (competitive / cooperative / campaign / hybrid)  
- 🧩 **Expansions & Characters** — per-game management (in progress)  
- 📝 **Plays** — session tracking, scoring, history  
- 📊 **Statistics** — global + per player + per game dashboards  
- 🔍 **BGG Search** — BoardGameGeek API integration  

---

## 🐳 Docker Architecture

This project is fully containerized using a **multi-stage Docker build pipeline**:

- Frontend build (Vite)
- Backend build (Node.js + TypeScript)
- Frontend tests (Vitest) → CI gate
- Backend tests (Vitest) → CI gate
- Production image (Node 24 Alpine)

👉 The Docker build acts as a **full CI pipeline** (build fails if tests fail)

---

## ▶️ Running the Project

### Frontend

```bash
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run init-db    # initialize SQLite database
npm run dev        # http://localhost:3001
```

### Tests

```bash
npm test               # watch mode
npm run test:run      # one-shot
npm run test:coverage # coverage report
```

---

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

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `docs/architecture/OVERVIEW.md` | Full-stack architecture |
| `docs/architecture/FRONTEND.md` | Frontend design patterns |
| `docs/architecture/BACKEND.md` | Backend architecture |
| `docs/architecture/DATABASE.md` | DB schema + views |
| `docs/architecture/DATA_MAPPING.md` | TS ↔ SQL mapping |
| `docs/guides/CONTRIBUTING.md` | Contribution guide |
| `docs/guides/DEVELOPMENT.md` | Coding standards |
| `docs/guides/DEPLOYMENT.md` | Docker & environment setup |
| `docs/security/SECURITY.md` | Security model |
| `ROADMAP.md` | Development roadmap |

---

## 🗄️ Database

- 12 tables: `players`, `games`, `game_expansions`, `game_characters`, `game_plays`, `players_play`, `bgg_catalog`, `bgg_catalog_language`, `labels`, `refresh_tokens`, `log_import`, `schema_version`
- 2 SQL views: `player_statistics`, `game_statistics`

Full schema: `docs/architecture/DATABASE.md`

---

## 📌 Summary

A fully containerized full-stack application with:

✔ Feature-based architecture  
✔ Automated testing in Docker pipeline  
✔ BGG API integration  
✔ SQLite relational design  
✔ Modular backend (services/repositories)
