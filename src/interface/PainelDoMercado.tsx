// Mercado da Cidade: o estoque do dia, com preço à vista.
import { CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import { comprarNoMercado, impedimentoDaCompra, proximaTroca } from '../engine/mercado.ts'
import { NOME_DA_RARIDADE, formatarDuracao } from './textos.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly agora: number; readonly executar: (comando: Comando) => void }

export function PainelDoMercado({ estado, agora, executar }: Props) {
  const dados = CONFIGURACAO.mercado
  if (estado.era < dados.era) return null
  return (
    <section className="painel mercado">
      <h3>Mercado da Cidade</h3>
      <p>
        Matrizes a preço fixo em ouro. O estoque troca à meia-noite de Brasília, daqui a{' '}
        {formatarDuracao(proximaTroca(dados, agora) - agora)}.
      </p>
      <ul className="lista">
        {estado.mercado.ofertas.map((oferta, i) => {
          const impedimento = impedimentoDaCompra(dados, estado, i)
          return (
            <li key={`${estado.mercado.dia}-${i}`}>
              <span>
                Matriz: {oferta.especie} {NOME_DA_RARIDADE[oferta.raridade]} · {oferta.preco.toLocaleString('pt-BR')} de ouro
              </span>
              <button
                disabled={impedimento !== null}
                title={impedimento ?? undefined}
                onClick={() => executar((e) => comprarNoMercado(dados, e, i))}
              >
                {oferta.comprada ? 'Comprada' : 'Comprar'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
