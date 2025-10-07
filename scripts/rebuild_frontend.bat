@echo off
REM Media Controller 前端构建脚本
REM 重新构建前端应用以应用配置更改

echo 正在构建前端应用...

REM 设置项目根目录
set "PROJECT_ROOT=F:\media-contrller"
cd /d "%PROJECT_ROOT%\frontend"

REM 检查Node.js是否可用
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js
    pause
    exit /b 1
)

REM 检查npm是否可用
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到npm
    pause
    exit /b 1
)

REM 安装依赖
echo 安装前端依赖...
npm install

REM 清理旧的构建文件
if exist "build" (
    echo 清理旧的构建文件...
    rmdir /s /q "build"
)

REM 构建前端
echo 正在构建前端应用...
npm run build

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo    前端构建成功！
    echo.
    echo    前端已更新，API端点现在指向 http://localhost:8003
    echo ================================================
) else (
    echo.
    echo 错误: 前端构建失败
    pause
    exit /b 1
)

pause