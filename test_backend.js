// 简单的后端功能测试脚本
const fs = require('fs');
const path = require('path');

console.log('开始测试后端功能...');

// 检查必要文件是否存在
const requiredFiles = [
  'backend/app.js',
  'backend/process-manager.js',
  'backend/wsl-manager.js',
  'backend/port-proxy-manager.js',
  'backend/config/index.js',
  'backend/api/index.js',
  'backend/api/services.js',
  'backend/api/logs.js',
  'backend/api/wsl.js',
  'backend/api/port-proxy.js'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`缺少文件: ${file}`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('✅ 所有后端文件都存在');
} else {
  console.log('❌ 有文件缺失');
  process.exit(1);
}

// 检查package.json依赖
const backendPackage = require('./backend/package.json');
const requiredDeps = ['express', 'cors', 'socket.io'];
const missingDeps = [];

for (const dep of requiredDeps) {
  if (!backendPackage.dependencies[dep]) {
    missingDeps.push(dep);
  }
}

if (missingDeps.length === 0) {
  console.log('✅ 所有后端依赖都已配置');
} else {
  console.log(`❌ 缺少依赖: ${missingDeps.join(', ')}`);
  process.exit(1);
}

// 检查配置文件
try {
  const config = require('./backend/config');
  console.log('✅ 配置文件可正常加载');
} catch (error) {
  console.error('❌ 配置文件加载失败:', error.message);
  process.exit(1);
}

// 尝试加载各模块
try {
  require('./backend/process-manager');
  console.log('✅ ProcessManager 模块可正常加载');
} catch (error) {
  console.error('❌ ProcessManager 模块加载失败:', error.message);
  process.exit(1);
}

try {
  require('./backend/wsl-manager');
  console.log('✅ WSLManager 模块可正常加载');
} catch (error) {
  console.error('❌ WSLManager 模块加载失败:', error.message);
  process.exit(1);
}

try {
  require('./backend/port-proxy-manager');
  console.log('✅ PortProxyManager 模块可正常加载');
} catch (error) {
  console.error('❌ PortProxyManager 模块加载失败:', error.message);
  process.exit(1);
}

try {
  require('./backend/api');
  console.log('✅ API 模块可正常加载');
} catch (error) {
  console.error('❌ API 模块加载失败:', error.message);
  process.exit(1);
}

console.log('\n🎉 后端功能测试完成，所有模块都正常！');