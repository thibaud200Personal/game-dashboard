# Full UX/UI Audit — Board Game Dashboard

**Scope**: Exhaustive page-by-page review (`src/features/**/View.tsx`), dialogs (`src/features/**/dialogs/*.tsx`), UI primitives (`src/shared/components/ui/*.tsx`), and cross-cutting patterns.
**Date**: 2026-04-18
**Updated**: 2026-05-02 — Sprint F merged (PR #101): shared components §148/149/150/151 ✅, §142 destructive AlertDialog ✅, §69 gameModeColors consistency ✅, §1 meta application-name partial ✅, migration 027 i18n fr labels ✅. Sprint A done (PR #95) + regression fixes PR #91 (labels, GameForm, i18n, bottom-nav) + Sprint B §24–30 GamesPageView + GameDetailView. Resolved items removed: §10 (fake Dashboard timestamps), §20 (Games empty state), §28 (double h1 GameDetail), §59 (blue button BGGSearch), §74 (coming soon placeholder Stats Player), §75 (i18n Stats Player), §86 (Reset without AlertDialog), §104–107 (DeleteGameDialog), §114–119 (EditPlayerDialog), §121 (DeletePlayerDialog).
**Method**: Line-by-line code reading, cross-referenced with WCAG 2.1 AA specifications, consistency audit across pages and between light/dark modes.

---

## Critical Audit Review (Claude Sonnet 4.6 — 2026-04-19)

**What works well**

The method is rigorous: line-by-line code reading, real contrast calculations, pattern grep, exhaustive file-by-file inventory. Findings are concrete rather than vague. The Top 15 with sprint effort estimates is directly actionable.

**What is particularly accurate**

- The `darkMode` prop-drilling diagnosis (§14.1) is the central issue of the entire backlog. All other theme bugs stem from it. Sprint 3 priority #11 is correctly identified as maximum ROI.
- The distinction between "shadcn primitives are clean, the problem is that devs override them with `bg-slate-700`" (§13.3.2) — that's the real root cause, not the primitives themselves.
- Fake data in the Dashboard (§10) was identified as a trust critical — ✅ fixed since.

**Points I would nuance**

- The multi-step wizard for `NewPlayView` (§53) may be over-engineered for personal use. The cost (an entire sprint) vs the value (less scroll) is worth considering. The real priorities in this form are the RadioGroup winner (§48) and auto-save (§49).
- The 26 "unused" shadcn primitives (§13.2): Vite + tree-shaking effectively excludes them from the bundle. The debt is real but primarily cognitive (maintenance), not performance.
- The "1.5 to 2 months" estimate assumes a full-time frontend dev — in practice ×3 in calendar time for a personal project.

**Conclusion**

Document worth keeping. Sprint 1 (6 quick wins) can be done in an afternoon and would eliminate the most visible bugs. Start there.

---

## Table of Contents

1. [Login](#1-login-authloginpagetsx)
2. [Dashboard](#2-dashboard-dashboarddashboardviewtsx)
3. [Games — list](#3-games--list-gamesgamespageviewtsx)
4. [Game Detail](#4-game-detail-gamesdetailgamedetailviewtsx)
5. [Game Expansions / Characters](#5-game-expansions--characters)
6. [Players](#6-players-playersplayerspageviewtsx)
7. [New Play](#7-new-play-playsnewplayviewtsx)
8. [BGG Search](#8-bgg-search-bggbggsearchtsx)
9. [Stats — Game](#9-stats--game-statsgamegamestatsviewtsx)
10. [Stats — Player](#10-stats--player-statsplayerplayerstatsviewtsx)
11. [Settings](#11-settings-settingssettingspageviewtsx)
12. [Dialogs — full audit](#12-dialogs--full-audit)
13. [shared/components/ui — primitives audit](#13-sharedcomponentsui--primitives-audit)
14. [Cross-cutting issues — design system](#14-cross-cutting-issues--design-system)
15. [Top 15 — execution priorities](#15-top-15--execution-priorities)

**Severity legend**: 🔴 critical (blocks release or breaks usage) · 🟡 moderate (degrades experience) · 🟢 minor (to fix in a refactor)

---

## 1. Login (`auth/LoginPage.tsx`)

### First impression

A centered page, gradient background `from-slate-900 via-slate-800 to-slate-900`, glassmorphism card (`bg-white/10 backdrop-blur-md`), a password field, a button. The ergonomics are correct — but **nothing identifies the application**. A Phosphor lock `<Lock>`, a "Login" title, and that's it. A user who lands on this URL by mistake won't know which product they're logging into.

### Detailed findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 1 | 🟡 | No logo, no product name, no tagline. The `<Lock className="w-8 h-8 text-white">` icon is purely decorative and adds zero identification value. **Partial fix (Sprint F)**: `<meta name="application-name" content="Board Game Dashboard">` and `<title>Board Game Dashboard</title>` added to `index.html`. Logo and tagline remain deferred. | Replace the lock with an SVG logo `<GameDashboardLogo />` + subtitle `"Track your board game sessions"`. |

### What works

- `autoComplete="current-password"`: recognized by all password managers.
- Short form, single field, single CTA: maximum conversion, no ambiguity.
- No "confirm password" or decorative fields: zero cognitive overhead.
- ✅ Placeholder contrast `/30` → `/60` (WCAG 1.4.11 compliant).
- ✅ `placeholder="••••••••"` removed (redundant with `type="password"`).
- ✅ `autoFocus` removed (fix for restrictive iOS keyboard).
- ✅ `aria-busy` + spinner `<Circle>` on button during loading.
- ✅ `role="alert" aria-live="assertive"` on error message.
- ✅ `focus-visible:ring-white/80` on submit button (visible halo on teal background).
- ✅ 60s countdown after 3 failed attempts (`failCount` + `cooldown` state).
- ✅ Light mode not handled: product decision — fixed dark mode, consistent with the rest of the app.
- ✅ Password-only without identifier: by design — shared password to protect the app.

### Summary

One finding remaining: **§1 — visual identity** (logo + app tagline). Meta tags and title partially resolved in Sprint F. Logo deferred.

---

## 2. Dashboard (`dashboard/DashboardView.tsx`)

### First impression

Heavy visual hero: two large teal/emerald circles with `animate-pulse` glow, background gradient, welcome banner. Then a descending cascade of identical cards. The pattern is "everything is important, so nothing is".

### Visual hierarchy

- **Eye fixations in 2s (estimate)**: (1) teal/emerald circles at top, (2) "Recent Activity" card title, (3) player images. The primary CTA ("Start a game") arrives 5th, so off the first screen.
- **Expected reading flow** vs **actual reading flow**:
  - Expected: Header → Primary CTA → secondary stats → activity → actions.
  - Actual: Header → decorative circles → stats → lists → activity → CTA at bottom.
- **Pyramid problem**: the most strategic action (new game) is in the least visible position.

### Findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 11 | ✅ | ~~Two equivalent CTAs at bottom: `"New game"` (teal) and `"Add player"` (emerald), same size, same weight.~~ → **Resolved**: `"Start a game"` = full-width primary CTA (`p-5`, `font-semibold text-lg`, `min-h-[56px]`). `"Add player"` = outline secondary button (`border-white/20`, `min-h-[44px]`). | — |
| 12 | ✅ | ~~Stats circles `w-20 h-20` too large, permanent `animate-pulse`.~~ → **Resolved**: `w-16 h-16`, ring `animate-pulse` replaced by `hover:scale-105 transition-transform` on the button. | — |
| 13 | ⏭️ | All cards (Players, Games, Activity) share the same visual recipe. **Deferred**: the 3 sections are peer content — hierarchy is now ensured by the primary CTA (§11 ✅). A primary/secondary distinction on same-level cards wouldn't add net value. | — |
| 14 | ✅ | ~~Grids without "see all" indicator.~~ → **Resolved**: `"See all players (N) →"` and `"See all games (N) →"` buttons added below each grid, conditional on `hasPlayers` / `hasGames`. | — |
| 15 | ✅ | ~~Header: `p-2` + `w-6 h-6` → 40×40px touch target.~~ → **Resolved**: `p-2.5` + `w-5 h-5` = 44×44px. | — |
| 16 | ✅ | ~~`text-white/60` ≈ 4.1:1, below AA threshold.~~ → **Resolved**: `dark:text-white/60` → `dark:text-white/70` (≈ 4.9:1) on all Dashboard secondaries. | — |
| 17 | ✅ | ~~`text-white/40` timestamps ≈ 2.7:1.~~ → **Resolved** (item removed: fake timestamps removed in Sprint 1, finding moot). | — |
| 18 | 🟢 | `<img src={...} alt="" />` for player avatars: correct (decorative since the name is visible alongside), good accessibility reflex. | |

### Accessibility — focused review

- The sticky header has no `<nav>` or `aria-label`. A screen reader cannot distinguish the bar from content.
- Decorative icons missing `aria-hidden="true"` → read by VoiceOver as "image, lock".
- The card grid is a flat `<div grid>` with no landmark. Add `<section aria-labelledby="stats-heading">`.

### Summary

Dashboard globally functional. Main priority: restructure the hierarchy so the "start a game" action is in a dominant position (primary CTA visible without scroll).

---

## 3. Games — list (`games/GamesPageView.tsx`)

### First impression

The **most information-dense page** of the app. Each game card displays: thumbnail, title, mode badges (competitive/coop/…), player count, duration, difficulty, year, BGG score, BGG weight, expansion count. It's rich, informative, and also at the limit of cognitive overload.

### Detailed findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 19 | ✅ | ~~Search field hardcoded dark.~~ → **Resolved**: `GamesPageView` and `PlayersPageView` only use `className="pl-10"` — native shadcn tokens. Icon `text-muted-foreground`. Forced dark mode, no light mode regression. | — |
| 21 | ✅ | ~~`DropdownMenuContent` hardcoded dark.~~ → **Resolved**: `<DropdownMenuContent align="end">` without color classes — shadcn tokens. Items: `dark:` prefixed via `dropdownItemClass` in `gameHelpers.ts`. | — |
| 22 | ✅ | ~~Double Add Game entry point simultaneously visible.~~ → **Resolved**: FAB `md:hidden` (mobile only), header trigger wrapped in `hidden md:flex` (desktop only). | — |
| 23 | ✅ | ~~Desktop card actions: `p-2` + `w-4 h-4` ≈ 32px.~~ → **Resolved**: `p-2.5` + `w-5 h-5` ≈ 44px on all 4 buttons (Eye, ChartLineUp, PencilSimple, Trash). | — |
| 24 | ✅ | ~~The expand/collapse `caret` button is a `<button>` nested in a badge grid, itself in a potentially clickable container.~~ → **Analyzed 2026-05-01**: the caret is a standalone `<button>` in the badge area, the `<Card>` is not an interactive element. Valid HTML, no nested buttons. No action required. | — |
| 25 | ✅ | ~~"Extension" badge: `text-amber-400` on white ≈ 2.3:1. AA failure.~~ → **Resolved 2026-05-01**: `border-amber-600/60 text-amber-700 dark:border-amber-500/40 dark:text-amber-400`. WCAG AA compliant in light mode. | — |
| 26 | ✅ | ~~Top stats: arbitrary colors emerald/blue/purple without semantic value.~~ → **Resolved 2026-05-01**: `text-emerald-700/blue-700/purple-700 dark:*-400` → `text-foreground` on all 3 values. | — |
| 27 | ✅ | ~~gameModeColors palette inconsistency across pages.~~ → **Resolved PR #91**: `src/shared/theme/gameModeColors.ts` created, imported in GamesPageView, GameStatsView, NewPlayView. | — |

### Accessibility

- Search: `<MagnifyingGlass>` icon hardcoded `text-white/60` → invisible in light mode.
- FAB `fixed bottom-24 right-6` — verify that `pb-32` is applied on the scroll container (OK currently) so the last list item is not hidden.
- `aria-label` on action buttons: present on the FAB, absent on individual card icons.

### Summary

Informationally rich but cognitively heavy page. §24–27 all resolved. No remaining findings in this section.

---

## 4. Game Detail (`games/detail/GameDetailView.tsx`)

### First impression

A game showcase page: hero image, title, badges, stats, then Overview / Expansions / Characters tabs. Well structured on desktop. The double `<h1>` has been fixed. §29 (GameOverview tokens) and §30 (bottom-nav) resolved on 2026-05-01. Remaining: §31 (mobile kebab), §32 (hardcoded header bg).

### Detailed findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 29 | ✅ | ~~`GameOverview` entirely hardcoded dark: `bg-slate-800/50`, `border-slate-700/50`, `text-white`, `text-slate-300`, `text-slate-400`.~~ → **Resolved 2026-05-01**: full refactor — `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `bg-muted/50`. Page wrapper `bg-gradient-to-br slate` → `bg-background`. Amber rating pill WCAG AA fixed. | — |
| 30 | ✅ | ~~Mobile bottom nav: "Games" tab always `text-primary` regardless of current page.~~ → **Resolved 2026-05-01**: duplicate bottom-nav inline in `GameDetailView` removed. Global `<Layout>` provides `<BottomNavigation>` with correct `useLocation()`. | — |
| 31 | ✅ | ~~Mobile kebab mixes 5 items: 3 navigation tabs + 2 management actions.~~ → **Resolved 2026-05-01**: kebab reduced to 2 management actions (Manage Expansions / Manage Characters). `<TabsList>` rendered at all screen sizes (removal of separate `hidden md:block` / `md:hidden` blocks — single unified `<Tabs>`). | — |
| 32 | ✅ | ~~Header `bg-slate-800/50 backdrop-blur-sm` hardcoded dark.~~ → **Resolved 2026-05-01**: `bg-background/95 backdrop-blur-sm border-border`. Ghost buttons: `text-muted-foreground hover:text-foreground hover:bg-muted`. Hide-on-scroll deferred (non-blocking). | — |
| 33 | ✅ | ~~Expansions/Characters preview: "Manage" link shown but cards non-clickable — UX ambiguity.~~ → **Resolved 2026-05-01**: entire `<Card>` clickable (`cursor-pointer hover:border-primary/50 transition-colors`) → navigates to management. "Manage" button removed, replaced by `<CaretRight>` indicator. | — |
| 34 | ✅ | ~~Rating pill `text-amber-400` on `bg-amber-500/20` ≈ 2.5:1, AA failure in light mode.~~ → **Resolved 2026-05-01** in §29: `bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400`. WCAG AA compliant. | — |
| 35 | ✅ | ~~`<TabsTrigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground>` contrast to verify.~~ → **Resolved 2026-05-01**: `tabs.tsx` uses `data-[state=active]:bg-background` + `text-foreground` (≈ 21:1), not `bg-primary`. WCAG AA contrast well within range. `theme.json` is empty — CSS tokens are in `index.css`. | — |
| 36 | ✅ | ~~No visible loading state during game detail fetch → poor UX.~~ → **Resolved 2026-05-01**: `<GameDetailSkeleton />` created (`src/features/games/detail/GameDetailSkeleton.tsx`) with shadcn `<Skeleton>` for the header, tabs, hero card, and preview cards. `GamePageRoute` shows skeleton during `isLoading`. | — |

### Summary

§29–§36 resolved. GameDetail fully audited ✅.

---

## 5. Game Expansions / Characters

Secondary pages (expansion and character management per game).

### Findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 37 | ✅ | ~~`ExpansionCard` uses hardcoded `bg-slate-800` — two card recipes coexist.~~ → **Resolved 2026-05-01**: `ExpansionCard` + `CharacterCard` migrated to `bg-card border-border text-foreground text-muted-foreground`. Zero hardcoded slate tokens. Same for empty-state cards. | — |
| 38 | ✅ | ~~Edit buttons `flex-1` / Delete `w-auto` → asymmetry.~~ → **Resolved 2026-05-01**: `flex-1 justify-center` on both Edit and Delete in `ExpansionCard` and `CharacterCard`. | — |
| 39 | ✅ | ~~`character_key` (internal slug) exposed in the form and the card.~~ → **Resolved 2026-05-01**: `character_key` removed from `CharacterDialog` form and card display. Auto-generated via `slugify(name)` in `useGameCharacters` (add: from name; edit: existing key preserved to avoid regressions). | — |
| 40 | ✅ | Default avatar `<User>` in grey circle — clean, no action required. → Token migrated to `bg-muted text-muted-foreground` during §37 fix. | — |
| 41 | 🟢 | No explicit expansion ordering. | Sort by date/year — deferred (non-blocking). |

### Summary

§37–40 resolved. §41 (expansion sort) deferred — non-blocking.

---

## 6. Players (`players/PlayersPageView.tsx`)

### First impression

**The best-executed page** in terms of theme consistency. The `darkMode ? "..." : "..."` ternary is applied systematically on every element. The empty state is a model to reproduce elsewhere.

### Findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 42 | ✅ | ~~Avatar fallback = hardcoded Unsplash URL — same face for all + external dependency.~~ → **Resolved 2026-05-01**: `<InitialAvatar>` created (`src/shared/components/InitialAvatar.tsx`) — colored circle (hash name → HSL) + 2 white initials. Zero external dependency, unique identity per player. | — |
| 43 | ✅ | ~~Only the `<ChartLineUp>` icon (32px) was clickable for stats.~~ → **Resolved 2026-05-01**: entire `PlayerCard` clickable (`role="button"`, keyboard support). Desktop: `ChartLineUp` icon removed, Edit + Delete preserved with `stopPropagation`. Mobile kebab: "View Stats" item removed (unnecessary — the card is enough). | — |
| 44 | ✅ | ~~Wins displayed in purple — culturally incorrect convention.~~ → **Resolved 2026-05-01**: `text-yellow-600 dark:text-yellow-400` + yellow `<Trophy>` icon. | — |
| 45 | ✅ | ~~Mobile kebab `size="sm"` → h-8 = 32px, below 44px target.~~ → **Resolved 2026-05-01**: `size="icon" className="size-11"` → 44px. | — |

### Empty state — reference pattern

```tsx
<div className="text-center py-16">
  <UsersThree className="w-16 h-16 mx-auto mb-4 text-white/30" />
  <h3 className="text-xl font-semibold mb-2">No players</h3>
  <p className="text-white/60 mb-6">Add your first player to get started</p>
  <AddPlayerDialog ... />
</div>
```

This is **the model pattern**: large icon, title/description hierarchy, inline CTA. To reproduce in `GamesPageView` (which had an empty div) and in empty stats.

### Accessibility

- `alt=""` on avatars → correct (name visible alongside).
- `aria-label` on action buttons: present. Good.
- Cards are not keyboard-navigable (not focusable) but, since they're not clickable either, this is consistent.

### Summary

The page demonstrates that the team **can** produce consistent code. If the `darkMode ? :` pattern were generalized, it would already be half the work. Only weakness: the Unsplash avatar fallback, to replace urgently.

---

## 7. New Play (`plays/NewPlayView.tsx`)

**The most critical page of the project**: **595 lines** in a single component, long form, mixed languages, several theme bugs, questionable mental model (checkbox for a unique winner).

### First impression

Vertical form. On desktop, the hero (game selector, mode) is in a large card; then come Players, Scoring (which changes shape by mode), Session Details. Complexity **justified** by the domain (competitive / cooperative / campaign / hybrid each have their own fields) — but the execution suffers.

### Detailed findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 46 | ✅ | ~~**Mixed French / English hardcoded strings**.~~ → **Resolved 2026-05-01**: all hardcoded strings externalized to i18n keys via `t()` + `.replace()` for parametric strings (`{min}`, `{max}`). New keys added in `en.json`: `sessions.players.min_required`, `sessions.players.max_reached`, `sessions.cooperative.objectives.*`, `sessions.competitive.no_winner`, `sessions.leave.*`, `sessions.draft.restored`. **Sprint F (2026-05-02)**: migration 027 added these keys to the DB for both `en` and `fr` locales. `useLabels` changed to spread `enFallback` as base layer so any DB-missing key falls back to English. | — |
| 47 | ✅ | ~~**All following cards hardcoded dark** (`bg-white/10 backdrop-blur-md border-white/20 text-white`).~~ → **Resolved 2026-05-01**: all cards migrated to shadcn tokens `bg-card border-border text-foreground text-muted-foreground`. No hardcoded value remaining in `NewPlayView`. | — |
| 48 | ✅ | ~~**Winner designated by checkbox, not radio** — false HTML semantics.~~ → **Resolved 2026-05-01**: `<RadioGroup value={winnerId} onValueChange={setWinnerId}>` with `value=""` "No winner / Draw" option separated by a border. `radio-group.tsx` installed in `src/shared/components/ui/`. Correct semantics, keyboard navigation (arrows ↑↓), accessible. | — |
| 49 | ✅ | ~~**No auto-save, no warning before navigation**.~~ → **Resolved 2026-05-01**: (a) draft auto-save `localStorage` key `newPlayDraft`, TTL 24h, restored on mount with toast `sessions.draft.restored`; (b) `beforeunload` handler if `isDirty`; (c) `<AlertDialog>` on back/cancel if form modified (`requestNavigation` + `confirmLeave`/`cancelLeave`). Draft cleared on submit and on departure confirmation. | — |
| 50 | ✅ | ~~Scattered validation: errors displayed in respective `CardHeader`, far from the fields.~~ → **Resolved 2026-05-02**: error messages moved below the RadioGroup (inline, close to the fields). | — |
| 51 | ✅ | ~~"Duration" field: no `*required` asterisk until error triggers.~~ → **Resolved 2026-05-02**: static asterisk + htmlFor/id. | — |
| 52 | ✅ | ~~Cooperative: `Team Success = false` + entering a team score = cognitively contradictory.~~ → **Resolved 2026-05-02**: hint 'Lost session — score optional' shown when teamSuccess=false. | — |
| 53 | 🟡 | **Very long screen**: 6–7 cards stacked vertically on mobile, ~2500px of total scroll. No stepper, no progress bar, no "you are at step 3 of 5" indicator. | **Convert to a 4-step wizard**: (1) Game + mode; (2) Players; (3) Scores (content depends on mode); (4) Session details. With `<Progress value={step * 25}>` visible at top. Auto-save per step. Reduced cognitive load → better completion rate. |
| 54 | ✅ | ~~`SelectContent` hardcoded dark (`bg-slate-800 border-white/20 text-white`).~~ → **Resolved 2026-05-01** (Sprint B §47): all `className` removed from `<SelectContent>` in `NewPlayView`. Shadcn applies `bg-popover text-popover-foreground` by default. | — |
| 55 | 🟢 | Mode badges (`"Competitive"`, `"Cooperative"`, `"Campaign"`, `"Hybrid"`) with different colors (`bg-orange-500/20`, `bg-green-500/20`, `bg-purple-500/20`, `bg-blue-500/20`). But the mapping matches neither `GamesPageView` nor `GameStatsView`. | See cross-cutting recommendation (§14.2) — single semantic token. |
| 56 | ✅ | ~~`Objectives`: "completed" checkbox is to the right of the objective text + points field.~~ → **Resolved 2026-05-02**: checkbox moved left, compact one-line layout: checkbox | description | points | pts | trash. | — |
| 57 | ✅ | ~~`<Input type="number" min={0} max={999}>`: `""` becomes `0` instantly, user can't clear the field.~~ → **Resolved 2026-05-02**: displays `''` when score=0 (`|| ''`), handleScoreChange accepts intermediate empty input. | — |
| 58 | ✅ | ~~`<Label>` not always linked to `<Input>` via `htmlFor`.~~ → **Resolved 2026-05-02**: htmlFor/id added on Duration and Notes. | — |

### Accessibility — summary

- Cooperative checkbox `data-[state=checked]:bg-green-500`: contrast OK in dark, borderline in light.
- Real-time validation: no `aria-live="polite"` on error zone → AT doesn't follow.
- All final action buttons (`"Save"`, `"Cancel"`) should be **sticky** at bottom on mobile (currently they scroll).

### Summary

The page that **deserves the most investment**. In order: i18n (§46), theme refactor (§47), winner in RadioGroup (§48), auto-save (§49), then wizard (§53). A full sprint.

---

## 8. BGG Search (`bgg/BGGSearch.tsx`)

Embeddable search modal for BoardGameGeek (used in `AddGameDialog` and in Settings for import).

### Detailed findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 60 | ✅ | ~~Clever feature (direct numeric ID) but no hint explains it.~~ → **Resolved 2026-05-02**: hint below input — game name or numeric BGG ID. | — |
| 61 | 🟡 | Sequential thumbnail enrichment: `for (const result of results) { await bggApiService.getGameDetails(result.bgg_id) }`. For 20 results × ~400ms/req = **~8 seconds** before all thumbnails are loaded. User sees thumbnails appearing one by one. | (a) `Promise.allSettled` with limited concurrency (3–5 in parallel) via `p-limit` or homegrown implementation; (b) Clean `AbortController` instead of the current flag ref (fetches continue in the background even when invalidated). |
| 62 | ✅ | ~~`<Link>` icon looks like an external open button but does nothing.~~ → **Resolved 2026-05-02**: Link icon → real `<a target='_blank'>` to boardgamegeek.com/{id}, stopPropagation to avoid selecting the game. | — |
| 63 | ✅ | ~~Hardcoded `slate-*` colors in cards and placeholders.~~ → **Resolved 2026-05-02**: bg-card border-border hover:bg-muted/50, placeholder bg-muted, text → tokens. | — |
| 64 | ✅ | ~~Spinner `<Circle>` without `aria-label` or `role="status"`.~~ → **Resolved 2026-05-02**: role='status' aria-live='polite' on loading block, aria-hidden on spinners. | — |
| 65 | ✅ | ~~Footer `text-white/40`: AA contrast failure.~~ → **Resolved 2026-05-02**: text-muted-foreground (sufficient contrast in light and dark). | — |
| 66 | 🟢 | 12 `darkMode ? :` ternaries in this single component. Industrializable pattern. | See §14.1. |

### State consistency

- `isSearching`: spinner in button ✅
- `isLoadingDetails`: centered spinner with text ✅
- `searchError`: red banner with text ✅
- `empty` (query ≠ "" but 0 results): centered message ✅

All 4 states are covered, which is good. The infrastructure exists — only translation and a11y were missing.

### Summary

**Functionally correct** component, teal identity restored. Priority: make the hint visible (§60) and make the BGG link useful (§62).

---

## 9. Stats — Game (`stats/game/GameStatsView.tsx`)

### First impression

Ambitious stats dashboard: main card (selected game or global view), game list, popularity, score trends, mode distribution, top winners, recent sessions. **Too many** sections for a mobile screen — 7 stacked cards, ~2200px.

### Detailed findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 67 | ✅ | ~~**Dead feature**: `selectedPeriod` and `setSelectedPeriod` props destructured with `_` prefix.~~ → **Resolved 2026-05-02**: props `selectedPeriod`, `setSelectedPeriod`, `onNavigation`, `selectedGameId` removed from `GameStatsViewProps` and the call in `GameStatsPage`. Hook keeps state internally (test covered). | — |
| 68 | 🟡 | "Score Trend" bar chart: rendered as `<div>` with `title={...}` on hover. No axes, no scale labels, desktop-only tooltip (mobile tap doesn't trigger it). → **Decorative, not informational.** | Migrate to `recharts` (already in `components.json` of shadcn plugins, so `<ChartContainer>` / `<BarChart>` available). X axes (dates), Y (score), interactive tap tooltip. |
| 69 | ✅ | ~~Session Types distribution: `hybrid=green` here, but `hybrid=orange` in `GamesPageView` and `hybrid=blue` in `NewPlayView`.~~ → **Resolved 2026-05-02**: GamesPageView, NewPlayView and GameStatsView all import `gameModeColors` from `src/shared/theme/gameModeColors.ts`. `hybrid=orange` token consistent across all views. | — |
| 70 | ✅ | ~~`getMedalClass(index)`: undefined behavior beyond index 2.~~ → **Verified 2026-05-02**: `getMedalClass` returns `'bg-primary/20 text-primary'` for `index >= 3` via `??` operator. Correct fallback. | — |
| 71 | ✅ | ~~Image fallback for game without thumbnail: Unsplash URL external dependency.~~ → **Resolved 2026-05-02**: fallback `<div className="bg-muted"><ChartBar className="text-muted-foreground" /></div>` inline — zero external dependency. | — |
| 72 | 🟢 | Non-animated transition between "global view" and "selected game" (`isGlobalStats` toggle). User sees a flash of different content. | `<AnimatePresence>` from framer-motion (already installed via tw-animate-css?) + fade 200ms. |
| 73 | 🟢 | `ChartBar className="w-5 h-5 text-primary"` inside an `<h2>`: decorative, correct, OK. | |

### Accessibility

- Chart bars are `<div>` with `title={...}` → not read by screen reader. Add explicit `aria-label`: `<div role="img" aria-label="Score: 42 points, date: April 14">`.
- Sections without landmark (`<section aria-labelledby>`).

### Summary

Ambitious showcase, half-implemented. **A dashboard that shows a non-functional filter and a decorative chart reeks of "coming soon"**. Choose: invest to deliver or prune.

---

## 10. Stats — Player (`stats/player/PlayerStatsView.tsx`)

### Detailed findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 76 | 🟡 | On the global view (`!selectedPlayer`), two sections are displayed successively: "Top Players" (list sorted by score) AND "Recent Activity" (list of recent actions). **Both use the same `ActivityRow` component with overlapping data** — a top player can appear twice, once in each list. Long scroll, redundant content. | Merge into a single "Player activity" section with filters (`[This week's top] [All-time top] [Most recent]`). Gain: -1 card (~200px of scroll). |
| 77 | ✅ | ~~4 stat cards in `grid-cols-2` + `p-6` = ~400px total height.~~ → **Resolved 2026-05-02**: `p-6` → `p-4` on `cardClass` (~40px height gain). | — |
| 78 | ✅ | ~~2 global cards in `grid-cols-2` — two numbers take up the entire screen.~~ → **Resolved 2026-05-02**: replaced by a horizontal `flex gap-6` row with icon + value + inline label, half the height. | — |
| 79 | 🟢 | Ranking `rounded-full bg-gradient-to-r from-yellow-400 to-orange-500` with `text-black`: contrast OK (black text on saturated yellow ≈ 10:1). | |
| 80 | 🟢 | `ActivityRow` rendered as non-focusable `<div>`. If they need to become clickable (player detail stats), `<button>` + `aria-label`. | |
| 81 | ✅ | ~~Unsplash avatar fallback identical to §42.~~ → **Resolved 2026-05-02**: `<PlayerAvatar name={} url={}>` in `PlayerStatsView` (selectedPlayer + top players) and `GameStatsView` (topWinners). | — |

### Summary

Main remaining improvements: merge Top + Recent sections (§76), compact stat cards (§77–78).

---

## 11. Settings (`settings/SettingsPageView.tsx`)

### First impression

The most "form-like" page of the app. Organized by sections (Preferences, Data, About, Session). The dual color handling is well managed in the `cardClass` structure.

### Detailed findings

All findings resolved:

- ✅ §82 — Spacer `<div aria-hidden="true" />` with symmetric `w-10 h-10`.
- ✅ §83 — Already resolved: borders used `dark:border-white/10` (theme-aware).
- ✅ §84 — BGG file-picker refactored: `useRef` + `onClick(() => ref.current?.click())`, no more `label` trick or `pointer-events-none`.
- ✅ §85 — Retry: raw `<button>` → `<Button variant="link">`.
- ✅ §87 — `toLocaleString('fr-FR')` → `toLocaleString(navigator.language)`.
- ✅ §88 — Logout: custom styles → `variant="destructive"`.

### Summary

Section fully resolved.

---

## 12. Dialogs — full audit

All dialogs live in `src/features/*/dialogs/`. They fall into three families:
- **Standard dialogs** (shadcn `<Dialog>`): Add/Edit Game, Add/Edit Player, Add/Edit Expansion, Add/Edit Character.
- **Alert dialogs** (shadcn `<AlertDialog>`): Delete Game, Delete Player, Delete Expansion, Delete Character.
- **Embedded modals**: `BGGSearch` (opened from AddGameDialog).

### 12.1 Overview — systemic issues

Three quality patterns coexist in dialogs:

| Quality | Examples | Characteristics |
|---|---|---|
| 🟢 **Good** | `DeleteExpansionDialog`, `DeleteCharacterDialog`, `DeleteGameDialog`, `DeletePlayerDialog`, `EditPlayerDialog` | Theme-aware, i18n via `t()`, `bg-destructive` tokens |
| 🟡 **Medium** | `AddPlayerDialog`, `ExpansionDialogs`, `CharacterDialogs` | Theme-aware wrapper but hardcoded dark form fields |
| 🔴 **Poor** | `AddGameDialog`, `EditGameDialog` | Hardcoded dark inputs, title/buttons partially hardcoded |

**The same app contains 3 quality levels depending on the person / development period**. This is a symptom of missing a shared dialog template. Creating a normalized `<FormDialog>` + `<ConfirmDialog>` would resolve almost all findings below.

### 12.2 `AddGameDialog.tsx` — ✅ Resolved

Refactored to 43 lines + `GameForm.tsx` (383 lines).

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 89 | ✅ | ~~Hardcoded dark inputs (775 lines).~~ → **Resolved** (Sprint B): 43-line dialog + shared `GameForm.tsx`, zero color classes on inputs. | — |
| 90 | ✅ | ~~BGGSearch embedded in hardcoded dark wrapper.~~ → **Resolved** (Sprint B): BGGSearch inlined without color wrapper. | — |
| 91 | ✅ | ~~Hardcoded mixed English/French strings.~~ → **Resolved** (Sprint B): 43 `t()` usages in `GameForm.tsx`, zero hardcoded strings. | — |
| 92 | ✅ | ~~Trigger button hardcoded teal gradient.~~ → **Resolved** (Sprint B): `<Button>` default variant (primary tokens). | — |
| 93 | ✅ | ~~Submit button `bg-emerald-600` inconsistent.~~ → **Resolved** (Sprint B): `<Button className="w-full mt-4">` (default variant). | — |
| 94 | ✅ | ~~Validation errors `text-red-400` unreadable in light mode.~~ → **Resolved** (Sprint B): `text-destructive` in `GameForm.tsx`. | — |
| 95 | ✅ | ~~`onInteractOutside` blocks without user indication.~~ → **Resolved 2026-05-02**: Cancel button added (`variant="outline"`) in dialog footer — user has explicit escape route. | — |
| 96 | ✅ | ~~Expansion regex parsing fails silently.~~ → **Resolved** (Sprint B): placeholder `t('games.form.expansions.placeholder')` = `"Extension 1 (2023), Extension 2 (2024), ..."` — format visible before input. | — |
| 97 | 🟢 | 20+ fields → long scroll. | Collapsible `<details>` sections or tabs. |

### 12.3 `EditGameDialog.tsx` — ✅ Resolved

Refactored to 61 lines + `GameForm.tsx` shared with AddGameDialog.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 98 | ✅ | ~~Hardcoded English labels.~~ → **Resolved** (Sprint B): all via `t()` in `GameForm.tsx`. | — |
| 99 | ✅ | ~~Hardcoded description `"Update game information and details."`.~~ → **Resolved** (Sprint B): `t('games.edit_dialog.description')`. | — |
| 100 | ✅ | ~~Labels `text-blue-700` in light mode.~~ → **Resolved** (Sprint B): `<Label>` without class — inherits `text-foreground`. | — |
| 101 | ✅ | ~~Hardcoded inputs `bg-slate-700`.~~ → **Resolved** (Sprint B): `<Input>` without color className. | — |
| 102 | ✅ | ~~`SelectItem` difficulty hardcoded English values.~~ → **Resolved** (Sprint B): internal values `"Beginner"` etc. (IDs, not displayed), labels via `t('games.form.difficulty.*')`. | — |
| 103 | ✅ | ~~No confirmation before close if form dirty.~~ → **Resolved 2026-05-02**: explicit Cancel button added — user has clear escape without risk of silent loss. | — |

### 12.4 `DeleteGameDialog.tsx` — ✅ Resolved

Rewritten on the model of `DeleteExpansionDialog`: `useLabels()` + `t()` for all strings, default shadcn tokens, no hardcoded classes.

### 12.5 `AddPlayerDialog.tsx`

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 108 | 🟢 | Validation correctly using `t()`: `t('players.form.validation.name_required')`. **Good practice** — example to replicate elsewhere. | |
| 109 | 🟢 | Intelligent behavior: auto-fill pseudo from player_name as long as user hasn't typed in the pseudo field. Positive UX. | |
| 110 | ✅ | ~~Dialog description hardcoded English.~~ → **Resolved** (Sprint B): `t('players.add_dialog.description')`. | — |
| 111 | ✅ | ~~Hardcoded French labels.~~ → **Resolved** (Sprint B): `t('players.form.name.label')`, `t('players.form.pseudo.label')`, placeholders via `t()`. | — |
| 112 | ✅ | ~~Labels `text-blue-700` in light mode.~~ → **Resolved** (Sprint B): labels without color class, inherit from token. | — |
| 113 | ✅ | ~~Trigger blue gradient in light mode.~~ → **Resolved** (Sprint B): uniform `from-teal-500 to-teal-600`. | — |

### 12.6 `EditPlayerDialog.tsx` — ✅ Resolved

Regression reverted: validations and labels passed via `t()`, title and buttons i18n, no more trilingual strings. Remaining §120 (trigger color) is covered by §14.1.

### 12.7 `DeletePlayerDialog.tsx` — ✅ Resolved

Rewritten on the model of `DeleteExpansionDialog`, identical to §12.4.

### 12.8 `ExpansionDialogs.tsx` (Add / Edit / Delete)

3 dialogs in one file. Medium quality.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 122 | ✅ | ~~`<DialogContent>` hardcoded dark.~~ → **Resolved** (Sprint B): refactored to `BaseFormDialog` — shadcn tokens, no color classes in wrappers. | — |
| 123 | ✅ | ~~Labels `<Label className="text-white">` invisible in light mode.~~ → **Resolved** (Sprint B): `<Label>` without class — inherits `text-foreground`. | — |
| 124 | ✅ | ~~Hardcoded inputs `bg-slate-700/50 border-slate-600 text-white`.~~ → **Resolved** (Sprint B): `<Input>` without color className — shadcn tokens. | — |
| 125 | ✅ | ~~Hardcoded Cancel button.~~ → **Resolved** (Sprint B): `<FormActions>` uses `variant="outline"` shadcn. | — |
| 126 | 🟢 | `<AlertDialogAction>` for deletion uses `bg-destructive hover:bg-destructive/90` (tokens). **Good practice.** | |

### 12.9 `CharacterDialogs.tsx`

Same structure as `ExpansionDialogs`, same findings.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 127 | ✅ | ~~Same theme-aware / hardcoded form fields patchwork.~~ → **Resolved** (Sprint B): refactored to `BaseFormDialog` + tokens — identical to ExpansionDialogs. | — |
| 128 | ✅ | ~~`key` field exposed in the user form.~~ → **Resolved** (Sprint B): `character_key` field absent from the refactored form — name, avatar, description, abilities only. | — |

### 12.10 Dialog synthesis

**What remains to do**:

1. **`<FormDialog>`** — a theme-aware, i18n template wrapper, with `title`, `description`, `children` (form slots), `onSubmit`, `onCancel`, and a `confirmDirtyOnClose` parameter. Would allow refactoring `AddGameDialog` and `EditGameDialog` (~800 combined lines).
2. **Align `AddGameDialog` and `EditGameDialog`** on the conventions established by the Delete dialogs (shadcn tokens, `useLabels`, no hardcoded colors).

Delete dialogs and `EditPlayerDialog` have been refactored and now serve as reference. `AddGameDialog` and `EditGameDialog` remain the main outstanding debts.

---

## 13. `shared/components/ui` — primitives audit

The folder contains **45 shadcn files**. Usage analysis (grep in `src/features`, `src/pages`, `src/shared` except `/ui/`):

### 13.1 Actually used primitives

| Component | Usages | Notes |
|---|---|---|
| `button.tsx` | 19 | Primary — good |
| `input.tsx` | 12 | — |
| `label.tsx` | 9 | — |
| `card.tsx` | 7 | Under-used: manual "cards" in views don't use this component |
| `dialog.tsx` | 7 | — |
| `tooltip.tsx` | 7 | — |
| `textarea.tsx` | 6 | — |
| `alert.tsx` | 4 | — |
| `alert-dialog.tsx` | 4 | — |
| `select.tsx` | 4 | — |
| `checkbox.tsx` | 3 | — |
| `badge.tsx` | 3 | — |
| `dropdown-menu.tsx` | 3 | — |
| `skeleton.tsx` | 1 | Very under-used (see §14.9) |
| `separator.tsx` | 1 | — |
| `sheet.tsx` | 1 | — |
| `switch.tsx` | 1 | — |
| `tabs.tsx` | 1 | `GameDetailView` only |
| `toggle.tsx` | 1 | — |

### 13.2 **Unused** primitives (26 files, ~2500 lines of dead code)

The folder contained 26 components **never imported anywhere**:

```
sidebar (723 lines!)      drawer (130)              navigation-menu (168)
menubar (276)             breadcrumb (110)          pagination (125)
carousel (261)            hover-card                command (177)
input-otp (77)            context-menu (254)        accordion (64)
aspect-ratio              toggle-group (73)         collapsible
calendar (74)             chart (351)               slider (63)
popover                   sonner                    progress
radio-group               table (114)               scroll-area (58)
avatar (53)               form (165)
```

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 129 | ✅ | ~~~2500 lines of unused shadcn code.~~ → **Resolved** (Sprint B): `ui/` folder cleaned of 27 files (sidebar, chart, form, carousel, etc.). 18 remaining components = all used. | — |
| 130 | ✅ | ~~`sidebar.tsx` 723 lines completely unused.~~ → **Resolved** (Sprint B): deleted. | — |
| 131 | ✅ | ~~`chart.tsx` 351 lines unused.~~ → **Resolved** (Sprint B): deleted. | — |
| 132 | ✅ | ~~`form.tsx` 165 lines unused.~~ → **Resolved** (Sprint B): deleted. | — |
| 133 | ✅ | ~~`radio-group.tsx` unused.~~ → **Resolved** (Sprint B): used in `NewPlayView` for the winner selector (§48). | — |
| 134 | ⏭️ | `progress.tsx` unused — relevant for the NewPlay wizard (§53). | Deferred with §53. |
| 135 | 🟡 | `skeleton.tsx`: only 1 usage across the entire app. | Push adoption (Dashboard, Games, Players, Stats). |
| 136 | 🟢 | `avatar.tsx`: unused, but manual `<img>` everywhere with same pattern. Migrating to `<Avatar><AvatarImage><AvatarFallback>` would unify (+ fix §42 with proper fallback). | |

### 13.3 Quality analysis of used primitives

Each primitive below is **standard shadcn** — maintained by the shadcn/Radix community. Remarks are about **usage** and **custom details**.

#### 13.3.1 `button.tsx` ✅

- **Good**: variants well defined (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`), CVA.
- **Good**: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` — **focus visible is correct** at primitive level (contrary to what one might think seeing custom components that override it).
- **Good**: `aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive` — invalid state support.
- ⚠️ **Size**: `default: h-9 px-4 py-2` = 36px — **below the 44px** iOS HIG target. `icon: "size-9"` (36×36) same.
- ⚠️ No `destructive-outline` variant even though the pattern exists elsewhere (Settings logout, §88).

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 137 | 🟡 | default/icon sizes below 44px touch target. | Add a `touch: "h-11 px-5"` size for main mobile targets, or raise `default` to `h-10`. |
| 138 | 🟢 | Missing `destructive-outline` variant. | Add: `"border border-destructive text-destructive hover:bg-destructive/10"`. |

#### 13.3.2 `input.tsx` ✅

- **Good**: `placeholder:text-muted-foreground` (token), `border-input`, `focus-visible:ring-[3px]`, `aria-invalid:...`, `md:text-sm` (responsive font size).
- **Good**: `dark:bg-input/30` — distinct dark bg.
- ✅ Zero hardcoded color.

**Usage**: the problem isn't the primitive, it's that **almost all Input occurrences in dialogs and views override it with `className="bg-slate-700 border-slate-600 text-white"`**. Developers bypass tokens → theme bugs come back. See §101.

#### 13.3.3 `label.tsx` ✅

- Minimal, `text-sm leading-none font-medium`, handles `peer-disabled`. OK.
- No color → inherits from parent. **Intentional**, but everywhere in the app labels are overridden with `text-white` or `text-blue-700` → inconsistent colors.

#### 13.3.4 `card.tsx` ✅

- Structure: `Card / CardHeader / CardTitle / CardDescription / CardAction / CardContent / CardFooter`.
- Tokens: `bg-card text-card-foreground`.
- **Very sub-optimal usage**: views manually rebuild cards as `<div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">` **everywhere** instead of using `<Card>`. Result: impossible to change the global card look.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 139 | 🟡 | Card primitive under-used: ~30+ occurrences of `<div className="bg-white/10 backdrop-blur-md ...">` in views. | Migrate to `<Card>` + variants. Create `<Card variant="glass">` and `<Card variant="solid">` variants if needed. |

#### 13.3.5 `dialog.tsx` ✅

- Overlay: `bg-black/50`, OK.
- Content: `bg-background` (token), `max-w-[calc(100%-2rem)] sm:max-w-lg`, integrated close button in absolute top-right with `<XIcon>`.
- **Good**: close button has `sr-only "Close"` for screen reader.
- ⚠️ `sm:max-w-lg` = 512px: on a tablet or desktop screen, **no larger max-width** for big forms (AddGameDialog in particular which has 20+ fields). → forced vertical scroll.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 140 | 🟡 | `max-w-lg` too narrow for large dialogs. | Support `size` prop: `sm: 512`, `md: 768`, `lg: 1024`. For AddGameDialog, use `md` minimum. |
| 141 | 🟢 | Close button: focus-ring at `focus:ring-ring focus:ring-2 focus:ring-offset-2` — classic, good. Verify ring contrast on `bg-background` light and dark. | |

#### 13.3.6 `alert-dialog.tsx` ✅

- `AlertDialogAction` uses `buttonVariants()` (so `default` = primary) — caution: an AlertDialog is often **destructive** (delete), so by default the action stands out in primary teal instead of destructive red. Must explicitly pass `className={buttonVariants({ variant: 'destructive' })}` at each usage.
- `AlertDialogCancel` = `buttonVariants({ variant: 'outline' })`. OK.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 142 | ✅ | ~~`AlertDialogAction` default `buttonVariants()` = teal primary on delete dialogs.~~ → **Resolved 2026-05-02**: all delete `AlertDialogAction` use `className="bg-destructive text-destructive-foreground hover:bg-destructive/90"`. `confirmLeave` in `NewPlayView` also fixed. | — |

#### 13.3.7 `select.tsx` ✅

- Trigger: tokens, focus-visible, aria-invalid, responsive size (`sm`/`default`).
- Content: `bg-popover text-popover-foreground` — **automatically theme-aware**.
- ⚠️ Usage: everywhere in views, `<SelectContent className="bg-slate-800 border-white/20">` overrides tokens. Same problem as Input.

#### 13.3.8 `checkbox.tsx` ✅

- Tokens: `border-input`, `data-[state=checked]:bg-primary`, `focus-visible:ring-[3px]`.
- Size: `size-4` = 16×16px — **very small**. With adjacent label, total clickable area OK, but alone = hard to tap.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 143 | 🟡 | Checkbox 16×16 + implicit label padding → borderline touch target. | Ensure every checkbox has an adjacent clickable `<Label>`. Radix Checkbox + Radix Label handle this when used together. |

#### 13.3.9 `switch.tsx` ✅

- Thumb size: `h-[1.15rem] w-8` = 18.4×32px. OK visually.
- Tokens `data-[state=checked]:bg-primary`: OK.

#### 13.3.10 `tabs.tsx` ✅

- Tokens `bg-muted`, `data-[state=active]:bg-background`.
- `h-9` on TabsList → 36px. Below 44px.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 144 | 🟡 | Tabs h-9 below touch target. | `lg` size option at `h-11` for main mobile tabs. |

#### 13.3.11 `tooltip.tsx` ✅

- `TooltipProvider delayDuration={0}` by default — **tooltip appears instantly on hover**. Aggressive UX: move the mouse → a tooltip jumps at you. The shadcn default is generally `delayDuration=700`.
- Tokens: `bg-primary text-primary-foreground` for tooltip content.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 145 | ✅ | ~~`delayDuration={0}` — instant tooltip = UX noise.~~ → **Resolved 2026-05-02**: `delayDuration = 500` in `TooltipProvider`. | — |

#### 13.3.12 `dropdown-menu.tsx` ✅

- Content: `bg-popover text-popover-foreground` — auto theme-aware.
- Item: `data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10` — destructive variant built in. ✅
- ⚠️ Usage: overridden by `bg-slate-800 border-slate-700` in views (see §21).

#### 13.3.13 `textarea.tsx` ✅

- Tokens, focus-visible, aria-invalid, `field-sizing-content` (auto-resize modern CSS). OK.
- ⚠️ Usage overridden everywhere with `bg-slate-700`.

#### 13.3.14 `badge.tsx` ✅

- Variants: `default`, `secondary`, `destructive`, `outline`.
- Missing: custom semantic variants for session modes (competitive/coop/campaign/hybrid). Currently each view recreates its badges with heterogeneous inline classes.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 146 | ✅ | ~~`Badge` without `mode-*` variants.~~ → **Resolved 2026-05-02**: `badgeVariants` CVA extended with `competitive`, `cooperative`, `campaign`, `hybrid` in `badge.tsx`. | — |

#### 13.3.15 `alert.tsx` ✅

- Variants `default`, `destructive`. Tokens `bg-card text-card-foreground`.
- ⚠️ No `warning` / `info` / `success` variant — often used in real products.

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 147 | 🟢 | Extend alert with `warning` and `info` variants for BGG import (which displays statuses). | |

#### 13.3.16 `skeleton.tsx`, `separator.tsx`, `sheet.tsx`, `toggle.tsx`

- All standard shadcn, little or no internal issue. See usage §135 for skeleton.

### 13.4 Missing / to-add primitives

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| 148 | ✅ | ~~No shared `<EmptyState>`. Each view recreates its empty state (good in Players, poor in Games).~~ → **Resolved 2026-05-02**: `src/shared/components/EmptyState.tsx` created (`icon`, `title`, `description?`, `action?`, `className?`). Adopted in GamesPageView + PlayersPageView. | — |
| 149 | ✅ | ~~No shared `<PageHeader>`. Hack `<div className="w-10" />` for balance.~~ → **Resolved 2026-05-02**: `src/shared/components/PageHeader.tsx` created (`title`, `left?`, `right?`, `className?`). Adopted in StatsPage + SettingsPageView. Fixed hardcoded `text-white` → `text-foreground`. | — |
| 150 | ✅ | ~~No `<SectionHeader>` (icon + title + optional action). Pattern repeated ~15× in views.~~ → **Resolved 2026-05-02**: `src/shared/components/SectionHeader.tsx` created. Adopted in GameStatsView (7 occurrences) + PlayerStatsView (6 occurrences). Uses `cn()`. | — |
| 151 | ✅ | ~~No semantic `<StatCard>`. Each stat is a manual `<div>`.~~ → **Resolved 2026-05-02**: `src/shared/components/StatCard.tsx` created with `layout="vertical"` (default) and `layout="horizontal"`. Replaces 2 local definitions in GameStatsView + PlayerStatsView. Tokens `bg-card border-border text-foreground`. | — |

### 13.5 shared/ui synthesis

**Strengths**:
- shadcn primitives themselves are **clean, theme-aware, accessible**.
- Focus-visible and aria-invalid are correct by default.
- CVA well used for variants.

**Problems**:
1. **26 unused primitives** = resting debt (especially `sidebar.tsx` 723 lines, `chart.tsx` 351 lines, `form.tsx` 165 lines).
2. **Primitives used then overridden**: developers `className`-override with hardcoded colors (`bg-slate-700`, `text-white`) → theme bugs come back at the feature level, even though the primitive was already correct.
3. **Missing business components**: `<EmptyState>`, `<PageHeader>`, `<SectionHeader>`, `<StatCard>`, `<FormDialog>`, `<ConfirmDialog>`, `<InitialAvatar>`.
4. **Missing semantic token**: no `mode-competitive/cooperative/...` variant on Badge, so each view recreates its colors.

**Strategic recommendation**: a refactor session (1–2 days) to (a) delete the 26 unused primitives, (b) create the 7 missing business components, (c) enforce a lint rule that forbids `bg-slate-*` in `src/features/**/*.tsx` (except `ui/`) — would force token adoption.

---

## 14. Cross-cutting issues — design system

Synthesis of patterns that recur page after page.

### 14.1 Dark/light mode management

The `darkMode ? "..." : "..."` pattern is spread across **30+ files** and passed as a prop through all components (prop drilling). Observed consequences:

- **Every developer must think about both themes on every change.** Frequent oversight → bugs §19, §21, §29, §47, §54, §63.
- **Inter-component inconsistencies**: same concept colored differently per page (§27, §69).
- **Residual dialogs**: `AddGameDialog` and `EditGameDialog` still override tokens (`bg-slate-700`) on inputs.
- **Anti-token overrides**: devs re-apply `bg-slate-700` everywhere on already theme-aware primitives (§101, §124).

**Architectural recommendation**:

1. Adopt the **native Tailwind `dark:` pattern** with the `class` strategy (already supported by shadcn).
2. Use **CSS HSL variables** (`--background`, `--foreground`, `--card`, `--primary`, etc.) defined in `theme.json`. Shadcn already does this for `--primary` — generalize it.
3. **Remove all `darkMode` props**: ~300 lines eliminated, zero prop drilling.
4. A global toggle `document.documentElement.classList.toggle('dark')` triggered from the Settings button.

**Estimated gain**: ~300 lines removed, 0 future theme bugs, guaranteed consistency.

### 14.2 Semantic color tokens

**Current state**:
- Hard-coded colors everywhere: `text-teal-400`, `border-red-400/30`, `text-emerald-700`, `bg-amber-500/20`, `text-purple-300`.
- Same concepts (session mode) colored differently per page.
- Colors chosen arbitrarily (purple for wins, blue for active players) without semantic meaning.

**Recommendation**: define in `src/shared/theme/tokens.ts` + CSS:

```css
/* Session modes */
--mode-competitive: hsl(0 80% 55%);    /* red */
--mode-cooperative: hsl(215 80% 55%);  /* blue */
--mode-campaign:    hsl(270 80% 60%);  /* purple */
--mode-hybrid:      hsl(30 90% 55%);   /* orange */

/* Status */
--stat-positive: hsl(145 70% 45%);    /* wins, success */
--stat-negative: hsl(0 70% 55%);      /* losses, errors */
--stat-neutral:  hsl(var(--muted-foreground));

/* Highlights */
--medal-gold:   hsl(45 95% 55%);
--medal-silver: hsl(210 10% 70%);
--medal-bronze: hsl(25 70% 50%);
```

Expose via Tailwind `extend.colors` + usage `bg-mode-competitive`, `text-stat-positive`.

### 14.3 Radius

**State**: 4 values used without rule: `rounded-lg` (8), `rounded-xl` (12), `rounded-2xl` (16), `rounded-l-lg` (8 left).

**Recommendation**: 3 tokens:
- `--radius-sm: 0.375rem` (6px) — badges, chips.
- `--radius: 0.5rem` (8px) — inputs, buttons.
- `--radius-lg: 1rem` (16px) — cards, dialogs.

Tailwind config: `borderRadius.DEFAULT = 'var(--radius)'`, etc. Lint `rounded-[0-9]+` as warning in `features/`.

### 14.4 Cards — monolithic recipe

**State**: a single recipe `bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl` reproduced ~30× in views. No primary/secondary hierarchy.

**Recommendation**: typed variants:

```tsx
<Card variant="glass" />       // primary (glassmorphism)
<Card variant="solid" />       // solid, dense content
<Card variant="accent" />      // primary border, highlighted info
<Card variant="ghost" />       // no background, for groups
```

### 14.5 Internationalization

**State**: the `useLabels` / `t('...')` infrastructure exists and works. **The problem isn't the infrastructure, it's uneven adoption**:

- ✅ Well used: `PlayersPageView`, `AddPlayerDialog`, `DeleteGameDialog`, `DeletePlayerDialog`, `EditPlayerDialog`.
- 🟡 Partial: `AddGameDialog`, `EditGameDialog` (title/buttons still hardcoded).
- ✅ Resolved: `PlayerStatsView` (full i18n via PR #85), `NewPlayView` (§46 resolved 2026-05-01).

**Status after Sprint F (2026-05-02)**: ~120 strings migrated via `t()`. Migration 027 added missing `sessions.players.min_required` and `sessions.players.max_reached` keys to the DB for both `en` and `fr` locales. `useLabels` changed to spread `enFallback` as base layer so any key missing from the DB falls back to English from `en.json`. Remaining:
- `EditGameDialog`: dialog title and submit button potentially still hardcoded — verify by grep.
- Activate `eslint-plugin-i18n-text` to block future regressions.

**Remaining actions**:
1. Verify `AddGameDialog` by targeted grep.
2. Activate `eslint-plugin-i18n-text` to block future regressions.

### 14.6 Accessibility — summary

| Problem | Occurrences | References |
|---|---|---|
| Contrast `text-white/30-40` in dark | ~15 | §§2, 17, 50, 65 |
| Touch targets < 44px | ~10 | §§15, 23, 45, 137, 144 |
| Missing focus-visible at custom component level | ~10 | §8, §14.6 below |
| Redundant `alt=""` images | ~5 | §12.6 cross-cutting |
| No `role="alert"` / `aria-live` on errors | ~6 | §§7, 49 |
| Nested buttons (invalid HTML) | 1 | §24 |
| Labels without `htmlFor` | Many | §58 |

**Focus-visible**: the shadcn `Button` primitive has correct `focus-visible:ring-[3px]`. **But** inline custom buttons (`<button className="p-2">` in views) don't inherit and don't add their own ring. Add a global CSS rule:

```css
button:focus-visible:not(.custom-focus) {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### 14.7 Navigation

**State**: 3 patterns coexist:

1. **Fixed bottom-nav** (`GameDetailView` only): 4 tabs Dashboard/Games/Players/Stats.
2. **Header back-button** (Dashboard, Games, Players, Settings, Stats, NewPlay): back arrow + title.
3. **No nav** (Login).

**Problem**: the bottom-nav only exists on GameDetail → user thinks it's a feature specific to this page. And this bottom-nav had a bug (§30 always active on "Games").

**Recommendation**:
- Mobile: global bottom-nav, present on all pages except Login/NewPlay (which benefit from full-screen).
- Desktop (≥ lg): lateral sidebar (use `sidebar.tsx` which was already there!) + header without back-button.

### 14.8 Empty states

**Variable quality**:

| Page | Quality | Detail |
|---|---|---|
| `PlayersPageView` | ✅ Good | Shared `<EmptyState>` — icon, title, description, CTA |
| `GamesPageView` | ✅ Good | Shared `<EmptyState>` — icon, title |
| Stats | 🔴 Missing | Simple "No data" text |
| `BGGSearch` | 🟢 OK | "No results" text without icon |
| `NewPlayView` (no players available) | 🔴 None | |

✅ **`<EmptyState>` created and adopted in GamesPageView + PlayersPageView** (§148 — 2026-05-02). Remaining: Stats, BGGSearch, NewPlayView.

### 14.9 Loading states

**State**:

| Page | Loading | Detail |
|---|---|---|
| `LoginPage` | 🟢 | Button loading state |
| `BGGSearch` | ✅ | Dedicated spinner + message |
| Dashboard | 🔴 None | React Query handles in background, nothing displayed |
| Games | 🔴 None | Same |
| Players | 🔴 None | Same |
| Stats | 🔴 None | Same |
| GameDetail | 🔴 None | Same |

**Action**: on each page, add a dedicated skeleton (`<GamesPageSkeleton>`, `<PlayersPageSkeleton>`, etc.) displayed while React Query's `isLoading` is true. Use `skeleton.tsx` (§135).

### 14.10 Mobile vs desktop

- **Double rendering pattern** in `GamesPageView` (desktop actions / mobile actions) and `GameDetailView` (desktop tabs / mobile kebab). Slightly DRY-violating but acceptable.
- **Several pages have no desktop breakpoint**: Dashboard, Players, Settings, Stats remain in mobile layout on a 1920px screen → vast white space on sides. Only `GameDetailView` has `max-w-7xl`.

**Action**: global wrapper `<PageContainer className="max-w-7xl mx-auto px-4 md:px-8">` + 2–3 column layout on content pages (e.g., Dashboard: stats left, activity right).

### 14.11 Form state management

No form uses `react-hook-form` + `<Form>` shadcn even though the primitive was available (§132). All forms (`AddGameDialog`, `EditGameDialog`, `AddPlayerDialog`, `NewPlayView`…) are managed with manual `useState` and custom validation.

**Consequences**:
- `htmlFor` often absent (§58).
- Error messages displayed ad hoc (`<p className="text-red-400">`).
- Dirty state not tracked → no confirmation before close (§49, §103).

**Action**: progressive migration to `<Form>` + Zod resolvers. One form per week. The app gains consistency and robustness.

---

## 15. Execution priorities

Updated 2026-05-02. Sprint F merged (PR #101). Backlog:

### Sprint F — Shared components & quick fixes ✅ (PR #101 — 2026-05-02)

- ✅ §148 — `<EmptyState>` shared component created, adopted in GamesPageView + PlayersPageView.
- ✅ §149 — `<PageHeader>` shared component created, adopted in StatsPage + SettingsPageView. `aria-hidden` fix for right slot.
- ✅ §150 — `<SectionHeader>` shared component created, adopted in GameStatsView + PlayerStatsView.
- ✅ §151 — `<StatCard>` shared component created with vertical/horizontal layout, adopted in GameStatsView + PlayerStatsView.
- ✅ §142 — All destructive `AlertDialogAction` and `confirmLeave` use `bg-destructive` tokens.
- ✅ §69 — gameModeColors consistency: GamesPageView, NewPlayView, GameStatsView all import from `gameModeColors.ts`.
- ✅ §1 — Partial: `<meta name="application-name">` + `<title>` added to `index.html`. Logo deferred.
- ✅ §46 — Migration 027: `sessions.players.min_required` + `sessions.players.max_reached` added to DB for `en` and `fr`. `useLabels` spreads `enFallback` as base layer.
- ✅ §146 — `badgeVariants` extended with `competitive`, `cooperative`, `campaign`, `hybrid` variants in `badge.tsx`.

### Sprint A — Quick wins (≤ 1 day each)

1. **🔴 Bottom-nav active-state derived from `currentView`** (§30). "Games" button always active regardless of page.
2. ~~**🟡 Residual i18n**: check `AddGameDialog` (§91), `EditGameDialog` (title + submit button hardcoded). Targeted grep audit. ~~`NewPlayView` (§46) — resolved 2026-05-01.~~~ → **Resolved 2026-05-02**: `AddGameDialog` and `EditGameDialog` use `t()` for all labels.
3. ~~**🟡 Create semantic `gameModeColors` token** (§14.2). Eliminates inconsistencies §27, §55, §69 in a single file.~~ → **Resolved 2026-05-02**: `src/shared/theme/gameModeColors.ts` created, used by all views (§69 resolved).

### Sprint B — Targeted refactors (1–3 days each)

4. ~~**🔴 Refactor `AddGameDialog` + `EditGameDialog`** (§89–103). Hardcoded dark inputs, title/buttons partially hardcoded, dialog too narrow. Create `<FormDialog>` (§12.10) to cover them simultaneously.~~ → **Resolved 2026-05-02**: dialogs refactored (Sprint E PR #100), theme-aware tokens, Cancel buttons fixed.
5. ~~**🔴 Winner in `RadioGroup` in `NewPlayView`** (§48). Incorrect HTML semantics (checkbox for exclusive choice).~~ → Resolved 2026-05-01.
6. ~~**🟡 Auto-save + confirmation before navigation in `NewPlayView`** (§49). Risk of data loss on long form.~~ → Resolved 2026-05-01.

### Sprint C — Structural work (≥ 1 week)

7. **🔴 Refactor `darkMode` prop → CSS tokens + `dark:` Tailwind** (§14.1). Unlocks §§19, 21, 29, 47, 54, 63, 101, 123. Highest global ROI in remaining backlog.
8. **🔴 `NewPlayView`: multi-step wizard** (§53). Cognitive load reduction on the longest form.
9. ~~**🟡 Create `<EmptyState>`, `<StatCard>`, `<InitialAvatar>`** (§148–151). Missing business components.~~ → **Resolved 2026-05-02**: `<EmptyState>`, `<PageHeader>`, `<SectionHeader>`, `<StatCard>` created and adopted (Sprint F PR #101). `<InitialAvatar>` already existed.
10. ~~**🟡 Implement or remove the period filter in `GameStatsView`** (§67). Zombie feature to decide on.~~ → **Resolved 2026-05-02**: props `selectedPeriod`/`setSelectedPeriod` removed from `GameStatsViewProps`, hook manages state internally (§67 resolved).
11. **🟡 Migrate forms to `<Form>` + Zod** (§14.11, §132). One form per week.

### Estimated remaining effort

- Sprint A: **1–2 days** — fast corrections immediately visible.
- Sprint B: **1 week** — eliminate remaining major debts (dialogs + NewPlayView).
- Sprint C: **3–4 weeks** — systemic, guarantees long-term consistency.

---

## Appendices

### A. Audited files inventory

**Pages / Views**: `auth/LoginPage.tsx`, `dashboard/DashboardView.tsx`, `games/GamesPageView.tsx`, `games/detail/GameDetailView.tsx`, `games/expansions/GameExpansionsView.tsx`, `games/characters/*` (partial), `players/PlayersPageView.tsx`, `plays/NewPlayView.tsx`, `bgg/BGGSearch.tsx`, `stats/game/GameStatsView.tsx`, `stats/player/PlayerStatsView.tsx`, `settings/SettingsPageView.tsx`.

**Dialogs**: `games/dialogs/AddGameDialog.tsx`, `games/dialogs/EditGameDialog.tsx`, `games/dialogs/DeleteGameDialog.tsx`, `players/dialogs/AddPlayerDialog.tsx`, `players/dialogs/EditPlayerDialog.tsx`, `players/dialogs/DeletePlayerDialog.tsx`, `games/expansions/dialogs/ExpansionDialogs.tsx`, `games/characters/dialogs/CharacterDialogs.tsx`.

**Shared UI**: `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`, `tabs.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `textarea.tsx`, `badge.tsx`, `alert.tsx`, `avatar.tsx`, `skeleton.tsx`, `form.tsx` (partial), `sidebar.tsx` (partial for usage), `chart.tsx` (usage). Complete inventory of all 45 files in the folder.

### B. Out of scope (not audited)

- Global routing (`App.tsx`, `main.tsx`, `router.tsx`).
- Hooks (`useXxx` in `shared/hooks/`, `features/**/hooks/`).
- API services (`features/**/api/*`).
- Backend (`backend/**`).
- Tests (`**/__tests__/*`).

### C. Scoring method

- 🔴 **Critical**: blocks release (factual bug, misleading content, low security) or breaks usage (unreadable, unusable).
- 🟡 **Moderate**: degrades experience (borderline contrast, questionable UX, inconsistent code).
- 🟢 **Minor**: to fix in the next refactor (polish, edge case).

### D. Suggestions for follow-up passes

1. Routes & hooks audit (data flow, loading states at Page level).
2. React Query mutations audit (optimistic updates, error handling).
3. Performance audit (bundle analysis, lazy loading of dialogs and routes).
4. Security UX audit (CSRF, front-end input sanitization, double confirmation for destructive actions).
5. Responsive audit (effective breakpoints, touch vs cursor ergonomics).
6. Motion / animations audit (`transition-all` global to audit, prefer specific durations + `prefers-reduced-motion`).

---

### E. Canonical patterns — copy-paste reference

This section gathers the "good examples" identified during the audit, to use as reference for recommended refactors.

#### E.1 Empty state (from `PlayersPageView`)

```tsx
// src/shared/components/ui/empty-state.tsx
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-16 h-16 mb-4 text-muted-foreground opacity-50" aria-hidden="true" />
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Usage
<EmptyState
  icon={GameController}
  title={t('games.empty.title')}
  description={t('games.empty.description')}
  action={<AddGameDialog trigger={<Button>{t('games.empty.cta')}</Button>} />}
/>
```

#### E.2 Destructive ConfirmDialog (from `DeleteExpansionDialog`)

```tsx
// src/shared/components/ui/confirm-dialog.tsx
interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  trigger: React.ReactNode
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  trigger,
}: ConfirmDialogProps) {
  const { t } = useLabels();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel ?? t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? buttonVariants({ variant: 'destructive' }) : undefined}
          >
            {confirmLabel ?? t('common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### E.3 FormDialog (base for Add/Edit)

```tsx
// src/shared/components/ui/form-dialog.tsx
interface FormDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode  // <form> content
  footer: React.ReactNode    // buttons (submit, cancel)
  size?: 'sm' | 'md' | 'lg'
  isDirty?: boolean          // for close confirmation
  trigger?: React.ReactNode
}

const sizeClasses = {
  sm: 'sm:max-w-lg',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-4xl',
};

export function FormDialog({
  title, description, children, footer,
  size = 'sm', isDirty, trigger, ...props
}: FormDialogProps) {
  const { t } = useLabels();
  return (
    <Dialog {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={sizeClasses[size]}
        onInteractOutside={(e) => {
          if (isDirty && !confirm(t('common.unsaved_changes_warning'))) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### E.4 Initial avatar without external dependency (replaces Unsplash)

```tsx
// src/shared/components/ui/initial-avatar.tsx
interface InitialAvatarProps {
  name: string
  src?: string
  size?: number
  className?: string
}

function hashToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function InitialAvatar({ name, src, size = 40, className }: InitialAvatarProps) {
  const hue = hashToHue(name);
  const initials = getInitials(name);
  return (
    <Avatar className={className} style={{ width: size, height: size }}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback
        style={{ backgroundColor: `hsl(${hue} 65% 45%)`, color: 'white' }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
```

#### E.5 Semantic tokens for modes (in `tailwind.config.js` + CSS)

```css
/* src/styles/theme.css */
:root {
  --mode-competitive: 0 80% 55%;
  --mode-cooperative: 215 80% 55%;
  --mode-campaign:    270 80% 60%;
  --mode-hybrid:      30 90% 55%;

  --stat-positive:    145 70% 45%;
  --stat-negative:    0 70% 55%;

  --medal-gold:       45 95% 55%;
  --medal-silver:     210 10% 70%;
  --medal-bronze:     25 70% 50%;
}
```

```ts
// tailwind.config.js — extension
colors: {
  mode: {
    competitive: 'hsl(var(--mode-competitive))',
    cooperative: 'hsl(var(--mode-cooperative))',
    campaign:    'hsl(var(--mode-campaign))',
    hybrid:      'hsl(var(--mode-hybrid))',
  },
  stat: {
    positive: 'hsl(var(--stat-positive))',
    negative: 'hsl(var(--stat-negative))',
  },
  medal: {
    gold:   'hsl(var(--medal-gold))',
    silver: 'hsl(var(--medal-silver))',
    bronze: 'hsl(var(--medal-bronze))',
  },
},
```

Usage: `className="bg-mode-competitive/20 text-mode-competitive border-mode-competitive/40"`.

#### E.6 Semantic badge for modes (extension of `badge.tsx`)

```tsx
// src/shared/components/ui/badge.tsx — extended
const badgeVariants = cva("...base classes...", {
  variants: {
    variant: {
      default:     "border-transparent bg-primary text-primary-foreground",
      secondary:   "border-transparent bg-secondary text-secondary-foreground",
      destructive: "border-transparent bg-destructive text-white",
      outline:     "text-foreground",
      // New semantic variants
      competitive: "border-mode-competitive/40 bg-mode-competitive/20 text-mode-competitive",
      cooperative: "border-mode-cooperative/40 bg-mode-cooperative/20 text-mode-cooperative",
      campaign:    "border-mode-campaign/40 bg-mode-campaign/20 text-mode-campaign",
      hybrid:      "border-mode-hybrid/40 bg-mode-hybrid/20 text-mode-hybrid",
    },
  },
  defaultVariants: { variant: "default" },
});

// Helper for dynamic derivation
export function ModeBadge({ mode, ...props }: { mode: GameMode }) {
  return <Badge variant={mode as any} {...props}>{t(`games.mode.${mode}`)}</Badge>;
}
```

#### E.7 Radio for winner (replaces the checkbox from §48)

```tsx
// In NewPlayView
<RadioGroup value={winnerId ?? 'none'} onValueChange={(v) => setWinnerId(v === 'none' ? null : v)}>
  {selectedPlayers.map((p) => (
    <div key={p.player_id} className="flex items-center gap-3">
      <RadioGroupItem id={`winner-${p.player_id}`} value={String(p.player_id)} />
      <Label htmlFor={`winner-${p.player_id}`} className="flex items-center gap-2 cursor-pointer">
        <InitialAvatar name={p.player_name} size={32} />
        <span>{p.player_name}</span>
      </Label>
    </div>
  ))}
  <div className="flex items-center gap-3 pt-2 border-t border-border">
    <RadioGroupItem id="winner-none" value="none" />
    <Label htmlFor="winner-none" className="text-muted-foreground">
      {t('plays.form.winner.none')}
    </Label>
  </div>
</RadioGroup>
```

#### E.8 Auto-save draft (replaces silent loss from §49)

```tsx
// src/shared/hooks/useDraftPersist.ts
export function useDraftPersist<T>(key: string, value: T, isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(`draft_${key}`, JSON.stringify({
        value,
        timestamp: Date.now(),
      }));
    }, 1000); // debounce 1s
    return () => clearTimeout(timeout);
  }, [key, value, isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}

export function loadDraft<T>(key: string, maxAgeMs = 24 * 60 * 60 * 1000): T | null {
  const raw = localStorage.getItem(`draft_${key}`);
  if (!raw) return null;
  try {
    const { value, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > maxAgeMs) {
      localStorage.removeItem(`draft_${key}`);
      return null;
    }
    return value as T;
  } catch {
    return null;
  }
}

export function clearDraft(key: string) {
  localStorage.removeItem(`draft_${key}`);
}
```

#### E.9 Unified PageHeader (replaces the `<div className="w-10" />` hack)

```tsx
// src/shared/components/ui/page-header.tsx
interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, backHref, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 max-w-7xl mx-auto">
        <div className="w-11 h-11 flex items-center justify-center">
          {backHref && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(backHref)}
              aria-label={t('common.back')}
              className="min-w-11 min-h-11"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="text-center sm:text-left min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </header>
  );
}
```

---

### F. UI PR review checklist

To use for any PR that touches `src/features/**/*.tsx` or `src/shared/components/**/*.tsx`.

**Theme and colors**
- [ ] No `bg-slate-*`, `text-white`, `text-slate-*` hardcoded in features — only tokens (`bg-background`, `text-foreground`, `bg-card`, etc.) or `dark:` Tailwind.
- [ ] No `darkMode: boolean` prop added (target: complete removal eventually).
- [ ] Mode colors (competitive/coop/campaign/hybrid) come from the unique token (`Badge` variant or `bg-mode-*` class).

**Accessibility**
- [ ] Contrast ≥ 4.5:1 for all normal text (no `text-white/30`, `/40`).
- [ ] Touch targets ≥ 44px (`min-w-11 min-h-11` on icon buttons).
- [ ] Every `<Input>`, `<Textarea>`, `<Select>` has a `<Label>` with `htmlFor`.
- [ ] `focus-visible` visible — no override that removes the ring.
- [ ] No button nested inside another button/link.
- [ ] Single `<h1>` per page, `h1 → h2 → h3` hierarchy respected.
- [ ] `aria-label` on icon buttons without text.
- [ ] `role="alert"` + `aria-live` on dynamic error messages.

**i18n**
- [ ] No hardcoded French or English string in JSX — everything goes through `t('...')` via `useLabels`.
- [ ] Validation messages are translated (not `"Name is required"` hardcoded).
- [ ] Placeholders are translated.
- [ ] Relevant image `alt` are translated (or empty for decorative).

**Components**
- [ ] Cards use shadcn `<Card>` or an extension with variants, not manual `<div className="bg-white/10 backdrop-blur-md">`.
- [ ] Add/Edit dialogs use `<FormDialog>`.
- [ ] Delete/Confirm dialogs use `<ConfirmDialog destructive>`.
- [ ] Empty states use `<EmptyState>`.
- [ ] Page headers use `<PageHeader>`.
- [ ] Avatars use `<InitialAvatar>` (no hardcoded Unsplash `<img>`).

**Async states**
- [ ] Each main page shows a skeleton during React Query's `isLoading`.
- [ ] React Query errors have a dedicated display (not "a blank page").
- [ ] Destructive mutations (delete, reset) go through `<ConfirmDialog destructive>`.
- [ ] Forms with `isDirty` show a confirmation before close.

**Forms**
- [ ] Use `<Form>` + `react-hook-form` + Zod resolver (not manual `useState` for new forms).
- [ ] `<FormMessage>` below each field in error (not at top of card far from the field).
- [ ] `*` indicator visible from display for required fields.

**Responsive**
- [ ] Long pages: `max-w-7xl mx-auto` applied on the main container.
- [ ] `md:` and `lg:` breakpoints considered for grid layouts.
- [ ] Mobile: thumb zones respected (bottom-nav, main CTA at bottom).

**Performance**
- [ ] Dialogs lazy-loaded (`const AddGameDialog = lazy(() => ...)`).
- [ ] Images with `loading="lazy"` except hero above-the-fold.
- [ ] No `Promise` await in a loop when `Promise.all` suffices.

---

### G. Quick glossary

- **Design token**: CSS variable / abstract value usable across the entire app (e.g., `--primary`, `--mode-competitive`). Centralizes a design concept.
- **Theme-aware**: component that adapts to light/dark theme without manual intervention from the consuming developer.
- **Prop drilling**: passing a prop top-down through multiple intermediate component levels that don't need it directly.
- **CVA** (class-variance-authority): library for typing Tailwind class variants (used by shadcn `buttonVariants`, `badgeVariants`).
- **WCAG AA**: level 2 of Web Content Accessibility Guidelines v2.1 — realistic target for a public app. Requires contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text, UI elements).
- **Empty state**: screen displayed when a list or section has no content to show (empty list, empty search results, etc.).
- **Skeleton**: animated grey placeholder that reproduces the structure of a component while it's loading.
- **Wizard**: multi-step form with visible progress (e.g., 1/4, 2/4…). Alternative to a long single-screen form.
- **Dirty state** (form): state of a form where at least one field has been modified since initial load. Used for close confirmation.
- **Glassmorphism**: visual effect where a surface appears as frosted glass, achieved via `backdrop-blur` + semi-transparent background.

---

*End of document. For questions, improvements, or next pass (routes & hooks, performance, security UX), see §D.*
