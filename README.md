# Media Controller

Media Controller 是一个用于管理 ComfyUI 和运行在 WSL 中的 Media-API 服务的 Web 管理面板。该项目具有前后端分离架构，使用 Node.js/Express 作为后端，React 作为前端，并集成了 WebSocket 实现实时日志和状态更新功能。

## 项目概述

**重要说明**：
- ComfyUI 在其自己的独立文件夹中运行，使用自己的 Python 环境 (如 F:\ComfyUI\python_dapao311\python.exe)
- Media-API 运行在 WSL 环境中
- 所有服务都需要监听所有地址 (0.0.0.0) 以支持局域网访问
- 不会破坏 ComfyUI 的独立运行环境

主要功能包括：
- 启动/停止 ComfyUI 服务
- 启动/停止运行在 WSL 中的 Media-API 服务
- 实时获取和显示两个服务的日志
- 通过 API 进行状态查询和启停控制
- 自动处理 WSL 端口代理及清理
- 支持中文字符正确显示
- 局域网访问支持
- 美化的暗色调简约科技风格界面

## 项目当前状态

目前项目中包含以下文件：
- `comfyui-start.bat` - ComfyUI 启动脚本
- `start_media-api.bat` - Media-API 启动脚本
- `goujian.txt` - 项目需求说明
- `README.md` - 项目说明文档（当前文件）

本项目需要完成一个完整的管理面板，包含前后端。以下为完整的项目构建计划。

## 项目结构

```
F:\media-contrller/
├── backend/                 # 后端 Node.js 服务器
│   ├── app.js              # 主应用入口
│   ├── process-manager.js  # 进程管理器
│   ├── wsl-manager.js      # WSL 管理器
│   ├── port-proxy-manager.js # 端口代理管理器
│   ├── api/                # API 路由
│   │   ├── services.js     # 服务控制路由
│   │   ├── logs.js         # 日志路由
│   │   ├── wsl.js          # WSL 相关路由
│   │   └── port-proxy.js   # 端口代理路由
│   ├── package.json        # 后端依赖
│   └── config/             # 配置文件
│       └── index.js        # 配置文件
├── frontend/               # 前端 React 应用
│   ├── src/                # 源代码
│   │   ├── components/     # React 组件
│   │   │   ├── Layout.js  # 布局组件
│   │   │   ├── ServiceControl.js # 服务控制组件
│   │   │   ├── LogViewer.js # 日志查看器组件
│   │   │   └── StatusIndicator.js # 状态指示器组件
│   │   ├── pages/          # 页面组件
│   │   │   └── Dashboard.js # 主控制面板
│   │   ├── services/       # API 服务
│   │   │   └── api.js     # API 调用
│   │   ├── styles/         # 样式文件
│   │   │   └── global.js  # 全局样式
│   │   ├── utils/          # 工具函数
│   │   ├── App.js          # 应用主组件
│   │   └── index.js        # 入口文件
│   ├── package.json        # 前端依赖
│   ├── webpack.config.js   # Webpack 配置
│   └── public/             # 静态文件
│       └── index.html      # HTML 模板
├── deploy/                 # 部署相关文件
├── scripts/                # 脚本文件
│   ├── start_server.bat    # 启动服务器脚本
│   └── build.bat           # 构建脚本
├── comfyui-start.bat       # ComfyUI 启动脚本
├── start_media-api.bat     # Media-API 启动脚本
├── README.md               # 项目说明
└── .gitignore              # Git 忽略文件
```

## 技术架构

### 后端 (Node.js/Express)
- **框架**: Express.js
- **WebSocket**: Socket.io 用于实时通信
- **跨域**: cors 处理跨域请求
- **进程管理**: child_process 模块用于启动和管理子进程
- **WSL 管理**: 通过 wsl 命令与 WSL 系统交互
- **端口代理**: 使用 netsh 命令管理 Windows 到 WSL 的端口映射

### 前端 (React)
- **框架**: React 18
- **样式**: styled-components 实现样式化组件
- **状态管理**: React hooks (useState, useEffect)
- **WebSocket 客户端**: socket.io-client 用于实时通信
- **HTTP 客户端**: axios 处理 API 请求
- **构建工具**: webpack

## 快速开始

### 环境要求

- Node.js v16+
- Windows 10/11 (支持 WSL)
- WSL2 (推荐)
- Ubuntu (或其他支持的发行版)

### 项目初始化

```bash
# 创建项目目录结构
mkdir backend frontend frontend/src/components frontend/src/pages frontend/src/services frontend/src/styles frontend/src/utils
mkdir deploy scripts config

# 初始化后端项目
cd backend
npm init -y

# 初始化前端项目
cd ../frontend
npm init -y
npm install react react-dom
```

### 安装依赖

#### 后端依赖
```bash
cd backend
npm install express cors socket.io child_process
npm install --save-dev nodemon
```

#### 前端依赖
```bash
cd frontend
npm install react react-dom styled-components axios socket.io-client
npm install --save-dev webpack webpack-cli webpack-dev-server babel-loader @babel/core @babel/preset-react
```

## 开发步骤

### 第一步：创建后端基础结构
1. 创建 `backend/app.js` - Express 服务器入口
2. 创建 `backend/process-manager.js` - 进程管理模块
3. 创建 `backend/wsl-manager.js` - WSL 管理模块
4. 创建 `backend/port-proxy-manager.js` - 端口代理管理模块
5. 创建 `backend/api/` 目录及路由文件
6. 创建 `backend/config/index.js` - 配置文件
7. 配置 `backend/package.json` - 设置依赖和脚本命令

### 第二步：创建前端基础结构  
1. 创建 `frontend/src/App.js` - React 应用主组件
2. 创建 `frontend/src/index.js` - React 入口文件
3. 创建组件目录 `frontend/src/components/`
4. 创建页面目录 `frontend/src/pages/`
5. 创建样式目录 `frontend/src/styles/`
6. 配置 `frontend/package.json` - 设置依赖和脚本命令
7. 配置 `webpack.config.js` - 前端构建配置

### 第三步：实现后端 API 功能
1. 实现服务控制接口
2. 实现日志获取接口
3. 实现 WSL 状态检查接口
4. 实现端口代理管理接口
5. 集成 WebSocket 实现实时通信

### 第四步：实现前端功能
1. 创建服务控制 UI 组件
2. 创建实时日志显示组件
3. 创建状态指示器组件
4. 创建主控制面板页面
5. 集成 API 调用和 WebSocket 通信

### 第五步：测试和部署
1. 功能测试
2. 界面优化
3. 性能优化
4. 创建部署脚本
5. 项目打包与发布

## API 接口

### 服务控制
- `GET /api/comfyui/status` - 获取comfyUI服务状态
- `POST /api/comfyui/start` - 启动 ComfyUI
- `POST /api/comfyui/stop` - 停止 ComfyUI
- `GET /api/media-api/status` - 获取Media-API服务状态
- `POST /api/media-api/start` - 启动 Media-API
- `POST /api/media-api/stop` - 停止 Media-API

### 日志相关
- `GET /api/logs/:service` - 获取服务日志 (service: comfyui|media-api)

### WSL 相关
- `GET /api/wsl/distros` - 获取 WSL 发行版列表
- `GET /api/wsl/service/:serviceName/status` - 检查 WSL 中服务状态

### 端口代理
- `POST /api/port-proxy/setup` - 设置端口代理
- `POST /api/port-proxy/clear/:localPort` - 清除端口代理

## WebSocket 事件

- `status-update` - 服务状态更新通知
- `log-{serviceName}` - 服务日志推送 (comfyui|media-api)

## 开发约定

1. **错误处理**: 所有异步操作都应包含适当的错误处理
2. **日志记录**: 关键操作和错误应记录到日志文件
3. **状态同步**: 使用 WebSocket 确保前端状态与后端保持同步
4. **资源清理**: 进程退出时应清理相关资源，包括端口代理
5. **安全性**: API 端点应考虑适当的验证和授权
6. **中文支持**: 确保所有日志和界面文本正确显示中文字符

## 部署和运行

### 快速启动

1. 确保系统已安装 Node.js v16+
2. 运行快速启动脚本（在当前窗口显示日志）：
   ```bash
   # Windows 系统
   cd scripts
   quick_start.bat
   ```
   
   或运行后台启动脚本（在新窗口中运行，不阻塞当前窗口）：
   ```bash
   # Windows 系统
   cd scripts
   background_start.bat
   ```

### 停止服务

要停止所有 Media Controller 服务，运行：
   ```bash
   # Windows 系统
   cd scripts
   stop_services.bat
   ```

### 生产环境部署

1. 确保系统已安装 Node.js v16+
2. 运行部署脚本：
   ```bash
   # Windows 系统
   cd scripts
   background_start.bat
   ```
   
3. 应用将自动：
   - 启动后端服务 (端口 8003)
   - 提供 Web 界面访问（访问 http://localhost:8003）

### 开发环境运行

1. 分别启动前后端：
   ```bash
   # 启动后端 (端口 8003)
   cd backend
   npm run dev
   
   # 启动前端（在另一个终端，端口 5173）
   cd frontend
   npm run dev
   ```

2. 或使用开发启动脚本：
   ```bash
   # Windows 系统
   cd scripts
   background_start.bat  # 使用后台启动脚本进行开发
   ```

### 开机启动配置

将 `scripts\startup.bat` 复制到Windows启动文件夹以实现开机自动启动：

1. 按 `Win + R` 键
2. 输入 `shell:startup` 并按回车
3. 将 `F:\media-contrller\scripts\startup.bat` 复制到打开的文件夹中

服务将在每次登录后自动启动（延迟30秒以避免系统启动时的资源竞争）。

### 访问界面

启动服务后，可以通过以下地址访问管理面板：
- 生产环境：http://localhost:8003
- 开发环境：http://localhost:5173

WebSocket 连接将自动使用正确的后端端口 (8003)，无需额外配置。

## 故障排除

1. 如果 WSL 端口代理设置失败，请检查：
   - WSL 服务是否运行
   - 是否有管理员权限运行应用
   - 目标端口是否已被占用

2. 如果中文字符显示异常，请检查：
   - 系统区域设置
   - 文件编码设置

3. 如果服务无法启动，请检查：
   - 启动脚本路径是否正确
   - 依赖是否已正确安装
   - 相关服务端口是否已被占用

4. 如果无法连接到服务，请检查：
   - 后端服务器是否正在运行 (默认端口 3000)
   - 防火墙设置是否允许相应端口通信