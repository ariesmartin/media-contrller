import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme, GlobalStyle } from './styles/global';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyle />
        <Dashboard />
      </>
    </ThemeProvider>
  );
}

export default App;