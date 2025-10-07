@echo off
echo ========================================
echo    Media Controller Stop Script
echo ========================================
echo.

echo Stopping Media Controller services...
echo.

REM Kill all Node.js processes
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] Found running Node.js processes, stopping them...
    taskkill /F /IM node.exe
    echo [INFO] Node.js processes stopped.
) else (
    echo [INFO] No running Node.js processes found.
)

REM Kill any WSL port proxy that might be running
echo [INFO] Cleaning up WSL port proxy rules...
netsh interface portproxy show v4tov4 >nul 2>&1
if %errorLevel% equ 0 (
    REM Remove common Media Controller port proxies
    netsh interface portproxy delete v4tov4 listenport=5000 listenaddress=0.0.0.0 >nul 2>&1
    netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0 >nul 2>&1
    echo [INFO] WSL port proxy rules cleaned up.
) else (
    echo [INFO] netsh command not available or no port proxy rules exist.
)

echo.
echo [INFO] All services stopped.
pause