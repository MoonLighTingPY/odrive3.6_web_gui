# ODrive Web GUI — Copilot Instructions

> Single source of truth for working in this repo. Supersedes all older instruction
> notes. Keep this file in sync with reality; if something here is wrong, fix it.

## What this project is
A web-based GUI to configure, monitor, and control ODrive motor controllers.
React + Vite frontend, Python Flask backend that talks to the ODrive over USB via
the `odrive` Python library. Runs as a dev server or as a standalone packaged app.

## Firmware support goal
Support **both 0.5.x and 0.6.x** firmware from one codebase. Version differences are
data-driven: the per-firmware API surface lives in the API-reference JSON
(`frontend/src/utils/odriveApiReference05x.json`, `odriveApiReference06x.json`).
Both 0.5.x and 0.6.x report `fw_version_major == 0`, so the firmware "line" is
chosen from `fw_version_minor` (5 → 0.5.x, 6 → 0.6.x).

## Environment / conventions
- Developed on **Linux** (zsh). Use Linux/POSIX commands. Use `python3`/`pip3` when
  ambiguous; a project venv lives at `backend/.venv`. `./install.sh`/`install.bat`
  create it and install all deps; `./build.sh`/`build.bat` build the standalone app.
- Must work on **both Linux and Windows** (avoid OS-specific paths; use `pathlib`).
- Frontend: React 18, Redux Toolkit, Chakra UI, Vite 6, recharts. ESLint flat config.
- Dev: from `frontend/`, `npm run dev` (real hardware) or `npm run mock_dev` (mock).
- Keep changes minimal and idiomatic. Don't reintroduce duplicated `_0_5`/`_0_6` files.

## Architecture (current)
- **Thin generic backend.** Flask exposes generic, version-agnostic endpoints that
  read/write/invoke ODrive properties by dotted path. All ODrive domain knowledge
  (property metadata, command generation, version differences) lives in the frontend.
- Backend endpoints (see `backend/app/app.py`):
  - `GET  /api/backend/version`
  - `GET  /api/devices`
  - `GET  /api/devices/<serial>/api-metadata[?section=]`
  - `POST /api/devices/<serial>/read`     body `{ "paths": [...] }` (REST fallback)
  - `POST /api/devices/<serial>/write`    body `{ "writes": [{path, value}] }`
  - `POST /api/devices/<serial>/command`  body `{ "path": ..., "args": [...] }`
  - `WS   /api/devices/<serial>/telemetry` — primary channel: streams telemetry AND
    handles `read`/`write`/`command` requests (id-keyed) on the same socket.
  - `POST /api/heartbeat`, `POST /api/shutdown` — standalone lifecycle only.
- **Per-device lock.** All device I/O (telemetry + read/write/command) is serialized
  via `device_manager.io_lock(serial)` so config writes never contend with the stream.
- **One WS per device on the frontend.** `api/deviceSocket.js` multiplexes telemetry
  and request/response; `api/backend.js` routes read/write/command over it (REST is a
  fallback). Don't add separate polling loops.
- **Data-driven frontend registry.** One registry built from the API-reference JSON,
  keyed by firmware line. This replaces the old duplicated property trees, registries,
  command generators, and `versionSelection.js` facade.
- **Mock mode.** `ODRIVE_MOCK=1` makes the backend simulate a device so the app and
  tests run end-to-end without hardware (`ODRIVE_MOCK_FW=6` for 0.6.x).

## Repo layout
### Backend (`backend/`)
- `app/app.py` — Flask app factory + routes (thin proxy).
- `app/device_manager.py` — device discovery, attribute resolve, batch read/write,
  per-device `io_lock`. `_find_any` returns None on timeout (no hardware = empty list).
- `app/telemetry.py` — WebSocket: telemetry stream + read/write/command requests.
- `app/lifecycle.py` — standalone single-instance + heartbeat watchdog + shutdown.
- `app/mock_odrive.py` — in-memory mock device seeded from the API-reference JSON.
- `app/constants.py` — `VERSION`.
- `app/routes/`, `app/utils/` — blueprint/util modules.
- `start_backend.py` — entry point (serves API; in prod also serves built frontend).
- `requirements.txt`, `servo.ico`.
- `run_standalone.py` — single-process launcher (serves API + built frontend, opens
  browser). `odrive_gui.spec` — PyInstaller spec. `requirements-build.txt` — adds
  PyInstaller. Build via `./build.sh` (Linux/macOS) or `build.bat` (Windows) →
  `backend/dist/odrive-gui[.exe]`.
- `app/paths.py` — locates the built frontend (`frontend/dist` or the PyInstaller
  bundle) so the backend can serve it in standalone mode.

### Frontend (`frontend/src/`)
- `api/backend.js` — typed client (REST + routes read/write/command over the socket).
- `api/deviceSocket.js` — one shared WebSocket per device (telemetry + RPC).
- `App.jsx`, `main.jsx`, `components/` — UI (tabs: configuration/config wizard,
  dashboard, inspector, presets, command console; modals; config-steps).
- `hooks/` — telemetry + property-tree + config-wizard hooks.
- `store/` — Redux slices (`device`, `telemetry`, `live`, `ui`). No `config` slice.
- `utils/` — config command generation, registry, validation (`configValidation.js`),
  helpers, charts, presets, property-tree, and the API-reference JSON files.

### Other
- `odrive_api_references/` — official API reference text + 0.5.x→0.6.x changelog
  (`API ODrive Reference 0.5.6.txt`, `API ODrive Reference 0.6.12.txt`,
  `changelog 0.5.x-0.6.12.txt`).
- `scripts/generate_api_reference.py` — regenerate an API-reference JSON from the
  text reference (parses `Expanded Path:` anchors). `scripts/check_api_reference.py`
  — report coverage gaps of a generated JSON vs its text source.

## Known issues being addressed (don't reintroduce)
- Frontend config layer historically called a dead endpoint and **fabricated default
  values** for failed reads, causing phantom "changed" parameters in the Apply tab.
  The fix is in place: keep a clean device snapshot of only successfully-read scalars
  and generate write commands strictly from a real diff. Never auto-write a value that
  wasn't read.
- Don't reintroduce duplicated `_0_6` vs non-`_0_6` files or per-component HTTP polling
  loops; use the data-driven registry and the shared device socket.

## Git context
- Working branch: `add-0.6.11-support` (the 0.6.x rewrite).
- The fuller, proven 0.5.x backend logic (calibration prerequisites, property-tree
  mapping, `sanitize_for_json` NaN/inf handling, telemetry config, PyInstaller/tray)
  lives on the `dev`/`deep-refactor` branches. Harvest from there with
  `git show dev:<path>` rather than reinventing.

## Reference docs
- API reference (text): `odrive_api_references/API ODrive Reference 0.5.6.txt`,
  `.../0.6.12.txt`.
- Changelog 0.5.x→0.6.12: `odrive_api_references/changelog 0.5.x-0.6.12.txt`.
- 0.6.x JSON is generated from the text reference via `scripts/generate_api_reference.py`;
  0.5.6 JSON is hand-curated (the 0.5.6 text export lacks the `Expanded Path:` anchors).
