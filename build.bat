@echo off
echo ============================================
echo ODrive v0.5.6 Web GUI Build Script
echo ============================================

REM Check if we're in the correct directory
if not exist "frontend" (
    echo Error: frontend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

if not exist "backend" (
    echo Error: backend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo.
echo [1/6] Stopping any running ODrive GUI processes...
taskkill /f /im app.exe >nul 2>&1
taskkill /f /im odrive_v36_gui.exe >nul 2>&1
taskkill /f /im ODrive_GUI_Tray.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Stopped existing processes
) else (
    echo ✓ No existing processes found
)

echo.
echo [2/6] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies!
    cd ..
    pause
    exit /b 1
)

echo.
echo [3/6] Building frontend production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build frontend!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo [4/6] Installing backend dependencies...
cd backend
echo Installing/updating backend dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies!
    cd ..
    pause
    exit /b 1
)

echo.
echo Installing tray app dependencies...
python -m pip install pystray Pillow
if %errorlevel% neq 0 (
    echo Error: Failed to install tray dependencies!
    cd ..
    pause
    exit /b 1
)

echo.
echo [5/6] Installing PyInstaller...
echo Checking if PyInstaller is installed...
python -m pip show pyinstaller >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PyInstaller is already installed
) else (
    echo Installing PyInstaller...
    python -m pip install pyinstaller
    if %errorlevel% neq 0 (
        echo Error: Failed to install PyInstaller!
        cd ..
        pause
        exit /b 1
    )
)

echo.
echo [6/6] Building ODrive GUI Tray Application...
echo Preparing servo.ico for tray app...

REM Always ensure servo.ico is available for tray app
if exist "..\frontend\public\servo.ico" (
    copy "..\frontend\public\servo.ico" "servo.ico" /Y >nul 2>&1
    echo ✓ Copied servo.ico to backend directory
) else (
    echo ⚠️ Warning: servo.ico not found in frontend\public\
)

REM Verify the icon exists
if exist "servo.ico" (
    echo ✓ servo.ico ready for tray app
    for %%A in (servo.ico) do echo    Size: %%~zA bytes
) else (
    echo ⚠️ Warning: No servo.ico found, tray will use fallback icon
)

if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build

echo.
echo Building System Tray Application...
echo Running PyInstaller with tray_app.spec...
pyinstaller tray_app.spec --clean --noconfirm
set PYINSTALLER_EXIT_CODE=%errorlevel%

echo PyInstaller exit code: %PYINSTALLER_EXIT_CODE%

if %PYINSTALLER_EXIT_CODE% neq 0 (
    echo Error: PyInstaller build failed with exit code %PYINSTALLER_EXIT_CODE%!
    echo.
    echo Troubleshooting steps:
    echo 1. Make sure PyInstaller is installed: pip install pyinstaller
    echo 2. Check that tray_app.spec file exists in backend directory
    echo 3. Verify all dependencies are installed: pystray, Pillow
    echo 4. Check for any error messages above
    cd ..
    pause
    exit /b 1
)

REM Check if the tray executable was actually created
if not exist "dist\ODrive_GUI_Tray.exe" (
    echo Error: Tray executable was not created!
    echo Expected location: backend\dist\ODrive_GUI_Tray.exe
    echo.
    echo Please check the PyInstaller output above for errors.
    cd ..
    pause
    exit /b 1
)

echo ✓ Tray executable created successfully

REM Go back to project root
cd ..

echo.
echo ============================================
echo BUILD COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo 🎉 ODrive GUI Tray Application Built Successfully!
echo.
echo Executable location: backend\dist\ODrive_GUI_Tray.exe
echo File size: 
for %%A in ("backend\dist\ODrive_GUI_Tray.exe") do echo    %%~zA bytes
echo.
echo 🚀 How to use:
echo   1. Run: backend\dist\ODrive_GUI_Tray.exe
echo   2. Look for the ODrive icon in your system tray
echo   3. Left click the tray icon to open the GUI
echo   4. Right click for menu options (Open GUI / Exit)
echo.
echo ✨ Features:
echo   • No console window - clean professional appearance
echo   • System tray icon with your servo.ico
echo   • Auto-opens GUI in browser on startup
echo   • Right-click menu for easy access
echo   • Clean shutdown and resource management
echo.
echo The GUI will automatically open in your browser when started.
echo ============================================

pause