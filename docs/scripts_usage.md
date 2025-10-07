# Media Controller 脚本使用说明

## 脚本文件说明

Media Controller 提供了多个批处理脚本来方便启动和管理服务：

### 1. quick_start.bat
- **功能**：在当前命令行窗口启动后端服务
- **特点**：可以看到实时日志输出，按 Ctrl+C 停止服务
- **适用场景**：开发调试、查看服务日志

### 2. background_start.bat
- **功能**：在新的命令行窗口中启动后端服务，不阻塞当前窗口
- **特点**：服务在后台运行，当前窗口可继续使用
- **适用场景**：生产环境部署、长时间运行服务

### 3. stop_services.bat
- **功能**：停止所有相关服务，清理端口代理
- **特点**：安全停止所有 Node.js 进程，清理 WSL 端口代理规则

## 使用方法

### 开发模式
```bash
cd scripts
quick_start.bat
```
- 服务将在当前窗口运行
- 可以实时查看所有日志输出
- 按 Ctrl+C 停止服务

### 生产模式
```bash
cd scripts
background_start.bat
```
- 服务将在新窗口中运行
- 当前窗口可继续执行其他命令
- 访问 http://localhost:3000 使用管理面板

### 停止服务
```bash
cd scripts
stop_services.bat
```
- 安全停止所有服务
- 清理 WSL 端口代理规则
- 释放占用的端口

## 故障排除

### 服务无法启动
1. 检查 Node.js 是否已安装：`node --version`
2. 检查端口是否被占用（默认 3000, 5000, 8188）
3. 确认配置文件中的路径是否正确

### 端口代理问题
- 使用 `stop_services.bat` 清理残留的端口代理规则
- 检查 Windows 防火墙设置

### 中文字符显示问题
- 确保系统使用 UTF-8 编码
- 在命令行中运行 `chcp 65001` 设置代码页