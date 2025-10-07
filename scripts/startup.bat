@echo off
REM Media Controller 开机启动脚本
REM 将此脚本复制到 Windows 启动文件夹以实现开机自动启动
REM 启动文件夹路径: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo 启动 Media Controller 服务...

REM 设置延迟启动，避免系统启动时资源竞争
timeout /t 3 /nobreak

REM 设置项目根目录
set "PROJECT_ROOT=F:\media-contrller"
cd /d "%PROJECT_ROOT%"

REM 检查Node.js是否可用
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请确保已安装Node.js并添加到PATH环境变量
    pause
    exit /b 1
)

REM 检查后端目录
if not exist "%PROJECT_ROOT%\backend" (
    echo 错误: 后端目录不存在
    exit /b 1
)

REM 安装依赖（如果需要）
cd "%PROJECT_ROOT%\backend"
if not exist "node_modules" (
    echo 正在安装后端依赖...
    npm install
)

REM 启动后端服务 - 确保使用正确的端口配置
cd "%PROJECT_ROOT%\backend"
echo 启动 Media Controller 后端服务...
start "Media Controller" cmd /c "node app.js"

REM 等待服务启动
timeout /t 10 /nobreak

REM 退出脚本
exit