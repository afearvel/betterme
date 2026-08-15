import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { seedIfEmpty } from './db/db.js'
import './index.css'

// Deja la base de datos lista (sobres y ajustes por defecto) antes de pintar.
await seedIfEmpty()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HashRouter: las URLs quedan como /#/finanzas. Es lo que funciona en
        GitHub Pages sin configurar nada en el servidor. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
