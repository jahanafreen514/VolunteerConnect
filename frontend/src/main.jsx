import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Automatically reload the page if a new deployment changes chunk hashes or dynamic imports fail
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const reloadKey = 'vc_chunk_reload_retry';
  if (!sessionStorage.getItem(reloadKey)) {
    sessionStorage.setItem(reloadKey, 'true');
    window.location.reload();
  }
});

// Clear reload guard once the application renders cleanly
window.addEventListener('load', () => {
  sessionStorage.removeItem('vc_chunk_reload_retry');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
