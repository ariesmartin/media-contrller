import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { serviceAPI } from '../services/api';
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
      // 清空日志
      if (logViewerRef.current) {
        logViewerRef.current.clearLogs();
      }
      fetchStatus();
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
      // 清空日志
      if (logViewerRef.current) {
        logViewerRef.current.clearLogs();
      }
    } catch (error) {
      console.error(`停止${serviceDisplayName}失败:`, error);
    } finally {
      setIsLoading(false);
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
        setStatus(currentServiceStatus);
      }
    });

    setSocket(newSocket);

    // 组件卸载时断开连接
    return () => {
      newSocket.close();
    };
  }, [serviceName]);

  // 组件挂载时获取初始状态
  useEffect(() => {
    fetchStatus();
    
    // 设置定时器定期更新状态（每5秒）
    const statusInterval = setInterval(fetchStatus, 5000);
    
    return () => {
      clearInterval(statusInterval);
    };
  }, [serviceName]);

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
          onClick={fetchStatus}
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