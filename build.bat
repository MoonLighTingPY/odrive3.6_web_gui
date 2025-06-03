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
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies!
    cd ..
    pause
    exit /b 1
)

echo.
echo [5/6] Installing PyInstaller...
echo Checking if PyInstaller is installed...
pip show pyinstaller >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PyInstaller is already installed
) else (
    echo Installing PyInstaller...
    pip install pyinstaller
    if %errorlevel% neq 0 (
        echo Error: Failed to install PyInstaller!
        cd ..
        pause
        exit /b 1
    )
)

echo.
echo [6/6] Building executable with PyInstaller...
echo Checking for servo.ico...
if not exist "servo.ico" (
    echo Warning: servo.ico not found in backend directory!
    echo Looking for icon in frontend...
    if exist "..\frontend\public\servo.ico" (
        copy "..\frontend\public\servo.ico" "servo.ico"
        echo ✓ Copied servo.ico from frontend
    ) else (
        echo Warning: No servo.ico found, executable will use default icon
    )
) else (
    echo ✓ Found servo.ico file (size: 
    dir servo.ico | findstr /C:"servo.ico"
    echo )
)

if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build

echo Running PyInstaller...
pyinstaller app.spec --clean --noconfirm
set PYINSTALLER_EXIT_CODE=%errorlevel%

echo PyInstaller exit code: %PYINSTALLER_EXIT_CODE%

if %PYINSTALLER_EXIT_CODE% neq 0 (
    echo Error: PyInstaller build failed with exit code %PYINSTALLER_EXIT_CODE%!
    echo.
    echo Troubleshooting steps:
    echo 1. Make sure PyInstaller is installed: pip install pyinstaller
    echo 2. Check that app.spec file exists in backend directory
    echo 3. Verify all dependencies are installed
    echo 4. Check for any error messages above
    cd ..
    pause
    exit /b 1
)

REM Check if the executable was actually created
if not exist "dist\odrive_v36_gui.exe" (
    echo Error: Executable was not created!
    echo Expected location: backend\dist\odrive_v36_gui.exe
    echo.
    echo Please check the PyInstaller output above for errors.
    cd ..
    pause
    exit /b 1
)

echo ✓ Executable created successfully

REM Go back to project root
cd ..

echo.
echo ============================================
echo BUILD COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo Executable location: backend\dist\odrive_v36_gui.exe
echo File size: 
dir "backend\dist\odrive_v36_gui.exe" | findstr "odrive_v36_gui.exe"
echo.
echo You can now run the GUI by executing:
echo backend\dist\odrive_v36_gui.exe
echo.
echo The GUI will automatically open in your browser when started.
echo ============================================

pause