@echo off
echo ========================================
echo    Media Controller Start Script
echo ========================================
echo.

echo Starting Media Controller...
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

REM Build frontend
echo [INFO] Building frontend application...
cd /d %~dp0../frontend
npm run build
if %errorLevel% neq 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Frontend build completed
echo.

REM Start backend server (in new window)
echo [INFO] Starting backend server...
start "Media Controller Backend" cmd /k "cd /d %~dp0../backend && node app.js"

echo.
echo [INFO] Server started in new window, please visit http://localhost:3000
echo [INFO] Keep this window open to maintain the service
pause