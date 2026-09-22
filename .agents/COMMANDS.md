# Commands

Run root commands from the repository root unless a `cd` is shown. Docker Engine with Compose is the canonical runtime; images pin Python 3.12 and Node 20. The frontend uses npm and the committed `package-lock.json`.

## Setup and development

```sh
docker compose build backend frontend
docker compose up -d db
docker compose run --rm backend alembic -c alembic.ini upgrade head
docker compose run --rm backend python scripts/seed_db.py --reset
docker compose up -d backend frontend
```

`seed_db.py --reset` is destructive to local application data. For bind-mounted hot reload:

```sh
docker compose up -d db
docker compose --profile dev up -d backend-dev frontend-dev
docker compose logs -f backend-dev frontend-dev
```

Production-style URLs are frontend `http://localhost:3000`, API `http://localhost:8000`, and OpenAPI UI `http://localhost:8000/docs`; dev-profile ports default to 3001 and 8001.

## Database

```sh
docker compose run --rm backend alembic -c alembic.ini revision --autogenerate -m "describe_change"
docker compose run --rm backend alembic -c alembic.ini upgrade head
docker compose run --rm backend alembic -c alembic.ini current
docker compose exec db psql -U postgres -d w4lkies
```

## Verification

```sh
# Compose syntax
docker compose config --quiet

# Backend suite with coverage reports configured by backend/pytest.ini
docker compose up -d db
docker compose run --rm backend pytest -q

# One backend test
docker compose run --rm backend pytest -q tests/test_public_routes.py

# Frontend static checks and production build (Node 20 via Docker is canonical)
docker compose build frontend
cd frontend && npm run lint

# Resolved production dependency audit; requires current npm advisory access
cd frontend && npm audit --omit=dev
```

There is no separate frontend test, typecheck, formatter, Python lint/typecheck, secret scan, container scan, or CI command yet; these gaps are tracked in `todos/TODO.md`. `next.config.mjs` currently suppresses ESLint and TypeScript failures during `next build`, so a build does not replace lint/type verification.

## Diagnostics and cleanup

```sh
docker compose ps
docker compose logs -f frontend backend db
docker compose down --remove-orphans
```

Do not add `-v` to `docker compose down` unless deleting the local PostgreSQL volume is intentional.
