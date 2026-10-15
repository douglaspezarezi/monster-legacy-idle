import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { TelaDeErro } from './interface/TelaDeErro.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TelaDeErro>
      <App />
    </TelaDeErro>
  </StrictMode>,
)
