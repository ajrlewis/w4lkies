#! /usr/bin/env bash

source .env
source venv/bin/activate
export PYTHONPATH="${PYTHONPATH}:src"
fastapi dev api/main.py
deactivate
