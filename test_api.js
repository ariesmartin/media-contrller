// API 接口测试

// 简单验证API路由结构
console.log('开始测试API接口定义...');

// 检查API路由文件是否存在且结构正确
const fs = require('fs');

// 读取services.js内容并验证API端点
const servicesContent = fs.readFileSync('backend/api/services.js', 'utf8');

const expectedEndpoints = [
  'GET /api/comfyui/status',
  'POST /api/comfyui/start', 
  'POST /api/comfyui/stop',
  'GET /api/media-api/status',
  'POST /api/media-api/start',
  'POST /api/media-api/stop'
];

console.log('验证API端点定义...');

// 检查是否包含所有必需的API端点
let hasComfyUIStatus = servicesContent.includes("get('/comfyui/status'");
let hasComfyUIStart = servicesContent.includes("post('/comfyui/start'");
let hasComfyUIStop = servicesContent.includes("post('/comfyui/stop'");
let hasMediaAPIStatus = servicesContent.includes("get('/media-api/status'");
let hasMediaAPIStart = servicesContent.includes("post('/media-api/start'");
let hasMediaAPIStop = servicesContent.includes("post('/media-api/stop'");

if (hasComfyUIStatus && hasComfyUIStart && hasComfyUIStop && hasMediaAPIStatus && hasMediaAPIStart && hasMediaAPIStop) {
  console.log('✅ 所有服务控制API端点都已定义');
} else {
  console.log('❌ 缺少某些服务控制API端点');
  console.log(`  - GET /api/comfyui/status: ${hasComfyUIStatus ? '✅' : '❌'}`);
  console.log(`  - POST /api/comfyui/start: ${hasComfyUIStart ? '✅' : '❌'}`);
  console.log(`  - POST /api/comfyui/stop: ${hasComfyUIStop ? '✅' : '❌'}`);
  console.log(`  - GET /api/media-api/status: ${hasMediaAPIStatus ? '✅' : '❌'}`);
  console.log(`  - POST /api/media-api/start: ${hasMediaAPIStart ? '✅' : '❌'}`);
  console.log(`  - POST /api/media-api/stop: ${hasMediaAPIStop ? '✅' : '❌'}`);
  process.exit(1);
}

// 读取logs.js内容
const logsContent = fs.readFileSync('backend/api/logs.js', 'utf8');
if (logsContent.includes("get('/:service'")) {
  console.log('✅ 日志API端点已定义');
} else {
  console.log('❌ 日志API端点未定义');
  process.exit(1);
}

// 读取wsl.js内容
const wslContent = fs.readFileSync('backend/api/wsl.js', 'utf8');
if (wslContent.includes("get('/distros'") && wslContent.includes("get('/service/:serviceName/status'")) {
  console.log('✅ WSL API端点已定义');
} else {
  console.log('❌ WSL API端点未完全定义');
  process.exit(1);
}

// 读取port-proxy.js内容
const proxyContent = fs.readFileSync('backend/api/port-proxy.js', 'utf8');
if (proxyContent.includes("post('/setup'") && proxyContent.includes("post('/clear/:localPort'")) {
  console.log('✅ 端口代理API端点已定义');
} else {
  console.log('❌ 端口代理API端点未完全定义');
  process.exit(1);
}

console.log('\n🎉 API接口测试完成，所有端点都已正确配置！');