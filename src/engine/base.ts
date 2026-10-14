// Postos de trabalho da base (GDD, seção 9). No F4 só a Forja, que produz ouro.
import type { Catalogo } from './especie.ts'
import { especieDo } from './especie.ts'
import { aumentar } from './equipamentos.ts'
import { multiplicadorDeRaridade } from './genes.ts'
import type { EstadoDoJogo } from './jogo.ts'
import type { TabelaDeTipos } from './multiplicador-de-tipo.ts'

export type DadosDePosto<Tipo extends string> = {
  readonly nome: string
  readonly tipos: readonly Tipo[]
  readonly vagas: number
  readonly ouroPorHora: number
}

export type Forja = {
  // Ids das criaturas da reserva que trabalham no posto.
  readonly trabalhadores: readonly number[]
  // Ouro produzido que ainda não fechou uma moeda inteira.
  readonly ouroFracionario: number
}

export const FORJA_VAZIA: Forja = { trabalhadores: [], ouroFracionario: 0 }

export const AFINIDADE_CERTA = 1.25
export const AFINIDADE_OPOSTA = 0.5

const HORA_MS = 60 * 60 * 1000

// +25% com um tipo do posto; −50% com um tipo que vence um tipo do posto; a afinidade certa prevalece.
export function afinidade<Tipo extends string>(tabela: TabelaDeTipos<Tipo>, posto: DadosDePosto<Tipo>, tipos: readonly Tipo[]): number {
  if (tipos.some((t) => posto.tipos.includes(t))) return AFINIDADE_CERTA
  if (tipos.some((t) => posto.tipos.some((p) => tabela(t, p) === 'vantagem'))) return AFINIDADE_OPOSTA
  return 1
}

export type ConfiguracaoDaBase<Tipo extends string> = {
  readonly tabela: TabelaDeTipos<Tipo>
  readonly catalogo: Catalogo<Tipo>
  readonly forja: DadosDePosto<Tipo>
}

export function ouroPorHoraDaForja<Tipo extends string>(configuracao: ConfiguracaoDaBase<Tipo>, estado: EstadoDoJogo<Tipo>): number {
  let total = 0
  for (const id of estado.forja.trabalhadores) {
    const membro = estado.reserva.find((m) => m.id === id)
    if (!membro) continue
    const tipos = especieDo(configuracao.catalogo, membro.especie).tipos
    total += configuracao.forja.ouroPorHora * multiplicadorDeRaridade(membro.genes) * afinidade(configuracao.tabela, configuracao.forja, tipos)
  }
  return aumentar(total, estado, 'cinto')
}

// O ouro inteiro entra no inventário; a fração fica guardada para o próximo período.
export function produzir<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  inicio: number,
  fim: number,
): { readonly estado: EstadoDoJogo<Tipo>; readonly ouro: number } {
  if (fim <= inicio || estado.forja.trabalhadores.length === 0) return { estado, ouro: 0 }
  const producao = estado.forja.ouroFracionario + (ouroPorHoraDaForja(configuracao, estado) * (fim - inicio)) / HORA_MS
  const ouro = Math.floor(producao)
  return {
    estado: {
      ...estado,
      inventario: { ...estado.inventario, ouro: estado.inventario.ouro + ouro },
      forja: { ...estado.forja, ouroFracionario: producao - ouro },
    },
    ouro,
  }
}

export function colocarNaForja<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  id: number,
): EstadoDoJogo<Tipo> {
  if (!estado.reserva.some((m) => m.id === id)) throw new RangeError(`criatura fora da reserva: ${id}`)
  if (estado.forja.trabalhadores.includes(id)) return estado
  if (estado.forja.trabalhadores.length >= configuracao.forja.vagas) throw new RangeError('Forja sem vaga')
  return { ...estado, forja: { ...estado.forja, trabalhadores: [...estado.forja.trabalhadores, id] } }
}

export function tirarDaForja<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): EstadoDoJogo<Tipo> {
  return { ...estado, forja: { ...estado.forja, trabalhadores: estado.forja.trabalhadores.filter((t) => t !== id) } }
}

export function trabalhando<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): boolean {
  return estado.forja.trabalhadores.includes(id)
}
