const express = require('express');
const router = express.Router();

// 日志相关路由
router.get('/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const { lines = 100 } = req.query; // 默认返回最近100行日志
    
    const { processManager } = req.app.locals || {};
    if (!processManager) {
      return res.status(500).json({ error: 'ProcessManager 未初始化' });
    }

    // 验证服务名称
    if (!['comfyui', 'media-api'].includes(service)) {
      return res.status(400).json({ error: '无效的服务名称，只支持: comfyui, media-api' });
    }

    const logLines = parseInt(lines);
    if (isNaN(logLines) || logLines <= 0) {
      return res.status(400).json({ error: '日志行数必须是正整数' });
    }

    const log = processManager.getLog(service, logLines);
    res.json({ service, lines: logLines, log });
  } catch (error) {
    console.error('获取日志失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;