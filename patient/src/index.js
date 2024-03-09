import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from "react";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {WalletProvider} from '@suiet/wallet-kit';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </StrictMode>
);

reportWebVitals();
