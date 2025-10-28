import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './firebaseConfig'; // Importa para executar o código de inicialização do Firebase

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Renderiza a aplicação. A inicialização do Firebase acontece de forma síncrona
// quando o módulo firebaseConfig.ts é importado acima.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
