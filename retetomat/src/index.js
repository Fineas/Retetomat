import React from 'react';
import { StrictMode } from "react";
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {WalletProvider} from '@suiet/wallet-kit';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </StrictMode>
);

reportWebVitals();
