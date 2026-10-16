// Avança o jogo inteiro num período: caçada e produção da base.
import type { Gerador } from './aleatorio.ts'
import type { ConfiguracaoDaBase } from './base.ts'
import { produzir } from './base.ts'
import type { ConfiguracaoDaCacada, Evento } from './cacada.ts'
import { simularCacada } from './cacada.ts'
import type { Linhagem } from './cruzamento.ts'
import type { EstadoDoJogo } from './jogo.ts'

export type ConfiguracaoDoJogo<Tipo extends string> = ConfiguracaoDaCacada<Tipo> &
  ConfiguracaoDaBase<Tipo> & { readonly linhagens: readonly Linhagem[] }

export type Avanco<Tipo extends string> = {
  readonly estado: EstadoDoJogo<Tipo>
  readonly eventos: readonly Evento[]
  readonly ouroDaForja: number
  readonly fragmentosDaMina: number
}

// A Forja e a Mina produzem mesmo com a caçada pausada.
export function avancarJogo<Tipo extends string>(
  configuracao: ConfiguracaoDoJogo<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  inicio: number,
  fim: number,
  gerador: Gerador,
): Avanco<Tipo> {
  const base = produzir(configuracao, estado, inicio, fim)
  const cacada = simularCacada(configuracao, base.estado, inicio, fim, gerador)
  return { ...cacada, ouroDaForja: base.ouro, fragmentosDaMina: base.fragmentos }
}
