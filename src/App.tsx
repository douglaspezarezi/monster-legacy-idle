import { Cacada } from './interface/Cacada.tsx'
import { EscolhaDoInicial } from './interface/EscolhaDoInicial.tsx'
import { PainelDaNuvem } from './interface/PainelDaNuvem.tsx'
import { PainelDeCopia } from './interface/PainelDeCopia.tsx'
import { PainelDePreferencias } from './interface/PainelDePreferencias.tsx'
import { usePreferencias } from './interface/preferencias.ts'
import { ResumoDaVolta } from './interface/ResumoDaVolta.tsx'
import { useJogo } from './interface/useJogo.ts'
import { useNuvem } from './interface/useNuvem.ts'
import { useSom } from './interface/useSom.ts'
import { useTravaDaAba } from './interface/useTravaDaAba.ts'

export function App() {
  const { situacao, jogarAqui } = useTravaDaAba()
  if (situacao === 'dona') return <Jogo />
  return (
    <main className="app">
      <h1>Monster Legacy Idle</h1>
      {situacao === 'outra-aba' && (
        <section className="painel aviso-de-aba">
          <h2>O jogo está aberto em outra aba</h2>
          <p>Só uma aba joga por vez, para uma não gravar por cima da outra. Quando a outra aba fechar, esta assume sozinha.</p>
          <button onClick={jogarAqui}>Jogar nesta aba</button>
        </section>
      )}
    </main>
  )
}

// Montado só na aba dona: ao assumir, relê o save mais recente.
function Jogo() {
  const { sessao, volta, comecar, executar, fecharVolta, exportar, importar } = useJogo()
  const nuvem = useNuvem(exportar, importar)
  const { preferencias, mudar } = usePreferencias()
  useSom(sessao, preferencias)
  return (
    <main className="app">
      <h1>Monster Legacy Idle</h1>
      <PainelDaNuvem {...nuvem} />
      {volta && <ResumoDaVolta volta={volta} aoFechar={fecharVolta} />}
      {sessao ? <Cacada sessao={sessao} executar={executar} modoLeve={preferencias.modoLeve} /> : <EscolhaDoInicial aoEscolher={comecar} />}
      <PainelDePreferencias preferencias={preferencias} mudar={mudar} />
      <PainelDeCopia temJogo={sessao !== null} exportar={exportar} importar={importar} />
    </main>
  )
}
