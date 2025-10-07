// 测试后端模块是否能够正确加载和初始化
const fs = require('fs');
const path = require('path');

console.log('正在验证后端模块...');

// 1. 测试配置加载
try {
    const config = require('./backend/config');
    console.log('✅ 配置文件加载成功:', config.server.port);
} catch (e) {
    console.error('❌ 配置文件加载失败:', e.message);
}

// 2. 测试各个管理器模块
try {
    const ProcessManager = require('./backend/process-manager');
    console.log('✅ ProcessManager 模块加载成功');
} catch (e) {
    console.error('❌ ProcessManager 模块加载失败:', e.message);
}

try {
    const WSLManager = require('./backend/wsl-manager');
    console.log('✅ WSLManager 模块加载成功');
} catch (e) {
    console.error('❌ WSLManager 模块加载失败:', e.message);
}

try {
    const PortProxyManager = require('./backend/port-proxy-manager');
    console.log('✅ PortProxyManager 模块加载成功');
} catch (e) {
    console.error('❌ PortProxyManager 模块加载失败:', e.message);
}

// 3. 测试 API 路由模块
try {
    const apiRouter = require('./backend/api');
    console.log('✅ API 路由模块加载成功');
} catch (e) {
    console.error('❌ API 路由模块加载失败:', e.message);
}

// 4. 检查 API 路由文件
const apiFiles = fs.readdirSync('./backend/api');
console.log(`✅ API 路由目录包含 ${apiFiles.length} 个文件:`, apiFiles);

// 5. 验证 package.json 依赖
try {
    const backendPackage = require('./backend/package.json');
    const dependencies = backendPackage.dependencies;
    const requiredDeps = ['express', 'cors', 'socket.io'];
    
    for (const dep of requiredDeps) {
        if (dependencies[dep]) {
            console.log(`✅ 依赖 ${dep} 已配置`);
        } else {
            console.error(`❌ 依赖 ${dep} 缺失`);
        }
    }
} catch (e) {
    console.error('❌ 后端 package.json 验证失败:', e.message);
}

console.log('\n🎉 后端模块验证完成！');
console.log('\n要启动完整应用，请执行以下步骤：');
console.log('1. 打开一个终端，进入 backend 目录，运行: npm start');
console.log('2. 打开另一个终端，进入 frontend 目录，运行: npm run dev (开发模式) 或 npm run build');
console.log('3. 访问 http://localhost:3000 查看应用');