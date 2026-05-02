# Sprint F — Shared Components & Quick Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create four shared UI primitives (EmptyState, PageHeader, SectionHeader, StatCard), add Badge mode variants, and close §1/§69/§142 quick fixes from the design audit.

**Architecture:** New components land in `src/shared/components/`. Each new component replaces its current inline pattern in the most important views. StatCard replaces two local definitions (GameStatsView, PlayerStatsView). Badge gets CVA mode variants. Quick fixes (§1 meta tag, §142 confirmLeave styling, §69 audit mark) bundled at the end.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui (CVA + cn), Vitest + Testing Library

---

## Task 0 — Branch

- [ ] Create and switch to branch

```bash
git checkout -b fix/ux-sprint-f-shared-components
```

---

## Task 1 — Badge mode variants (§146)

**Files:**
- Modify: `src/shared/components/ui/badge.tsx`

- [ ] **Step 1: Add mode variants to `badgeVariants`**

In `badge.tsx`, extend the `variants.variant` object with four new entries. Final `badgeVariants` call:

```tsx
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        competitive:
          "border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-400",
        cooperative:
          "border-blue-400/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        campaign:
          "border-purple-400/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
        hybrid:
          "border-orange-400/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npm run build 2>&1 | head -20
```

Expected: no TS errors related to badge.

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/ui/badge.tsx
git commit -m "feat(ui): add mode variants to Badge (§146)"
```

---

## Task 2 — EmptyState component (§148)

**Files:**
- Create: `src/shared/components/EmptyState.tsx`
- Create: `src/shared/__tests__/components/EmptyState.test.tsx`
- Modify: `src/features/games/GamesPageView.tsx`
- Modify: `src/features/players/PlayersPageView.tsx`

- [ ] **Step 1: Write failing test**

Create `src/shared/__tests__/components/EmptyState.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameController } from '@phosphor-icons/react';
import EmptyState from '@/shared/components/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={<GameController />} title="No games" description="Add your first game" />);
    expect(screen.getByText('No games')).toBeInTheDocument();
    expect(screen.getByText('Add your first game')).toBeInTheDocument();
  });

  it('renders CTA when provided', () => {
    render(
      <EmptyState
        icon={<GameController />}
        title="No games"
        action={<button>Add game</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Add game' })).toBeInTheDocument();
  });

  it('renders without description or action', () => {
    render(<EmptyState icon={<GameController />} title="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/shared/__tests__/components/EmptyState.test.tsx
```

Expected: FAIL with "Cannot find module '@/shared/components/EmptyState'"

- [ ] **Step 3: Implement EmptyState**

Create `src/shared/components/EmptyState.tsx`:

```tsx
import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className ?? ''}`}>
      <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40 [&>svg]:w-full [&>svg]:h-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm run test:run -- src/shared/__tests__/components/EmptyState.test.tsx
```

Expected: 3 tests PASS

- [ ] **Step 5: Adopt in GamesPageView**

In `src/features/games/GamesPageView.tsx`, add the import at the top:

```tsx
import EmptyState from '@/shared/components/EmptyState';
```

Replace the existing empty state block (around line 494):

```tsx
{games.length === 0 && (
  <div className="text-center py-12">
    <GameController className="w-16 h-16 mx-auto mb-4 opacity-20" />
    <p className="text-white/60">{t('games.empty')}</p>
  </div>
)}
```

With:

```tsx
{games.length === 0 && (
  <EmptyState
    icon={<GameController />}
    title={t('games.empty')}
  />
)}
```

- [ ] **Step 6: Adopt in PlayersPageView**

In `src/features/players/PlayersPageView.tsx`, find the empty state block (around line 220):

```tsx
<div className="text-center py-8">
  <UsersThree className="w-16 h-16 mx-auto mb-4 text-white/30" />
  <h3 className="text-xl font-semibold mb-2">Aucun joueur</h3>
  <p className="text-white/60 mb-6">Ajoutez votre premier joueur pour commencer</p>
  <AddPlayerDialog ... />
</div>
```

Read the actual content and replace with:

```tsx
<EmptyState
  icon={<UsersThree />}
  title={t('players.empty.title')}
  description={t('players.empty.description')}
  action={<AddPlayerDialog ... />}
/>
```

Note: verify the exact i18n keys for `players.empty.title` and `players.empty.description` exist in `src/shared/i18n/en.json` before using them. If they don't exist, add them.

- [ ] **Step 7: Add import to PlayersPageView**

```tsx
import EmptyState from '@/shared/components/EmptyState';
```

- [ ] **Step 8: TypeScript check**

```bash
npm run build 2>&1 | head -30
```

Expected: clean.

- [ ] **Step 9: Commit**

```bash
git add src/shared/components/EmptyState.tsx src/shared/__tests__/components/EmptyState.test.tsx src/features/games/GamesPageView.tsx src/features/players/PlayersPageView.tsx
git commit -m "feat(ui): add EmptyState shared component, adopt in Games + Players (§148)"
```

---

## Task 3 — PageHeader component (§149)

**Files:**
- Create: `src/shared/components/PageHeader.tsx`
- Create: `src/shared/__tests__/components/PageHeader.test.tsx`
- Modify: `src/features/stats/StatsPage.tsx`
- Modify: `src/features/settings/SettingsPageView.tsx`

- [ ] **Step 1: Write failing test**

Create `src/shared/__tests__/components/PageHeader.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/shared/components/PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Statistics" />);
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('renders left and right slots', () => {
    render(
      <PageHeader
        title="Stats"
        left={<button>Back</button>}
        right={<button>Settings</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders a spacer div when right slot is omitted', () => {
    const { container } = render(
      <PageHeader title="Stats" left={<button>Back</button>} />
    );
    // 3 children: left, title, right spacer
    const header = container.firstChild as HTMLElement;
    expect(header.children.length).toBe(3);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/shared/__tests__/components/PageHeader.test.tsx
```

Expected: FAIL with "Cannot find module '@/shared/components/PageHeader'"

- [ ] **Step 3: Implement PageHeader**

Create `src/shared/components/PageHeader.tsx`:

```tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, left, right, className }: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className ?? ''}`}>
      <div className="w-10 flex justify-start">{left}</div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <div className="w-10 flex justify-end" aria-hidden={!right}>
        {right}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm run test:run -- src/shared/__tests__/components/PageHeader.test.tsx
```

Expected: 3 tests PASS

- [ ] **Step 5: Adopt in StatsPage**

In `src/features/stats/StatsPage.tsx`, add import:

```tsx
import PageHeader from '@/shared/components/PageHeader';
```

Replace the header block (lines 58–68):

```tsx
<div className="flex items-center justify-between mb-6">
  <button
    onClick={handleBackNavigation}
    aria-label="Go back"
    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
  >
    <ArrowLeft className="w-6 h-6" />
  </button>
  <h1 className="text-2xl font-bold text-white">{t('stats.page.title')}</h1>
  <div className="w-10" />
</div>
```

With:

```tsx
<PageHeader
  title={t('stats.page.title')}
  left={
    <button
      onClick={handleBackNavigation}
      aria-label="Go back"
      className="p-2 hover:bg-muted rounded-lg transition-colors"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  }
  className="mb-6"
/>
```

- [ ] **Step 6: Adopt in SettingsPageView**

In `src/features/settings/SettingsPageView.tsx`, find the header with `<div className="w-10 h-10" aria-hidden="true" />` spacer (around line 71) and replace the entire header flex block with `<PageHeader>`. Add import at top:

```tsx
import PageHeader from '@/shared/components/PageHeader';
```

Read the current settings header block and replace accordingly.

- [ ] **Step 7: TypeScript check**

```bash
npm run build 2>&1 | head -30
```

- [ ] **Step 8: Commit**

```bash
git add src/shared/components/PageHeader.tsx src/shared/__tests__/components/PageHeader.test.tsx src/features/stats/StatsPage.tsx src/features/settings/SettingsPageView.tsx
git commit -m "feat(ui): add PageHeader shared component, adopt in Stats + Settings (§149)"
```

---

## Task 4 — SectionHeader component (§150)

**Files:**
- Create: `src/shared/components/SectionHeader.tsx`
- Create: `src/shared/__tests__/components/SectionHeader.test.tsx`
- Modify: `src/features/stats/game/GameStatsView.tsx` (2–3 section headers)
- Modify: `src/features/stats/player/PlayerStatsView.tsx` (2–3 section headers)

- [ ] **Step 1: Write failing test**

Create `src/shared/__tests__/components/SectionHeader.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Trophy } from '@phosphor-icons/react';
import SectionHeader from '@/shared/components/SectionHeader';

describe('SectionHeader', () => {
  it('renders icon and title', () => {
    render(<SectionHeader icon={<Trophy />} title="Top Players" />);
    expect(screen.getByText('Top Players')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <SectionHeader
        icon={<Trophy />}
        title="Top Players"
        action={<button>See all</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'See all' })).toBeInTheDocument();
  });

  it('renders without action', () => {
    render(<SectionHeader icon={<Trophy />} title="Top Players" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/shared/__tests__/components/SectionHeader.test.tsx
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement SectionHeader**

Create `src/shared/components/SectionHeader.tsx`:

```tsx
import React from 'react';

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({ icon, title, action, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-primary" aria-hidden="true">{icon}</span>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm run test:run -- src/shared/__tests__/components/SectionHeader.test.tsx
```

Expected: 3 tests PASS

- [ ] **Step 5: Adopt in GameStatsView**

In `src/features/stats/game/GameStatsView.tsx`, add import:

```tsx
import SectionHeader from '@/shared/components/SectionHeader';
```

Identify the 2–3 inline section headers (the `flex items-center justify-between` + icon + title patterns) and replace them. Search for patterns like:

```tsx
<div className={`flex items-center gap-2 mb-3 ${sectionTitleClass}`}>
  <SomeIcon className="w-5 h-5 text-..." />
  <h3 className={sectionTitleClass}>...</h3>
</div>
```

Replace each with `<SectionHeader icon={<SomeIcon />} title={t('...')} />`.

- [ ] **Step 6: Adopt in PlayerStatsView**

Same process in `src/features/stats/player/PlayerStatsView.tsx`.

- [ ] **Step 7: TypeScript check**

```bash
npm run build 2>&1 | head -30
```

- [ ] **Step 8: Commit**

```bash
git add src/shared/components/SectionHeader.tsx src/shared/__tests__/components/SectionHeader.test.tsx src/features/stats/game/GameStatsView.tsx src/features/stats/player/PlayerStatsView.tsx
git commit -m "feat(ui): add SectionHeader shared component, adopt in GameStats + PlayerStats (§150)"
```

---

## Task 5 — StatCard component (§151)

**Files:**
- Create: `src/shared/components/StatCard.tsx`
- Create: `src/shared/__tests__/components/StatCard.test.tsx`
- Modify: `src/features/stats/game/GameStatsView.tsx` (remove local StatCard, import shared)
- Modify: `src/features/stats/player/PlayerStatsView.tsx` (remove local StatCard, import shared)

The two local StatCards have different interfaces:
- GameStatsView: vertical (icon centered, value below, label below)
- PlayerStatsView: horizontal (icon left, value + label right)

The shared component supports both via `layout` prop.

- [ ] **Step 1: Write failing test**

Create `src/shared/__tests__/components/StatCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from '@phosphor-icons/react';
import StatCard from '@/shared/components/StatCard';

describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard icon={<Calendar />} value="42" label="Sessions" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
  });

  it('renders vertical layout by default', () => {
    const { container } = render(<StatCard icon={<Calendar />} value="42" label="Sessions" />);
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('renders horizontal layout when specified', () => {
    const { container } = render(
      <StatCard icon={<Calendar />} value="42" label="Sessions" layout="horizontal" />
    );
    expect(container.firstChild).not.toHaveClass('text-center');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/shared/__tests__/components/StatCard.test.tsx
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement StatCard**

Create `src/shared/components/StatCard.tsx`:

```tsx
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export default function StatCard({ icon, value, label, layout = 'vertical', className }: StatCardProps) {
  if (layout === 'horizontal') {
    return (
      <div className={`bg-card border border-border rounded-xl p-4 ${className ?? ''}`}>
        <div className="flex items-center gap-3">
          <div className="shrink-0">{icon}</div>
          <div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-xl p-4 text-center ${className ?? ''}`}>
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm run test:run -- src/shared/__tests__/components/StatCard.test.tsx
```

Expected: 3 tests PASS

- [ ] **Step 5: Replace local StatCard in GameStatsView**

In `src/features/stats/game/GameStatsView.tsx`:

1. Add import:
```tsx
import StatCard from '@/shared/components/StatCard';
```

2. Delete the local `interface StatCardProps` block (lines 29–34) and the local `function StatCard` (lines 35–43).

3. The existing call sites (`<StatCard icon={...} value={...} label={...} />`) are already compatible with the shared interface — no changes needed to the JSX.

Note: the existing call sites use colored icons (`text-blue-400`, `text-green-400`, etc.) passed as `icon` prop. Keep them as-is — icon coloring stays in the caller.

- [ ] **Step 6: Replace local StatCard in PlayerStatsView**

In `src/features/stats/player/PlayerStatsView.tsx`:

1. Add import:
```tsx
import StatCard from '@/shared/components/StatCard';
```

2. Delete the local `interface StatCardProps` block (lines 50–58) and local `function StatCard` (lines 59–73).

3. The existing call sites pass `cardClass`, `titleClass`, `labelClass` which no longer exist on the shared interface. Replace all 4 calls (lines ~146–149):

**Before:**
```tsx
<StatCard icon={<div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center"><Trophy className="w-5 h-5" /></div>} value={selectedPlayer.wins} label={t('stats.player.stat.wins')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
<StatCard icon={<div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"><Target className="w-5 h-5" /></div>} value={selectedPlayer.games_played} label={t('stats.player.stat.games_played')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
<StatCard icon={<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><Star className="w-5 h-5" /></div>} value={selectedPlayer.total_score} label={t('stats.player.stat.total_score')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
<StatCard icon={<div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center"><ChartBar className="w-5 h-5" /></div>} value={selectedPlayer.average_score} label={t('stats.player.stat.avg_score')} cardClass={cardClass} titleClass={titleClass} labelClass={labelClass} />
```

**After:**
```tsx
<StatCard layout="horizontal" icon={<div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white"><Trophy className="w-5 h-5" /></div>} value={selectedPlayer.wins} label={t('stats.player.stat.wins')} />
<StatCard layout="horizontal" icon={<div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Target className="w-5 h-5" /></div>} value={selectedPlayer.games_played} label={t('stats.player.stat.games_played')} />
<StatCard layout="horizontal" icon={<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white"><Star className="w-5 h-5" /></div>} value={selectedPlayer.total_score} label={t('stats.player.stat.total_score')} />
<StatCard layout="horizontal" icon={<div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white"><ChartBar className="w-5 h-5" /></div>} value={selectedPlayer.average_score} label={t('stats.player.stat.avg_score')} />
```

- [ ] **Step 7: Clean up unused variables in PlayerStatsView**

After removing the local StatCard, remove `cardClass`, `titleClass`, `labelClass` variables if they're only used by the old StatCard calls. Check their usage in the file first.

- [ ] **Step 8: TypeScript check**

```bash
npm run build 2>&1 | head -30
```

Expected: clean.

- [ ] **Step 9: Run all tests**

```bash
npm run test:run
```

Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add src/shared/components/StatCard.tsx src/shared/__tests__/components/StatCard.test.tsx src/features/stats/game/GameStatsView.tsx src/features/stats/player/PlayerStatsView.tsx
git commit -m "feat(ui): add StatCard shared component, replace local definitions in GameStats + PlayerStats (§151)"
```

---

## Task 6 — Quick fixes (§1, §142) + audit updates (§69 resolved)

**Files:**
- Modify: `index.html`
- Modify: `src/features/plays/NewPlayView.tsx`
- Modify: `docs/DESIGN_AUDIT.md`

- [ ] **Step 1: §1 — Add `<meta name="application-name">` to index.html**

In `index.html`, after the viewport meta tag, add:

```html
<meta name="application-name" content="Board Game Dashboard" />
```

- [ ] **Step 2: §142 — Fix confirmLeave AlertDialogAction in NewPlayView**

In `src/features/plays/NewPlayView.tsx` around line 593, find:

```tsx
<AlertDialogAction onClick={confirmLeave}>{t('sessions.leave.confirm')}</AlertDialogAction>
```

Replace with:

```tsx
<AlertDialogAction onClick={confirmLeave} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('sessions.leave.confirm')}</AlertDialogAction>
```

- [ ] **Step 3: Update DESIGN_AUDIT.md — mark §69 and §142 resolved**

In `docs/DESIGN_AUDIT.md`:

For §69 (around line 325), change:
```
| 69 | 🟡 | Distribution « Session Types » ...
```
To:
```
| 69 | ✅ | ~~Distribution « Session Types » : `hybrid=vert` ici, mais `hybrid=orange` dans GamesPageView et `hybrid=bleu` dans NewPlayView.~~ → **Résolu 2026-05-02** : GamesPageView, NewPlayView et GameStatsView importent tous `gameModeColors` depuis `src/shared/theme/gameModeColors.ts`. Token `hybrid=orange` cohérent sur toutes les vues. | — |
```

For §142 (find in §12 dialogs section), mark it resolved.

Also update §146 to mark it resolved.

Update the §15 priorities section to remove already-resolved items (see memory notes).

- [ ] **Step 4: TypeScript + lint check**

```bash
npm run build 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add index.html src/features/plays/NewPlayView.tsx docs/DESIGN_AUDIT.md
git commit -m "fix(ux): §1 meta application-name, §142 confirmLeave destructive, audit §69/§142/§146 resolved"
```

---

## Task 7 — Final check + PR

- [ ] **Step 1: Full test suite**

```bash
npm run test:run
```

Expected: all pass (coverage may be below threshold for new files — check).

- [ ] **Step 2: TypeScript + lint**

```bash
npm run build && npm run lint
```

- [ ] **Step 3: Visual check — start dev server and verify**

```bash
npm run dev
```

Open http://localhost:5173 and verify:
- Login page has app name + meta
- Games empty state uses EmptyState component (if you have no games)
- Stats page header uses PageHeader (back button + title + spacer)
- Game stats section headers look correct
- Player stats section headers look correct
- Player stat cards use horizontal layout with tokens

- [ ] **Step 4: Update memory backlog**

Remove §1, §69, §142, §146, §148, §149, §150, §151 from `C:\Users\thibs\.claude\projects\c--git-game-dashboard\memory\project_design_audit_backlog.md`.
