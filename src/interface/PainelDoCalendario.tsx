// Calendário de presença: 28 casas, uma por dia em que o jogo é aberto.
import { CALENDARIO } from '../conteudo/calendario.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import type { ItemDoCalendario } from '../engine/calendario.ts'
import { diaLocal, podeResgatar, resgatar } from '../engine/calendario.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly agora: number; readonly executar: (comando: Comando) => void }

const NOME_DO_ITEM: Readonly<Record<ItemDoCalendario, string>> = {
  capsulas: 'Cápsulas',
  tonicosDeCura: 'Tônicos de Cura',
  tonicosDeRetorno: 'Tônicos de Retorno',
  perolas: 'Pérolas',
  fragmentos: 'Fragmentos',
  diamantes: 'Diamantes',
}

// O dia vira à meia-noite do fuso deste navegador.
function hoje(agora: number): number {
  return diaLocal(agora, new Date(agora).getTimezoneOffset())
}

export function PainelDoCalendario({ estado, agora, executar }: Props) {
  const { casa } = estado.calendario
  const liberada = podeResgatar(estado, hoje(agora))
  const premio = CALENDARIO[casa]
  return (
    <section className="painel calendario">
      <h3>Calendário de presença</h3>
      <p>Cada dia em que você abre o jogo libera a próxima casa. Faltar um dia não perde nada: a casa espera.</p>
      <ol className="casas">
        {CALENDARIO.map((p, i) => {
          const estadoDaCasa = i < casa ? 'resgatada' : i === casa ? (liberada ? 'liberada' : 'amanha') : 'futura'
          return (
            <li key={i} className={`casa ${estadoDaCasa} ${p.item}`} title={`Dia ${i + 1}: ${p.quantidade} ${NOME_DO_ITEM[p.item]}`}>
              <small>{i + 1}</small>
              <span>{i < casa ? '✓' : p.quantidade}</span>
            </li>
          )
        })}
      </ol>
      <div className="resgate">
        <span>
          Dia {casa + 1}: {premio.quantidade} {NOME_DO_ITEM[premio.item]}
        </span>
        <button disabled={!liberada} onClick={() => executar((e, t) => resgatar(CALENDARIO, e, hoje(t)))}>
          {liberada ? 'Resgatar' : 'Volte amanhã'}
        </button>
      </div>
    </section>
  )
}
