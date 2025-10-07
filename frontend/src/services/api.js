import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8003/api', // 后端 API 基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么，比如添加认证token
    console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    console.log(`收到响应: ${response.config.url} - 状态码: ${response.status}`);
    return response;
  },
  (error) => {
    // 对响应错误做点什么
    console.error(`API 请求错误: ${error.config?.url} - ${error.message}`);
    return Promise.reject(error);
  }
);

// 服务控制相关 API
export const serviceAPI = {
  // 获取所有服务状态
  getStatus: () => apiClient.get('/services/status'),
  
  // ComfyUI 服务控制
  getComfyUIStatus: () => apiClient.get('/comfyui/status'),
  startComfyUI: () => apiClient.post('/comfyui/start'),
  stopComfyUI: () => apiClient.post('/comfyui/stop'),
  
  // Media-API 服务控制
  getMediaAPIStatus: () => apiClient.get('/media-api/status'),
  startMediaAPI: () => apiClient.post('/media-api/start'),
  stopMediaAPI: () => apiClient.post('/media-api/stop'),
};

// 日志相关 API
export const logAPI = {
  getLog: (service, lines = 100) => apiClient.get(`/logs/${service}?lines=${lines}`),
};

// WSL 相关 API
export const wslAPI = {
  getDistros: () => apiClient.get('/wsl/distros'),
  getServiceStatus: (serviceName) => apiClient.get(`/wsl/service/${serviceName}/status`),
};

// 端口代理相关 API
export const portProxyAPI = {
  setupPortProxy: (localPort, targetAddress, targetPort) => 
    apiClient.post('/port-proxy/setup', { localPort, targetAddress, targetPort }),
  clearPortProxy: (localPort) => apiClient.post(`/port-proxy/clear/${localPort}`),
  getPortProxyList: () => apiClient.get('/port-proxy/list'),
};

export default apiClient;