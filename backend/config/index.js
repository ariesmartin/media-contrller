// 配置文件
module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 8003,
    host: process.env.HOST || '0.0.0.0'  // 监听所有地址以支持局域网访问
  },
  
  // ComfyUI 配置
  comfyUI: {
    startScript: 'F:\\\\media-contrller\\\\comfyui-start.bat',
    port: 8188,
    url: 'http://localhost:8188',
    pythonPath: 'F:\\\\ComfyUI\\\\python_dapao311\\\\python.exe',
    comfyUIPath: 'F:\\\\ComfyUI'
  },
  
  // Media-API 配置
  mediaAPI: {
    startScript: 'F:\\\\media-contrller\\\\start_media-api.bat',
    port: 5000,  // 恢复为原端口
    url: 'http://localhost:5000'
  },
  
  // WSL 配置
  wsl: {
    distro: 'Ubuntu',
    port: 5000  // 恢复为原端口
  },
  
  // 日志配置
  log: {
    maxSize: '10MB',
    maxFiles: 5
  }
};