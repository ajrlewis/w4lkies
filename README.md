# W4lkies

![W4lkies logo](frontend/public/img/logo.png)

Monorepo for **w4lkies.com**. Primary components:

- `frontend`: Next.js web application
- `backend`: FastAPI API
- `db`: PostgreSQL 16

## Local Development (Docker-First)

Run commands from the repository root (`w4lkies/`) where `docker-compose.yml` lives, or pass `-f /absolute/path/to/docker-compose.yml`.

### Services and Local URLs

| Service               | Container          | Local URL / Access                                      |
| --------------------- | ------------------ | ------------------------------------------------------- |
| Frontend (`frontend`) | `w4lkies-frontend` | `http://localhost:3000`                                 |
| API (`backend`)       | `w4lkies-backend`  | `http://localhost:8000`                                 |
| API docs              | `w4lkies-backend`  | `http://localhost:8000/docs`                            |
| Postgres (`db`)       | `w4lkies-database` | `postgresql://postgres:postgres@localhost:5432/w4lkies` |

If ports are overridden with env vars (`FRONTEND_PORT`, `BACKEND_PORT`, `POSTGRES_PORT`), URLs change accordingly.

### Quick Start

```bash
# 1) Optional clean reset
docker compose down --remove-orphans -v --rmi local
docker image prune -f

# 2) Build images
docker compose build backend frontend

# 3) Start database
docker compose up -d db

# 4) Apply migrations
docker compose run --rm backend alembic -c alembic.ini upgrade head

# 5) Seed data (reset + seed)
docker compose run --rm backend python scripts/seed_db.py --reset

# 6) Start API + frontend
docker compose up -d backend frontend
```

### Verify

```bash
docker compose ps
docker compose logs -f frontend backend db
```

### Live Reload Dev Mode (No Rebuild Per Code Change)

Use the `dev` profile services to get hot reload for frontend and backend while editing local files.

```bash
# Start database
docker compose up -d db

# Start dev API + frontend (hot reload)
docker compose --profile dev up -d backend-dev frontend-dev

# Follow logs
docker compose logs -f backend-dev frontend-dev
```

Dev URLs:

- Frontend dev: `http://localhost:3001`
- API dev: `http://localhost:8001`
- API docs dev: `http://localhost:8001/docs`

Notes:

- Frontend and backend source are bind-mounted into containers, so HTML/JS/TS/Python edits apply without rebuilding images.
- The existing `frontend` and `backend` services remain production-style image runs.

## Common Commands

### Migrations

```bash
docker compose run --rm backend alembic -c alembic.ini revision --autogenerate -m "describe_change"
docker compose run --rm backend alembic -c alembic.ini upgrade head
docker compose run --rm backend alembic -c alembic.ini current
```

### Tests

```bash
docker compose up -d db
docker compose run --rm backend pytest -q
```

### Database Shell

```bash
docker compose exec db psql -U postgres -d w4lkies
```

### Dangling Images and Build Cache

Rebuilding images creates old, untagged layers by design. Clean them periodically:

```bash
docker image prune -f
docker builder prune -f
```
