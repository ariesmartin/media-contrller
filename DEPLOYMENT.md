# Media Controller 部署和运行说明

## 项目概述

Media Controller 是一个用于管理 ComfyUI 和运行在 WSL 中的 Media-API 服务的 Web 管理面板。该项目具有前后端分离架构，使用 Node.js/Express 作为后端，React 作为前端，并集成了 WebSocket 实现实时日志和状态更新功能。

## 系统要求

- Node.js v16+
- Windows 10/11 (支持 WSL)
- WSL2 (推荐)
- Ubuntu (或其他支持的发行版)

## 部署选项

### 选项 1: 生产环境一键部署（首次运行）

运行生产环境启动脚本（包含依赖安装和构建过程）：

```bash
cd scripts
start_server.bat
```

此脚本将自动：
1. 检查 Node.js 安装
2. 安装后端依赖
3. 安装前端依赖
4. 构建前端应用
5. 启动后端服务器

应用启动后，访问 `http://localhost:3000`

### 选项 2: 快速启动（后续运行）

如果已经运行过 `start_server.bat` 并且依赖已安装、前端已构建，可以使用快速启动脚本：

```bash
cd scripts
quick_start.bat
```

这将直接启动后端服务器，跳过依赖安装和构建步骤。

### 选项 2: 手动部署

#### 2.1 安装后端依赖

```bash
cd backend
npm install
```

#### 2.2 安装前端依赖

```bash
cd frontend
npm install
```

#### 2.3 构建前端应用

```bash
cd frontend
npm run build
```

#### 2.4 启动后端服务器

```bash
cd backend
npm start
```

应用启动后，访问 `http://localhost:3000`

### 选项 3: 开发环境运行

#### 3.1 启动后端开发服务器

```bash
cd backend
npm run dev
```

#### 3.2 启动前端开发服务器

在另一个终端：

```bash
cd frontend
npm run dev
```

前端开发服务器通常运行在 `http://localhost:5173`，后端 API 位于 `http://localhost:3000`

## 功能验证

### API 接口测试

以下 API 接口应该可用：

- `GET /api/comfyui/status` - 获取 ComfyUI 服务状态
- `POST /api/comfyui/start` - 启动 ComfyUI
- `POST /api/comfyui/stop` - 停止 ComfyUI
- `GET /api/media-api/status` - 获取 Media-API 服务状态
- `POST /api/media-api/start` - 启动 Media-API
- `POST /api/media-api/stop` - 停止 Media-API
- `GET /api/logs/:service` - 获取服务日志 (service: comfyui|media-api)
- `GET /api/wsl/distros` - 获取 WSL 发行版列表
- `GET /api/wsl/service/:serviceName/status` - 检查 WSL 中服务状态
- `POST /api/port-proxy/setup` - 设置端口代理
- `POST /api/port-proxy/clear/:localPort` - 清除端口代理

### WebSocket 功能测试

WebSocket 应该能够实时接收：

- 服务状态更新 (`status-update` 事件)
- ComfyUI 日志 (`log-comfyui` 事件)
- Media-API 日志 (`log-media-api` 事件)

### 开机启动验证

启动服务后验证：
1. 后端服务在端口 8003 上运行
2. 访问 http://localhost:8003 能看到控制面板
3. WebSocket 连接正常工作
4. 可以启动/停止 ComfyUI 和 Media-API 服务
5. 实时日志正常显示

如需开机启动，请将 `scripts\startup.bat` 复制到Windows启动文件夹 (`shell:startup`)。

## 故障排除

### 1. 服务器无法启动

检查 Node.js 是否已安装：
```bash
node --version
```

检查端口 3000 是否被占用：
```bash
netstat -ano | findstr :3000
```

### 2. WSL 相关问题

确认 WSL 已正确安装：
```bash
wsl --list --verbose
```

确认 Ubuntu 发行版可用：
```bash
wsl -l -q
```

### 3. 端口代理问题

端口代理需要管理员权限，确保以管理员身份运行应用。

### 4. 中文字符显示问题

确保系统区域设置支持中文。

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
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── styles/         # 样式文件
│   │   ├── utils/          # 工具函数
│   │   ├── App.js          # 应用主组件
│   │   └── index.js        # 入口文件
│   ├── package.json        # 前端依赖
│   ├── webpack.config.js   # Webpack 配置
│   └── public/             # 静态文件
│       └── index.html      # HTML 模板
├── scripts/                # 脚本文件
│   ├── start_server.bat    # 生产启动脚本
│   └── start_dev.bat       # 开发启动脚本
├── deploy/                 # 部署相关文件
├── comfyui-start.bat       # ComfyUI 启动脚本
├── start_media-api.bat     # Media-API 启动脚本
└── README.md               # 项目说明
```

## 环境配置

### ComfyUI 配置

确保 ComfyUI 启动脚本路径正确配置：
- 路径: `F:\media-contrller\comfyui-start.bat`
- 确保该脚本可启动 ComfyUI 服务

### Media-API 配置

确保 Media-API 启动脚本路径正确配置：
- 路径: `F:\media-contrller\start_media-api.bat`
- 确保该脚本可启动 WSL 中的 Media-API 服务

## 安全注意事项

- API 端点目前没有身份验证，部署到生产环境前请添加适当的验证机制
- 确保只有授权用户能够访问服务器
- 定期更新依赖包以修复安全漏洞

## 性能优化

- 前端资源已构建和压缩
- 后端使用了适当的中间件
- 日志缓冲区大小已限制以避免内存泄漏