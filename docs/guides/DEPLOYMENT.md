# Deployment Guide

## Docker Architecture

### Now — Single Container

The frontend (compiled static files) and the backend (Express API) run in the same container. Express serves both the static files and the API.

```
[Browser]
    ↓ HTTPS
[Single Container]
  ├── Express → GET /api/v1/*  (API)
  ├── Express → GET /*         (static dist/ files)
  └── SQLite named volume
```

### Future — Two Containers

```yaml
# docker-compose.yml (future)
services:
  nginx:
    image: nginx:alpine
    ports: ["443:443", "80:80"]
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on: [backend]

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - AUTH_JWT_SECRET=${AUTH_JWT_SECRET}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - USER_PASSWORD=${USER_PASSWORD}
    volumes:
      - db_data:/app/data

volumes:
  db_data:
```

nginx routes `/api/*` to the backend, everything else to static files.

**Note**: SQLite remains accessible only by the backend container. No concurrency issue between containers.

## Multi-Stage Dockerfile

```dockerfile
# Stage 1 — build (sources + tests + compilation)
FROM node:24-alpine AS builder
WORKDIR /app

# Shared types (needed for both builds)
COPY shared/ ./shared/

# Frontend
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY src/ ./src/
RUN npm ci
RUN npm run test:run          # Blocks if tests fail
RUN npm run build             # → dist/

# Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend/ ./backend/
RUN cd backend && npm run test:run   # Blocks if tests fail
RUN cd backend && npm run build      # → backend/dist/

# Stage 2 — production (artifacts only)
FROM node:24-alpine AS production
WORKDIR /app

# Frontend static files
COPY --from=builder /app/dist ./dist

# Compiled backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json

# Persistent data
VOLUME /app/data

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "backend/dist/server.js"]
```

**Guarantee**: if a test fails in Stage 1, the image does not build. Passing tests are a necessary condition for deployment.

## Environment Variables

Copy `.env.example` to `.env` and fill in all values.

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `AUTH_JWT_SECRET` | ✅ | JWT signing secret. Generate: `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | ✅ | Admin password (BGG import, advanced features) |
| `USER_PASSWORD` | ✅ | Standard user password |
| `PORT` | No | Backend port (default: 3001) |
| `NODE_ENV` | ✅ prod | `production` in prod, `development` locally |
| `CORS_ORIGINS` | ✅ | Allowed CORS origins, comma-separated |
| `LOG_LEVEL` | No | pino log level (default: `info`) |
| `DB_PATH` | No | SQLite path (default: `/app/data/database.db`) |

## Starting in Production

```bash
# Build the image
docker build -t game-dashboard .

# Start with environment variables
docker run -d \
  --name game-dashboard \
  -p 443:3001 \
  -v game_db:/app/data \
  --env-file .env \
  game-dashboard
```

## Backups

The SQLite database is in the `game_db` volume. Manual backup:

```bash
docker run --rm \
  -v game_db:/data \
  -v $(pwd)/backups:/backups \
  alpine tar czf /backups/db-$(date +%Y%m%d).tar.gz -C /data .
```

Automate with a host cron job or a dedicated container.

## BGG Catalog Import

The BGG catalog (175k games) must be imported manually from the Settings interface (admin role required).

1. Download the monthly BGG CSV dump: `boardgames_ranks.csv`
2. Upload via Settings → "Import BGG Catalog"
3. Import takes a few seconds (FTS5 + index)

The catalog is not included in the Docker image — it is stored in the persistent database.

## HTTPS

In production, configure HTTPS at the reverse proxy level (nginx, Caddy, Traefik) or a cloud service. Let's Encrypt certificate recommended.

Minimal Caddyfile:
```
your-domain.com {
  reverse_proxy localhost:3001
}
```

Caddy automatically handles the Let's Encrypt certificate and HTTP→HTTPS redirection.

## Monitoring

Logs are on stdout in JSON format (pino). Viewing:

```bash
docker logs game-dashboard --follow
docker logs game-dashboard --since 1h | grep '"level":50'  # errors only
```

To filter by level:
```bash
docker logs game-dashboard | npx pino-pretty  # readable formatting in dev
```
