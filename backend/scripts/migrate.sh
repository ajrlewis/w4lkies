#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET="${1:-head}"

cd "${BACKEND_DIR}"

# Optional local defaults; callers can still override with exported env vars.
if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

if [[ -z "${SQLALCHEMY_DATABASE_URI:-}" && -z "${POSTGRES_URL:-}" ]]; then
  echo "Error: SQLALCHEMY_DATABASE_URI or POSTGRES_URL must be set."
  exit 1
fi

if command -v alembic >/dev/null 2>&1; then
  alembic -c alembic.ini upgrade "${TARGET}"
else
  python3 -m alembic -c alembic.ini upgrade "${TARGET}"
fi
