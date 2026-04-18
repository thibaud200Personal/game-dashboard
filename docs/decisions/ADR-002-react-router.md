# ADR-002 — URL-based Navigation with React Router v7

**Date**: March 31, 2026
**Status**: Accepted

## Context

The current navigation is state-based: `currentView` (string) + `navigationContext` (id + source) in `App.tsx`. Consequences:
- F5 always returns to the home screen
- No shareable deep links
- No browser history
- `App.tsx` accumulates shell + router + state management

## Decision

Adopt React Router v7. Each page has a URL. `App.tsx` becomes a pure shell. `navigationContext` is replaced by browser history (`navigate(-1)`) and `location.state` for contextual cases.

## Contextual Mobile Navigation

`navigationContext` served to know "which screen I came from" for the mobile back button. With React Router:

- Simple case (linear back): `navigate(-1)` — native browser history
- Contextual case (back to a specific tab): `navigate('/stats/games/42', { state: { from: '/games' } })`, retrieved with `useLocation().state`

## Responsive Layout

The React Router migration is orthogonal to responsive design. `BottomNavigation` uses `useLocation()` for active state and `<Link>` for navigation. The `use-mobile.ts` hook and responsive Tailwind classes are unchanged.

## Consequences

**Positive:**
- Real URLs: deep links, F5, browser history
- `App.tsx` reduced to its shell role
- `navigationContext` and `handleNavigation` removed (~50 lines)
- Standard React — better ecosystem familiarity

**Negative:**
- Non-trivial migration: every call to `handleNavigation` must be converted
- Contextual mobile navigation cases require case-by-case analysis
- React Router adds a dependency

## Rejected Alternatives

- **Keep state-based navigation**: does not address UX limitations (no URLs)
- **TanStack Router**: more recent, good DX, but less mature and more costly to migrate
