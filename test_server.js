// 简化版测试服务器，确认所有模块能正常工作
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// 导入配置和管理器
const config = require('./backend/config');
const ProcessManager = require('./backend/process-manager');
const WSLManager = require('./backend/wsl-manager');
const PortProxyManager = require('./backend/port-proxy-manager');

// 初始化 Express 应用
const app = express();
const server = http.createServer(app);
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
const processManager = new ProcessManager(io);
const wslManager = new WSLManager();
const portProxyManager = new PortProxyManager();

// 将管理器实例附加到应用对象
app.locals.processManager = processManager;
app.locals.wslManager = wslManager;
app.locals.portProxyManager = portProxyManager;

// API 路由
app.use('/api', require('./backend/api'));

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);
  socket.emit('status-update', processManager.getStatus());
  
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
  });
});

// 简单健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      comfyui: processManager.getStatus().comfyui,
      'media-api': processManager.getStatus()['media-api']
    }
  });
});

// 捕获启动错误
server.on('error', (err) => {
  console.error('服务器启动错误:', err);
});

// 启动服务器
server.listen(config.server.port, config.server.host, () => {
  console.log(`\n✅ 测试服务器启动成功！`);
  console.log(`📍 访问 http://${config.server.host}:${config.server.port}/health 检查状态`);
  console.log(`📋 所有模块已正确加载和初始化`);
  console.log(`🔧 ProcessManager, WSLManager, PortProxyManager 都已就绪`);
  console.log(`🌐 API 服务监听中...`);
  console.log(`🔄 WebSocket 服务就绪...`);
  console.log('\n💡 服务器正常运行中... (按 Ctrl+C 停止)');
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n\n🛑 正在关闭服务器...');
  processManager.stopAllServices();
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});