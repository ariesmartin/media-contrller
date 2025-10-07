@REM Set environment variable to indicate HuggingFace Hub to download models to "project directory\HuggingFaceHub" instead of "user\.cache" directory
set HF_HUB_CACHE=%~dp0\HuggingFaceHub

echo ====================================
echo     ComfyUI Startup Script
echo ====================================
echo.

REM Check if ComfyUI installation path exists
if not exist "F:\ComfyUI\ComfyUI\main.py" (
    echo [ERROR] ComfyUI installation path does not exist!
    echo.
    echo Please ensure the following files exist:
    echo   - F:\ComfyUI\ComfyUI\main.py
    echo   - F:\ComfyUI\python_dapao311\python.exe
    echo.
    echo This is the independent ComfyUI installation path, not a ComfyUI folder in the current directory
    echo.
    pause
    exit /b 1
)

REM Check if ComfyUI independent Python environment exists
if not exist "F:\ComfyUI\python_dapao311\python.exe" (
    echo [ERROR] ComfyUI independent Python environment does not exist!
    echo.
    echo Please ensure ComfyUI's independent Python environment is installed:
    echo   - F:\ComfyUI\python_dapao311\python.exe
    echo.
    pause
    exit /b 1
)

echo [INFO] Using ComfyUI independent Python environment...
echo [INFO] ComfyUI Python version:
F:\ComfyUI\python_dapao311\python.exe --version
echo.

REM Run ComfyUI
echo [STARTING] Starting ComfyUI, listening on all addresses...
echo [INFO] Access address: http://localhost:8188
echo [INFO] LAN access: http://[YOUR_IP]:8188
echo.

REM Set console code page to UTF-8 before running ComfyUI to handle Chinese characters properly
chcp 65001 >nul
cd /d F:\ComfyUI\ComfyUI
F:\ComfyUI\python_dapao311\python.exe -s main.py --auto-launch --listen 0.0.0.0

REM Pause script to view output
pause