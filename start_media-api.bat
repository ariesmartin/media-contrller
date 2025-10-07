@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Set colors
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo %GREEN%========================================%NC%
echo %GREEN%Media API One-Click Startup Script%NC%
echo %GREEN%========================================%NC%
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo %YELLOW%[WARNING]%NC% Non-administrator mode detected
    echo %YELLOW%[WARNING]%NC% Cannot configure WSL port forwarding, local access only
    echo %BLUE%[TIP]%NC% For LAN access, right-click and "Run as administrator"
    set "ADMIN_MODE=false"
    echo.
) else (
    echo %GREEN%[SUCCESS]%NC% Administrator privileges verified
    set "ADMIN_MODE=true"
    echo.
)

echo %BLUE%[INFO]%NC% Starting Media API Server...
echo %BLUE%[INFO]%NC% Project path: /home/martin/media_api_project
echo.

REM Check WSL availability
echo %BLUE%[CHECK]%NC% WSL environment...
wsl --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% WSL not installed or unavailable
    echo Please install WSL: wsl --install
    pause
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% WSL available

REM Check Ubuntu distribution
echo %BLUE%[CHECK]%NC% Ubuntu distribution...
wsl -d Ubuntu -e echo "WSL Ubuntu is available" >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Ubuntu distribution not found
    echo Please install Ubuntu: wsl --install -d Ubuntu
    pause
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% Ubuntu distribution available

REM Check project directory
echo %BLUE%[CHECK]%NC% Project directory...
wsl -d Ubuntu -e test -d /home/martin/media_api_project
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Project directory not found: /home/martin/media_api_project
    echo Please ensure project exists in WSL Ubuntu
    pause
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% Project directory exists

REM Parse command line arguments
set "ARGS="
:parse_args
if "%~1"=="" goto setup_network
set "ARGS=%ARGS% %1"
shift
goto parse_args

:setup_network
echo.
echo %BLUE%[NETWORK]%NC% Configuring WSL network...

REM Get WSL2 IP address
echo %BLUE%[CHECK]%NC% Getting WSL2 IP address...
for /f "tokens=*" %%i in ('wsl -d Ubuntu hostname -I 2^>nul') do set "WSL_IP=%%i"
set "WSL_IP=%WSL_IP: =%"
if "%WSL_IP%"=="" (
    echo %RED%[ERROR]%NC% Cannot get WSL2 IP address
    echo Please check if WSL2 is running properly
    pause
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% WSL2 IP address: %WSL_IP%

REM Check if Media API service is running
echo %BLUE%[CHECK]%NC% Media API service status...
wsl -d Ubuntu -e bash -c "netstat -tlnp 2>/dev/null | grep ':5000 ' | grep LISTEN" >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%[INFO]%NC% Media API service not running, will start service
) else (
    echo %GREEN%[SUCCESS]%NC% Media API service is running
)

REM Configure port forwarding (admin mode only)
if "%ADMIN_MODE%"=="true" (
    echo %BLUE%[CONFIG]%NC% Setting up port forwarding rules...
    
    REM Delete existing port forwarding rules
    netsh interface portproxy delete v4tov4 listenport=5000 >nul 2>&1
    
    REM Add new port forwarding rule
    netsh interface portproxy add v4tov4 listenport=5000 listenaddress=0.0.0.0 connectport=5000 connectaddress=%WSL_IP% >nul 2>&1
    if errorlevel 1 (
        echo %RED%[ERROR]%NC% Port forwarding configuration failed
    ) else (
        echo %GREEN%[SUCCESS]%NC% Port forwarding configured (0.0.0.0:5000 -> %WSL_IP%:5000)
    )
    
    REM Configure firewall rules
    echo %BLUE%[CONFIG]%NC% Setting up firewall rules...
    netsh advfirewall firewall delete rule name="WSL Media API" >nul 2>&1
    netsh advfirewall firewall add rule name="WSL Media API" dir=in action=allow protocol=TCP localport=5000 >nul 2>&1
    if errorlevel 1 (
        echo %YELLOW%[WARNING]%NC% Firewall rule configuration failed, may affect LAN access
    ) else (
        echo %GREEN%[SUCCESS]%NC% Firewall rule configured
    )
)

:run_server
echo.
echo %BLUE%[STARTUP]%NC% Executing in WSL Ubuntu environment...

REM Set default arguments if none provided
if "%ARGS%"=="" set "ARGS= --debug --host 0.0.0.0 --port 5000"

echo %BLUE%[COMMAND]%NC% cd /home/martin/media_api_project ^&^& source venv/bin/activate ^&^& source cudnn_env_complete.sh ^&^& python3 start_server.py%ARGS%
echo.

REM Execute startup command in WSL with cleanup handling
echo %YELLOW%[INFO]%NC% Starting server with automatic cleanup on exit...
wsl -d Ubuntu -e bash -c "cd /home/martin/media_api_project && source venv/bin/activate && if [ -f cudnn_env_complete.sh ]; then source cudnn_env_complete.sh; fi && python3 start_server.py%ARGS%; echo 'Server stopped'"

REM Server has stopped, perform cleanup
call :cleanup

if errorlevel 1 (
    echo.
    echo %RED%[ERROR]%NC% Server startup failed
    echo %YELLOW%Please check the following:%NC%
    echo   1. Virtual environment exists: /home/martin/media_api_project/venv
    echo   2. Dependencies installed: pip install -r requirements.txt
    echo   3. Redis is running: sudo service redis-server start
    echo   4. Port 5000 is not occupied
    call :cleanup
    pause
    exit /b 1
)

REM Display access information
echo.
echo %GREEN%========================================%NC%
echo %GREEN%Service started successfully!%NC%
echo %GREEN%========================================%NC%
echo.
echo %BLUE%Access URLs:%NC%
echo   Local access: http://localhost:5000
echo   WSL internal: http://%WSL_IP%:5000

if "%ADMIN_MODE%"=="true" (
    REM Get Windows host IP
    for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4"') do (
        set "HOST_IP=%%i"
        set "HOST_IP=!HOST_IP: =!"
        if not "!HOST_IP!"=="" (
            echo   LAN access: http://!HOST_IP!:5000
            goto :show_tips
        )
    )
)

:show_tips
echo.
echo %YELLOW%Tips:%NC%
if "%ADMIN_MODE%"=="false" (
    echo   - Currently in non-admin mode, local access only
    echo   - For LAN access, run this script as administrator
) else (
    echo   - LAN devices can access API service via above URLs
    echo   - If unable to access, check firewall and network settings
)
echo   - Press Ctrl+C to stop service
echo %GREEN%========================================%NC%
echo.
echo %YELLOW%[INFO]%NC% Server will run until you press Ctrl+C or close this window
echo %YELLOW%[INFO]%NC% Cleanup will be performed automatically when server stops
echo.
goto :eof

REM Cleanup function
:cleanup
echo.
echo %YELLOW%[CLEANUP]%NC% Cleaning up resources...
if "%ADMIN_MODE%"=="true" (
    echo %BLUE%[CLEANUP]%NC% Removing port forwarding rules...
    netsh interface portproxy delete v4tov4 listenport=5000 >nul 2>&1
    echo %BLUE%[CLEANUP]%NC% Removing firewall rules...
    netsh advfirewall firewall delete rule name="WSL Media API" >nul 2>&1
    echo %GREEN%[SUCCESS]%NC% Network configuration cleaned up
)
echo %GREEN%[SUCCESS]%NC% Cleanup completed
echo %BLUE%[INFO]%NC% You can now safely close this window
pause
exit /b 0
