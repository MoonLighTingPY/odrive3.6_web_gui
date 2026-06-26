"""Locate the built frontend so the backend can serve it in standalone mode.

In development the frontend is served by Vite and the backend is API-only. In a
packaged build (or when ``frontend/dist`` exists) the backend serves the static
build so the whole app runs from a single process.
"""

from __future__ import annotations

import sys
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def frontend_dist() -> Path | None:
    """Return the path to the built frontend, or None if it isn't available.

    Search order:
      1. PyInstaller bundle (``sys._MEIPASS/frontend_dist``).
      2. ``frontend/dist`` relative to the repo (normal dev/prod build).
    """
    bundle = getattr(sys, "_MEIPASS", None)
    if bundle:
        candidate = Path(bundle) / "frontend_dist"
        if (candidate / "index.html").exists():
            return candidate

    candidate = _repo_root() / "frontend" / "dist"
    if (candidate / "index.html").exists():
        return candidate

    return None
