@echo off
echo ========================================
echo    Media Controller Quick Start Script
echo ========================================
echo.

echo Starting Media Controller (Quick Start)...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js first
    pause
    exit /b 1
)

REM Start backend server in current window to show logs
echo [INFO] Starting backend server...
echo [INFO] Press Ctrl+C to stop the server
echo.

cd /d %~dp0../backend
node app.js

echo.
echo [INFO] Server stopped
pause