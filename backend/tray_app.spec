# -*- mode: python ; coding: utf-8 -*-
import os
import sys
from PyInstaller.utils.hooks import collect_all, collect_submodules

# Collect all necessary modules
pystray_datas, pystray_binaries, pystray_hiddenimports = collect_all('pystray')
pil_datas, pil_binaries, pil_hiddenimports = collect_all('PIL')
flask_datas, flask_binaries, flask_hiddenimports = collect_all('flask')
odrive_submodules = collect_submodules('odrive')

# ODrive library binaries and data collection
def get_odrive_paths():
    try:
        import odrive
        odrive_path = os.path.dirname(odrive.__file__)
        
        binaries = []
        datas = []
        
        # Add ODrive DLLs for Windows - CRITICAL FIX
        if sys.platform == 'win32':
            # Look for the lib directory in odrive package
            lib_path = os.path.join(odrive_path, 'lib')
            if os.path.exists(lib_path):
                for file in os.listdir(lib_path):
                    if file.endswith('.dll'):
                        source_path = os.path.join(lib_path, file)
                        binaries.append((source_path, 'odrive/lib'))
                        print(f"Adding ODrive DLL: {source_path} -> odrive/lib")
            
            # Also check pyodrive directory
            dll_path = os.path.join(odrive_path, 'pyodrive')
            if os.path.exists(dll_path):
                for file in os.listdir(dll_path):
                    if file.endswith('.dll'):
                        binaries.append((os.path.join(dll_path, file), 'odrive/pyodrive'))
        
        # Add ODrive data files
        for root, dirs, files in os.walk(odrive_path):
            for file in files:
                if file.endswith(('.json', '.yaml', '.yml')):
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
    'servo.png',
    '../frontend/public/servo.ico',
    '../frontend/public/servo.png'
]

for icon_path in possible_icons:
    full_path = os.path.abspath(icon_path)
    if os.path.exists(full_path):
        icon_file = full_path
        break

if not icon_file:
    print("Warning: No icon file found")

# Combine all binaries and datas
all_binaries = odrive_binaries + pystray_binaries + pil_binaries + flask_binaries
all_datas = [
    ('../frontend/dist', 'static'),
] + odrive_datas + pystray_datas + pil_datas + flask_datas + ([
    (icon_file, '.'),
] if icon_file else [])

# Combine all hidden imports
all_hiddenimports = [
    'odrive',
    'odrive.utils',
    'odrive.enums',
    'flask',
    'flask_cors',
    'app',
    'start_backend',
    'threading',
    'webbrowser',
    'json',
    'time',
    'logging',
    'collections',
    'os',
    'sys',
    'requests',  # Add requests for backend testing
] + pystray_hiddenimports + pil_hiddenimports + flask_hiddenimports + odrive_submodules

a = Analysis(
    ['tray_app.py'],
    pathex=[],
    binaries=all_binaries,
    datas=all_datas,
    hiddenimports=all_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
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
    console=False,  # Back to False for production
    windowed=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=icon_file,
)