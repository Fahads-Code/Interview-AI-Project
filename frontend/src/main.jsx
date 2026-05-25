import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { AuthProvider } from './features/auth/services/auth.context.jsx' // ← add karo
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  // </StrictMode>,
)
