# -*- mode: python ; coding: utf-8 -*-
import os
import sys

# Minimal ODrive path collection - only get essential files
def get_odrive_essentials():
    try:
        import odrive
        odrive_path = os.path.dirname(odrive.__file__)
        
        binaries = []
        datas = []
        
        # Only collect essential DLLs for Windows
        if sys.platform == 'win32':
            lib_path = os.path.join(odrive_path, 'lib')
            if os.path.exists(lib_path):
                for file in ['libusb-1.0.dll', 'odrive.dll']:  # Only essential DLLs
                    dll_path = os.path.join(lib_path, file)
                    if os.path.exists(dll_path):
                        binaries.append((dll_path, 'odrive/lib'))
        
        # Only essential config files
        for config_file in ['odrive_config.json']:
            config_path = os.path.join(odrive_path, config_file)
            if os.path.exists(config_path):
                datas.append((config_path, 'odrive'))
        
        return binaries, datas
    except ImportError:
        return [], []

odrive_binaries, odrive_datas = get_odrive_essentials()

# Icon file detection - simplified
icon_file = None
for icon_path in ['servo.ico', '../frontend/public/servo.ico']:
    if os.path.exists(icon_path):
        icon_file = os.path.abspath(icon_path)
        break

# Minimal hidden imports - only what's actually needed
minimal_hiddenimports = [
    'odrive',
    'flask',
    'flask_cors',
    'PIL',
    'pystray',
    'requests'
]

a = Analysis(
    ['tray_app.py'],
    pathex=[],
    binaries=odrive_binaries,
    datas=[
        ('../frontend/dist', 'static'),
    ] + odrive_datas + ([
        (icon_file, '.'),
    ] if icon_file else []),
    hiddenimports=minimal_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',  # Exclude heavy unused packages
        'numpy',
        'scipy',
        'tkinter',
        'PyQt5',
        'PyQt6'
    ],
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
    upx=False,  # Disable UPX for faster builds
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