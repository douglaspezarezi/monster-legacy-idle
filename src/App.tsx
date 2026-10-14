import { Cacada } from './interface/Cacada.tsx'
import { EscolhaDoInicial } from './interface/EscolhaDoInicial.tsx'
import { ResumoDaVolta } from './interface/ResumoDaVolta.tsx'
import { useJogo } from './interface/useJogo.ts'

export function App() {
  const { sessao, volta, comecar, executar, fecharVolta } = useJogo()
  return (
    <main className="app">
      <h1>Monster Legacy Idle</h1>
      {volta && <ResumoDaVolta volta={volta} aoFechar={fecharVolta} />}
      {sessao ? <Cacada sessao={sessao} executar={executar} /> : <EscolhaDoInicial aoEscolher={comecar} />}
    </main>
  )
}
