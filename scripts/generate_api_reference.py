#!/usr/bin/env python3
"""Generate an ODrive API-reference JSON from the official text reference.

The text reference (exported from the ODrive docs) is the source of truth. Each
member is anchored by an ``Expanded Path:`` block giving its real runtime path
(e.g. ``odrv.axis0.config.motor.pole_pairs``), which makes the format reliable
to parse. Output schema matches ``odriveApiReference05x.json`` so the frontend
registry consumes it unchanged.

Usage:
    python scripts/generate_api_reference.py \
        "odrive_api_references/API ODrive Reference 0.6.x.txt" \
        frontend/src/utils/odriveApiReference06x.json --version 0.6.11
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

PILCROW = "\uf0c1"  # headerlink glyph appended to headings in the export

ACCESS = {"read-write": "rw", "read-only": "ro"}

# Map a documented scalar type token to the JSON "*Property" type the frontend
# registry understands (it only inspects substrings: Bool/Float/Uint/Int).
SCALAR_TYPE_RE = re.compile(r"^(float|uint|int)(\d+)$", re.IGNORECASE)


def clean(line: str) -> str:
    return line.rstrip("\n").replace(PILCROW, "")


def strip_prefix(path: str) -> str:
    # "odrv.x.y" / "odrv0.x.y" -> "x.y"
    return re.sub(r"^odrv\d*\.", "", path)


def templatize(path: str) -> str:
    # The docs only enumerate axis0; collapse to a template the app expands.
    return re.sub(r"axis0", "axis{n}", path, count=1)


def json_type(token: str, enum_names: set[str]) -> str | None:
    """Return the JSON type string for a scalar/enum token, or None to skip."""
    t = token.strip()
    if t == "bool":
        return "BoolProperty"
    m = SCALAR_TYPE_RE.match(t)
    if m:
        base, bits = m.group(1).capitalize(), m.group(2)
        return f"{base}{bits}Property"
    # Already-qualified enum/flag property, e.g. "Property[ODrive.Error]".
    pm = re.match(r"^Property\[(.+)\]$", t)
    if pm:
        return t
    if t in enum_names:
        return f"Property[{t}]"
    # Anything else (sub-object class, array, tuple, unknown) is not a leaf.
    return None


def category_for(path: str) -> str:
    if ".motor" in path or path.endswith(".motor"):
        return "motor"
    if "encoder" in path or "commutation_mapper" in path or "pos_vel_mapper" in path:
        return "encoder"
    if ".controller" in path or ".trap_traj" in path:
        return "controller"
    if ".can" in path or path.startswith("can."):
        return "can"
    if path.startswith("axis"):
        return "axis"
    return "system"


def parse_enums(lines: list[str]) -> dict:
    """Parse `class ODrive.X` sections that contain `NAME = N (0xN)` members."""
    enums: dict[str, dict] = {}
    enum_re = re.compile(r"^\s{4}([A-Z][A-Z0-9_]*) = (\d+) \(0x([0-9a-fA-F]+)\)\s*$")
    class_re = re.compile(r"^class (ODrive\.[A-Za-z0-9_.]+)\s*$")

    current = None
    for idx, raw in enumerate(lines):
        line = clean(raw)
        cm = class_re.match(line.strip()) if line.startswith("class ") else None
        if cm:
            current = cm.group(1)
            continue
        em = enum_re.match(line)
        if em and current:
            enums.setdefault(current, {"name": current, "values": {}})
            name, dec, hx = em.group(1), int(em.group(2)), em.group(3)
            enums[current]["values"][name] = {
                "value": dec,
                "hex": f"0x{hx}",
                "description": description_after(lines, idx),
            }
    # Keep only classes that actually had enumerators.
    return {k: v for k, v in enums.items() if v["values"]}


def description_after(lines: list[str], idx: int) -> str:
    """Return the first prose paragraph following a signature/enumerator line.

    Prose lines are more deeply indented than the member they describe; we stop
    at the next member signature, keyword block (Parameters/Expanded Path/...),
    class header, or column-0 line.
    """
    for k in range(idx + 1, min(idx + 10, len(lines))):
        line = clean(lines[k])
        stripped = line.strip()
        if not stripped:
            continue
        if stripped in SKIP_SIGS or SIG_RE.match(line) or line.startswith("class "):
            break
        if line.startswith(" "):
            return stripped
        break
    return ""


# A member signature sits at 4-space indent and is either a property
# ("name: ...") or a method ("name(...)").
SIG_RE = re.compile(r"^ {4}([a-z_][A-Za-z0-9_]*)\s*([:(].*)$")
SKIP_SIGS = {"Parameters:", "Returns:", "Expanded Path:", "Members:"}


def find_signature(lines: list[str], idx: int) -> tuple[str, str, int] | None:
    """Walk backwards from an 'Expanded Path:' line to its member signature.

    Returns (name, rest, sig_line_index).
    """
    for k in range(idx - 1, -1, -1):
        line = clean(lines[k])
        if line.strip() in SKIP_SIGS:
            continue
        m = SIG_RE.match(line)
        if m:
            return m.group(1), m.group(2), k
        # A blank line or deeper-indented prose is fine; a new class header or a
        # column-0 line means we've gone too far.
        if line and not line.startswith(" ") and not line.startswith("class "):
            return None
    return None


def parse_property(rest: str, enum_names: set[str]):
    """Parse the part after 'name:' -> (json_type, access) or None."""
    body = rest[1:].strip() if rest.startswith(":") else rest.strip()
    # Drop a leading "[Unit] -" annotation and a trailing "experimental" tag
    # (the export glues it onto the access keyword, e.g. "read-writeexperimental").
    body = re.sub(r"^\[[^\]]*\]\s*-\s*", "", body).strip()
    body = re.sub(r"(read-write|read-only)experimental\b", r"\1", body)
    body = re.sub(r"\bexperimental\b", "", body).strip()
    tokens = body.split()
    if not tokens:
        return None
    access = ACCESS.get(tokens[-1])
    if access is None:
        return None
    type_token = " ".join(tokens[:-1]).strip()
    jt = json_type(type_token, enum_names)
    if jt is None:
        return None
    return jt, access


def parse_method(name: str, rest: str):
    """Parse a method signature -> (returns, [param_names])."""
    paren = re.search(r"\((.*?)\)", rest)
    params = []
    if paren and paren.group(1).strip():
        params = [p.strip().split("=")[0].strip() for p in paren.group(1).split(",") if p.strip()]
    ret = None
    arrow = rest.split("\u2192")
    if len(arrow) > 1:
        ret = arrow[1].replace("experimental", "").strip() or None
    return ret, params


def expanded_path_after(lines: list[str], idx: int) -> str | None:
    j = idx + 1
    while j < len(lines) and not clean(lines[j]).strip():
        j += 1
    return clean(lines[j]).strip() if j < len(lines) else None


def generate(text: str, version: str) -> dict:
    lines = text.split("\n")
    enums = parse_enums(lines)
    enum_names = set(enums)

    properties: dict[str, dict] = {}
    commands: dict[str, dict] = {}
    seen: set[str] = set()

    for i, raw in enumerate(lines):
        if clean(raw).strip() != "Expanded Path:":
            continue
        path_raw = expanded_path_after(lines, i)
        if not path_raw or not path_raw.startswith("odrv"):
            continue
        sig = find_signature(lines, i)
        if not sig:
            continue
        name, rest, sig_idx = sig
        path = templatize(strip_prefix(path_raw))
        if path in seen:
            continue
        seen.add(path)
        category = category_for(path)
        description = description_after(lines, sig_idx)

        if rest.startswith("("):
            ret, params = parse_method(name, rest)
            commands.setdefault(category, {})[path] = {
                "name": name,
                "path": path,
                "category": category,
                "parameters": [{"name": p, "type": "", "description": ""} for p in params],
                "returns": ret or "",
                "description": description,
            }
        else:
            parsed = parse_property(rest, enum_names)
            if not parsed:
                continue
            jt, access = parsed
            properties.setdefault(category, {})[path] = {
                "name": name,
                "path": path,
                "type": jt,
                "access": access,
                "category": category,
                "description": description,
            }

    return {
        "version": version,
        "api_metadata": {
            "root_class": "ODrive",
            "description": "ODrive motor controller API reference",
        },
        "types": {},
        "enums": enums,
        "commands": commands,
        "properties": properties,
        "classes": {},
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("input", type=Path, help="text reference file")
    ap.add_argument("output", type=Path, help="output JSON file")
    ap.add_argument("--version", default="0.6.12", help="firmware version string")
    args = ap.parse_args()

    text = args.input.read_text(encoding="utf-8")
    data = generate(text, args.version)
    args.output.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    nprop = sum(len(g) for g in data["properties"].values())
    ncmd = sum(len(g) for g in data["commands"].values())
    print(f"Wrote {args.output}")
    print(f"  properties: {nprop}  commands: {ncmd}  enums: {len(data['enums'])}")


if __name__ == "__main__":
    main()
