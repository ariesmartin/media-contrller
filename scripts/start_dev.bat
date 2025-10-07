@echo off
echo ========================================
echo    Media Controller Development Start Script
echo ========================================
echo.

echo Starting Media Controller in development mode...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js first
    pause
    exit /b 1
)

echo [INFO] Checking and installing dependencies...
echo.

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd /d %~dp0../backend
npm install
if %errorLevel% neq 0 (
    echo [ERROR] Backend dependencies installation failed
    pause
    exit /b 1
)

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd /d %~dp0../frontend
npm install
if %errorLevel% neq 0 (
    echo [ERROR] Frontend dependencies installation failed
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Dependencies installation completed
echo.

REM Start backend development server (in new window)
echo [INFO] Starting backend development server...
start "Media Controller Backend Dev" cmd /k "cd /d %~dp0../backend && npm run dev"

REM Start frontend development server (in new window)
echo [INFO] Starting frontend development server...
start "Media Controller Frontend Dev" cmd /k "cd /d %~dp0../frontend && npm run dev"

echo.
echo [INFO] Development servers started in separate windows
pause