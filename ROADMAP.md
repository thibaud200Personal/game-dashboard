# 🗺️ Roadmap — Board Game Dashboard

**📈 Status**: 346 tests (212 backend + 134 frontend) · Phase 3 in progress

---

## 🧹 TECH DEBT & BUGS

- 🟡 [Pending](docs/TECH_DEBT_AND_BUGS.md)
- 🟢 [Done](docs/TECH_DEBT_AND_BUGS_DONE.md)

---

## 🎨 DESIGN

- 📊 [Design Audit](docs/DESIGN_AUDIT.md)

---

## 🎯 Current Phase — Phase 3: UX Polish

Functional dark/light theme (migration from prop-drilling → Tailwind `dark:`), time-series charts, and backend BGG cache improvements in progress.

---

## 📈 Evolution Plan

- ✅ Phase 1 — Foundation (complete) → [details](docs/ROADMAP_ARCHIVE.md)
- ✅ Phase 2 — BGG & DB Polish (complete) → [details](docs/ROADMAP_ARCHIVE.md)
---

### 🎨 Phase 3 — UX Polish

<details open>
<summary>See detail</summary>

#### **Dark/Light Theme** — functional, refactor pending
- ⚠️ Dark mode toggle disabled in Settings (removed during Sprint 2 — to restore during a proper light-mode design pass)

#### **Time-Series Charts** — scope réduit
- ~~Recharts~~ → CSS pur (bar charts via height %) — score evolution + game trends livrés
- Temporal performance : non implémenté (jugé pas utile)

#### **Backend BGG Cache** — partial
- ⏳ Periodic metadata sync (descriptions, min/max players, etc.) — not started, deferred

</details>

---

### 🔄 Phase 4 — Advanced Features

<details>
<summary>See detail</summary>

#### **Character Selection in Session** — not started
- `has_characters` detection in place, selection interface missing
- Modal interface for character selection in sessions

#### **Data Enrichment**
- **UltraBoardGames Character Service**: HTML scraping UltraBoardGames.com (no API). ⚠️ Fragile + legally ambiguous — to tackle when other features are stable.
- **Data Export/Import**: stubs present in `useSettingsPage`, implementation missing (JSON/CSV export, import with validation, automatic backup).
- **BGG data translation table**: `difficulty` (`Beginner`, `Intermediate`, `Expert`) and other BGG-sourced enum values are displayed as-is (English) — intentional, they come from BGG. A future `bgg_translations` table could map these to FR/ES if needed.

#### **End-to-End Tests** — not started
- Recommended framework: Playwright
- 7 priority workflows: BGG search/import, CRUD players/games/sessions, navigation, stats
- Target files: `e2e/bgg-search.spec.ts`, `player-crud.spec.ts`, `game-crud.spec.ts`, `session-create.spec.ts`, `navigation.spec.ts`, `stats-page.spec.ts`

#### **Granular Error Handling** — partially done
- ✅ Global `ErrorBoundary` + `ErrorFallback.tsx` + `sonner` toasts in all hooks
- **Remaining**: per-feature error boundaries (if BGGSearch crashes, only that section crashes)

#### **Performance Tests** — not started
- Vitest benchmarking suite. Note: 340 tests in ~25s — low priority.

</details>

---

### ✨ Phase 5 — Advanced Features (long term)

<details>
<summary>See detail</summary>

#### **Multi-Scenario Campaign Mode** — not started
- `campaign` support exists in DB + types, but no dedicated interface
- Schema to add: `campaigns` table, `game_plays.campaign_id`, `scenario_number`
- Backend: CRUD `/api/campaigns` + `GET /api/campaigns/:id/plays`
- Frontend: `CampaignPage`, "Add to campaign" option in NewPlayPage

#### **DB Migration System** — not started
- Knex.js or explicit versioning system instead of the custom runner

#### **Advanced Dashboard** — not started
- Sophisticated recharts charts: score evolution, trends, temporal comparisons

#### **Advanced Image Management** — not started
- Download BGG images at import → local storage → WebP re-encoding with `sharp`
- Docker volume: `uploads/` in the existing named volume (with SQLite)

#### ❌ Not Relevant for This Project
- Multi-user, PWA/offline, Tournament Mode, Achievements, AI/ML, Social sharing

</details>

---


