import React from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient(135deg, ${props => props.theme.colors.background} 0%, #121212 100%);
  color: ${props => props.theme.colors.textPrimary};
  display: flex;
  flex-direction: column;
`;

const LayoutHeader = styled.header`
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.cardBorder};
  padding: ${props => props.theme.spacing.md};
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${props => props.theme.spacing.md};
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  background: linear-gradient(90deg, ${props => props.theme.colors.primary}, #9c27b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const LayoutMain = styled.main`
  flex: 1;
`;

const LayoutFooter = styled.footer`
  background-color: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.cardBorder};
  padding: ${props => props.theme.spacing.md};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: auto;
`;

const Layout = ({ children, title }) => {
  return (
    <LayoutContainer>
      <LayoutHeader>
        <HeaderContent>
          <HeaderTitle>{title}</HeaderTitle>
          <HeaderActions>
            <span style={{ color: '#9e9e9e', fontSize: '0.9rem' }}>
              Media Controller v1.0
            </span>
          </HeaderActions>
        </HeaderContent>
      </LayoutHeader>
      
      <LayoutMain>
        {children}
      </LayoutMain>
      
      <LayoutFooter>
        <p>© 2025 Media Controller - 服务管理面板</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          实时监控 ComfyUI 和 Media-API 服务
        </p>
      </LayoutFooter>
    </LayoutContainer>
  );
};

export default Layout;