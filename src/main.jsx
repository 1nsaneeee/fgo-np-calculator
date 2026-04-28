import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';
import './global.css';

console.log(
  '%c FGO Calculator %c v3.0 ',
  'color:oklch(0.78 0.18 195);font-family:monospace;font-size:22px;font-weight:900;letter-spacing:3px',
  'color:oklch(0.58 0.02 240);font-family:monospace;font-size:12px'
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
