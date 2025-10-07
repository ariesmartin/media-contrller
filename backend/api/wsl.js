const express = require('express');
const router = express.Router();

// WSL 相关路由
router.get('/distros', async (req, res) => {
  try {
    const { wslManager } = req.app.locals || {};
    if (!wslManager) {
      return res.status(500).json({ error: 'WSLManager 未初始化' });
    }

    const distros = await wslManager.getDistros();
    res.json({ distros });
  } catch (error) {
    console.error('获取 WSL 发行版失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/service/:serviceName/status', async (req, res) => {
  try {
    const { serviceName } = req.params;
    
    const { wslManager } = req.app.locals || {};
    if (!wslManager) {
      return res.status(500).json({ error: 'WSLManager 未初始化' });
    }

    // 验证服务名称
    if (!['media-api'].includes(serviceName)) {
      return res.status(400).json({ error: '无效的服务名称，目前只支持: media-api' });
    }

    const status = await wslManager.checkServiceStatus(serviceName);
    res.json(status);
  } catch (error) {
    console.error(`检查 WSL 服务 ${serviceName} 状态失败:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;