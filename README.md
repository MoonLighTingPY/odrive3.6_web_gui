# ODrive Web GUI

A web-based GUI for configuring, monitoring, and controlling ODrive motor
controllers. Supports **both 0.5.x and 0.6.x firmware** from one codebase, and
runs on **Linux and Windows** as either a development server or a single
standalone executable.

[![Latest Release](https://img.shields.io/github/release/MoonLighTingPY/odrive3.6_web_gui.svg?logo=github)](https://github.com/MoonLighTingPY/odrive3.6_web_gui/releases)
[![ODrive Firmware](https://img.shields.io/badge/ODrive_firmware-0.5.x_%7C_0.6.x-blue.svg)](https://docs.odriverobotics.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-green.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)

## Quick Navigation

[Why this GUI?](#why-this-gui) ·
[Features](#features) ·
[Download & Install](#download--install) ·
[For Developers](#for-developers) ·
[Contributing](#contributing)

## Why This GUI?

The official ODrive GUI dropped support for older firmware. This project gives
0.5.x users a modern interface and also works with 0.6.x:

- One app, both firmware lines — 0.5.x and 0.6.x, selected automatically per device.
- Cross-platform — Linux and Windows, dev mode or a standalone executable.
- No hardware required — a built-in mock device runs the whole app and the test suite without an ODrive.

## Features

| Feature | Notes |
|---|---|
| Configuration wizard | Grouped, data-driven editor for every writable parameter, with inline validation and pre-apply safety checks |
| Apply (change tracking) | Writes only parameters you actually changed — no phantom commands |
| Presets | Full device snapshots; apply, compare, import/export, guarded by firmware line |
| Inspector | Browse and edit any property; enum dropdowns; setpoint sliders; live values |
| Live charts | Real-time plotting of any property over a single telemetry WebSocket |
| Dashboard | Bus voltage/current, axis state, position/velocity, active errors |
| Command console | odrivetool-style read / write / call (`odrv0.` prefix optional) |
| Multi-axis | Switch between axis 0 and 1 |

All device communication runs over one WebSocket per device — telemetry plus
read/write/command — so the UI stays responsive and config edits never contend
with the live stream. Configuration data (property names, types, enums) is
generated from the official ODrive API reference, so it stays faithful to each
firmware line.

---

## Download & Install

No setup needed — download the standalone app for your OS, run it, and your
browser opens to the GUI. No Python or Node.js required.

1. Go to the [latest release](https://github.com/MoonLighTingPY/odrive3.6_web_gui/releases/latest).
2. Download the build for your OS:
   - Windows: `odrive-gui.exe`
   - Linux: `odrive-gui`
3. Run it. The app launches, opens your browser, and is ready. Connect your
   ODrive over USB and start configuring. Use the Quit Application button when done.

---

## For Developers

Everything below is only for building from source or contributing.

### Prerequisites

- Python 3.10+ with `pip`
- Node.js 18+ with `npm`

### Install

Run the install script once. It creates the backend virtual environment at
`backend/.venv` if missing, then installs Python and frontend dependencies:

```bash
git clone https://github.com/MoonLighTingPY/odrive3.6_web_gui.git
cd odrive3.6_web_gui

# Linux / macOS
./install.sh

# Windows
install.bat
```

### Run in development

From `frontend/`:

```bash
npm run dev        # backend + frontend, real hardware
npm run mock_dev   # backend + frontend, simulated device (no hardware)
```

The UI is served on `http://localhost:3000` and proxies the API and telemetry
WebSocket to the backend on `http://127.0.0.1:5000`.

### Build the standalone app

The build bundles the backend, the `odrive` library, and the built frontend into
a single executable. The venv is created automatically if needed.

```bash
# Linux / macOS
./build.sh

# Windows
build.bat
```

The executable is written to `backend/dist/odrive-gui` (`.exe` on Windows). It is
single-instance, stops when the page closes, and has a Quit Application button.

### Tests

```bash
cd frontend && npm test       # vitest unit + integration tests
cd frontend && npm run lint   # eslint
```

### Architecture

- Thin backend (Flask): generic, version-agnostic endpoints that read/write/
  invoke ODrive properties by dotted path, plus a telemetry WebSocket that also
  carries read/write/command. Device access is serialized per device; the
  backend stays free of ODrive domain knowledge.
- Data-driven frontend (React + Vite + Chakra UI): a single registry built from
  the API-reference JSON drives the property tree, the config form, validation,
  and command generation for both firmware lines.
- Regenerating the reference: `scripts/generate_api_reference.py` parses the
  official text reference into JSON; `scripts/check_api_reference.py` reports
  coverage gaps.

---

## Contributing

Contributions are welcome — bug fixes, features, or improvements:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push the branch and open a Pull Request

If you find this project helpful, please consider giving it a star on GitHub.
