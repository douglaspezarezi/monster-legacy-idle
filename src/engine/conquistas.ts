// Conquistas, Diamantes e espaços na reserva (GDD, seção 13).
import type { Criatura } from './criatura.ts'
import type { Catalogo } from './especie.ts'
import type { Raridade } from './genes.ts'
import { FAIXAS_DE_RARIDADE, raridadeDosGenes } from './genes.ts'
import { formaDa } from './evolucao.ts'
import type { EstadoDoJogo } from './jogo.ts'

// Contam a vida toda e não zeram no reset de Era.
export type Contadores = {
  readonly abates: number
  readonly chefes: number
  readonly capturas: number
  readonly cruzamentos: number
  readonly comprasNoMercado: number
  readonly pergaminhosUsados: number
  // Índices das ilhas com o andar 10 vencido, sem repetição.
  readonly ilhasVencidas: readonly number[]
}

export const CONTADORES_ZERADOS: Contadores = {
  abates: 0,
  chefes: 0,
  capturas: 0,
  cruzamentos: 0,
  comprasNoMercado: 0,
  pergaminhosUsados: 0,
  ilhasVencidas: [],
}

// O que cada conquista mede. As de raridade contam os monstros do jogador com aquela raridade ou melhor.
export type Medida =
  | 'abates'
  | 'chefes'
  | 'capturas'
  | 'cruzamentos'
  | 'registro'
  | 'era'
  | 'nivel'
  | 'forma'
  | 'epicas'
  | 'lendarias'
  | 'miticas'
  | 'prismaticas'
  | 'despertas'
  | 'ilhas'
  | 'mercado'
  | 'pergaminhos'

export type Conquista = {
  readonly id: string
  readonly nome: string
  readonly grupo: string
  readonly medida: Medida
  readonly meta: number
  readonly diamantes: number
}

export const ESPACOS_POR_COMPRA = 10
export const PRECO_DOS_ESPACOS = 100
export const MAXIMO_DE_ESPACOS = 100

function membros<Tipo extends string>(estado: EstadoDoJogo<Tipo>): Criatura[] {
  return [estado.ativa, ...estado.reserva]
}

function ordem(raridade: Raridade): number {
  return FAIXAS_DE_RARIDADE.findIndex((f) => f.raridade === raridade)
}

function comRaridade<Tipo extends string>(estado: EstadoDoJogo<Tipo>, minima: Raridade): number {
  return membros(estado).filter((m) => ordem(raridadeDosGenes(m.genes)) >= ordem(minima)).length
}

export function progresso<Tipo extends string>(catalogo: Catalogo<Tipo>, estado: EstadoDoJogo<Tipo>, medida: Medida): number {
  const { contadores } = estado
  switch (medida) {
    case 'abates':
    case 'chefes':
    case 'capturas':
    case 'cruzamentos':
      return contadores[medida]
    case 'mercado':
      return contadores.comprasNoMercado
    case 'pergaminhos':
      return contadores.pergaminhosUsados
    case 'ilhas':
      return contadores.ilhasVencidas.length
    case 'registro':
      return estado.registro.length
    case 'era':
      return estado.era
    case 'nivel':
      return Math.max(...membros(estado).map((m) => m.nivel))
    case 'forma':
      return Math.max(...membros(estado).map((m) => formaDa(catalogo, m.especie)))
    case 'epicas':
      return comRaridade(estado, 'epica')
    case 'lendarias':
      return comRaridade(estado, 'lendaria')
    case 'miticas':
      return comRaridade(estado, 'mitica')
    case 'prismaticas':
      return membros(estado).filter((m) => m.prismatica).length
    case 'despertas':
      return membros(estado).filter((m) => m.despertada).length
  }
}

// Espécies da ativa e da reserva que ainda não estão no registro, na ordem em que aparecem.
export function registrar<Tipo extends string>(estado: EstadoDoJogo<Tipo>): EstadoDoJogo<Tipo> {
  const novas = [...new Set(membros(estado).map((m) => m.especie))].filter((e) => !estado.registro.includes(e))
  return novas.length ? { ...estado, registro: [...estado.registro, ...novas] } : estado
}

// Registra as espécies e paga, uma vez só, as conquistas que alcançaram a meta.
export function conferirConquistas<Tipo extends string>(
  conquistas: readonly Conquista[],
  catalogo: Catalogo<Tipo>,
  inicial: EstadoDoJogo<Tipo>,
): { readonly estado: EstadoDoJogo<Tipo>; readonly concluidas: readonly Conquista[] } {
  const estado = registrar(inicial)
  const concluidas = conquistas.filter((c) => !estado.conquistas.includes(c.id) && progresso(catalogo, estado, c.medida) >= c.meta)
  if (concluidas.length === 0) return { estado, concluidas }
  const diamantes = concluidas.reduce((total, c) => total + c.diamantes, 0)
  return {
    estado: {
      ...estado,
      conquistas: [...estado.conquistas, ...concluidas.map((c) => c.id)],
      inventario: { ...estado.inventario, diamantes: estado.inventario.diamantes + diamantes },
    },
    concluidas,
  }
}

export function contar<Tipo extends string>(estado: EstadoDoJogo<Tipo>, campo: Exclude<keyof Contadores, 'ilhasVencidas'>): EstadoDoJogo<Tipo> {
  return { ...estado, contadores: { ...estado.contadores, [campo]: estado.contadores[campo] + 1 } }
}

// Por que não dá para comprar espaços agora; null quando dá.
export function impedimentoDosEspacos<Tipo extends string>(estado: EstadoDoJogo<Tipo>): string | null {
  if (estado.espacosNaReserva >= MAXIMO_DE_ESPACOS) return `a reserva já tem ${MAXIMO_DE_ESPACOS} espaços`
  if (estado.inventario.diamantes < PRECO_DOS_ESPACOS) return `precisa de ${PRECO_DOS_ESPACOS} Diamantes`
  return null
}

export function comprarEspacos<Tipo extends string>(estado: EstadoDoJogo<Tipo>): EstadoDoJogo<Tipo> {
  const impedimento = impedimentoDosEspacos(estado)
  if (impedimento) throw new RangeError(`não pode comprar espaços: ${impedimento}`)
  return {
    ...estado,
    espacosNaReserva: estado.espacosNaReserva + ESPACOS_POR_COMPRA,
    inventario: { ...estado.inventario, diamantes: estado.inventario.diamantes - PRECO_DOS_ESPACOS },
  }
}
