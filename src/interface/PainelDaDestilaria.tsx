// Destilaria, a Base especial: construção com Diamantes e escolha do tipo destilado.
import { CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { TIPOS } from '../conteudo/tipos.ts'
import {
  PRECO_DA_DESTILARIA,
  construirDestilaria,
  escolherTipoDaDestilaria,
  essenciasPorHoraDaDestilaria,
  impedimentoDaDestilaria,
} from '../engine/base.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly executar: (comando: Comando) => void }

export function PainelDaDestilaria({ estado, executar }: Props) {
  const { destilaria } = estado
  const vagas = CONFIGURACAO.destilaria.vagas
  if (!destilaria.construida) {
    const impedimento = impedimentoDaDestilaria(estado)
    return (
      <>
        <h3>Destilaria</h3>
        <p>
          Produz Essências do tipo que você escolher, também com o jogo fechado. Serve para despertar monstros de tipos que você não caça.
        </p>
        <button disabled={impedimento !== null} title={impedimento ?? undefined} onClick={() => executar((e) => construirDestilaria(e))}>
          Construir por {PRECO_DA_DESTILARIA} Diamantes
        </button>
      </>
    )
  }
  const porHora = essenciasPorHoraDaDestilaria(CONFIGURACAO, estado)
  return (
    <>
      <h3>
        Destilaria ({destilaria.trabalhadores.length}/{vagas})
      </h3>
      <label className="opcao">
        Tipo destilado
        <select
          value={destilaria.tipo ?? ''}
          onChange={(ev) => {
            const tipo = TIPOS.find((t) => t === ev.target.value)
            if (tipo) executar((e) => escolherTipoDaDestilaria(e, tipo))
          }}
        >
          {destilaria.tipo === null && <option value="">Escolha um tipo</option>}
          {TIPOS.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>
      <p>
        {destilaria.tipo === null
          ? 'Escolha um tipo para começar.'
          : `Produz ${porHora.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} Essência de ${destilaria.tipo} por hora. Monstros de ${destilaria.tipo} rendem +25%; os de tipos que vencem ${destilaria.tipo}, −50%. Trocar de tipo perde a fração em andamento.`}
      </p>
    </>
  )
}
