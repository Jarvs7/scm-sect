import React from 'react';
import ReactDOM from 'react-dom/client';
import "./styles/style.css";
import App from './app';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();