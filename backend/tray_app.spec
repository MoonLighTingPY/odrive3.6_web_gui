# -*- mode: python ; coding: utf-8 -*-
import os
import sys
from PyInstaller.utils.hooks import collect_all, collect_submodules

# Optimize imports by excluding unnecessary modules
excludes = [
    'matplotlib',
    'numpy.random._examples',
    'tornado',
    'IPython',
    'jupyter',
    'notebook',
    # 'tkinter',  # Remove tkinter from excludes since we need it for message dialogs
    'PyQt5',
    'PyQt6',
    'PySide2',
    'PySide6',
    'cv2',
    'scipy',
    'pandas',
    'sympy'
]

# Collect necessary modules with optimizations
pystray_datas, pystray_binaries, pystray_hiddenimports = collect_all('pystray')
pil_datas, pil_binaries, pil_hiddenimports = collect_all('PIL')
flask_datas, flask_binaries, flask_hiddenimports = collect_all('flask')
odrive_submodules = collect_submodules('odrive')

# ODrive library binaries and data collection (optimized)
def get_odrive_paths():
    try:
        import odrive
        odrive_path = os.path.dirname(odrive.__file__)
        
        binaries = []
        datas = []
        
        # Add only essential ODrive DLLs for Windows
        if sys.platform == 'win32':
            lib_path = os.path.join(odrive_path, 'lib')
            if os.path.exists(lib_path):
                for file in os.listdir(lib_path):
                    if file.endswith('.dll'):
                        source_path = os.path.join(lib_path, file)
                        binaries.append((source_path, 'odrive/lib'))
        
        # Add only essential data files
        essential_files = ['version']
        for root, dirs, files in os.walk(odrive_path):
            for file in files:
                if any(essential in file for essential in essential_files) or file.endswith('.json'):
                    file_path = os.path.join(root, file)
                    arc_path = os.path.relpath(file_path, os.path.dirname(odrive_path))
                    datas.append((file_path, os.path.dirname(arc_path)))
        
        return binaries, datas
    except ImportError:
        return [], []

odrive_binaries, odrive_datas = get_odrive_paths()

# Icon file path
icon_file = None
possible_icons = [
    'servo.ico',
    '../frontend/public/servo.ico'
]

for icon_path in possible_icons:
    full_path = os.path.abspath(icon_path)
    if os.path.exists(full_path):
        icon_file = full_path
        break

# Combine all binaries and datas
all_binaries = odrive_binaries + pystray_binaries + pil_binaries + flask_binaries
all_datas = [
    ('../frontend/dist', 'static'),
    ('app', 'app'),  # Include the entire app folder
] + odrive_datas + pystray_datas + pil_datas + flask_datas + ([
    (icon_file, '.'),
] if icon_file else [])

# Essential hidden imports only - updated for app folder structure
all_hiddenimports = [
    'odrive',
    'odrive.utils',
    'flask',
    'flask_cors',
    'app.app',  # Updated import path
    'app.odrive_manager',  # Add app module imports
    'app.odrive_telemetry_config',
    'app.utils.utils',
    'app.utils.calibration_utils',
    'app.routes.device_routes',
    'app.routes.config_routes',
    'app.routes.calibration_routes',
    'app.routes.telemetry_routes',
    'app.routes.system_routes',
    'threading',
    'webbrowser',
    'json',
    'time',
    'logging',
    'requests',
    'tkinter',  # Add tkinter for message dialogs
    'tkinter.messagebox'  # Add tkinter.messagebox specifically
] + pystray_hiddenimports + pil_hiddenimports + flask_hiddenimports

a = Analysis(
    ['tray_app.py'],
    pathex=[],
    binaries=all_binaries,
    datas=all_datas,
    hiddenimports=all_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,  # Add excludes for better performance
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='ODrive_GUI_Tray',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    windowed=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=icon_file,
)