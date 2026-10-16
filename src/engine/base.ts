// Postos de trabalho da base (GDD, seção 9): a Forja produz ouro e a Mina, Fragmentos.
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
  // Ouro na Forja, Fragmentos na Mina, por criatura antes de raridade e afinidade.
  readonly porHora: number
}

export type Forja = {
  // Ids das criaturas da reserva que trabalham no posto.
  readonly trabalhadores: readonly number[]
  // Ouro produzido que ainda não fechou uma moeda inteira.
  readonly ouroFracionario: number
}

export type Mina = {
  readonly trabalhadores: readonly number[]
  readonly fragmentosFracionarios: number
}

export const FORJA_VAZIA: Forja = { trabalhadores: [], ouroFracionario: 0 }
export const MINA_VAZIA: Mina = { trabalhadores: [], fragmentosFracionarios: 0 }

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
  readonly mina: DadosDePosto<Tipo>
}

function producaoPorHora<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  posto: DadosDePosto<Tipo>,
  trabalhadores: readonly number[],
): number {
  let total = 0
  for (const id of trabalhadores) {
    const membro = estado.reserva.find((m) => m.id === id)
    if (!membro) continue
    const tipos = especieDo(configuracao.catalogo, membro.especie).tipos
    total += posto.porHora * multiplicadorDeRaridade(membro.genes) * afinidade(configuracao.tabela, posto, tipos)
  }
  return total
}

// O Cinto aumenta só a Forja.
export function ouroPorHoraDaForja<Tipo extends string>(configuracao: ConfiguracaoDaBase<Tipo>, estado: EstadoDoJogo<Tipo>): number {
  return aumentar(producaoPorHora(configuracao, estado, configuracao.forja, estado.forja.trabalhadores), estado, 'cinto')
}

export function fragmentosPorHoraDaMina<Tipo extends string>(configuracao: ConfiguracaoDaBase<Tipo>, estado: EstadoDoJogo<Tipo>): number {
  return producaoPorHora(configuracao, estado, configuracao.mina, estado.mina.trabalhadores)
}

// O que fecha uma unidade inteira entra no inventário; a fração fica guardada para o próximo período.
export function produzir<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  inicio: number,
  fim: number,
): { readonly estado: EstadoDoJogo<Tipo>; readonly ouro: number; readonly fragmentos: number } {
  const semTrabalhadores = estado.forja.trabalhadores.length === 0 && estado.mina.trabalhadores.length === 0
  if (fim <= inicio || semTrabalhadores) return { estado, ouro: 0, fragmentos: 0 }
  const horas = (fim - inicio) / HORA_MS
  const producaoDeOuro = estado.forja.ouroFracionario + ouroPorHoraDaForja(configuracao, estado) * horas
  const producaoDeFragmentos = estado.mina.fragmentosFracionarios + fragmentosPorHoraDaMina(configuracao, estado) * horas
  const ouro = Math.floor(producaoDeOuro)
  const fragmentos = Math.floor(producaoDeFragmentos)
  return {
    estado: {
      ...estado,
      inventario: { ...estado.inventario, ouro: estado.inventario.ouro + ouro, fragmentos: estado.inventario.fragmentos + fragmentos },
      forja: { ...estado.forja, ouroFracionario: producaoDeOuro - ouro },
      mina: { ...estado.mina, fragmentosFracionarios: producaoDeFragmentos - fragmentos },
    },
    ouro,
    fragmentos,
  }
}

// Uma criatura trabalha num posto por vez.
export function trabalhando<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): boolean {
  return estado.forja.trabalhadores.includes(id) || estado.mina.trabalhadores.includes(id)
}

function podeTrabalhar<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number, ocupadas: number, vagas: number, nome: string): boolean {
  if (!estado.reserva.some((m) => m.id === id)) throw new RangeError(`criatura fora da reserva: ${id}`)
  if (trabalhando(estado, id)) return false
  if (ocupadas >= vagas) throw new RangeError(`${nome} sem vaga`)
  return true
}

export function colocarNaForja<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  id: number,
): EstadoDoJogo<Tipo> {
  if (estado.mina.trabalhadores.includes(id)) throw new RangeError(`criatura trabalhando na Mina: ${id}`)
  if (!podeTrabalhar(estado, id, estado.forja.trabalhadores.length, configuracao.forja.vagas, 'Forja')) return estado
  return { ...estado, forja: { ...estado.forja, trabalhadores: [...estado.forja.trabalhadores, id] } }
}

export function tirarDaForja<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): EstadoDoJogo<Tipo> {
  return { ...estado, forja: { ...estado.forja, trabalhadores: estado.forja.trabalhadores.filter((t) => t !== id) } }
}

export function colocarNaMina<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  id: number,
): EstadoDoJogo<Tipo> {
  if (estado.forja.trabalhadores.includes(id)) throw new RangeError(`criatura trabalhando na Forja: ${id}`)
  if (!podeTrabalhar(estado, id, estado.mina.trabalhadores.length, configuracao.mina.vagas, 'Mina')) return estado
  return { ...estado, mina: { ...estado.mina, trabalhadores: [...estado.mina.trabalhadores, id] } }
}

export function tirarDaMina<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): EstadoDoJogo<Tipo> {
  return { ...estado, mina: { ...estado.mina, trabalhadores: estado.mina.trabalhadores.filter((t) => t !== id) } }
}
