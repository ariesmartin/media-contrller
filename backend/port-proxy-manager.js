const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class PortProxyManager {
  constructor() {
    this.proxyMappings = new Map(); // 存储代理映射关系
  }

  // 设置端口代理
  async setupPortProxy(localPort, targetAddress, targetPort) {
    try {
      // 删除现有的端口代理规则（如果存在）
      await this.clearPortProxy(localPort);
      
      // 设置新的端口代理
      const command = `netsh interface portproxy add v4tov4 listenport=${localPort} listenaddress=0.0.0.0 connectport=${targetPort} connectaddress=${targetAddress}`;
      await execPromise(command);
      
      // 配置防火墙规则
      const firewallCommand = `netsh advfirewall firewall add rule name="WSL Port Proxy ${localPort}" dir=in action=allow protocol=TCP localport=${localPort}`;
      await execPromise(firewallCommand);
      
      // 保存映射关系
      this.proxyMappings.set(localPort, {
        targetAddress,
        targetPort,
        timestamp: new Date()
      });
      
      console.log(`端口代理已设置: 0.0.0.0:${localPort} -> ${targetAddress}:${targetPort}`);
      return { success: true, message: `端口代理已设置: ${localPort} -> ${targetAddress}:${targetPort}` };
    } catch (error) {
      console.error(`设置端口代理失败: ${localPort} -> ${targetAddress}:${targetPort}`, error.message);
      return { success: false, error: error.message };
    }
  }

  // 清除端口代理
  async clearPortProxy(localPort) {
    try {
      // 删除端口代理规则
      const command = `netsh interface portproxy delete v4tov4 listenport=${localPort}`;
      await execPromise(command).catch(() => {
        // 忽略删除不存在的端口代理规则时的错误
      });
      
      // 删除防火墙规则
      const firewallCommand = `netsh advfirewall firewall delete rule name="WSL Port Proxy ${localPort}"`;
      await execPromise(firewallCommand).catch(() => {
        // 忽略删除不存在的防火墙规则时的错误
      });
      
      // 删除映射关系
      this.proxyMappings.delete(localPort);
      
      console.log(`端口代理已清除: ${localPort}`);
      return { success: true, message: `端口代理已清除: ${localPort}` };
    } catch (error) {
      console.error(`清除端口代理失败: ${localPort}`, error.message);
      return { success: false, error: error.message };
    }
  }

  // 获取当前端口代理列表
  async getPortProxyList() {
    try {
      const { stdout } = await execPromise('netsh interface portproxy show v4tov4');
      const lines = stdout.split('\\n');
      
      const proxies = [];
      let inProxiesSection = false;
      
      for (const line of lines) {
        if (line.includes('Listen on')) {
          inProxiesSection = true;
          continue;
        }
        
        if (inProxiesSection && line.trim() !== '' && !line.includes('---')) {
          // 解析代理信息
          const parts = line.trim().split(/\\s+/);
          if (parts.length >= 4) {
            const listenAddress = parts[0];
            const listenPort = parts[1];
            const connectAddress = parts[2];
            const connectPort = parts[3];
            
            proxies.push({
              listenAddress,
              listenPort: parseInt(listenPort),
              connectAddress,
              connectPort: parseInt(connectPort)
            });
          }
        }
      }
      
      console.log(`当前端口代理列表:`, proxies);
      return { success: true, proxies };
    } catch (error) {
      console.error('获取端口代理列表失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 自动配置 WSL 端口代理
  async setupWSLPortProxy(wslIP, localPort, wslPort) {
    try {
      if (!wslIP) {
        return { success: false, error: 'WSL IP 地址不能为空' };
      }
      
      // 设置从 Windows 到 WSL 的端口代理
      return await this.setupPortProxy(localPort, wslIP, wslPort);
    } catch (error) {
      console.error(`自动配置 WSL 端口代理失败: ${localPort} -> ${wslIP}:${wslPort}`, error.message);
      return { success: false, error: error.message };
    }
  }

  // 检查特定端口是否已被代理
  async isPortProxied(port) {
    const result = await this.getPortProxyList();
    if (result.success) {
      return result.proxies.some(proxy => proxy.listenPort == port); // 使用 == 以处理数字和字符串比较
    }
    return false;
  }
}

module.exports = PortProxyManager;