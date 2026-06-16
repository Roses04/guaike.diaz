/**
 * PUNTO DE ENTRADA PRINCIPAL DE REACT (Vite)
 * 
 * Este archivo es lo primero que se ejecuta en el navegador.
 * Toma el componente principal <App /> y lo inyecta (renderiza)
 * dentro del div con id="root" en el archivo index.html.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Estilos globales y variables Tailwind
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // StrictMode ayuda a detectar errores comunes en React durante el desarrollo
  <StrictMode>
    <App />
  </StrictMode>,
)
