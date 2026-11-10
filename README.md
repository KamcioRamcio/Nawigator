# Nawigator

Medicine and medical-equipment inventory for the training ship MV Nawigator XXI (Maritime University of Szczecin).
It tracks stock and expiry dates, computes what needs ordering, manages orders and disposal (utilization) records,
and prints PDF reports. The UI is in Polish.

It is built to run on an **old laptop (4 GB RAM, Linux Mint)**: one Docker container, one Node.js process,
SQLite, ~35 MB of RAM.

## Features

- Main medicine list, minimum medicine list (kept in sync), equipment lists — grouped by category
- Expiry status (`Przeterminowane`, `Ważność 1/3 miesiące`, …) and stock status (`Do zamówienia`, `Uwaga Ilość`, …) computed by SQLite triggers and refreshed nightly
- Preview of statuses at a future date
- Orders: add items from any list, mark as received to add stock (once) and record the delivered expiry dates
- Disposal records with reasons, kept even after the item is deleted
- PDF exports of every list, order and disposal record
- Users with roles `admin` / `user` / `viewer`
- Database export/import — **exports from older app versions are migrated automatically**
- Automatic backups after every change and daily (last 7 days)

## Stack

| Part | Tech |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Vite 8, jsPDF (loaded on demand) |
| Backend | Node.js 24, Express 5, SQLite (`sqlite3`), `express-validator`, `multer`, `node-schedule` |
| Tests | `node:test` + `supertest` (backend), Playwright (end-to-end) |
| Runtime | Docker (`node:24-trixie-slim`) |

## Project layout

```
backend/
  server.js          entry point: migrate DB, listen, nightly job
  app.js             Express app (API + built frontend), used by tests too
  routes/            REST endpoints + validation
  db/                SQL queries, schema, triggers, migration
  utils/helpers.js   backups, export, import
  test/              backend tests + old-schema fixture
src/                 React app (pages, components, PDF generators)
e2e/                 Playwright tests and test server
docs/                technical documentation (Polish)
Dockerfile           single production image
```

## Development

Requires Node.js ≥ 22.12.

```bash
npm install
npm --prefix backend install

npm run dev:backend   # API on :3333, database in backend/data/
npm run dev           # UI on http://localhost:8888, /api is proxied to :3333
```

Environment variables (backend): `PORT` (3333), `DB_PATH` (`./data/db.sqlite3`), `BACKUP_DIR` (`./backups`),
`STATIC_DIR` (serve the built frontend from this folder), `TZ`.

An empty database gets a user `admin` without a password. To work with real data, use **Import** on the login screen.

## Tests

```bash
npm test                          # backend: every endpoint, migration of old databases, backups
npx playwright install chromium   # once
npm run test:e2e                  # builds the app and drives the real UI
```

If an old export named `database_export_2025-04-16.db` is present in the repo root (it is git-ignored), both suites
also import it. See [docs/testy.md](docs/testy.md).

## Production

```bash
docker build -t weatherme/navigator:latest .
docker push weatherme/navigator:latest
```

On the laptop the image runs with the database and backups mounted from the host:

```bash
docker run -d --name nawigator --restart unless-stopped \
  --user "$(id -u):$(id -g)" --memory 300m \
  -p 8888:8888 \
  -v ~/nawigator-data:/app/data \
  -v ~/Desktop/nawigator-backups:/app/backups \
  weatherme/navigator:latest
```

The local `navi.sh` script does this, plus a one-time move of the database out of the pre-2.0 two-container
setup. Details, backup restore and troubleshooting: [docs/wdrozenie.md](docs/wdrozenie.md).

## Documentation

- [Architecture](docs/architektura.md)
- [Database, statuses and migration](docs/baza-danych.md)
- [API reference](docs/api.md)
- [Deployment and maintenance](docs/wdrozenie.md)
- [Tests](docs/testy.md)

## Author

Maintained by KamcioRamcio.
