"""Shared access to the ODrive API-reference JSON.

The API-reference JSON files are the single source of truth for the property and
command surface of each firmware line. They live in the frontend so the UI can
ship them, and the backend reads the same files (used for the ``api-metadata``
endpoint and to seed the mock device).

Firmware versioning note: ODrive 0.5.x and 0.6.x **both** report
``fw_version_major == 0``; they are distinguished by ``fw_version_minor``
(5 vs 6). We therefore key the reference files on the minor "line" (5 or 6),
not on the major.
"""

from __future__ import annotations

import json
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

# Map firmware line (minor) -> reference filename.
_FILENAME_BY_LINE = {
    5: "odriveApiReference05x.json",
    6: "odriveApiReference06x.json",
}


def repo_root() -> Path:
    """Base path for bundled data.

    In a PyInstaller build the data is extracted under ``sys._MEIPASS``; in a
    normal checkout it lives at the repository root (backend/app/ -> repo/).
    """
    bundle = getattr(sys, "_MEIPASS", None)
    if bundle:
        return Path(bundle)
    return Path(__file__).resolve().parents[2]


def reference_line(fw_major: int, fw_minor: int) -> int:
    """Return the supported firmware line (5 or 6) for a reported version.

    ODrive 0.5.x and 0.6.x both report major 0, so we discriminate on minor.
    """
    if int(fw_major) == 0:
        return 6 if int(fw_minor) >= 6 else 5
    # Future majors (>=1) are not supported yet; fall back to the newest known.
    return 6


def api_reference_path(line: int) -> Path:
    try:
        filename = _FILENAME_BY_LINE[int(line)]
    except (KeyError, ValueError, TypeError) as exc:
        raise ValueError(f"Unsupported firmware line: {line}") from exc
    return repo_root() / "frontend" / "src" / "utils" / filename


@lru_cache(maxsize=None)
def load_api_reference(line: int) -> Dict[str, Any]:
    """Load and cache the API-reference JSON for the given firmware line."""
    path = api_reference_path(line)
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)
