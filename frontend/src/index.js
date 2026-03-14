import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { SettingsProvider } from './contexts/SettingsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <App />
        <Toaster position="top-center" />
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
