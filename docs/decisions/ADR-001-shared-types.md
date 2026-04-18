# ADR-001 — Shared Types in `shared/`

**Date**: March 31, 2026
**Status**: Accepted

## Context

The project had two distinct type files:
- `src/types/index.ts` (frontend)
- `backend/models/interfaces.ts` (backend)

Both files describe the same entities (`Player`, `Game`, `GameSession`...) but are maintained independently. Silent divergences appeared (`game_type`, `pseudo`).

## Decision

Create a `shared/types/` folder at the monorepo root with an `index.d.ts` file (hand-written TypeScript declaration — no compiled `.ts` source). Frontend and backend both import from this file via the `@shared/types` alias. `backend/models/interfaces.ts` is deleted. `src/types/index.ts` only re-exports from `shared/types`.

> **Implementation note**: `index.d.ts` is intentionally hand-written. The backend has `rootDir: "./"` and the frontend has `noEmit: true` — no risk of being overwritten by `tsc`. To add a type: edit `shared/types/index.d.ts` directly, no build step required. See [DEVELOPMENT.md §6](../guides/DEVELOPMENT.md#6-shared-types--sharedtypes).

## Consequences

**Positive:**
- Single source of truth — one place to change when a type changes
- TypeScript catches inconsistencies at build time (front + back compile against the same types)
- Natural preparation for a future Android client

**Negative:**
- Migration required: move types, update imports, configure path aliases in both tsconfigs
- The Dockerfile must copy `shared/` before building both projects

## Rejected Alternatives

- **Frontend as source** (`src/types/` → backend imports from `../src/types`): creates a backend → frontend dependency, semantically wrong
- **Backend as source** (`backend/models/` → frontend imports from `../backend/models`): same problem in reverse
