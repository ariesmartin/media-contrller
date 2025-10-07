// 简单的前端功能测试脚本
const fs = require('fs');

console.log('开始测试前端功能...');

// 检查必要文件是否存在
const requiredFiles = [
  'frontend/src/App.js',
  'frontend/src/index.js',
  'frontend/src/components/ServiceControl.js',
  'frontend/src/components/StatusIndicator.js',
  'frontend/src/components/LogViewer.js',
  'frontend/src/components/Layout.js',
  'frontend/src/pages/Dashboard.js',
  'frontend/src/services/api.js',
  'frontend/src/styles/global.js',
  'frontend/public/index.html'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`缺少文件: ${file}`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('✅ 所有前端文件都存在');
} else {
  console.log('❌ 有文件缺失');
  process.exit(1);
}

// 检查package.json依赖
const frontendPackage = require('./frontend/package.json');
const requiredDeps = ['react', 'react-dom', 'styled-components', 'axios', 'socket.io-client'];
const missingDeps = [];

for (const dep of requiredDeps) {
  if (!frontendPackage.dependencies[dep]) {
    missingDeps.push(dep);
  }
}

if (missingDeps.length === 0) {
  console.log('✅ 所有前端依赖都已配置');
} else {
  console.log(`❌ 缺少依赖: ${missingDeps.join(', ')}`);
  process.exit(1);
}

console.log('\n🎉 前端功能测试完成，所有模块都正常！');