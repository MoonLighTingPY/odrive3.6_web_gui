@echo off
setlocal enabledelayedexpansion

echo ============================================
echo ODrive v0.5.6 Web GUI Build Script (Optimized)
echo ============================================

REM Quick directory check
if not exist "frontend" (
    echo Error: Run from project root directory.
    pause & exit /b 1
)

echo Choose build option:
echo [1] Full build (clean + dependencies + build)
echo [2] Quick build (skip dependencies, reuse cache)
echo [3] Dependencies only
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="3" goto install_deps_only
if "%choice%"=="2" goto quick_build
if "%choice%"=="1" goto full_build
echo Invalid choice.
pause & exit /b 1

:full_build
echo [FULL BUILD] Starting...
call :stop_processes
call :build_frontend
call :install_backend_deps
goto build_executable

:quick_build
echo [QUICK BUILD] Skipping dependencies...
call :stop_processes
REM Skip frontend build if dist exists and is recent
if exist "frontend\dist" (
    echo ✓ Using existing frontend build
) else (
    echo Frontend build missing, building...
    call :build_frontend
)
goto build_executable

:install_deps_only
echo [DEPS ONLY] Installing dependencies...
call :install_backend_deps
echo Dependencies installed.
pause & exit /b 0

:stop_processes
echo Stopping existing processes...
taskkill /f /im ODrive_GUI_Tray.exe >nul 2>&1
exit /b 0

:build_frontend
echo Building frontend...
cd frontend
call npm ci --silent 2>nul || call npm install --silent
if !errorlevel! neq 0 (echo Frontend deps failed & pause & exit /b 1)
call npm run build --silent
if !errorlevel! neq 0 (echo Frontend build failed & pause & exit /b 1)
cd ..
exit /b 0

:install_backend_deps
echo Installing backend dependencies...
cd backend
python -m pip install --quiet --no-warn-script-location -r requirements.txt
if !errorlevel! neq 0 (echo Backend deps failed & pause & exit /b 1)
cd ..
exit /b 0

:build_executable
cd backend
echo Building executable...

REM Copy icon if needed
if exist "..\frontend\public\servo.ico" copy "..\frontend\public\servo.ico" "servo.ico" /Y >nul

REM Clean only if full build
if "%choice%"=="1" (
    if exist "dist" rmdir /s /q dist >nul 2>&1
    if exist "build" rmdir /s /q build >nul 2>&1
    echo ✓ Cleaned build cache
)

echo Running PyInstaller...
pyinstaller tray_app.spec --noconfirm %~1
if !errorlevel! neq 0 (
    echo Build failed!
    pause & exit /b 1
)

if not exist "dist\ODrive_GUI_Tray.exe" (
    echo Executable not created!
    pause & exit /b 1
)

cd ..
echo.
echo ============================================
echo BUILD COMPLETED SUCCESSFULLY!
echo ============================================
echo Executable: backend\dist\ODrive_GUI_Tray.exe
for %%A in ("backend\dist\ODrive_GUI_Tray.exe") do echo Size: %%~zA bytes
echo.
echo Quick start: backend\dist\ODrive_GUI_Tray.exe
pause