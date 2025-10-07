// 检查所有模块是否可以正确加载，但不实际启动服务器
const fs = require('fs');

console.log('🔍 检查项目结构...');

// 检查主要目录和文件
const checks = [
  { path: './backend/app.js', desc: '后端主应用' },
  { path: './backend/config/index.js', desc: '配置文件' },
  { path: './backend/process-manager.js', desc: '进程管理器' },
  { path: './backend/wsl-manager.js', desc: 'WSL管理器' },
  { path: './backend/port-proxy-manager.js', desc: '端口代理管理器' },
  { path: './backend/api/index.js', desc: 'API路由主文件' },
  { path: './backend/package.json', desc: '后端依赖配置' },
  { path: './frontend/package.json', desc: '前端依赖配置' },
  { path: './frontend/src/App.js', desc: '前端主组件' },
  { path: './frontend/src/index.js', desc: '前端入口文件' },
  { path: './scripts/start_server.bat', desc: '生产启动脚本' },
  { path: './scripts/start_dev.bat', desc: '开发启动脚本' }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  if (fs.existsSync(check.path)) {
    console.log(`✅ ${check.desc} - 存在`);
    passed++;
  } else {
    console.log(`❌ ${check.desc} - 缺失`);
    failed++;
  }
});

console.log(`\n📊 检查结果: ${passed} 通过, ${failed} 失败`);

if (failed === 0) {
  console.log('\n🎉 所有文件都已存在！项目结构完整。');
  console.log('\n🔧 要启动应用，请执行以下命令：');
  console.log('   1. cd backend && npm start');
  console.log('   2. 访问 http://localhost:3000');
  console.log('\n💻 开发模式请分别执行：');
  console.log('   1. cd backend && npm run dev');
  console.log('   2. cd frontend && npm run dev');
} else {
  console.log('\n❌ 项目结构不完整，请检查缺失的文件。');
}