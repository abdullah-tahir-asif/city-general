import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { FirebaseProvider } from './context/FirebaseContext';
import { ToastProvider } from './components/Toast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </FirebaseProvider>
  </StrictMode>,
);
