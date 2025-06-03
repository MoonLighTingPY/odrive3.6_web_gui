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
echo [1/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies!
    cd ..
    pause
    exit /b 1
)

echo.
echo [2/4] Building frontend production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Frontend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies!
    cd ..
    pause
    exit /b 1
)

echo.
echo [4/4] Building executable with PyInstaller...
pyinstaller app.spec --clean
if %errorlevel% neq 0 (
    echo Error: PyInstaller build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================
echo Build completed successfully!
echo ============================================
echo.
echo Executable location: backend\dist\app.exe
echo.
echo You can now run the ODrive GUI by executing:
echo   backend\dist\app.exe
echo.
pause