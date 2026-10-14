import { Cacada } from './interface/Cacada.tsx'
import { EscolhaDoInicial } from './interface/EscolhaDoInicial.tsx'
import { useJogo } from './interface/useJogo.ts'

export function App() {
  const { sessao, comecar, executar } = useJogo()
  return (
    <main className="app">
      <h1>Monster Legacy Idle</h1>
      {sessao ? <Cacada sessao={sessao} executar={executar} /> : <EscolhaDoInicial aoEscolher={comecar} />}
    </main>
  )
}
