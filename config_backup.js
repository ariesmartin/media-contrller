// 配置文件
module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // ComfyUI 配置
  comfyUI: {
    startScript: 'F:\\\\media-contrller\\\\comfyui-start.bat',
    port: 8188,
    url: 'http://localhost:8188',
    pythonPath: 'F:\\\\ComfyUI\\\\ComfyUI\\\\python_dapao311\\\\python.exe',
    comfyUIPath: 'F:\\\\ComfyUI\\\\ComfyUI'
  },
  
  // Media-API 配置
  mediaAPI: {
    startScript: 'F:\\\\media-contrller\\\\start_media-api.bat',
    port: 5001,  // 修改：从5000改为5001以避免端口冲突
    url: 'http://localhost:5001'  // 修改：从5000改为5001
  },
  
  // WSL 配置
  wsl: {
    distro: 'Ubuntu',
    port: 5001  // 修改：从5000改为5001以保持一致
  },
  
  // 日志配置
  log: {
    maxSize: '10MB',
    maxFiles: 5
  }
};