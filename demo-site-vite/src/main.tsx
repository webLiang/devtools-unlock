import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initDisableDevtool } from './devtools/disableDevtoolSetup';
import './index.css';
import App from './App.tsx';

// Init early to mimic real sites enabling anti-debug before app code.
initDisableDevtool();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
