const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const config = require('./config');
const ProcessManager = require('./process-manager');
const WSLManager = require('./wsl-manager');
const PortProxyManager = require('./port-proxy-manager');

// 初始化 Express 应用
const app = express();
const server = http.createServer(app);

// WebSocket 服务器
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 初始化管理器
const wslManager = new WSLManager();
const portProxyManager = new PortProxyManager();
const processManager = new ProcessManager(io, portProxyManager, wslManager);

// 将管理器实例附加到应用对象，以便在路由中使用
app.locals.processManager = processManager;
app.locals.wslManager = wslManager;
app.locals.portProxyManager = portProxyManager;

// API 路由
app.use('/api', require('./api'));

// 为前端提供静态文件服务（生产环境）
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 健康检查页面
app.get('/health-check', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/health-check.html'));
});

// 所有其他路由返回前端 index.html（生产环境）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 发送初始状态 - 等待外部服务检测完成
  setTimeout(async () => {
    try {
      const initialStatus = await processManager.getStatus();
      socket.emit('status-update', initialStatus);
      console.log('发送初始状态给新连接的客户端:', initialStatus);
    } catch (error) {
      console.error('获取初始状态失败:', error);
      socket.emit('status-update', { 
        comfyui: { running: false, pid: null, startTime: null }, 
        'media-api': { running: false, pid: null, startTime: null } 
      });
    }
  }, 100); // 短暂延迟，确保外部服务检测完成

  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  processManager.stopAllServices();
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 启动服务器
server.listen(config.server.port, config.server.host, () => {
  console.log(`Media Controller 服务器运行在 http://${config.server.host}:${config.server.port}`);
});

module.exports = { app, server, io };