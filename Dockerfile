# ─────────────────────────────────────────────
# Stage 1: Build frontend
# ─────────────────────────────────────────────
FROM node:24-alpine AS frontend-builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY index.html tsconfig.json vite.config.ts tailwind.config.js .env.production* ./
COPY shared/ ./shared/
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Build backend + compile native modules
# ─────────────────────────────────────────────
FROM node:24-alpine AS backend-builder
WORKDIR /app/backend

RUN apk add --no-cache python3 make g++

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ .
COPY shared/ ../shared/
RUN npm run build
RUN npm prune --omit=dev

# ─────────────────────────────────────────────
# Stage 3: Run frontend tests
# Build fails here if any frontend test fails.
# ─────────────────────────────────────────────
FROM node:24-alpine AS test-frontend
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY index.html tsconfig.json vite.config.ts vitest.config.ts tailwind.config.js ./
COPY shared/ ./shared/

ENV CI=true
RUN npm run test:run

# ─────────────────────────────────────────────
# Stage 4: Run backend tests
# Build fails here if any backend test fails.
# ─────────────────────────────────────────────
FROM node:24-alpine AS test-backend
WORKDIR /app/backend

RUN apk add --no-cache python3 make g++

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ .
COPY shared/ ../shared/

ENV CI=true
RUN npm run test:run

# ─────────────────────────────────────────────
# Stage 5: Production image
# Only reached if both test stages pass.
# ─────────────────────────────────────────────
FROM node:24-alpine AS production
WORKDIR /app

# Marker files from test stages — forces Docker to execute them
# even when building only the production target.
COPY --from=test-frontend /app/package.json /tmp/test-frontend-ok
COPY --from=test-backend /app/backend/package.json /tmp/test-backend-ok

COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY backend/database/schema.sql ./dist/database/schema.sql
COPY backend/database/migrations/ ./dist/database/migrations/
COPY --from=frontend-builder /app/dist ./public

RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/data/board_game_score.db
ENV CORS_ORIGINS=http://localhost:5000

EXPOSE 5000

CMD ["node", "dist/server.js"]
