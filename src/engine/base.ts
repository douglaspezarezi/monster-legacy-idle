// Postos de trabalho da base (GDD, seção 9): a Forja produz ouro, a Mina, Fragmentos, a Destilaria, Essências do tipo escolhido, e a Pesca, Pérolas.
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
  // Ouro na Forja, Fragmentos na Mina, Pérolas na Pesca, por criatura antes de raridade e afinidade.
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

export type Pesca = {
  readonly trabalhadores: readonly number[]
  readonly perolasFracionarias: number
}

// A Base especial: construída uma vez com Diamantes; o jogador escolhe o tipo destilado.
export type Destilaria<Tipo extends string> = {
  readonly construida: boolean
  readonly tipo: Tipo | null
  readonly trabalhadores: readonly number[]
  readonly essenciasFracionarias: number
}

export const FORJA_VAZIA: Forja = { trabalhadores: [], ouroFracionario: 0 }
export const MINA_VAZIA: Mina = { trabalhadores: [], fragmentosFracionarios: 0 }
export const PESCA_VAZIA: Pesca = { trabalhadores: [], perolasFracionarias: 0 }
export const DESTILARIA_VAZIA: Destilaria<never> = { construida: false, tipo: null, trabalhadores: [], essenciasFracionarias: 0 }

export const PRECO_DA_DESTILARIA = 300

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
  readonly pesca: DadosDePosto<Tipo>
  // Os tipos vêm da escolha do jogador, não do conteúdo.
  readonly destilaria: Omit<DadosDePosto<Tipo>, 'tipos'>
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

// O Cinto aumenta todos os postos.
export function ouroPorHoraDaForja<Tipo extends string>(configuracao: ConfiguracaoDaBase<Tipo>, estado: EstadoDoJogo<Tipo>): number {
  return aumentar(producaoPorHora(configuracao, estado, configuracao.forja, estado.forja.trabalhadores), estado, 'cinto')
}

export function fragmentosPorHoraDaMina<Tipo extends string>(configuracao: ConfiguracaoDaBase<Tipo>, estado: EstadoDoJogo<Tipo>): number {
  return aumentar(producaoPorHora(configuracao, estado, configuracao.mina, estado.mina.trabalhadores), estado, 'cinto')
}

export function perolasPorHoraDaPesca<Tipo extends string>(configuracao: ConfiguracaoDaBase<Tipo>, estado: EstadoDoJogo<Tipo>): number {
  return aumentar(producaoPorHora(configuracao, estado, configuracao.pesca, estado.pesca.trabalhadores), estado, 'cinto')
}

export function essenciasPorHoraDaDestilaria<Tipo extends string>(configuracao: ConfiguracaoDaBase<Tipo>, estado: EstadoDoJogo<Tipo>): number {
  const { tipo, trabalhadores } = estado.destilaria
  if (tipo === null) return 0
  return aumentar(producaoPorHora(configuracao, estado, { ...configuracao.destilaria, tipos: [tipo] }, trabalhadores), estado, 'cinto')
}

// O que fecha uma unidade inteira entra no inventário; a fração fica guardada para o próximo período.
export function produzir<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  inicio: number,
  fim: number,
): { readonly estado: EstadoDoJogo<Tipo>; readonly ouro: number; readonly fragmentos: number; readonly essencias: number; readonly perolas: number } {
  const { forja, mina, destilaria, pesca } = estado
  const semTrabalhadores = [forja, mina, destilaria, pesca].every((posto) => posto.trabalhadores.length === 0)
  if (fim <= inicio || semTrabalhadores) return { estado, ouro: 0, fragmentos: 0, essencias: 0, perolas: 0 }
  const horas = (fim - inicio) / HORA_MS
  const producaoDeOuro = forja.ouroFracionario + ouroPorHoraDaForja(configuracao, estado) * horas
  const producaoDeFragmentos = mina.fragmentosFracionarios + fragmentosPorHoraDaMina(configuracao, estado) * horas
  const producaoDeEssencias = destilaria.essenciasFracionarias + essenciasPorHoraDaDestilaria(configuracao, estado) * horas
  const producaoDePerolas = pesca.perolasFracionarias + perolasPorHoraDaPesca(configuracao, estado) * horas
  const ouro = Math.floor(producaoDeOuro)
  const fragmentos = Math.floor(producaoDeFragmentos)
  const essencias = Math.floor(producaoDeEssencias)
  const perolas = Math.floor(producaoDePerolas)
  const { inventario } = estado
  const tipo = destilaria.tipo
  return {
    estado: {
      ...estado,
      inventario: {
        ...inventario,
        ouro: inventario.ouro + ouro,
        fragmentos: inventario.fragmentos + fragmentos,
        perolas: inventario.perolas + perolas,
        essencias: essencias > 0 && tipo !== null ? { ...inventario.essencias, [tipo]: (inventario.essencias[tipo] ?? 0) + essencias } : inventario.essencias,
      },
      forja: { ...forja, ouroFracionario: producaoDeOuro - ouro },
      mina: { ...mina, fragmentosFracionarios: producaoDeFragmentos - fragmentos },
      destilaria: { ...destilaria, essenciasFracionarias: producaoDeEssencias - essencias },
      pesca: { ...pesca, perolasFracionarias: producaoDePerolas - perolas },
    },
    ouro,
    fragmentos,
    essencias,
    perolas,
  }
}

// Uma criatura trabalha num posto por vez.
export function trabalhando<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): boolean {
  return [estado.forja, estado.mina, estado.destilaria, estado.pesca].some((posto) => posto.trabalhadores.includes(id))
}

// Falso se a criatura já está neste posto; lança se está em outro, fora da reserva ou sem vaga.
function podeTrabalhar(trabalhadores: readonly number[], estado: EstadoDoJogo<string>, id: number, vagas: number, nome: string): boolean {
  if (!estado.reserva.some((m) => m.id === id)) throw new RangeError(`criatura fora da reserva: ${id}`)
  if (trabalhadores.includes(id)) return false
  if (trabalhando(estado, id)) throw new RangeError(`criatura trabalhando em outro posto: ${id}`)
  if (trabalhadores.length >= vagas) throw new RangeError(`${nome} sem vaga`)
  return true
}

export function colocarNaForja<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  id: number,
): EstadoDoJogo<Tipo> {
  if (!podeTrabalhar(estado.forja.trabalhadores, estado, id, configuracao.forja.vagas, 'Forja')) return estado
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
  if (!podeTrabalhar(estado.mina.trabalhadores, estado, id, configuracao.mina.vagas, 'Mina')) return estado
  return { ...estado, mina: { ...estado.mina, trabalhadores: [...estado.mina.trabalhadores, id] } }
}

export function tirarDaMina<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): EstadoDoJogo<Tipo> {
  return { ...estado, mina: { ...estado.mina, trabalhadores: estado.mina.trabalhadores.filter((t) => t !== id) } }
}

export function colocarNaPesca<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  id: number,
): EstadoDoJogo<Tipo> {
  if (!podeTrabalhar(estado.pesca.trabalhadores, estado, id, configuracao.pesca.vagas, 'Pesca')) return estado
  return { ...estado, pesca: { ...estado.pesca, trabalhadores: [...estado.pesca.trabalhadores, id] } }
}

export function tirarDaPesca<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): EstadoDoJogo<Tipo> {
  return { ...estado, pesca: { ...estado.pesca, trabalhadores: estado.pesca.trabalhadores.filter((t) => t !== id) } }
}

// Por que a Destilaria não pode ser construída; null quando pode.
export function impedimentoDaDestilaria<Tipo extends string>(estado: EstadoDoJogo<Tipo>): string | null {
  if (estado.destilaria.construida) return 'a Destilaria já foi construída'
  if (estado.inventario.diamantes < PRECO_DA_DESTILARIA) return `precisa de ${PRECO_DA_DESTILARIA} Diamantes`
  return null
}

export function construirDestilaria<Tipo extends string>(estado: EstadoDoJogo<Tipo>): EstadoDoJogo<Tipo> {
  const impedimento = impedimentoDaDestilaria(estado)
  if (impedimento) throw new RangeError(`não pode construir: ${impedimento}`)
  return {
    ...estado,
    destilaria: { ...estado.destilaria, construida: true },
    inventario: { ...estado.inventario, diamantes: estado.inventario.diamantes - PRECO_DA_DESTILARIA },
  }
}

// Trocar de tipo perde a fração da Essência em andamento.
export function escolherTipoDaDestilaria<Tipo extends string>(estado: EstadoDoJogo<Tipo>, tipo: Tipo): EstadoDoJogo<Tipo> {
  if (!estado.destilaria.construida) throw new RangeError('a Destilaria ainda não foi construída')
  if (estado.destilaria.tipo === tipo) return estado
  return { ...estado, destilaria: { ...estado.destilaria, tipo, essenciasFracionarias: 0 } }
}

export function colocarNaDestilaria<Tipo extends string>(
  configuracao: ConfiguracaoDaBase<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  id: number,
): EstadoDoJogo<Tipo> {
  if (!estado.destilaria.construida) throw new RangeError('a Destilaria ainda não foi construída')
  if (!podeTrabalhar(estado.destilaria.trabalhadores, estado, id, configuracao.destilaria.vagas, 'Destilaria')) return estado
  return { ...estado, destilaria: { ...estado.destilaria, trabalhadores: [...estado.destilaria.trabalhadores, id] } }
}

export function tirarDaDestilaria<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): EstadoDoJogo<Tipo> {
  return { ...estado, destilaria: { ...estado.destilaria, trabalhadores: estado.destilaria.trabalhadores.filter((t) => t !== id) } }
}
