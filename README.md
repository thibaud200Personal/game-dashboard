<h1 align="center">🎲 Board Game Dashboard</h1>
<p align="center">A responsive web application for desktop and mobile.</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue" />
  <img src="https://img.shields.io/badge/Node.js-24-green" />
  <img src="https://img.shields.io/badge/SQLite-Database-lightgrey" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/docker-ready-blue" />
  <img src="https://img.shields.io/badge/tests-Vitest-success" />
</p>

<p align="center">Track board game sessions, manage players, analyze statistics, and search or import games directly from BoardGameGeek (BGG).</p>

## 📌 Highlights

✔ Responsive desktop/mobile UI  
✔ BoardGameGeek API integration  
✔ Feature-based frontend architecture  
✔ Modular backend architecture  
✔ Automated Docker testing pipeline  
✔ SQLite relational database

## 📷 Preview

<p align="center">
  <img alt="dashboard" src="https://github.com/user-attachments/assets/4e3d5aae-1502-4ffc-b6b9-17037e8592fa" width="30%"/>
  &nbsp;&nbsp;
  <img alt="GameList" src="https://github.com/user-attachments/assets/85a26993-0eed-4ac6-bb21-9392fd293e7d" width="30%" />
</p>

<p align="center">
  <img alt="session" src="https://github.com/user-attachments/assets/d90da03b-0e17-4e0c-b27b-c95c44565f71" width="30%" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img alt="settings" src="https://github.com/user-attachments/assets/7ab256e5-88bb-4a4a-9a43-0efa1cd50e54" width="30%" />
</p>

---

## 🚀 Features

- 👤 **Players** — CRUD, avatars, play/win/score statistics
- 🎲 **Games** — CRUD, BGG import, 4 play modes
- 🧩 **Expansions & Characters** — per-game management *(in progress)*
- 📝 **Plays** — session tracking, scoring, history
- 📊 **Statistics** — dashboards by player, game, and globally
- 🔍 **BGG Search** — search and import from BoardGameGeek

---

## 🐳 Docker Architecture

This project is fully containerized using a **multi-stage Docker build pipeline**:

```md id="u7q4mw"
👉 Docker acts as a built-in CI pipeline — builds fail automatically if tests fail.

---

## ⚡ Quick Start

Run the full stack with Docker:

```bash
docker compose up --build
```

Open:

- Frontend → http://localhost:5173
- Backend → http://localhost:3001

---

## ▶️ Run Locally

### Frontend

```bash
npm install
npm run dev
```

Available at: `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm run init-db
npm run dev
```

Available at: `http://localhost:3001`

### Tests

```bash
npm test
npm run test:run
npm run test:coverage
```
---

## 🧱 Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Node.js 24 + Express |
| Database | SQLite (better-sqlite3) |
| Testing | Vitest + React Testing Library + MSW |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |


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

### 🧠 Architecture / technics
| File | Description |
|------|-------------|
| `docs/architecture/OVERVIEW.md` | Full-stack architecture |
| `docs/architecture/FRONTEND.md` | Frontend design patterns |
| `docs/architecture/BACKEND.md` | Backend architecture |
| `docs/architecture/DATABASE.md` | DB schema + views |
| `docs/architecture/DATA_MAPPING.md` | TS ↔ SQL mapping |

### 🧑‍💻 Development Guides
| File | Description |
|------|-------------|
| `docs/guides/CONTRIBUTING.md` | Contribution guide |
| `docs/guides/DEVELOPMENT.md` | Coding standards |
| `docs/guides/DEPLOYMENT.md` | Docker & environment setup |
| `docs/security/SECURITY.md` | Security model |

### 📈 Project Tracking
| File | Description |
|------|-------------|
| `ROADMAP.md` | Development roadmap |

---
