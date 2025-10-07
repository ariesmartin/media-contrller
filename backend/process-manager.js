const { spawn } = require('child_process');
const path = require('path');
const config = require('./config');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class ProcessManager {
  constructor(io, portProxyManager, wslManager) {
    this.io = io;
    this.portProxyManager = portProxyManager;
    this.wslManager = wslManager;
    this.processes = {
      comfyui: null,
      'media-api': null
    };
    this.status = {
      comfyui: { running: false, pid: null, startTime: null },
      'media-api': { running: false, pid: null, startTime: null }
    };
    this.logBuffers = {
      comfyui: [],
      'media-api': []
    };
    this.maxLogLines = 1000; // 限制日志缓冲区大小
    
    // 立即检测外部运行的服务
    this.detectExternalServices();
    // 启动定期检测外部服务的定时器（每10秒检测一次）
    this.startExternalServiceDetection();
  }
  
  // 开始定期检测外部运行的服务
  startExternalServiceDetection() {
    setInterval(async () => {
      await this.detectExternalServices();
      // 如果状态发生变化，发送状态更新
      this.sendStatusUpdate();
    }, 10000); // 每10秒检测一次
  }

  // 启动 ComfyUI 服务
  async startComfyUI() {
    return new Promise(async (resolve, reject) => {
      if (this.processes.comfyui) {
        console.log('ComfyUI 进程已在运行');
        this.sendStatusUpdate();
        resolve({ success: true, message: 'ComfyUI 进程已在运行' });
        return;
      }

      try {
        console.log('正在启动 ComfyUI...');
        
        // 启动前检查并清理端口占用
        if (this.wslManager) {
          console.log(`检查 Windows 中端口 ${config.comfyUI.port} 的占用情况...`);
          try {
            const portCheckResult = await this.wslManager.checkWindowsPortUsage(config.comfyUI.port);
            if (portCheckResult.success && portCheckResult.used) {
              console.log(`检测到 Windows 中端口 ${config.comfyUI.port} 被占用，正在终止相关进程...`);
              const killResult = await this.wslManager.killWindowsProcessOnPort(config.comfyUI.port);
              if (killResult.success) {
                console.log(`已终止 Windows 中占用端口 ${config.comfyUI.port} 的进程`);
              } else {
                console.warn(`终止 Windows 中占用端口的进程时出错:`, killResult.error);
              }
            } else if (portCheckResult.success) {
              console.log(`Windows 中端口 ${config.comfyUI.port} 未被占用`);
            } else {
              console.warn(`检查 Windows 中端口 ${config.comfyUI.port} 占用情况时出错:`, portCheckResult.error);
            }
          } catch (checkError) {
            console.warn(`检查 Windows 端口占用时出错:`, checkError);
          }
        }

        this.processes.comfyui = spawn('cmd.exe', ['/c', 'chcp 65001 >nul && ' + config.comfyUI.startScript], {
          cwd: path.dirname(config.comfyUI.startScript),
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true,
          env: {
            ...process.env,
            // 设置环境变量以确保正确的字符编码
            PYTHONIOENCODING: 'utf-8',
            LANG: 'zh_CN.UTF-8',
            LC_ALL: 'zh_CN.UTF-8',
            // 设置Windows区域设置
            PYTHONUTF8: '1'
          }
        });

        this.status.comfyui.running = true;
        this.status.comfyui.pid = this.processes.comfyui.pid;
        this.status.comfyui.startTime = new Date();

        // 处理 stdout
        this.processes.comfyui.stdout.on('data', (data) => {
          const logMessage = data.toString();
          this.addLog('comfyui', logMessage, 'stdout');
          this.io.emit('log-comfyui', logMessage);
        });

        // 处理 stderr
        this.processes.comfyui.stderr.on('data', (data) => {
          const logMessage = data.toString();
          this.addLog('comfyui', logMessage, 'stderr');
          this.io.emit('log-comfyui', logMessage);
        });

        // 处理进程退出
        this.processes.comfyui.on('close', (code) => {
          console.log(`ComfyUI 进程退出，退出码: ${code}`);
          this.status.comfyui.running = false;
          this.status.comfyui.pid = null;
          this.status.comfyui.startTime = null;
          this.processes.comfyui = null;
          this.sendStatusUpdate();
        });

        this.processes.comfyui.on('error', (err) => {
          console.error('ComfyUI 进程错误:', err);
          this.addLog('comfyui', `进程错误: ${err.message}`, 'error');
          this.io.emit('log-comfyui', `进程错误: ${err.message}`);
          this.stopComfyUI();
        });

        this.sendStatusUpdate();
        console.log('ComfyUI 启动成功，PID:', this.processes.comfyui.pid);
        resolve({ success: true, pid: this.processes.comfyui.pid });
      } catch (error) {
        console.error('启动 ComfyUI 时出错:', error);
        reject({ success: false, error: error.message });
      }
    });
  }

  // 停止 ComfyUI 服务
  stopComfyUI() {
    return new Promise((resolve, reject) => {
      if (!this.processes.comfyui) {
        console.log('ComfyUI 进程未运行');
        resolve({ success: true, message: 'ComfyUI 进程未运行' });
        return;
      }

      try {
        console.log('正在停止 ComfyUI...');
        // 尝试优雅关闭 (发送 SIGTERM)
        this.processes.comfyui.kill('SIGTERM');
        
        // 如果进程在 5 秒内未退出，强制终止 (SIGKILL)
        setTimeout(() => {
          if (this.processes.comfyui) {
            this.processes.comfyui.kill('SIGKILL');
            this.processes.comfyui = null;
            this.status.comfyui.running = false;
            this.status.comfyui.pid = null;
            this.status.comfyui.startTime = null;
            this.sendStatusUpdate();
            console.log('ComfyUI 强制终止');
            resolve({ success: true, message: 'ComfyUI 已强制终止' });
          }
        }, 5000);

        this.processes.comfyui.on('close', (code) => {
          console.log(`ComfyUI 进程已关闭，退出码: ${code}`);
          this.processes.comfyui = null;
          this.status.comfyui.running = false;
          this.status.comfyui.pid = null;
          this.status.comfyui.startTime = null;
          this.sendStatusUpdate();
          resolve({ success: true, message: 'ComfyUI 已停止' });
        });
      } catch (error) {
        console.error('停止 ComfyUI 时出错:', error);
        reject({ success: false, error: error.message });
      }
    });
  }

  // 启动 Media-API 服务
  async startMediaAPI() {
    return new Promise(async (resolve, reject) => {
      if (this.processes['media-api']) {
        console.log('Media-API 进程已在运行');
        this.sendStatusUpdate();
        resolve({ success: true, message: 'Media-API 进程已在运行' });
        return;
      }

      try {
        console.log('正在启动 Media-API...');
        
        // 启动前检查并清理 Windows 中的端口占用
        if (this.wslManager) {
          console.log(`检查 Windows 中端口 ${config.mediaAPI.port} 的占用情况...`);
          try {
            const portCheckResult = await this.wslManager.checkWindowsPortUsage(config.mediaAPI.port);
            if (portCheckResult.success && portCheckResult.used) {
              console.log(`检测到 Windows 中端口 ${config.mediaAPI.port} 被占用，正在终止相关进程...`);
              const killResult = await this.wslManager.killWindowsProcessOnPort(config.mediaAPI.port);
              if (killResult.success) {
                console.log(`已终止 Windows 中占用端口 ${config.mediaAPI.port} 的进程`);
              } else {
                console.warn(`终止 Windows 中占用端口的进程时出错:`, killResult.error);
              }
            } else if (portCheckResult.success) {
              console.log(`Windows 中端口 ${config.mediaAPI.port} 未被占用`);
            } else {
              console.warn(`检查 Windows 中端口 ${config.mediaAPI.port} 占用情况时出错:`, portCheckResult.error);
            }
          } catch (checkError) {
            console.warn(`检查 Windows 端口占用时出错:`, checkError);
          }
        }

        // 启动前确保 WSL 端口代理已清理
        if (this.portProxyManager) {
          await this.portProxyManager.clearPortProxy(config.mediaAPI.port).catch(error => {
            console.warn('清理端口代理时出错（可忽略）:', error.message);
          });
        }

        // 获取 WSL 管理器实例并检查 WSL 中的端口占用情况
        if (this.wslManager) {
          console.log(`检查 WSL 中端口 ${config.wsl.port} 的占用情况...`);
          try {
            const portCheckResult = await this.wslManager.checkPortUsage(config.wsl.port);
            if (portCheckResult.success && portCheckResult.used) {
              console.log(`检测到 WSL 中端口 ${config.wsl.port} 被占用，正在终止相关进程...`);
              const killResult = await this.wslManager.killProcessOnPort(config.wsl.port);
              if (killResult.success) {
                console.log(`已终止 WSL 中占用端口 ${config.wsl.port} 的进程`);
              } else {
                console.warn(`终止 WSL 中占用端口的进程时出错:`, killResult.error);
              }
            } else if (portCheckResult.success) {
              console.log(`WSL 中端口 ${config.wsl.port} 未被占用`);
            } else {
              console.warn(`检查 WSL 中端口 ${config.wsl.port} 占用情况时出错:`, portCheckResult.error);
            }
          } catch (checkError) {
            console.warn(`检查 WSL 端口占用时出错:`, checkError);
          }
        }

        this.processes['media-api'] = spawn('cmd.exe', ['/c', 'chcp 65001 >nul && ' + config.mediaAPI.startScript], {
          cwd: path.dirname(config.mediaAPI.startScript),
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true,
          env: {
            ...process.env,
            // 设置环境变量以确保正确的字符编码
            PYTHONIOENCODING: 'utf-8',
            LANG: 'zh_CN.UTF-8',
            LC_ALL: 'zh_CN.UTF-8',
            // 设置Windows区域设置
            PYTHONUTF8: '1'
          }
        });

        this.status['media-api'].running = true;
        this.status['media-api'].pid = this.processes['media-api'].pid;
        this.status['media-api'].startTime = new Date();

        // 处理 stdout
        this.processes['media-api'].stdout.on('data', (data) => {
          const logMessage = data.toString();
          this.addLog('media-api', logMessage, 'stdout');
          this.io.emit('log-media-api', logMessage);
        });

        // 处理 stderr
        this.processes['media-api'].stderr.on('data', (data) => {
          const logMessage = data.toString();
          this.addLog('media-api', logMessage, 'stderr');
          this.io.emit('log-media-api', logMessage);
        });

        // 处理进程退出
        this.processes['media-api'].on('close', async (code) => {
          console.log(`Media-API 进程退出，退出码: ${code}`);
          this.status['media-api'].running = false;
          this.status['media-api'].pid = null;
          this.status['media-api'].startTime = null;
          this.processes['media-api'] = null;
          
          // 进程退出后自动清理端口代理
          if (this.portProxyManager) {
            await this.portProxyManager.clearPortProxy(config.mediaAPI.port).catch(error => {
              console.warn('清理端口代理时出错（可忽略）:', error.message);
            });
          }
          
          this.sendStatusUpdate();
        });

        this.processes['media-api'].on('error', (err) => {
          console.error('Media-API 进程错误:', err);
          this.addLog('media-api', `进程错误: ${err.message}`, 'error');
          this.io.emit('log-media-api', `进程错误: ${err.message}`);
          this.stopMediaAPI();
        });

        this.sendStatusUpdate();
        console.log('Media-API 启动成功，PID:', this.processes['media-api'].pid);
        
        // 启动成功后设置 WSL 端口代理
        if (this.portProxyManager) {
          try {
            const ipResult = await this.wslManager.getWSLIPAddress();
            if (ipResult.success && ipResult.ip) {
              await this.portProxyManager.setupWSLPortProxy(ipResult.ip, config.mediaAPI.port, config.wsl.port);
              console.log(`自动设置 WSL 端口代理: Windows ${config.mediaAPI.port} -> WSL ${ipResult.ip}:${config.wsl.port}`);
            } else {
              console.warn('无法获取 WSL IP 地址，跳过端口代理设置');
            }
          } catch (proxyError) {
            console.error('设置 WSL 端口代理失败:', proxyError.message);
          }
        }
        
        resolve({ success: true, pid: this.processes['media-api'].pid });
      } catch (error) {
        console.error('启动 Media-API 时出错:', error);
        reject({ success: false, error: error.message });
      }
    });
  }

  // 停止 Media-API 服务
  async stopMediaAPI() {
    return new Promise(async (resolve, reject) => {
      if (!this.processes['media-api']) {
        console.log('Media-API 进程未运行');
        // 即使进程未运行，也尝试清理端口代理
        if (this.portProxyManager) {
          await this.portProxyManager.clearPortProxy(config.mediaAPI.port).catch(error => {
            console.warn('清理端口代理时出错（可忽略）:', error.message);
          });
        }
        resolve({ success: true, message: 'Media-API 进程未运行' });
        return;
      }

      try {
        console.log('正在停止 Media-API...');
        // 尝试优雅关闭 (发送 SIGTERM)
        this.processes['media-api'].kill('SIGTERM');
        
        // 如果进程在 5 秒内未退出，强制终止 (SIGKILL)
        setTimeout(() => {
          if (this.processes['media-api']) {
            this.processes['media-api'].kill('SIGKILL');
            this.processes['media-api'] = null;
            this.status['media-api'].running = false;
            this.status['media-api'].pid = null;
            this.status['media-api'].startTime = null;
            
            // 清理端口代理
            if (this.portProxyManager) {
              this.portProxyManager.clearPortProxy(config.mediaAPI.port).catch(error => {
                console.warn('清理端口代理时出错（可忽略）:', error.message);
              });
            }
            
            this.sendStatusUpdate();
            console.log('Media-API 强制终止');
            resolve({ success: true, message: 'Media-API 已强制终止' });
          }
        }, 5000);

        this.processes['media-api'].on('close', async (code) => {
          console.log(`Media-API 进程已关闭，退出码: ${code}`);
          this.processes['media-api'] = null;
          this.status['media-api'].running = false;
          this.status['media-api'].pid = null;
          this.status['media-api'].startTime = null;
          
          // 清理端口代理
          if (this.portProxyManager) {
            await this.portProxyManager.clearPortProxy(config.mediaAPI.port).catch(error => {
              console.warn('清理端口代理时出错（可忽略）:', error.message);
            });
          }
          
          this.sendStatusUpdate();
          resolve({ success: true, message: 'Media-API 已停止' });
        });
      } catch (error) {
        console.error('停止 Media-API 时出错:', error);
        reject({ success: false, error: error.message });
      }
    });
  }

  // 获取服务状态
  async getStatus() {
    // 检测外部运行的服务
    await this.detectExternalServices();
    
    return {
      comfyui: { ...this.status.comfyui },
      'media-api': { ...this.status['media-api'] }
    };
  }

  // 获取指定服务的日志
  async getLog(serviceName, lines = 100) {
    // 如果是管理器启动的进程，返回内存中的日志
    if (this.logBuffers[serviceName] && 
        ((serviceName === 'comfyui' && this.processes.comfyui) || 
         (serviceName === 'media-api' && this.processes['media-api']))) {
      const logLength = this.logBuffers[serviceName].length;
      const start = Math.max(0, logLength - lines);
      const result = this.logBuffers[serviceName].slice(start).join('');
      console.log(`返回 ${serviceName} 的 ${result.split('\n').length - 1} 行日志`);
      return result;
    }
    
    // 如果是外部运行的进程，尝试从日志文件获取日志（如果有的话）
    // 为了兼容性，返回一个提示信息
    if (this.status[serviceName]?.running) {
      // 检查是否为外部运行的进程
      const externalRunning = await this.isExternalServiceRunning(serviceName);
      if (externalRunning && !this.processes[serviceName]) {
        console.log(`检测到 ${serviceName} 外部运行，但无法获取日志`);
        return `[INFO] 检测到 ${serviceName} 服务正在外部运行，但当前管理器未跟踪其日志输出。\n要获取完整日志，请通过管理器启动服务。\n[INFO] 服务状态: 运行中`;
      }
    }
    
    if (this.logBuffers[serviceName]) {
      const logLength = this.logBuffers[serviceName].length;
      const start = Math.max(0, logLength - lines);
      const result = this.logBuffers[serviceName].slice(start).join('');
      console.log(`返回 ${serviceName} 的 ${result.split('\n').length - 1} 行历史日志`);
      return result;
    }
    
    console.log(`没有找到 ${serviceName} 的日志数据`);
    return '';
  }

  // 检查特定服务是否作为外部进程运行
  async isExternalServiceRunning(serviceName) {
    if (serviceName === 'comfyui') {
      return await this.isExternalComfyUIRunning('');
    } else if (serviceName === 'media-api') {
      return await this.isExternalMediaAPIRunning('');
    }
    return false;
  }

  // 添加日志到缓冲区
  addLog(serviceName, message, type = 'stdout') {
    if (!this.logBuffers[serviceName]) {
      this.logBuffers[serviceName] = [];
    }

    // 添加时间戳
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    
    this.logBuffers[serviceName].push(logEntry);

    // 限制缓冲区大小
    if (this.logBuffers[serviceName].length > this.maxLogLines) {
      this.logBuffers[serviceName] = this.logBuffers[serviceName].slice(-this.maxLogLines);
    }
  }

  // 发送状态更新到所有连接的客户端
  sendStatusUpdate() {
    this.io.emit('status-update', this.getStatus());
  }

  // 检测系统中是否运行着未被管理器跟踪的服务进程
  async detectExternalServices() {
    try {
      // 查找可能的 ComfyUI 进程
      const comfyUIRunning = this.status.comfyui.running || await this.isExternalComfyUIRunning();
      // 查找可能的 Media-API 进程
      const mediaAPIRunning = this.status['media-api'].running || await this.isExternalMediaAPIRunning();
      
      // 如果发现外部运行的进程，更新状态
      if (!this.status.comfyui.running && comfyUIRunning) {
        this.status.comfyui.running = true;
        this.status.comfyui.startTime = new Date();
        console.log('检测到外部运行的 ComfyUI 进程');
      }
      
      if (!this.status['media-api'].running && mediaAPIRunning) {
        this.status['media-api'].running = true;
        this.status['media-api'].startTime = new Date();
        console.log('检测到外部运行的 Media-API 进程');
      }
      
      // 如果管理器跟踪的进程不存在但状态标记为运行，则更新状态
      if (this.status.comfyui.running && !this.processes.comfyui) {
        const actualRunning = await this.isExternalComfyUIRunning();
        if (!actualRunning) {
          this.status.comfyui.running = false;
          this.status.comfyui.pid = null;
          this.status.comfyui.startTime = null;
          console.log('已更新 ComfyUI 状态为未运行（外部进程已停止）');
        }
      }
      
      if (this.status['media-api'].running && !this.processes['media-api']) {
        const actualRunning = await this.isExternalMediaAPIRunning();
        if (!actualRunning) {
          this.status['media-api'].running = false;
          this.status['media-api'].pid = null;
          this.status['media-api'].startTime = null;
          console.log('已更新 Media-API 状态为未运行（外部进程已停止）');
        }
      }
    } catch (error) {
      console.error('检测外部服务进程时出错:', error);
    }
  }

  // 检查是否有外部的 ComfyUI 进程在运行
  async isExternalComfyUIRunning() {
    try {
      // 首先使用tasklist命令获取进程列表
      const { stdout: tasklistOutput } = await execAsync('tasklist /fo csv /nh');
      
      // 检查 Python 进程中是否包含 ComfyUI 的启动脚本
      const comfyUIScriptPath = config.comfyUI.startScript.replace(/\\/g, '\\\\'); // 转义路径
      if (tasklistOutput.toLowerCase().includes('python') && tasklistOutput.toLowerCase().includes(comfyUIScriptPath.toLowerCase())) {
        return true;
      }
      
      // 如果 wmic 命令失败，尝试使用 PowerShell 替代
      try {
        const { stdout: psOutput } = await execAsync(`powershell "Get-WmiObject -Class Win32_Process -Filter \\"Name='python.exe'\\" | Select-Object CommandLine | Where-Object {$_.CommandLine -like '*${comfyUIScriptPath.replace(/'/g, "'")}*'}"`);
        if (psOutput && psOutput.trim() !== '') {
          return true;
        }
      } catch (psError) {
        console.warn('PowerShell 获取进程命令行失败:', psError.message);
        // 如果 PowerShell 也失败，仅依赖 tasklist 的结果
      }
      
      return false;
    } catch (error) {
      console.error('检查外部 ComfyUI 进程时出错:', error);
      return false;
    }
  }

  // 检查是否有外部的 Media-API 进程在运行
  async isExternalMediaAPIRunning() {
    try {
      // 首先使用tasklist命令获取进程列表
      const { stdout: tasklistOutput } = await execAsync('tasklist /fo csv /nh');
      
      // 检查 Python 进程中是否包含 Media-API 的启动脚本
      const mediaAPIScriptPath = config.mediaAPI.startScript.replace(/\\/g, '\\\\'); // 转义路径
      if (tasklistOutput.toLowerCase().includes('python') && tasklistOutput.toLowerCase().includes(mediaAPIScriptPath.toLowerCase())) {
        return true;
      }
      
      // 如果 wmic 命令失败，尝试使用 PowerShell 替代
      try {
        const { stdout: psOutput } = await execAsync(`powershell "Get-WmiObject -Class Win32_Process -Filter \\"Name='python.exe'\\" | Select-Object CommandLine | Where-Object {$_.CommandLine -like '*${mediaAPIScriptPath.replace(/'/g, "'")}*'}"`);
        if (psOutput && psOutput.trim() !== '') {
          return true;
        }
      } catch (psError) {
        console.warn('PowerShell 获取进程命令行失败:', psError.message);
        // 如果 PowerShell 也失败，仅依赖 tasklist 的结果
      }
      
      return false;
    } catch (error) {
      console.error('检查外部 Media-API 进程时出错:', error);
      return false;
    }
  }

  // 停止所有服务
  async stopAllServices() {
    console.log('正在停止所有服务...');
    if (this.processes.comfyui) {
      this.processes.comfyui.kill('SIGKILL');
      this.processes.comfyui = null;
      this.status.comfyui.running = false;
      this.status.comfyui.pid = null;
      this.status.comfyui.startTime = null;
    }

    if (this.processes['media-api']) {
      this.processes['media-api'].kill('SIGKILL');
      this.processes['media-api'] = null;
      this.status['media-api'].running = false;
      this.status['media-api'].pid = null;
      this.status['media-api'].startTime = null;
    }
    
    // 清理端口代理
    if (this.portProxyManager) {
      await this.portProxyManager.clearPortProxy(config.mediaAPI.port).catch(error => {
        console.warn('清理端口代理时出错（可忽略）:', error.message);
      });
    }
  }
}

module.exports = ProcessManager;