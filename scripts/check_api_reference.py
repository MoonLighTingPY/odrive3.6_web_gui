#!/usr/bin/env python3
"""Check a generated API-reference JSON for coverage gaps against its text source.

Reports any ``Expanded Path:`` entries in the text reference that did not make it
into the JSON (e.g. a member type the generator didn't recognise). Intended as a
quick sanity check after running ``generate_api_reference.py``.

Usage:
    python scripts/check_api_reference.py \
        "odrive_api_references/API ODrive Reference 0.6.12.txt" \
        frontend/src/utils/odriveApiReference06x.json
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

PILCROW = "\uf0c1"


def text_paths(text: str) -> set[str]:
    lines = text.split("\n")
    paths: set[str] = set()
    for i, raw in enumerate(lines):
        if raw.replace(PILCROW, "").strip() != "Expanded Path:":
            continue
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        if j < len(lines):
            p = lines[j].replace(PILCROW, "").strip()
            p = re.sub(r"^odrv\d*\.", "", p)
            p = re.sub(r"axis0", "axis{n}", p, count=1)
            paths.add(p)
    return paths


def json_paths(data: dict) -> set[str]:
    out: set[str] = set()
    for group in data.get("properties", {}).values():
        out.update(group.keys())
    for group in data.get("commands", {}).values():
        out.update(group.keys())
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("text", type=Path)
    ap.add_argument("json", type=Path)
    args = ap.parse_args()

    src = text_paths(args.text.read_text(encoding="utf-8"))
    dst = json_paths(json.loads(args.json.read_text(encoding="utf-8")))

    missing = sorted(src - dst)
    print(f"text paths: {len(src)}  json paths: {len(dst)}  missing: {len(missing)}")
    # Sub-object members (classes) are intentionally skipped, so some "missing"
    # entries are expected; list them so a human can confirm none are leaves.
    for p in missing:
        print("  -", p)


if __name__ == "__main__":
    main()
