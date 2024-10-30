import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.tsx';
// Styles
import '@/styles/fonts.css';
import '@/index.css';
// Store

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
