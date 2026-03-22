# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Build backend + compile native modules
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend

# Build tools required for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ .
# Compile TypeScript
RUN npm run build
# Prune to production-only deps (native binaries stay compiled)
RUN npm prune --omit=dev

# Stage 3: Production image
FROM node:22-alpine AS production
WORKDIR /app

# Copy production node_modules (with compiled native modules)
COPY --from=backend-builder /app/backend/node_modules ./node_modules

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./dist

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
