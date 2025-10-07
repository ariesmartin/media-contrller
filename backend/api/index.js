const express = require('express');
const router = express.Router();

// 导入各个子路由
const servicesRouter = require('./services');
const logsRouter = require('./logs');
const wslRouter = require('./wsl');
const portProxyRouter = require('./port-proxy');

// 使用子路由
// 服务相关路由 - 为符合API文档要求，我们直接使用servicesRouter的端点
// 但在主路由层面，我们需要为每个服务单独设置
// 这里保留使用services路由，因为它是按照正确的端点设计的
router.use('/', servicesRouter);  // 这将直接提供 /comfyui/* 和 /media-api/* 端点
router.use('/logs', logsRouter);
router.use('/wsl', wslRouter);
router.use('/port-proxy', portProxyRouter);

module.exports = router;