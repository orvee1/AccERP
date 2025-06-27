import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

console.log('main.jsx is executing');

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('Root element:', document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
