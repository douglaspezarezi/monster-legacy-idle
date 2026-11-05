// Chocadeira e Santuário: os ovos do cruzamento com o tempo que falta para chocar.
import type { Tipo } from '../conteudo/tipos.ts'
import { raridadeDosGenes } from '../engine/genes.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import type { Ovo } from '../engine/ovos.ts'
import { MULTIPLICADOR_DO_SANTUARIO, PRECO_DO_SANTUARIO, VAGAS_DA_CHOCADEIRA, construirSantuario, impedimentoDoSantuario } from '../engine/ovos.ts'
import { NOME_DA_RARIDADE, formatarDuracao } from './textos.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly agora: number; readonly executar: (comando: Comando) => void }

const MINUTO_MS = 60 * 1000

function DescricaoDoOvo({ ovo, agora }: { readonly ovo: Ovo; readonly agora: number }) {
  const falta = ovo.prontoEm - agora
  return (
    <span>
      Ovo de {ovo.filhote.especie} {NOME_DA_RARIDADE[raridadeDosGenes(ovo.filhote.genes)]} ·{' '}
      {falta > 0 ? `choca em ${formatarDuracao(Math.ceil(falta / MINUTO_MS) * MINUTO_MS)}` : 'pronto, esperando espaço na reserva'}
    </span>
  )
}

export function PainelDosOvos({ estado, agora, executar }: Props) {
  const { chocadeira, santuario } = estado
  const impedimento = impedimentoDoSantuario(estado)
  return (
    <section className="painel ovos">
      <h3>
        Chocadeira ({chocadeira.length}/{VAGAS_DA_CHOCADEIRA})
      </h3>
      <p>O cruzamento gera um ovo, que choca também com o jogo fechado. Quanto mais raro o filhote, mais tempo leva: de 10 minutos a 5 h 20.</p>
      {chocadeira.length > 0 && (
        <ul className="lista">
          {chocadeira.map((ovo, i) => (
            <li key={i}>
              <DescricaoDoOvo ovo={ovo} agora={agora} />
            </li>
          ))}
        </ul>
      )}
      <h3>Santuário prismático</h3>
      {santuario.construido ? (
        <>
          <p>
            Um ovo épico ou melhor que choca aqui tem {MULTIPLICADOR_DO_SANTUARIO} vezes a chance de sair prismático.
          </p>
          {santuario.ovo ? <DescricaoDoOvo ovo={santuario.ovo} agora={agora} /> : <p>Vazio.</p>}
        </>
      ) : (
        <>
          <p>
            Uma vaga de ovo a mais, em que o ovo épico ou melhor tem {MULTIPLICADOR_DO_SANTUARIO} vezes a chance de sair prismático.
          </p>
          <button disabled={impedimento !== null} title={impedimento ?? undefined} onClick={() => executar((e) => construirSantuario(e))}>
            Construir por {PRECO_DO_SANTUARIO} Diamantes
          </button>
        </>
      )}
    </section>
  )
}
