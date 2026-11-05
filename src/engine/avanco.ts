// Avança o jogo inteiro num período: caçada e produção da base.
import type { Gerador } from './aleatorio.ts'
import type { ConfiguracaoDaBase } from './base.ts'
import { produzir } from './base.ts'
import type { ConfiguracaoDaCacada, Evento } from './cacada.ts'
import { simularCacada } from './cacada.ts'
import type { Conquista } from './conquistas.ts'
import { conferirConquistas } from './conquistas.ts'
import type { Linhagem } from './cruzamento.ts'
import type { DadosDeIlha } from './ilhas.ts'
import type { DadosDoMercado } from './mercado.ts'
import { atualizarMercado } from './mercado.ts'
import type { EstadoDoJogo } from './jogo.ts'

export type ConfiguracaoDoJogo<Tipo extends string> = ConfiguracaoDaCacada<Tipo> &
  ConfiguracaoDaBase<Tipo> & {
    readonly linhagens: readonly Linhagem[]
    readonly ilhas: readonly DadosDeIlha[]
    readonly mercado: DadosDoMercado
    readonly conquistas: readonly Conquista[]
  }

export type Avanco<Tipo extends string> = {
  readonly estado: EstadoDoJogo<Tipo>
  readonly eventos: readonly Evento[]
  readonly ouroDaForja: number
  readonly fragmentosDaMina: number
}

// A Forja e a Mina produzem mesmo com a caçada pausada. O estoque do Mercado é sorteado no fim, para não mudar os sorteios da caçada.
// As conquistas são conferidas no fim de cada avanço, o que também cobre os comandos dados desde o anterior.
export function avancarJogo<Tipo extends string>(
  configuracao: ConfiguracaoDoJogo<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  inicio: number,
  fim: number,
  gerador: Gerador,
): Avanco<Tipo> {
  const base = produzir(configuracao, estado, inicio, fim)
  const cacada = simularCacada(configuracao, base.estado, inicio, fim, gerador)
  const mercado = atualizarMercado(configuracao, cacada.estado, fim, gerador)
  const { estado: estadoFinal, concluidas } = conferirConquistas(configuracao.conquistas, configuracao.catalogo, mercado)
  const eventos = [...cacada.eventos, ...concluidas.map((c) => ({ tipo: 'conquista' as const, instante: fim, nome: c.nome, diamantes: c.diamantes }))]
  return { estado: estadoFinal, eventos, ouroDaForja: base.ouro, fragmentosDaMina: base.fragmentos }
}
