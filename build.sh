#!/usr/bin/env bash
# Build the ODrive Web GUI standalone executable (Linux/macOS).
#
# Produces backend/dist/odrive-gui. Run from anywhere; paths are resolved
# relative to this script.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"

echo "==> Building frontend"
cd "$FRONTEND"
npm ci || npm install
npm run build

echo "==> Packaging backend with PyInstaller"
cd "$BACKEND"
if [ ! -x ".venv/bin/python" ]; then
  echo "==> Creating Python venv at backend/.venv"
  "${PYTHON:-python3}" -m venv .venv
fi
PY=".venv/bin/python"
"$PY" -m pip install --upgrade pip
"$PY" -m pip install -r requirements-build.txt
"$PY" -m PyInstaller odrive_gui.spec --noconfirm

echo "==> Done. Executable at: $BACKEND/dist/odrive-gui"
