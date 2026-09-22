# Workflow

## Normal change loop

1. Read `README.md` and inspect the affected frontend, backend, migration, and test code.
2. Make the smallest change that preserves the boundaries in `ARCHITECTURE.md` and the relevant adopted presets.
3. Add or update focused backend tests for backend behavior. Frontend automated tests are not yet established; verify frontend work with lint/build plus the affected browser flow and record meaningful missing coverage.
4. Run the relevant commands from `COMMANDS.md`. For cross-component or release work, run the full verification set.
5. Review the diff, including generated lockfile and migration changes. Update `.agents/` only when durable project facts changed.
6. Keep product work in GitHub issues or the existing root `TODO.md`. Reserve `.agents/todos/` for agent-configuration and engineering-process follow-up.

## Git and delivery

Use the tailored GitHub Flow preset in `presets/git/github-flow.md`. The remote default branch is `master`; use one focused typed branch per change and merge through a pull request. Before pushing or updating a pull request, fetch `origin/master`, merge it into the feature branch, resolve conflicts there, and rerun affected verification.

The repository is currently solo-maintained and `master` had no ruleset or branch protection when checked on 2026-09-22. Do not change remote settings without explicit maintainer authorization; the open policy choice is tracked in `todos/TODO.md`.

## Database and deployment care

- Create Alembic revisions for schema changes and inspect generated operations. Do not rewrite migrations that may have run outside local development.
- Use synthetic local seed data. Database reset commands destroy the local Compose volume and require explicit intent.
- Repository files own application code, migrations, Compose, Dockerfiles, and `backend/vercel.json`. Vercel owns live deployment state; production inspection or mutation requires explicit authorization.
- Never commit `.env` values, tokens, customer data, financial exports, or database dumps.

## Completion

Relevant checks must have actually run. Report failures and unavailable checks exactly; do not hide them behind Next.js's configured build-time lint/type-error bypasses. Follow `SECURITY.md` for vulnerability work and record genuine deferred engineering setup in `todos/TODO.md`.
