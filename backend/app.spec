# -*- mode: python ; coding: utf-8 -*-
import os
import sys
from PyInstaller.utils.hooks import collect_data_files, collect_dynamic_libs

# Collect ODrive data files and dynamic libraries
odrive_datas = collect_data_files('odrive')
odrive_binaries = collect_dynamic_libs('odrive')

# Get the path to the odrive package
import odrive
odrive_path = os.path.dirname(odrive.__file__)

# Add ODrive lib directory containing the DLL
odrive_lib_path = os.path.join(odrive_path, 'lib')
if os.path.exists(odrive_lib_path):
    # Add all files from the lib directory
    for file in os.listdir(odrive_lib_path):
        if file.endswith('.dll') or file.endswith('.so') or file.endswith('.dylib'):
            odrive_binaries.append((os.path.join(odrive_lib_path, file), 'odrive/lib'))

block_cipher = None

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=odrive_binaries,
    datas=[
        ('../frontend/dist', 'static'),
    ] + odrive_datas,
    hiddenimports=[
        'odrive',
        'odrive.utils',
        'odrive.enums',
        'usb.backend.libusb1',
        'usb.backend.openusb',
        'usb.backend.libusb0',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='odrive_v36_gui',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)