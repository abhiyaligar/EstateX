import React from 'react';
import AppRoutes from './routes/AppRoutes';
import LiquidChrome from './components/ui/LiquidChrome';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
