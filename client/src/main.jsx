import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { TravellerAuthProvider } from './context/TravellerAuthContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TravellerAuthProvider>
        <App />
      </TravellerAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
