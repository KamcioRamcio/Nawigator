# Nawigator: one container = Express API + built frontend on port 8888.
# Data lives in /app/data (mount it!), backups in /app/backups.

FROM node:24-trixie-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM node:24-trixie-slim AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
 && node -e "require('sqlite3')"

FROM node:24-trixie-slim
ENV NODE_ENV=production \
    PORT=8888 \
    STATIC_DIR=/app/dist \
    DB_PATH=/app/data/db.sqlite3 \
    BACKUP_DIR=/app/backups \
    TZ=Europe/Warsaw
WORKDIR /app/backend
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ ./
COPY --from=frontend /app/dist /app/dist
RUN mkdir -p /app/data /app/backups && chown node:node /app/data /app/backups
USER node
EXPOSE 8888
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8888/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
# Small heap cap: the app needs ~60 MB, the laptop has 4 GB in total.
CMD ["node", "--max-old-space-size=192", "server.js"]
