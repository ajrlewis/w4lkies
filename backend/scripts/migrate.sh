#!/usr/bin/env bash
set -euo pipefail

MESSAGE="${1:-auto migration}"

alembic -c alembic.ini revision --autogenerate -m "${MESSAGE}"
alembic -c alembic.ini upgrade head
