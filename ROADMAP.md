# 🗺️ Roadmap — Board Game Dashboard

**📈 Status**: 346 tests (212 backend + 134 frontend) · Phase 3 in progress

## 🎯 Current Phase — Phase 3: UX Polish

Functional dark/light theme (to migrate from prop-drilling → Tailwind `dark:`), time-series charts + backend BGG cache to implement. → [see detail](#-phase-3--ux-polish)

---

## Evolution Plan

### ✅ Phase 1 — Foundation (complete)
### ✅ Phase 2 — BGG & DB Polish (complete)
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

## 📊 Performance — Unlighthouse Audit April 2026

**Global scores:** 91 total · 89 Performance · 92 Accessibility · 100 Best Practices · 83 SEO

| Page | Perf | A11y | BP | SEO |
|------|------|------|-----|-----|
| / (dashboard) | 88 | 92 | 100 | 83 |
| /games | 89 | 91 | 100 | 83 |
| /players | 89 | 93 | 100 | 83 |
| /plays/new | 93 | 93 | 100 | 82 |
| /settings | 95 | 93 | 100 | 82 |
| /stats | **80** | **87** | 100 | 83 |

| Priority | Category | Issue | Solution |
|----------|-----------|-------|----------|
| ⭐⭐ | SEO | Missing meta description | `<meta name="description">` in `index.html` |
| ⭐⭐ | Performance | `/stats` perf 80 — heavy recharts | Lazy load charts, optimize stats queries |
| ⭐⭐ | Accessibility | `/stats` a11y 87 — charts without aria | `aria-label` on recharts charts |
| ⭐ | Performance | Google Fonts render-blocking (~780ms) | `font-display: swap` or self-hosting |
| ⭐ | Performance | No asset cache headers | Server/Nginx level fix |
| ⭐ | Performance | BGG images not optimized (~32 KiB) | Download at import + re-encode WebP with `sharp` |

---

## 🔧 Infrastructure History

| PR | Date | Summary | Detail |
|---|---|---|---|
| #43 | March 2026 | Fix game deletion, supports_hybrid, DeletePlayerDialog, types | [changelog/pr-43-fix-popups-delete.md](changelog/pr-43-fix-popups-delete.md) |
| #44 | March 2026 | Stack update: Node 24, Vite 7.3, Vitest 4, TS 5.9 | [changelog/pr-44-stack-update.md](changelog/pr-44-stack-update.md) |
| #45 | March 2026 | Remove @github/spark + 15 dead packages | [changelog/pr-45-remove-spark.md](changelog/pr-45-remove-spark.md) |
| #46 | March 2026 | ROADMAP reorganization + changelog/ directory + .gitattributes LF | [changelog/pr-46-roadmap-reorganization.md](changelog/pr-46-roadmap-reorganization.md) |
| #57 | March 2026 | Static bearer token authentication | — |
| #58 | March 2026 | Quick wins: formatExpansion merge, BGGSearch, debounce, onKeyDown | — |

📋 Planned technical updates: [changelog/planned-updates.md](changelog/planned-updates.md)

*Last updated: April 2026*

