import { Cacada } from './interface/Cacada.tsx'
import { EscolhaDoInicial } from './interface/EscolhaDoInicial.tsx'
import { PainelDaNuvem } from './interface/PainelDaNuvem.tsx'
import { ResumoDaVolta } from './interface/ResumoDaVolta.tsx'
import { useJogo } from './interface/useJogo.ts'
import { useNuvem } from './interface/useNuvem.ts'

export function App() {
  const { sessao, volta, comecar, executar, fecharVolta, exportar, importar } = useJogo()
  const nuvem = useNuvem(exportar, importar)
  return (
    <main className="app">
      <h1>Monster Legacy Idle</h1>
      <PainelDaNuvem {...nuvem} />
      {volta && <ResumoDaVolta volta={volta} aoFechar={fecharVolta} />}
      {sessao ? <Cacada sessao={sessao} executar={executar} /> : <EscolhaDoInicial aoEscolher={comecar} />}
    </main>
  )
}
