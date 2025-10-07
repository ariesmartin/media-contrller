const express = require('express');
const router = express.Router();

// 服务控制路由
router.get('/status', async (req, res) => {
  try {
    const { processManager } = req.app.locals || {};
    if (!processManager) {
      return res.status(500).json({ error: 'ProcessManager 未初始化' });
    }

    const status = processManager.getStatus();
    res.json(status);
  } catch (error) {
    console.error('获取服务状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/comfyui/status', async (req, res) => {
  try {
    const { processManager } = req.app.locals || {};
    if (!processManager) {
      return res.status(500).json({ error: 'ProcessManager 未初始化' });
    }

    const status = processManager.getStatus();
    res.json(status.comfyui);
  } catch (error) {
    console.error('获取 ComfyUI 状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/comfyui/start', async (req, res) => {
  try {
    const { processManager } = req.app.locals || {};
    if (!processManager) {
      return res.status(500).json({ error: 'ProcessManager 未初始化' });
    }

    const result = await processManager.startComfyUI();
    res.json(result);
  } catch (error) {
    console.error('启动 ComfyUI 失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/comfyui/stop', async (req, res) => {
  try {
    const { processManager } = req.app.locals || {};
    if (!processManager) {
      return res.status(500).json({ error: 'ProcessManager 未初始化' });
    }

    const result = await processManager.stopComfyUI();
    res.json(result);
  } catch (error) {
    console.error('停止 ComfyUI 失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/media-api/status', async (req, res) => {
  try {
    const { processManager } = req.app.locals || {};
    if (!processManager) {
      return res.status(500).json({ error: 'ProcessManager 未初始化' });
    }

    const status = processManager.getStatus();
    res.json(status['media-api']);
  } catch (error) {
    console.error('获取 Media-API 状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/media-api/start', async (req, res) => {
  try {
    const { processManager } = req.app.locals || {};
    if (!processManager) {
      return res.status(500).json({ error: 'ProcessManager 未初始化' });
    }

    const result = await processManager.startMediaAPI();
    res.json(result);
  } catch (error) {
    console.error('启动 Media-API 失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/media-api/stop', async (req, res) => {
  try {
    const { processManager } = req.app.locals || {};
    if (!processManager) {
      return res.status(500).json({ error: 'ProcessManager 未初始化' });
    }

    const result = await processManager.stopMediaAPI();
    res.json(result);
  } catch (error) {
    console.error('停止 Media-API 失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;