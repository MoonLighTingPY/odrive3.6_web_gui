@echo off
REM Build the ODrive Web GUI standalone executable (Windows).
REM Produces backend\dist\odrive-gui.exe
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%frontend"
set "BACKEND=%ROOT%backend"

echo ==^> Building frontend
cd /d "%FRONTEND%" || exit /b 1
call npm ci || call npm install || exit /b 1
call npm run build || exit /b 1

echo ==^> Packaging backend with PyInstaller
cd /d "%BACKEND%" || exit /b 1
if not exist ".venv\Scripts\python.exe" (
  echo ==^> Creating Python venv at backend\.venv
  python -m venv .venv || exit /b 1
)
set "PY=.venv\Scripts\python.exe"
"%PY%" -m pip install --upgrade pip || exit /b 1
"%PY%" -m pip install -r requirements-build.txt || exit /b 1
"%PY%" -m PyInstaller odrive_gui.spec --noconfirm || exit /b 1

echo ==^> Done. Executable at: %BACKEND%\dist\odrive-gui.exe
endlocal
