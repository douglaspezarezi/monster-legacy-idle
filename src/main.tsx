import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { ForaDeQuadro } from './interface/ForaDeQuadro.tsx'
import { estaEmQuadro } from './interface/quadro.ts'
import { TelaDeErro } from './interface/TelaDeErro.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TelaDeErro>
      {estaEmQuadro() ? <ForaDeQuadro /> : <App />}
    </TelaDeErro>
  </StrictMode>,
)
