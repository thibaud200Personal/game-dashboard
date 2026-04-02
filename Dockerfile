# Stage 1: Build frontend
FROM node:24-alpine AS frontend-builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Copy only frontend source (exclude backend/, .git, etc.)
COPY src ./src
COPY index.html tsconfig.json vite.config.ts tailwind.config.js .env.production* ./
RUN npm run build

# Stage 2: Build backend + compile native modules
FROM node:24-alpine AS backend-builder
WORKDIR /app/backend

# Build tools required for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ .
COPY shared/ ../shared/
# Compile TypeScript
RUN npm run build
# Prune to production-only deps (native binaries stay compiled)
RUN npm prune --omit=dev

# Stage 3: Production image
FROM node:24-alpine AS production
WORKDIR /app

# Copy production node_modules (with compiled native modules)
COPY --from=backend-builder /app/backend/node_modules ./node_modules

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy SQL schema (read at runtime via __dirname)
COPY backend/database/schema.sql ./dist/database/schema.sql

# Copy SQL migration files (read at runtime by DatabaseConnection via __dirname/migrations)
COPY backend/database/migrations/ ./dist/database/migrations/

# Copy frontend build
COPY --from=frontend-builder /app/dist ./public

# Create data dir for SQLite volume
RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/data/board_game_score.db
ENV CORS_ORIGINS=http://localhost:5000

EXPOSE 5000

CMD ["node", "dist/server.js"]
