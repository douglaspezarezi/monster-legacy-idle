// Estado do jogo no F2 e comandos do jogador (GDD, seções 4, 5, 7 e 13).
import type { Gerador } from './aleatorio.ts'
import type { FiltroDeCaptura } from './captura.ts'
import { ESPACOS_NA_RESERVA, FILTRO_VAZIO } from './captura.ts'
import type { Luta } from './combate.ts'
import type { Criatura } from './criatura.ts'
import { combatenteDe } from './criatura.ts'
import type { Catalogo } from './especie.ts'
import type { Matriz } from './nascimento.ts'
import { abrirMatriz, criarInicial } from './nascimento.ts'

export type Membro = Criatura & { readonly id: number }

export type Inventario = {
  readonly ouro: number
  readonly capsulas: number
  readonly tonicosDeCura: number
  readonly tonicosDeRetorno: number
  readonly matrizes: readonly Matriz[]
}

export type Encontro<Tipo extends string> = {
  readonly selvagem: Criatura
  readonly chefe: boolean
  readonly luta: Luta<Tipo>
}

export type EstadoDoJogo<Tipo extends string> = {
  readonly ativa: Membro
  // Vida da criatura ativa fora de luta; durante a luta vale a da luta.
  readonly vidaDaAtiva: number
  readonly reserva: readonly Membro[]
  readonly proximoId: number
  readonly inventario: Inventario
  readonly rota: number
  readonly rotasLiberadas: number
  // Abates desde o último chefe, por rota (índice 0 para a rota 1).
  readonly abatesPorRota: readonly number[]
  readonly avancoAutomatico: boolean
  // Fração da Vida máxima.
  readonly gatilhoDeCura: number
  readonly filtroDeCaptura: FiltroDeCaptura
  readonly fadigaAte: number
  readonly pausada: boolean
  readonly encontro: Encontro<Tipo> | null
  readonly proximoSelvagemEm: number
}

export const INVENTARIO_INICIAL: Inventario = {
  ouro: 200,
  capsulas: 10,
  tonicosDeCura: 5,
  tonicosDeRetorno: 5,
  matrizes: [],
}

export const GATILHO_DE_CURA_INICIAL = 0.3

export type ItemDaLoja = 'capsula' | 'tonicoDeCura' | 'tonicoDeRetorno'

export const PRECOS: Readonly<Record<ItemDaLoja, number>> = {
  capsula: 50,
  tonicoDeCura: 25,
  tonicoDeRetorno: 150,
}

const CAMPO_DO_ITEM = {
  capsula: 'capsulas',
  tonicoDeCura: 'tonicosDeCura',
  tonicoDeRetorno: 'tonicosDeRetorno',
} as const satisfies Record<ItemDaLoja, keyof Inventario>

export function vidaMaxima<Tipo extends string>(catalogo: Catalogo<Tipo>, criatura: Criatura): number {
  return combatenteDe(catalogo, criatura).atributos.vida
}

export function novoJogo<Tipo extends string>(
  catalogo: Catalogo<Tipo>,
  numeroDeRotas: number,
  especieInicial: string,
  agora: number,
  gerador: Gerador,
): EstadoDoJogo<Tipo> {
  const ativa: Membro = { ...criarInicial(gerador, especieInicial), id: 1 }
  return {
    ativa,
    vidaDaAtiva: vidaMaxima(catalogo, ativa),
    reserva: [],
    proximoId: 2,
    inventario: INVENTARIO_INICIAL,
    rota: 1,
    rotasLiberadas: 1,
    abatesPorRota: Array.from({ length: numeroDeRotas }, () => 0),
    avancoAutomatico: true,
    gatilhoDeCura: GATILHO_DE_CURA_INICIAL,
    filtroDeCaptura: FILTRO_VAZIO,
    fadigaAte: 0,
    pausada: false,
    encontro: null,
    proximoSelvagemEm: agora,
  }
}

// Vida da criatura ativa agora, dentro ou fora de luta.
export function vidaAtual<Tipo extends string>(estado: EstadoDoJogo<Tipo>): number {
  return estado.encontro ? estado.encontro.luta.jogador.vida : estado.vidaDaAtiva
}

// Encerra a luta em andamento sem XP e sem derrota; o próximo selvagem vem na hora.
function semEncontro<Tipo extends string>(estado: EstadoDoJogo<Tipo>, agora: number): EstadoDoJogo<Tipo> {
  return { ...estado, vidaDaAtiva: vidaAtual(estado), encontro: null, proximoSelvagemEm: agora }
}

export function comprar<Tipo extends string>(estado: EstadoDoJogo<Tipo>, item: ItemDaLoja, quantidade: number): EstadoDoJogo<Tipo> {
  if (!Number.isInteger(quantidade) || quantidade < 1) throw new RangeError(`quantidade inválida: ${quantidade}`)
  const custo = PRECOS[item] * quantidade
  if (custo > estado.inventario.ouro) throw new RangeError(`ouro insuficiente: ${estado.inventario.ouro} para ${custo}`)
  const campo = CAMPO_DO_ITEM[item]
  return {
    ...estado,
    inventario: { ...estado.inventario, ouro: estado.inventario.ouro - custo, [campo]: estado.inventario[campo] + quantidade },
  }
}

// A criatura que entra vem com a vida cheia; a que sai vai para a reserva.
export function trocarAtiva<Tipo extends string>(
  estado: EstadoDoJogo<Tipo>,
  catalogo: Catalogo<Tipo>,
  id: number,
  agora: number,
): EstadoDoJogo<Tipo> {
  const entra = estado.reserva.find((m) => m.id === id)
  if (!entra) throw new RangeError(`criatura fora da reserva: ${id}`)
  const reserva = estado.reserva.map((m) => (m.id === id ? estado.ativa : m))
  return { ...semEncontro(estado, agora), ativa: entra, reserva, vidaDaAtiva: vidaMaxima(catalogo, entra) }
}

export function escolherRota<Tipo extends string>(estado: EstadoDoJogo<Tipo>, rota: number, agora: number): EstadoDoJogo<Tipo> {
  if (!Number.isInteger(rota) || rota < 1 || rota > estado.rotasLiberadas) throw new RangeError(`rota trancada: ${rota}`)
  if (rota === estado.rota) return estado
  return { ...semEncontro(estado, agora), rota }
}

export function abrirMatrizDoInventario<Tipo extends string>(
  estado: EstadoDoJogo<Tipo>,
  indice: number,
  gerador: Gerador,
): EstadoDoJogo<Tipo> {
  const matriz = estado.inventario.matrizes[indice]
  if (!matriz) throw new RangeError(`matriz inexistente: ${indice}`)
  if (estado.reserva.length >= ESPACOS_NA_RESERVA) throw new RangeError('reserva cheia')
  const matrizes = estado.inventario.matrizes.filter((_, i) => i !== indice)
  return {
    ...estado,
    reserva: [...estado.reserva, { ...abrirMatriz(gerador, matriz), id: estado.proximoId }],
    proximoId: estado.proximoId + 1,
    inventario: { ...estado.inventario, matrizes },
  }
}

export function definirGatilhoDeCura<Tipo extends string>(estado: EstadoDoJogo<Tipo>, gatilho: number): EstadoDoJogo<Tipo> {
  if (!(gatilho >= 0 && gatilho <= 1)) throw new RangeError(`gatilho fora de 0 a 1: ${gatilho}`)
  return { ...estado, gatilhoDeCura: gatilho }
}

export function definirFiltroDeCaptura<Tipo extends string>(estado: EstadoDoJogo<Tipo>, filtro: FiltroDeCaptura): EstadoDoJogo<Tipo> {
  return { ...estado, filtroDeCaptura: filtro }
}

export function definirAvancoAutomatico<Tipo extends string>(estado: EstadoDoJogo<Tipo>, ligado: boolean): EstadoDoJogo<Tipo> {
  return { ...estado, avancoAutomatico: ligado }
}

// A caçada pausada por falta de Tônico de Retorno volta quando o jogador retorna, sem perdas (GDD, seção 5).
export function retomarCacada<Tipo extends string>(
  estado: EstadoDoJogo<Tipo>,
  catalogo: Catalogo<Tipo>,
  agora: number,
): EstadoDoJogo<Tipo> {
  if (!estado.pausada) return estado
  return { ...estado, pausada: false, vidaDaAtiva: vidaMaxima(catalogo, estado.ativa), encontro: null, proximoSelvagemEm: agora }
}
