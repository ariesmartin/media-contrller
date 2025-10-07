import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { serviceAPI, logAPI } from '../services/api';
import { Card, Button, StatusIndicator as StatusBadge } from '../styles/global';
import io from 'socket.io-client';
import LogViewer from './LogViewer';

const ServiceCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  height: 100%;
  min-height: 600px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ServiceTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  color: ${props => props.theme.colors.textPrimary};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &::before {
    content: '⚙️';
    font-size: 1.2rem;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
  min-width: 150px;
`;

const StatusInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  justify-content: flex-end;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const StatusValue = styled.span`
  color: ${props => props.theme.colors.textPrimary};
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  padding: ${props => props.theme.spacing.sm} 0;
  border-top: 1px solid ${props => props.theme.colors.glassBorder};
  padding-top: ${props => props.theme.spacing.md};
`;

const ServiceControl = ({ serviceName, serviceDisplayName }) => {
  const [status, setStatus] = useState({ running: false, pid: null, startTime: null });
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const prevStatusRef = useRef({ running: false });
  const logViewerRef = useRef(null);

  // 获取服务状态
  const fetchStatus = async () => {
    try {
      let response;
      if (serviceName === 'comfyui') {
        response = await serviceAPI.getComfyUIStatus();
      } else {
        response = await serviceAPI.getMediaAPIStatus();
      }
      setStatus(response.data);
    } catch (error) {
      console.error(`获取${serviceDisplayName}状态失败:`, error);
    }
  };

  // 启动服务
  const startService = async () => {
    setIsLoading(true);
    try {
      if (serviceName === 'comfyui') {
        await serviceAPI.startComfyUI();
      } else {
        await serviceAPI.startMediaAPI();
      }
      fetchStatus();
      // 启动服务后，稍等一下再获取日志
      setTimeout(() => {
        if (logViewerRef.current) {
          logViewerRef.current.refreshLogs(serviceName);
        }
      }, 1000); // 延迟1秒获取日志，确保服务已启动
    } catch (error) {
      console.error(`启动${serviceDisplayName}失败:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // 停止服务
  const stopService = async () => {
    setIsLoading(true);
    try {
      if (serviceName === 'comfyui') {
        await serviceAPI.stopComfyUI();
      } else {
        await serviceAPI.stopMediaAPI();
      }
      fetchStatus();
      // 停止服务后，获取更新的日志
      setTimeout(() => {
        if (logViewerRef.current) {
          logViewerRef.current.refreshLogs(serviceName);
        }
      }, 1000); // 延迟1秒获取日志
    } catch (error) {
      console.error(`停止${serviceDisplayName}失败:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取历史日志
  const fetchHistoricalLogs = async () => {
    try {
      const response = await logAPI.getLog(serviceName, 100); // 获取最近100条日志
      const logContent = response.data.log;
      
      // 将历史日志按行分割并逐行添加到日志查看器
      const logLines = logContent.split('\n').filter(line => line.trim() !== '');
      
      if (logViewerRef.current && logLines.length > 0) {
        // 清空现有日志以避免重复
        logViewerRef.current.clearLogs();
        
        // 逐行添加历史日志
        logLines.forEach(logLine => {
          if (logLine.trim()) {
            logViewerRef.current.addLog(logLine);
          }
        });
      }
    } catch (error) {
      console.error(`获取${serviceDisplayName}历史日志失败:`, error);
    }
  };

  // 设置WebSocket连接监听实时日志
  useEffect(() => {
    // 连接到WebSocket服务器
    const newSocket = io('http://localhost:8003');

    // 监听对应服务的日志事件
    const logEventName = `log-${serviceName}`;
    newSocket.on(logEventName, (logMessage) => {
      // 通过 ref 调用 LogViewer 的方法来添加日志
      if (logViewerRef.current) {
        logViewerRef.current.addLog(logMessage);
      }
    });

    // 监听服务状态更新
    newSocket.on('status-update', (status) => {
      // 只更新当前组件对应的服务状态
      const currentServiceStatus = status[serviceName];
      if (currentServiceStatus) {
        // 检查服务状态是否发生变化
        const wasRunning = prevStatusRef.current.running;
        setStatus(currentServiceStatus);
        prevStatusRef.current = { running: currentServiceStatus.running };
        
        // 如果服务变为运行状态，获取最新日志
        if (currentServiceStatus.running && !wasRunning) {
          setTimeout(() => {
            if (logViewerRef.current) {
              console.log(`服务 ${serviceName} 状态变为运行，获取最新日志`);
              logViewerRef.current.refreshLogs(serviceName);
            }
          }, 1000); // 延迟1秒，确保服务已完全启动
        }
      }
    });
    
    // WebSocket 连接成功后，主 useEffect 会处理日志获取
    newSocket.on('connect', () => {
      console.log(`WebSocket 连接建立，服务: ${serviceName}`);
      // 日志获取由主 useEffect 处理
    });

    setSocket(newSocket);

    // 组件卸载时断开连接
    return () => {
      newSocket.close();
    };
  }, [serviceName]);

  // 组件挂载时获取初始状态和日志
  useEffect(() => {
    let isMounted = true; // 防止组件卸载后状态更新
    
    const initialize = async () => {
      await fetchStatus(); // 获取初始状态
      
      // 等待一会儿，让WebSocket连接建立并接收初始状态更新
      setTimeout(() => {
        if (isMounted && status.running && logViewerRef.current) {
          console.log(`页面加载完成，服务 ${serviceName} 正在运行，获取初始日志`);
          logViewerRef.current.refreshLogs(serviceName);
        }
      }, 1000);
    };
    
    initialize();
    
    // 设置定时器定期更新状态（每5秒）
    const statusInterval = setInterval(fetchStatus, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(statusInterval);
    };
  }, [serviceName, status.running]);

  return (
    <ServiceCard>
      <ServiceHeader>
        <ServiceTitle>{serviceDisplayName}</ServiceTitle>
        <StatusContainer>
          <StatusBadge status={status.running ? 'running' : 'stopped'}>
            {status.running ? '运行中' : '已停止'}
          </StatusBadge>
          <StatusInfo>
            {status.pid && (
              <>
                <span>PID:</span>
                <StatusValue>{status.pid}</StatusValue>
              </>
            )}
            {status.startTime && (
              <>
                <span>运行时间:</span>
                <StatusValue>
                  {Math.floor((new Date() - new Date(status.startTime)) / 1000 / 60)}分钟
                </StatusValue>
              </>
            )}
          </StatusInfo>
        </StatusContainer>
      </ServiceHeader>
      
      <ButtonGroup>
        <Button 
          variant="primary" 
          onClick={startService} 
          disabled={status.running || isLoading}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isLoading ? '启动中...' : '▶️ 启动'}
          </span>
        </Button>
        <Button 
          variant="danger" 
          onClick={stopService} 
          disabled={!status.running || isLoading}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isLoading ? '停止中...' : '⏹️ 停止'}
          </span>
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => {
            fetchStatus();
            // 使用 LogViewer 的 refreshLogs 方法刷新日志
            if (logViewerRef.current) {
              logViewerRef.current.refreshLogs(serviceName);
            }
          }}
          style={{ minWidth: 'auto' }}
        >
          🔁 刷新
        </Button>
      </ButtonGroup>
      
      <LogViewer 
        ref={logViewerRef}
        service={serviceName}
        title={`${serviceDisplayName} 实时日志`}
      />
    </ServiceCard>
  );
};

export default ServiceControl;