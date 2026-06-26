@echo off
REM Install all dependencies for the ODrive Web GUI (Windows).
REM Creates backend\.venv if missing, installs backend + build requirements,
REM and installs frontend npm packages. Safe to re-run.
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%frontend"
set "BACKEND=%ROOT%backend"

echo ==^> Ensuring Python venv at backend\.venv
cd /d "%BACKEND%" || exit /b 1
if not exist ".venv\Scripts\python.exe" (
  python -m venv .venv || exit /b 1
)
set "VENV_PY=.venv\Scripts\python.exe"
"%VENV_PY%" -m pip install --upgrade pip || exit /b 1
"%VENV_PY%" -m pip install -r requirements-build.txt || exit /b 1

echo ==^> Installing frontend dependencies
cd /d "%FRONTEND%" || exit /b 1
call npm ci || call npm install || exit /b 1

echo ==^> Done. Run build.bat to build the standalone app, or 'npm run dev' (in frontend\) for development.
endlocal
