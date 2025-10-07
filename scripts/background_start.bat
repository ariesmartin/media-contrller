@echo off
echo ========================================
echo    Media Controller Background Start Script
echo ========================================
echo.

echo Starting Media Controller (Background)...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js first
    pause
    exit /b 1
)

REM Start backend server in background window
echo [INFO] Starting backend server in background...
cd /d %~dp0../backend
start "Media Controller Backend" cmd /c "node app.js & echo. & echo [INFO] Server stopped. Press any key to close this window... & pause >nul"

echo.
echo [INFO] Server started in background window
echo [INFO] You can close this window, the server will continue running
pause