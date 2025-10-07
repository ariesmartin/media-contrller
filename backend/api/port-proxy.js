const express = require('express');
const router = express.Router();

// 端口代理路由
router.post('/setup', async (req, res) => {
  try {
    const { localPort, targetAddress, targetPort } = req.body;
    
    const { portProxyManager } = req.app.locals || {};
    if (!portProxyManager) {
      return res.status(500).json({ error: 'PortProxyManager 未初始化' });
    }

    if (!localPort || !targetAddress || !targetPort) {
      return res.status(400).json({ error: '缺少必需参数: localPort, targetAddress, targetPort' });
    }

    const result = await portProxyManager.setupPortProxy(localPort, targetAddress, targetPort);
    res.json(result);
  } catch (error) {
    console.error('设置端口代理失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/clear/:localPort', async (req, res) => {
  try {
    const { localPort } = req.params;
    
    const { portProxyManager } = req.app.locals || {};
    if (!portProxyManager) {
      return res.status(500).json({ error: 'PortProxyManager 未初始化' });
    }

    if (!localPort) {
      return res.status(400).json({ error: '缺少必需参数: localPort' });
    }

    const result = await portProxyManager.clearPortProxy(parseInt(localPort));
    res.json(result);
  } catch (error) {
    console.error(`清除端口代理失败: ${localPort}`, error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { portProxyManager } = req.app.locals || {};
    if (!portProxyManager) {
      return res.status(500).json({ error: 'PortProxyManager 未初始化' });
    }

    const result = await portProxyManager.getPortProxyList();
    res.json(result);
  } catch (error) {
    console.error('获取端口代理列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;