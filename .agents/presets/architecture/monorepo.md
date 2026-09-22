# W4lkies Monorepo Preset

- Preserve the existing root `frontend/`, `backend/`, and `docker-compose.yml` layout; do not introduce an `apps/`, workspace, shared-package, or task-runner abstraction without a demonstrated need.
- Treat frontend and backend as independently deployable boundaries joined by the documented HTTP API and environment configuration.
- Keep frontend npm resolution in `frontend/package-lock.json`; backend dependency resolution remains separate.
- Keep cross-boundary contracts explicit in FastAPI schemas/OpenAPI and frontend types. Avoid silently changing one side without verifying the other.
- Keep backend tests in `backend/tests/`. When a frontend test baseline is adopted, keep those tests within `frontend/`.
- Use the root Docker Compose topology for cross-component development and verification.
