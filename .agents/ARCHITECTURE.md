# Architecture

W4lkies is a Docker-first polyglot monorepo with three runtime boundaries:

```text
browser
  -> Next.js 14 frontend (`frontend/`, port 3000)
  -> FastAPI HTTP API (`backend/src/`, port 8000)
       -> SQLAlchemy models and CRUD services
       -> PostgreSQL 16 (`db`, port 5432)
       -> SMTP when mail settings are present
```

## Frontend

The Next.js App Router entrypoints in `frontend/app/` host a client-side React application from `frontend/src/ClientApp.tsx`. `src/App.tsx` and `src/legacy-pages/` provide React Router navigation; API modules call the backend using `NEXT_PUBLIC_API_BASE_URL`. Authentication tokens currently live in browser `localStorage`. UI components use Tailwind and Radix-derived components.

Keep browser-only APIs and token handling in client code. `NEXT_PUBLIC_*` values are public build/runtime configuration, never secrets. The frontend has no automated test suite yet and its Next config currently allows build output despite lint or TypeScript errors.

## Backend and data

`backend/src/main.py` constructs FastAPI, CORS, static assets, and routers. Request/response contracts live in `schemas/`; routers own HTTP concerns, services own workflows, CRUD modules own persistence operations, and SQLAlchemy models define persisted entities. `backend/api/main.py` adapts the same application for Vercel.

Alembic revisions under `backend/alembic/versions/` are the canonical schema history. PostgreSQL is authoritative for runtime business data. Treat customer, dog, booking, invoice, expense, bank-transaction, and authentication data as sensitive. Financial CSV exports and database dumps are local data, not source artifacts.

FastAPI exposes OpenAPI at `/docs`. JWT configuration and database/mail credentials enter through environment variables. Never rely on Compose's development defaults for production secrets.

## Runtime and external boundaries

- Root `docker-compose.yml` owns local production-style and hot-reload topology. The backend Dockerfile pins Python 3.12; the frontend Dockerfile pins Node 20.
- Repository code, Dockerfiles, migrations, and `backend/vercel.json` are canonical deployment inputs. Vercel is authoritative only for live deployment state and logs.
- GitHub is the canonical Git remote and collaboration boundary. There is no checked-in CI configuration.
- No evidence establishes Doppler, Linear, Mintlify, or Supabase as active infrastructure. The installed Supabase frontend package is not referenced by application source.

External deployment, production database, secret, DNS, or GitHub settings must not be mutated without explicit maintainer authorization.
