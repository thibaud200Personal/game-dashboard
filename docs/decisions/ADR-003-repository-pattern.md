# ADR-003 — Repository Pattern for the Backend

**Date**: March 31, 2026
**Status**: Accepted

## Context

`DatabaseManager.ts` (896 lines) is a god class managing all entities with no separation of concerns. Impossible to test in isolation. Every new entity makes it heavier.

## Decision

Split `DatabaseManager` into:
- `DatabaseConnection.ts` — SQLite connection + migration runner only
- One repository per domain: `PlayerRepository`, `GameRepository`, `SessionRepository`, `StatsRepository`, `BGGRepository`
- One service layer per domain: `PlayerService`, `GameService`, `SessionService`, `StatsService`, `AuthService`

Dependency injection: repositories receive `DatabaseConnection` as a constructor parameter.

## Transaction Management

Transactions that span multiple tables stay in the service layer:

```ts
// PlayService.ts
createPlay(payload) {
  return this.db.transaction(() => {
    const playId = this.playRepo.insertPlay(payload)
    this.playRepo.insertPlayPlayers(playId, payload.players)
    return this.playRepo.findById(playId)!
  })()
}
```

Rule: **a transaction never leaves a service**. Repositories are unaware of being inside a transaction — they execute their queries normally.

## Consequences

**Positive:**
- Each repository is testable in isolation (injected in-memory SQLite DB)
- Each service is testable with mocked repositories
- Single responsibility per file
- `server.ts` simplified (delegates to routes, no inline logic)

**Negative:**
- More files to maintain
- Cross-repository transactions require the service to have direct access to `DatabaseConnection` (for `.transaction()`) in addition to the repositories

## Rejected Alternatives

- **Keep monolithic `DatabaseManager`**: does not address the testability problem
- **ORM (Prisma, Knex)**: adds a heavy dependency, loses control over SQL views which are an advantage of the current schema, limited SQLite support for Prisma migrations
