# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for the ODrive Web GUI standalone app.

Bundles the Flask backend, the odrive library, and the built frontend into a
single executable that serves the whole app and opens a browser.

Build (from the repo root, after `npm run build` in frontend/):
    cd backend
    pyinstaller odrive_gui.spec --noconfirm

Output: backend/dist/odrive-gui (Linux) / odrive-gui.exe (Windows).
"""

import os
import sys
from PyInstaller.utils.hooks import collect_all, collect_submodules

block_cipher = None

# Repo root relative to this spec (backend/odrive_gui.spec -> repo/).
REPO_ROOT = os.path.abspath(os.path.join(os.getcwd(), os.pardir))
FRONTEND_DIST = os.path.join(REPO_ROOT, "frontend", "dist")

if not os.path.isdir(FRONTEND_DIST):
    raise SystemExit(
        "frontend/dist not found. Run 'npm run build' in frontend/ before packaging."
    )

datas = [
    # Serve the built UI; app.paths looks for it under _MEIPASS/frontend_dist.
    (FRONTEND_DIST, "frontend_dist"),
    # API-reference JSON the backend reads at runtime.
    (
        os.path.join(REPO_ROOT, "frontend", "src", "utils", "odriveApiReference05x.json"),
        os.path.join("frontend", "src", "utils"),
    ),
    (
        os.path.join(REPO_ROOT, "frontend", "src", "utils", "odriveApiReference06x.json"),
        os.path.join("frontend", "src", "utils"),
    ),
]
binaries = []
hiddenimports = collect_submodules("odrive") + [
    "simple_websocket",
    "wsproto",
]

# odrive ships native libraries/data needed at runtime.
for pkg in ("odrive", "fibre"):
    try:
        d, b, h = collect_all(pkg)
        datas += d
        binaries += b
        hiddenimports += h
    except Exception:
        pass

excludes = [
    "matplotlib", "scipy", "pandas", "sympy", "IPython", "jupyter", "notebook",
    "tkinter", "PyQt5", "PyQt6", "PySide2", "PySide6", "cv2",
]

a = Analysis(
    ["run_standalone.py"],
    pathex=[os.getcwd()],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    runtime_hooks=[],
    excludes=excludes,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

icon = os.path.join(REPO_ROOT, "backend", "servo.ico")

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="odrive-gui",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    icon=icon if os.path.exists(icon) else None,
)
