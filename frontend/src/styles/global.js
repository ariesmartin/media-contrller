// 全局样式和主题
import styled, { createGlobalStyle, keyframes } from 'styled-components';

// 创建动画
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 168, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 168, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 168, 255, 0); }
`;

// 全局样式
export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #0a0a0a 0%, #121212 100%);
    color: #e0e0e0;
    line-height: 1.6;
    overflow-x: hidden;
    min-height: 100vh;
  }

  button {
    border: none;
    cursor: pointer;
    outline: none;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  input, textarea, select {
    font-family: inherit;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #0a0a0a;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

// 主题配置
export const theme = {
  colors: {
    primary: '#00a8ff',      // 科技蓝
    primaryDark: '#0077b6',  // 深科技蓝
    secondary: '#9c27b0',    // 紫色
    secondaryDark: '#7b1fa2', // 深紫色
    success: '#4caf50',      // 绿色
    warning: '#ff9800',      // 橙色
    danger: '#f44336',       // 红色
    surface: '#1a1a1a',      // 深色表面
    onSurface: '#ffffff',    // 表面内容颜色
    background: '#0a0a0a',   // 背景颜色
    card: '#1e1e1e',         // 卡片背景
    cardBorder: '#2a2a2a',   // 卡片边框
    textPrimary: '#e0e0e0',  // 主要文字
    textSecondary: '#9e9e9e', // 次要文字
    textDisabled: '#616161',  // 禁用文字
    glass: 'rgba(30, 30, 30, 0.7)', // 玻璃效果
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
  },
  shadows: {
    sm: '0 4px 6px rgba(0, 0, 0, 0.1)',
    md: '0 6px 12px rgba(0, 0, 0, 0.2)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.3)',
  },
  breakpoints: {
    sm: '600px',
    md: '960px',
    lg: '1280px',
  },
};

// 通用容器
export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

// 卡片组件
export const Card = styled.div`
  background: ${props => props.theme.colors.glass};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.colors.glassBorder};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

// 按钮组件
export const Button = styled.button`
  padding: 12px 24px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  min-width: 120px;
  position: relative;
  overflow: hidden;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary});
          color: white;
          border: 1px solid ${props.theme.colors.primary};

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${props.theme.colors.primaryDark}, ${props.theme.colors.secondaryDark});
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 168, 255, 0.3);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255, 255, 255, 0.05);
          color: ${props.theme.colors.textPrimary};
          border: 1px solid ${props.theme.colors.textSecondary};

          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1);
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, ${props.theme.colors.danger}, #d32f2f);
          color: white;
          border: 1px solid ${props.theme.colors.danger};

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #d32f2f, #b71c1c);
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
          }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, ${props.theme.colors.success}, #2e7d32);
          color: white;
          border: 1px solid ${props.theme.colors.success};

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #2e7d32, #1b5e20);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          }
        `;
      default:
        return `
          background: ${props.theme.colors.cardBorder};
          color: ${props.theme.colors.textPrimary};
          border: 1px solid ${props.theme.colors.cardBorder};

          &:hover:not(:disabled) {
            background: #444;
          }
        `;
    }
  }}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    pointer-events: none;
  }
  
  &:hover::before {
    transform: translateX(0);
  }
`;

// 文本区域组件
export const TextArea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.cardBorder};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textPrimary};
  font-family: 'Courier New', monospace;
  resize: vertical;
  min-height: 200px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 168, 255, 0.2);
  }
`;

// 输入框组件
export const Input = styled.input`
  width: 100%;
  padding: 12px ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.cardBorder};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textPrimary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 168, 255, 0.2);
  }
`;

// 标题组件
export const Title = styled.h1`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 2.5rem;
  margin-bottom: ${props => props.theme.spacing.md};
  text-align: center;
  background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

// 副标题组件
export const SubTitle = styled.h2`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.5rem;
  margin-bottom: ${props => props.theme.spacing.md};
  padding-bottom: ${props => props.theme.spacing.sm};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
    border-radius: 2px;
  }
`;

// 状态指示器
export const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'running':
        return `
          background: rgba(76, 175, 80, 0.15);
          color: ${props.theme.colors.success};
          border: 1px solid rgba(76, 175, 80, 0.3);
        `;
      case 'stopped':
        return `
          background: rgba(158, 158, 158, 0.15);
          color: #9e9e9e;
          border: 1px solid rgba(158, 158, 158, 0.3);
        `;
      case 'error':
        return `
          background: rgba(244, 67, 54, 0.15);
          color: ${props.theme.colors.danger};
          border: 1px solid rgba(244, 67, 54, 0.3);
        `;
      default:
        return `
          background: rgba(255, 152, 0, 0.15);
          color: ${props.theme.colors.warning};
          border: 1px solid rgba(255, 152, 0, 0.3);
        `;
    }
  }}
`;