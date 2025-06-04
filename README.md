
# 🚀 ODrive v0.5.6 Web GUI

A modern, web-based desktop application for configuring, monitoring, and controlling ODrive motor controllers running firmware v0.5.6 (aka v3.6-56V).

[![Releases](https://img.shields.io/github/v/release/MoonLighTingPY/odrive3.6_web_gui?logo=github)](https://github.com/MoonLighTingPY/odrive3.6_web_gui/releases)

## 🎯 Key Capabilities

- Full **Configuration Wizard** (power, motor, encoder, control & interfaces)
- **Real-Time Dashboard** with power, thermal & encoder telemetry
- **Inspector**: live console + JSON state viewer + command сonsole history
- **Device Management**: scan, connect/disconnect, multi-device support
- **System Tray App** (Windows) with auto-browser launch
- **Cross-Platform Backend**: Flask + ODrive Python lib v0.6.10.post0

## 📥 Download (Windows)

Grab the latest standalone `.exe` from my [Releases page](https://github.com/MoonLighTingPY/odrive3.6_web_gui/releases).  
No Python or Node.js required—just unzip and run.

## 🛠️ Build from Source

### Windows 📦

1. Clone repo and install backend dependencies:
   ```bash
   git clone https://github.com/MoonLighTingPY/odrive3.6_web_gui.git
   cd odrive3.6_web_gui/backend
   python -m pip install -r requirements.txt

   ```
2. Build frontend:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

2. Build Package with PyInstaller:
   ```bash
   cd ../backend
   pyinstaller tray_app.spec --clean --noconfirm
   ```
3. Run `dist/tray_app.exe`.

### Linux / macOS 🐧🍎

> _Note: prebuilt GUI is Windows-only. On Linux/macOS you can run the dev servers._

1. **Backend**:
   ```bash
   cd odrive3.6_web_gui/backend
   pip install -r requirements.txt
   python start_backend.py
   ```
2. **Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
3. Open your browser to `http://localhost:3000`.

## ⚙️ Features at a Glance

| Tab            | Highlights                                  |
| -------------- | ------------------------------------------- |
| Configuration  | 6-step wizard, live command preview, calibrate & save |
| Dashboard      | Live plots, thermal & power gauges, encoder feedback |
| Inspector      | ASCII console, auto-complete, JSON viewer, history |
| Device List    | Scan USB, multi-ODrive, connect/disconnect  |
| Tray Icon      | Browser auto-open, quick exit, status badges|

## 🎓 ODrive V0.5.6 (aka V3.6-56V) documentation

- Offline docs in `odrive_docs_local/`  
- Online docs link: https://docs.odriverobotics.com/v/0.5.6/getting-started.html

