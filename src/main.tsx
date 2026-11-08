import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Geliştirme sırasında mağaza durumunu tarayıcı konsolundan incelemek için
if (import.meta.env.DEV) {
  void import('@/lib/store').then((m) => {
    ;(window as unknown as Record<string, unknown>).__pc = m
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
