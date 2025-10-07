import React from 'react';
import styled from 'styled-components';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: ${props => 
    props.status === 'running' ? 'rgba(76, 175, 80, 0.1)' : 
    props.status === 'stopped' ? 'rgba(117, 117, 117, 0.1)' : 
    'rgba(255, 152, 0, 0.1)'
  };
  color: ${props => 
    props.status === 'running' ? props.theme.colors.success : 
    props.status === 'stopped' ? '#999' : 
    props.theme.colors.warning
  };
  border: 1px solid ${props => 
    props.status === 'running' ? 'rgba(76, 175, 80, 0.3)' : 
    props.status === 'stopped' ? 'rgba(117, 117, 117, 0.3)' : 
    'rgba(255, 152, 0, 0.3)'
  };
  font-size: 0.9rem;
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => 
    props.status === 'running' ? props.theme.colors.success : 
    props.status === 'stopped' ? '#999' : 
    props.theme.colors.warning
  };
`;

const StatusText = styled.span`
  font-weight: 500;
`;

const StatusIndicator = ({ status, text }) => {
  return (
    <StatusContainer status={status}>
      <StatusDot status={status} />
      <StatusText>{text || (status === 'running' ? '运行中' : status === 'stopped' ? '已停止' : '未知')}</StatusText>
    </StatusContainer>
  );
};

export default StatusIndicator;