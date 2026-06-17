/**
 * PUNTO DE ENTRADA PRINCIPAL DE REACT (Vite)
 * 
 * Este archivo es lo primero que se ejecuta en el navegador.
 * Toma el componente principal <App /> y lo inyecta (renderiza)
 * dentro del div con id="root" en el archivo index.html.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
