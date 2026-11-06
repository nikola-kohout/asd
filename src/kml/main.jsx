import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import KmlApp from './KmlApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KmlApp />
  </StrictMode>,
)
