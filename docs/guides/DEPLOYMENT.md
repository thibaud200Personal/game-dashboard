# Guide de déploiement

## Architecture Docker

### Maintenant — single container

Le frontend (fichiers statiques compilés) et le backend (API Express) tournent dans le même conteneur. Express sert à la fois les fichiers statiques et l'API.

```
[Navigateur]
    ↓ HTTPS
[Container unique]
  ├── Express → GET /api/v1/*  (API)
  ├── Express → GET /*         (fichiers statiques dist/)
  └── SQLite volume nommé
```

### Futur — deux containers

```yaml
# docker-compose.yml (futur)
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

nginx route `/api/*` vers le backend, tout le reste vers les fichiers statiques.

**Note** : SQLite reste accessible uniquement par le conteneur backend. Pas de problème de concurrence entre containers.

## Dockerfile multi-stage

```dockerfile
# Stage 1 — build (sources + tests + compilation)
FROM node:24-alpine AS builder
WORKDIR /app

# Shared types (nécessaire pour les deux builds)
COPY shared/ ./shared/

# Frontend
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY src/ ./src/
RUN npm ci
RUN npm run test:run          # Bloque si tests échouent
RUN npm run build             # → dist/

# Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend/ ./backend/
RUN cd backend && npm run test:run   # Bloque si tests échouent
RUN cd backend && npm run build      # → backend/dist/

# Stage 2 — production (uniquement les artefacts)
FROM node:24-alpine AS production
WORKDIR /app

# Fichiers statiques frontend
COPY --from=builder /app/dist ./dist

# Backend compilé
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json

# Données persistantes
VOLUME /app/data

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "backend/dist/server.js"]
```

**Garantie** : si un test échoue en Stage 1, l'image ne se construit pas. Tests fonctionnels = condition nécessaire au déploiement.

## Variables d'environnement

Copier `.env.example` vers `.env` et remplir toutes les valeurs.

```bash
cp .env.example .env
```

| Variable | Obligatoire | Description |
|---|---|---|
| `AUTH_JWT_SECRET` | ✅ | Secret signature JWT. Générer : `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | ✅ | Mot de passe admin (import BGG, features avancées) |
| `USER_PASSWORD` | ✅ | Mot de passe utilisateur standard |
| `PORT` | Non | Port backend (défaut : 3001) |
| `NODE_ENV` | ✅ prod | `production` en prod, `development` en local |
| `CORS_ORIGINS` | ✅ | Origines CORS autorisées, séparées par `,` |
| `LOG_LEVEL` | Non | Niveau de log pino (défaut : `info`) |
| `DB_PATH` | Non | Chemin SQLite (défaut : `/app/data/database.db`) |

## Démarrage en production

```bash
# Build de l'image
docker build -t game-dashboard .

# Démarrage avec les variables d'environnement
docker run -d \
  --name game-dashboard \
  -p 443:3001 \
  -v game_db:/app/data \
  --env-file .env \
  game-dashboard
```

## Backups

La base de données SQLite est dans le volume `game_db`. Backup manuel :

```bash
docker run --rm \
  -v game_db:/data \
  -v $(pwd)/backups:/backups \
  alpine tar czf /backups/db-$(date +%Y%m%d).tar.gz -C /data .
```

Automatiser avec un cron host ou un conteneur dédié.

## Import catalogue BGG

Le catalogue BGG (175k jeux) doit être importé manuellement depuis l'interface Settings (rôle admin requis).

1. Télécharger le dump CSV mensuel BGG : `boardgames_ranks.csv`
2. Uploader via Settings → "Import BGG Catalog"
3. L'import prend quelques secondes (FTS5 + index)

Le catalogue n'est pas inclus dans l'image Docker — il est stocké dans la base de données persistante.

## HTTPS

En production, configurer HTTPS au niveau du reverse proxy (nginx, Caddy, Traefik) ou d'un service cloud. Certificat Let's Encrypt recommandé.

Exemple Caddyfile minimal :
```
ton-domaine.com {
  reverse_proxy localhost:3001
}
```

Caddy gère automatiquement le certificat Let's Encrypt et la redirection HTTP→HTTPS.

## Monitoring

Les logs sont sur stdout au format JSON (pino). Consultation :

```bash
docker logs game-dashboard --follow
docker logs game-dashboard --since 1h | grep '"level":50'  # erreurs uniquement
```

Pour filtrer par niveau :
```bash
docker logs game-dashboard | npx pino-pretty  # formatage lisible en dev
```
