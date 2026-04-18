# ADR-004 — Signed JWT + admin/user Roles

**Date**: March 31, 2026
**Status**: Accepted

## Context

The current authentication (PR #57) uses a 64-hex token generated in memory at startup. Problems:
- Token invalid on every Docker container restart
- Non-standard (not JWT) — no expiration, no claims
- Token stored in `localStorage` — vulnerable to XSS
- Single access level for all operations

## Decision

### Signed JWT

Replace the static token with JWTs signed with `jsonwebtoken`:
- Secret in `AUTH_JWT_SECRET` (.env)
- Expiration: 1 hour
- Payload: `{ sub: 'user', role: 'admin'|'user', iat, exp }`
- Restart-resistant (validated by signature, not by in-memory dictionary)

### HttpOnly Cookie for the Web

The JWT is stored in an `HttpOnly; SameSite=Strict; Secure` cookie. Not accessible via JavaScript — protected against XSS. `credentials: true` in CORS.

### admin/user Roles

Two passwords configured in `.env`:
- `ADMIN_PASSWORD` → token with `role: 'admin'`
- `USER_PASSWORD` → token with `role: 'user'`

| Role | Scope |
|---|---|
| `user` | Read, create/edit games/players/sessions |
| `admin` | All user access + BGG catalog import + sensitive deletions |

Frontend: admin features are conditionally rendered based on the role decoded from the JWT. The backend verifies the role via `requireRole('admin')` — frontend verification is cosmetic (UX only), backend verification is the only security guarantee.

## Consequences

**Positive:**
- Restart-resistant
- Standard JWT — existing tooling, auditability
- HttpOnly cookie — XSS protected
- Extensible roles for a future multi-user setup
- BGG catalog import protected by admin role

**Negative:**
- ~~No refresh token~~ — **Refresh tokens implemented** (`refresh_tokens` table, family rotation via `RefreshTokenRepository` + `AuthService.rotateRefreshToken`). Access token expiration: 1h, refresh token: 30 days.
- Migration: frontend must switch from `localStorage` to cookie, adapt requests with `credentials: 'include'`

## Rejected Alternatives

- **Keep static token**: restart problem unresolved, non-standard
- **Server sessions (express-session)**: server-side state incompatible with multi-client goal (Android)
- **OAuth2**: over-engineering for a personal single/dual-user use case
