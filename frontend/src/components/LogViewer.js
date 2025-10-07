import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';
import { Card, Button as StyledButton } from '../styles/global';
import { logAPI } from '../services/api';

const LogContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  min-height: 500px;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} 0;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const LogTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.textPrimary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &::before {
    content: '📄';
    font-size: 1.2rem;
  }
`;

const LogControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const LogContent = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.glass};
  border: 1px solid ${props => props.theme.colors.glassBorder};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  height: 380px;
  min-height: 380px;
  overflow-y: auto;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 ${props => props.theme.spacing.md} ${props => props.theme.spacing.md};
  
  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(30, 30, 30, 0.5);
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(${props => props.theme.colors.primaryDark}, ${props => props.theme.colors.secondaryDark});
  }
`;

const LogEntry = styled.div`
  margin-bottom: 6px;
  padding: 6px ${props => props.theme.spacing.sm};
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  /* 根据日志内容中的关键词设置不同样式 */
  &[data-type="error"] {
    border-left: 3px solid ${props => props.theme.colors.danger};
    background-color: rgba(244, 67, 54, 0.05);
    color: #ff6b6b;
  }
  
  &[data-type="warn"] {
    border-left: 3px solid ${props => props.theme.colors.warning};
    background-color: rgba(255, 152, 0, 0.05);
    color: #ffd166;
  }
  
  &[data-type="info"] {
    border-left: 3px solid ${props => props.theme.colors.primary};
    background-color: rgba(0, 168, 255, 0.05);
    color: #4cc9f0;
  }
  
  &[data-type="debug"] {
    border-left: 3px solid ${props => props.theme.colors.secondary};
    background-color: rgba(156, 39, 176, 0.05);
    color: #c77dff;
  }
  
  &[data-type="success"] {
    border-left: 3px solid ${props => props.theme.colors.success};
    background-color: rgba(76, 175, 80, 0.05);
    color: #72ef6d;
  }
`;

const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const LogViewer = forwardRef(({ service, title = "服务日志" }, ref) => {
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);
  const logContainerRef = useRef(null);

  // 通过 useImperativeHandle 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    addLog: (logMessage) => {
      setLogs(prevLogs => {
        // 限制日志数量，避免过多内容影响性能
        const maxLogs = 500; // 限制为500条日志以保持性能
        const newLogs = [...prevLogs, {
          id: Date.now() + Math.random(),
          message: logMessage,
          timestamp: new Date().toISOString(),
          type: getLogType(logMessage) // 根据内容自动判断日志类型
        }];
        
        // 只保留最新的日志，实现瀑布效果
        return newLogs.length > maxLogs ? newLogs.slice(-maxLogs) : newLogs;
      });
    },
    clearLogs: () => {
      setLogs([]);
    },
    getLogs: () => logs,
    // 添加刷新日志的方法
    refreshLogs: async (serviceName) => {
      if (serviceName) {
        try {
          console.log(`正在获取 ${serviceName} 的日志...`);
          const response = await logAPI.getLog(serviceName, 100); // 获取最近100条日志
          console.log(`${serviceName} 日志响应:`, response.data);
          
          const logContent = response.data.log;
          
          // 将历史日志按行分割并逐行添加到日志查看器
          const logLines = logContent.split('\n').filter(line => line.trim() !== '');
          console.log(`${serviceName} 解析出的行数:`, logLines.length);
          
          // 清空现有日志
          setLogs([]);
          
          // 逐行添加历史日志
          const newLogs = logLines.map(logLine => ({
            id: Date.now() + Math.random(),
            message: logLine,
            timestamp: new Date().toISOString(),
            type: getLogType(logLine) // 根据内容自动判断日志类型
          })).slice(-500); // 限制为最多500条日志
          
          console.log(`${serviceName} 创建的新日志条目数:`, newLogs.length);
          setLogs(newLogs);
        } catch (error) {
          console.error(`获取${serviceName}历史日志失败:`, error);
          // 即使获取失败，也要确保清空现有日志或显示错误信息
          setLogs([{
            id: Date.now(),
            message: `获取日志失败: ${error.message}`,
            timestamp: new Date().toISOString(),
            type: 'error'
          }]);
        }
      } else {
        console.log('serviceName 未提供，无法刷新日志');
      }
    }
  }));

  // 根据日志内容判断日志类型
  const getLogType = (logMessage) => {
    const lowerMsg = logMessage.toLowerCase();
    if (lowerMsg.includes('error') || lowerMsg.includes('err')) {
      return 'error';
    } else if (lowerMsg.includes('warn') || lowerMsg.includes('warning')) {
      return 'warn';
    } else if (lowerMsg.includes('info')) {
      return 'info';
    } else if (lowerMsg.includes('debug')) {
      return 'debug';
    } else if (lowerMsg.includes('success') || lowerMsg.includes('ok') || lowerMsg.includes('done')) {
      return 'success';
    }
    return 'info'; // 默认类型
  };

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "auto" }); // 使用 "auto" 而不是 "smooth" 以获得瀑布效果
    }
  };

  // 检查是否在底部，控制自动滚动
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const container = logContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 如果滚动到底部，则启用自动滚动；否则禁用
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5; // 5px 容差
      setAutoScroll(isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 当启用自动滚动时，日志更新后立即滚动到底部（实现瀑布效果）
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [logs, autoScroll]);

  // 复制日志到剪贴板
  const copyLogs = async () => {
    try {
      const logText = logs.map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`).join('\n');
      await navigator.clipboard.writeText(logText);
      alert('日志已复制到剪贴板');
    } catch (err) {
      console.error('复制日志失败:', err);
      alert('复制日志失败');
    }
  };

  return (
    <LogContainer>
      <LogHeader>
        <LogTitle>{title}</LogTitle>
        <LogControls>
          <StyledButtonGroup>
            <StyledButton 
              variant={autoScroll ? "primary" : "secondary"} 
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? "关闭自动滚动" : "开启自动滚动"}
              style={{minWidth: 'auto', padding: '8px 12px', fontSize: '0.8rem'}}
            >
              {autoScroll ? '🔒' : '🔓'} 滚动
            </StyledButton>
            <StyledButton 
              variant="secondary" 
              onClick={() => setLogs([])}
              style={{minWidth: 'auto', padding: '8px 12px', fontSize: '0.8rem'}}
            >
              🗑️ 清空
            </StyledButton>
            <StyledButton 
              variant="secondary" 
              onClick={copyLogs}
              style={{minWidth: 'auto', padding: '8px 12px', fontSize: '0.8rem'}}
            >
              📋 复制
            </StyledButton>
          </StyledButtonGroup>
        </LogControls>
      </LogHeader>
      <LogContent ref={logContainerRef}>
        {logs.length === 0 ? (
          <div style={{ 
            color: '#666', 
            fontStyle: 'italic', 
            textAlign: 'center', 
            paddingTop: '150px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🪵</div>
              <div>暂无日志信息</div>
              <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>服务启动后将显示实时日志</div>
            </div>
          </div>
        ) : (
          logs.map((log) => (
            <LogEntry 
              key={log.id} 
              data-type={log.type}
            >
              <span style={{ color: '#9e9e9e', fontSize: '0.75rem', marginRight: '8px' }}>
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              {log.message}
            </LogEntry>
          ))
        )}
        <div ref={logEndRef} />
      </LogContent>
    </LogContainer>
  );
});

LogViewer.displayName = 'LogViewer';

export default LogViewer;