import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from "./contexts/AuthContext";
import './styles/globals.css';
import './index.css';
import { Toaster } from 'sonner@2.0.3';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
    <App />
    </AuthProvider>
    <Toaster position="top-center" richColors />
  </React.StrictMode>
);
