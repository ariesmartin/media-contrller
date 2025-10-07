const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class WSLManager {
  constructor() {
    this.distro = 'Ubuntu'; // 默认发行版
  }

  // 检查 WSL 可用性
  async checkWSLAvailability() {
    try {
      const { stdout } = await execPromise('wsl --version');
      console.log('WSL 可用:', stdout);
      return true;
    } catch (error) {
      console.error('WSL 不可用:', error.message);
      return false;
    }
  }

  // 获取 WSL 发行版列表
  async getDistros() {
    try {
      const { stdout } = await execPromise('wsl -l -q');
      const distros = stdout
        .split('\\n')
        .map(distro => distro.trim())
        .filter(distro => distro.length > 0);
      
      console.log('WSL 发行版列表:', distros);
      return distros;
    } catch (error) {
      console.error('获取 WSL 发行版列表失败:', error.message);
      return [];
    }
  }

  // 在 WSL 中执行命令
  async executeCommandInWSL(command, distro = null) {
    try {
      const targetDistro = distro || this.distro;
      const fullCommand = `wsl -d ${targetDistro} -e bash -c "${command}"`;
      const { stdout, stderr } = await execPromise(fullCommand);
      
      console.log(`WSL 执行命令: ${command}`);
      if (stderr) {
        console.warn(`WSL 命令警告: ${stderr}`);
      }
      
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error(`WSL 命令执行失败: ${command}`, error.message);
      return { success: false, error: error.message, stderr: error.stderr };
    }
  }

  // 检查 WSL 中服务的运行状态
  async checkServiceStatus(serviceName) {
    try {
      // 根据服务名称确定端口和检查命令
      let checkCommand = '';
      if (serviceName === 'media-api') {
        checkCommand = 'netstat -tlnp 2>/dev/null | grep \\\':5000 \\\' | grep LISTEN';
      } else {
        // 可以根据需要添加其他服务的检查命令
        return { success: false, error: `未知服务: ${serviceName}` };
      }

      const result = await this.executeCommandInWSL(checkCommand);
      if (result.success) {
        const isRunning = result.stdout && result.stdout.trim().length > 0;
        console.log(`WSL 中 ${serviceName} 服务运行状态: ${isRunning ? '运行中' : '未运行'}`);
        return { success: true, running: isRunning };
      } else {
        console.error(`检查 ${serviceName} 服务状态失败:`, result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error(`检查 ${serviceName} 服务状态时出错:`, error);
      return { success: false, error: error.message };
    }
  }

  // 检查 WSL 中端口占用情况
  async checkPortUsage(port, distro = null) {
    try {
      const targetDistro = distro || this.distro;
      const command = `netstat -tlnp 2>/dev/null | grep ':${port} ' | grep LISTEN`;
      const result = await this.executeCommandInWSL(command, targetDistro);
      
      if (result.success) {
        const isPortUsed = result.stdout && result.stdout.trim().length > 0;
        console.log(`WSL 中端口 ${port} 占用情况: ${isPortUsed ? '被占用' : '空闲'}`);
        return { success: true, used: isPortUsed, processes: result.stdout };
      } else {
        console.error(`检查端口 ${port} 占用情况失败:`, result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error(`检查端口 ${port} 占用情况时出错:`, error);
      return { success: false, error: error.message };
    }
  }

  // 在WSL中终止占用指定端口的进程
  async killProcessOnPort(port, distro = null) {
    try {
      const targetDistro = distro || this.distro;
      // 使用 lsof 查找占用端口的进程ID
      const command = `lsof -i :${port} -t 2>/dev/null || netstat -tlnp 2>/dev/null | grep ':${port} ' | awk '{print $7}' | cut -d'/' -f1 2>/dev/null`;
      const result = await this.executeCommandInWSL(command, targetDistro);

      if (result.success && result.stdout.trim()) {
        const pids = result.stdout.trim().split(/\\s+/);
        for (const pid of pids) {
          if (pid && !isNaN(pid)) {
            console.log(`正在终止 WSL 中占用端口 ${port} 的进程 (PID: ${pid})`);
            const killCommand = `kill -9 ${pid}`;
            const killResult = await this.executeCommandInWSL(killCommand, targetDistro);
            if (killResult.success) {
              console.log(`成功终止进程 PID: ${pid}`);
            } else {
              console.error(`终止进程 PID: ${pid} 失败:`, killResult.error);
            }
          }
        }
        return { success: true, message: `已终止占用端口 ${port} 的进程` };
      } else {
        console.log(`端口 ${port} 在 WSL 中未被占用或无法获取进程ID`);
        return { success: true, message: `端口 ${port} 在 WSL 中未被占用` };
      }
    } catch (error) {
      console.error(`终止端口 ${port} 上的进程时出错:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // 检查 Windows 中的端口占用情况
  async checkWindowsPortUsage(port) {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);
      
      // 使用 netstat 检查端口占用情况
      const command = `netstat -ano | findstr :${port}`;
      const { stdout } = await execPromise(command);
      
      const isPortUsed = stdout && stdout.trim().length > 0;
      console.log(`Windows 中端口 ${port} 占用情况: ${isPortUsed ? '被占用' : '空闲'}`);
      
      return { success: true, used: isPortUsed, processes: stdout };
    } catch (error) {
      console.error(`检查 Windows 端口 ${port} 占用情况时出错:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // 在 Windows 中终止占用指定端口的进程
  async killWindowsProcessOnPort(port) {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);
      
      // 首先找到占用端口的进程PID
      const findPidCommand = `netstat -ano | findstr :${port}`;
      const { stdout } = await execPromise(findPidCommand);
      
      if (stdout && stdout.trim()) {
        // 提取 PID（在 netstat 输出的第5列）
        const lines = stdout.trim().split(/\\r?\\n/);
        for (const line of lines) {
          const parts = line.trim().split(/\\s+/);
          if (parts.length >= 5) {
            const pid = parts[4]; // PID 在第5列
            if (pid && !isNaN(pid)) {
              console.log(`正在终止 Windows 中占用端口 ${port} 的进程 (PID: ${pid})`);
              const killCommand = `taskkill /PID ${pid} /F`;
              const killResult = await execPromise(killCommand);
              console.log(`成功终止进程 PID: ${pid}`);
            }
          }
        }
        return { success: true, message: `已终止占用端口 ${port} 的进程` };
      } else {
        console.log(`端口 ${port} 在 Windows 中未被占用`);
        return { success: true, message: `端口 ${port} 在 Windows 中未被占用` };
      }
    } catch (error) {
      console.error(`终止 Windows 中端口 ${port} 上的进程时出错:`, error);
      return { success: false, error: error.message };
    }
  }

  // 获取 WSL IP 地址
  async getWSLIPAddress(distro = null) {
    try {
      const targetDistro = distro || this.distro;
      const command = 'hostname -I';
      const result = await this.executeCommandInWSL(command, targetDistro);
      
      if (result.success) {
        const ips = result.stdout.trim().split(/\\s+/).filter(ip => ip.length > 0);
        const ipAddress = ips.length > 0 ? ips[0] : null;  // 取第一个 IP 地址
        console.log(`WSL ${targetDistro} IP 地址: ${ipAddress}`);
        return { success: true, ip: ipAddress };
      } else {
        console.error(`获取 WSL IP 地址失败:`, result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('获取 WSL IP 地址时出错:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = WSLManager;