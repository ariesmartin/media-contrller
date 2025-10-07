import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import { Container, Card, Title, SubTitle } from '../styles/global';
import ServiceControl from '../components/ServiceControl';
import Layout from '../components/Layout';

const DashboardContainer = styled(Container)`
  padding-top: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.xl};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(650px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const StatusBanner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.colors.glass};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.colors.glassBorder};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    text-align: center;
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'connected':
        return `
          background: rgba(76, 175, 80, 0.15);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.3);
        `;
      case 'error':
        return `
          background: rgba(244, 67, 54, 0.15);
          color: #f44336;
          border: 1px solid rgba(244, 67, 54, 0.3);
        `;
      default:
        return `
          background: rgba(255, 152, 0, 0.15);
          color: #ff9800;
          border: 1px solid rgba(255, 152, 0, 0.3);
        `;
    }
  }}
`;

const StatusInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  text-align: left;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    text-align: center;
  }
`;

const Dashboard = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // 连接到后端 WebSocket
    const newSocket = io('http://localhost:8003', {
      transports: ['websocket', 'polling'], // 指定传输方式
      timeout: 20000, // 20秒超时
    });

    newSocket.on('connect', () => {
      console.log('已连接到 WebSocket 服务器');
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', () => {
      console.log('已断开 WebSocket 连接');
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket 连接错误:', error);
      setConnectionStatus('error');
    });

    // 监听服务状态更新
    newSocket.on('status-update', (status) => {
      console.log('收到服务状态更新:', status);
    });

    // 监听 ComfyUI 日志
    newSocket.on('log-comfyui', (log) => {
      console.log('收到 ComfyUI 日志:', log.substring(0, 100) + '...');
    });

    // 监听 Media-API 日志
    newSocket.on('log-media-api', (log) => {
      console.log('收到 Media-API 日志:', log.substring(0, 100) + '...');
    });

    setSocket(newSocket);

    // 组件卸载时断开连接
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <Layout title="Media Controller - 服务管理面板">
      <DashboardContainer>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Title>Media Controller</Title>
          <SubTitle>智能服务管理面板</SubTitle>
        </div>
        
        <StatusBanner>
          <StatusInfo>
            <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: '1.2rem' }}>系统状态</h3>
            <p style={{ margin: 0, color: '#9e9e9e' }}>
              当前连接状态: 
              <ConnectionStatus status={connectionStatus}>
                {connectionStatus === 'connected' ? ' ✅ 已连接' : 
                 connectionStatus === 'error' ? ' ❌ 连接错误' : ' ⏸️ 未连接'}
              </ConnectionStatus>
            </p>
          </StatusInfo>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#9e9e9e' }}>实时管理 ComfyUI 和 Media-API 服务</p>
            <p style={{ margin: 0, color: '#9e9e9e' }}>监控服务状态和实时日志</p>
          </div>
        </StatusBanner>
        
        <p style={{ 
          color: '#9e9e9e', 
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          您可以在此面板中启动/停止 ComfyUI 和 Media-API 服务，并实时查看它们的日志。
          所有操作都会实时反映在状态和日志中。
        </p>

        <ServicesGrid>
          <ServiceControl 
            serviceName="comfyui" 
            serviceDisplayName="ComfyUI 服务" 
          />
          <ServiceControl 
            serviceName="media-api" 
            serviceDisplayName="Media-API 服务" 
          />
        </ServicesGrid>
      </DashboardContainer>
    </Layout>
  );
};

export default Dashboard;