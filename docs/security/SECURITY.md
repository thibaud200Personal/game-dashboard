# Security

## Threat Model

The application is exposed on the internet with access restricted by authentication. The main threats for this type of project:

| Threat | Probability | Measure |
|---|---|---|
| Unauthenticated access to data | High | JWT on all routes |
| Password brute-force | High | Rate limiting on `/auth/login` |
| XSS → token theft | Medium | HttpOnly cookie (not readable via JS) |
| SQL injection | Low | Parameterized queries (better-sqlite3) |
| Information leak via stack traces | High if unhandled | Errors masked in production |
| Vulnerable dependencies | Ongoing | npm audit in CI |

## Authentication

### JWT

Tokens signed with `jsonwebtoken` and a secret configured in `.env`.

```
POST /api/v1/auth/login
  Body: { password: string }
  → validates against ADMIN_PASSWORD or USER_PASSWORD
  → generates: { sub: 'user', role: 'admin'|'user', iat, exp: now+3600 }
  → web: Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict; Secure
  → Android: { token, expiresIn: 3600 }
```

**Why HttpOnly cookie for the web**: an `HttpOnly` cookie is not accessible via `document.cookie` in JavaScript. An XSS attack cannot exfiltrate the token. `localStorage` is inherently vulnerable to XSS.

**Why a .env secret**: the JWT is signed server-side. If the secret is compromised, all active tokens are immediately invalidated by changing the secret. Never hardcode the secret.

Generate a secure secret:
```bash
openssl rand -hex 32
```

### Roles

| Role | Scope |
|---|---|
| `user` | Read all data, create/edit games/players/sessions, export |
| `admin` | All `user` access + BGG catalog import + bulk deletions |

The role is in the JWT payload. The frontend uses it to show/hide admin features. The backend verifies it via `requireRole('admin')` for sensitive routes — frontend-side verification is cosmetic only.

### Expiration and Refresh

Tokens valid for 1 hour. On expiration, the frontend receives a 401 and redirects to `/login`. No refresh token currently implemented — acceptable for personal use (manual reconnection every hour if the session is long).

## Rate Limiting

```ts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 max attempts
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/v1/auth/login', loginLimiter)
```

Failed attempts are logged at `warn` level with the source IP.

## HTTP Headers — Helmet

```ts
app.use(helmet())
```

Automatically configured headers:
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `X-Frame-Options: DENY` — prevents clickjacking
- `Strict-Transport-Security` — enforces HTTPS
- `Content-Security-Policy` — restricts script sources

## Input Validation

All inputs are validated by Zod schemas:
- **Body**: `validateBody(schema)` on POST/PUT
- **Route parameters**: `validateParams(z.object({ id: z.coerce.number().int().positive() }))`
- **Query strings**: `validateQuery(schema)` on routes with filters

Rule: never trust a value from `req.params` or `req.query` without prior validation.

## SQL Injection

`better-sqlite3` uses parameterized queries. Never interpolate variables into SQL queries:

```ts
// ✅ Secure
db.prepare('SELECT * FROM players WHERE player_id = ?').get(id)

// ❌ Vulnerable
db.prepare(`SELECT * FROM players WHERE player_id = ${id}`).get()
```

## Error Messages in Production

```ts
const isDev = process.env.NODE_ENV !== 'production'

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err)
  res.status(resolveStatus(err)).json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  })
})
```

In production: no internal information in error responses. Details are in the logs (pino), not in the HTTP response.

## CORS

```ts
const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) ?? []
app.use(cors({
  origin: allowedOrigins,
  credentials: true,          // required for HttpOnly cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
```

`credentials: true` is required for the browser to send cookies cross-origin. In production, `allowedOrigins` must contain only the frontend domain.

## HTTPS

In production, HTTP → HTTPS redirection and `Strict-Transport-Security` header. Configured at the reverse proxy level (nginx) or in `server.ts` for direct deployment.

## Dependency Audit

```bash
npm audit              # Frontend
cd backend && npm audit  # Backend
```

Executed on every PR in the Docker build stage. A `high` or `critical` severity vulnerability blocks the build.

## BGG Catalog Import

The import endpoint (`POST /api/v1/bgg/import-catalog`) processes a 175k-line CSV file. It is protected by `requireRole('admin')` for two reasons:
1. Long operation — can saturate server resources
2. Massively modifies the database

The CSV file must be uploaded by the administrator from the Settings interface (admin role required).

## Pre-Deployment Security Checklist

- [ ] `AUTH_JWT_SECRET` generated with `openssl rand -hex 32` (32+ chars)
- [ ] `ADMIN_PASSWORD` and `USER_PASSWORD` strong and different
- [ ] `NODE_ENV=production` in the production environment
- [ ] `CORS_ORIGINS` contains only the production domain
- [ ] `npm audit` → 0 high/critical vulnerabilities
- [ ] HTTPS configured (valid certificate)
- [ ] Logs accessible (Docker stdout or aggregator)
- [ ] Rate limiting active on `/auth/login`
