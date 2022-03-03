import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './main.css';

ReactDOM.render(
  <React.StrictMode>
    {/* <BrowserRouter basename='/demo-apps/satellite-explorer/dist'> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
