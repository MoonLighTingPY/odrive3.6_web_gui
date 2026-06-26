#!/usr/bin/env bash
# Install all dependencies for the ODrive Web GUI (Linux/macOS).
#
# Creates backend/.venv if missing, installs backend + build requirements, and
# installs frontend npm packages. Safe to re-run.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"

PY="${PYTHON:-python3}"

echo "==> Ensuring Python venv at backend/.venv"
cd "$BACKEND"
if [ ! -x ".venv/bin/python" ]; then
  "$PY" -m venv .venv
fi
VENV_PY=".venv/bin/python"
"$VENV_PY" -m pip install --upgrade pip
"$VENV_PY" -m pip install -r requirements-build.txt

echo "==> Installing frontend dependencies"
cd "$FRONTEND"
npm ci || npm install

echo "==> Done. Run './build.sh' to build the standalone app, or 'npm run dev' (in frontend/) for development."
