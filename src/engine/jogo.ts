// Estado do jogo no F2 e comandos do jogador (GDD, seções 4, 5, 7 e 13).
import type { Gerador } from './aleatorio.ts'
import type { Forja, Mina } from './base.ts'
import { FORJA_VAZIA, MINA_VAZIA, trabalhando } from './base.ts'
import type { Equipamentos } from './equipamentos.ts'
import { SEM_EQUIPAMENTOS } from './equipamentos.ts'
import type { FiltroDeCaptura } from './captura.ts'
import { ESPACOS_NA_RESERVA, FILTRO_VAZIO } from './captura.ts'
import type { Luta } from './combate.ts'
import type { Criatura } from './criatura.ts'
import { combatenteDe } from './criatura.ts'
import type { Catalogo } from './especie.ts'
import type { Matriz } from './nascimento.ts'
import { abrirMatriz, criarInicial } from './nascimento.ts'
import { voltarAoNivel1 } from './evolucao.ts'

// Era em que a criatura passou pelo reset; abaixo da Era atual, ela volta ao nível 1 ao ser ativada.
export type Membro = Criatura & { readonly id: number; readonly era: number }

export type Inventario = {
  readonly ouro: number
  readonly capsulas: number
  readonly tonicosDeCura: number
  readonly tonicosDeRetorno: number
  readonly matrizes: readonly Matriz[]
  // Produzidos pela Mina; pagam o Despertar.
  readonly fragmentos: number
  // Essências por tipo, que caem nas rotas 5 a 7 do bioma do tipo.
  readonly essencias: Readonly<Record<string, number>>
  // Chaves da Ilha, que caem na rota 5 e abrem as Ilhas Lendárias.
  readonly chaves: number
}

export type Encontro<Tipo extends string> = {
  readonly selvagem: Criatura
  readonly chefe: boolean
  readonly luta: Luta<Tipo>
}

// Rota em que a caçada estava, rotas liberadas e contadores de chefe de um bioma.
export type ProgressoDoBioma = {
  readonly rota: number
  readonly rotasLiberadas: number
  readonly abatesPorRota: readonly number[]
}

export type EstadoDoJogo<Tipo extends string> = {
  readonly era: number
  // Índice do bioma da caçada. As rotas e contadores dele ficam nos campos rota, rotasLiberadas e abatesPorRota.
  readonly bioma: number
  // Progresso dos demais biomas, por índice; o bioma que falta começa do zero.
  readonly outrosBiomas: Readonly<Record<number, ProgressoDoBioma>>
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
  readonly forja: Forja
  readonly mina: Mina
  readonly equipamentos: Equipamentos
  // Estoque mínimo de cada item que a Loja repõe sozinha; 0 desliga.
  readonly reposicao: Readonly<Record<ItemDaLoja, number>>
}

export const INVENTARIO_INICIAL: Inventario = {
  ouro: 200,
  capsulas: 10,
  tonicosDeCura: 5,
  tonicosDeRetorno: 5,
  matrizes: [],
  fragmentos: 0,
  essencias: {},
  chaves: 0,
}

export const GATILHO_DE_CURA_INICIAL = 0.3

export type ItemDaLoja = 'capsula' | 'tonicoDeCura' | 'tonicoDeRetorno'

export const PRECOS: Readonly<Record<ItemDaLoja, number>> = {
  capsula: 50,
  tonicoDeCura: 25,
  tonicoDeRetorno: 150,
}

export const SEM_REPOSICAO: Readonly<Record<ItemDaLoja, number>> = { capsula: 0, tonicoDeCura: 0, tonicoDeRetorno: 0 }

// O Tônico de Retorno vem primeiro: sem ele a caçada pausa.
const ORDEM_DA_REPOSICAO: readonly ItemDaLoja[] = ['tonicoDeRetorno', 'tonicoDeCura', 'capsula']

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
  const ativa: Membro = { ...criarInicial(gerador, especieInicial), id: 1, era: 1 }
  return {
    era: 1,
    bioma: 0,
    outrosBiomas: {},
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
    forja: FORJA_VAZIA,
    mina: MINA_VAZIA,
    equipamentos: SEM_EQUIPAMENTOS,
    reposicao: SEM_REPOSICAO,
  }
}

// Vida da criatura ativa agora, dentro ou fora de luta.
export function vidaAtual<Tipo extends string>(estado: EstadoDoJogo<Tipo>): number {
  return estado.encontro ? estado.encontro.luta.jogador.vida : estado.vidaDaAtiva
}

// Encerra a luta em andamento sem XP e sem derrota; o próximo selvagem vem na hora.
export function semEncontro<Tipo extends string>(estado: EstadoDoJogo<Tipo>, agora: number): EstadoDoJogo<Tipo> {
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

// Compra o que falta para cada mínimo, até onde o ouro der.
export function repor<Tipo extends string>(estado: EstadoDoJogo<Tipo>): EstadoDoJogo<Tipo> {
  let inventario = estado.inventario
  for (const item of ORDEM_DA_REPOSICAO) {
    const campo = CAMPO_DO_ITEM[item]
    const quantidade = Math.min(estado.reposicao[item] - inventario[campo], Math.floor(inventario.ouro / PRECOS[item]))
    if (quantidade > 0) {
      inventario = { ...inventario, ouro: inventario.ouro - quantidade * PRECOS[item], [campo]: inventario[campo] + quantidade }
    }
  }
  return inventario === estado.inventario ? estado : { ...estado, inventario }
}

export function definirReposicao<Tipo extends string>(estado: EstadoDoJogo<Tipo>, item: ItemDaLoja, minimo: number): EstadoDoJogo<Tipo> {
  if (!Number.isInteger(minimo) || minimo < 0) throw new RangeError(`mínimo inválido: ${minimo}`)
  return repor({ ...estado, reposicao: { ...estado.reposicao, [item]: minimo } })
}

// A criatura que entra vem com a vida cheia; a que sai vai para a reserva.
export function trocarAtiva<Tipo extends string>(
  estado: EstadoDoJogo<Tipo>,
  catalogo: Catalogo<Tipo>,
  id: number,
  agora: number,
): EstadoDoJogo<Tipo> {
  const naReserva = estado.reserva.find((m) => m.id === id)
  if (!naReserva) throw new RangeError(`criatura fora da reserva: ${id}`)
  const entra = naReserva.era < estado.era ? { ...voltarAoNivel1(catalogo, naReserva), era: estado.era } : naReserva
  if (trabalhando(estado, id)) throw new RangeError(`criatura num posto de trabalho: ${id}`)
  const reserva = estado.reserva.map((m) => (m.id === id ? estado.ativa : m))
  return { ...semEncontro(estado, agora), ativa: entra, reserva, vidaDaAtiva: vidaMaxima(catalogo, entra) }
}

export function escolherRota<Tipo extends string>(estado: EstadoDoJogo<Tipo>, rota: number, agora: number): EstadoDoJogo<Tipo> {
  if (!Number.isInteger(rota) || rota < 1 || rota > estado.rotasLiberadas) throw new RangeError(`rota trancada: ${rota}`)
  if (rota === estado.rota) return estado
  return { ...semEncontro(estado, agora), rota }
}

export function progressoNovo(numeroDeRotas: number): ProgressoDoBioma {
  return { rota: 1, rotasLiberadas: 1, abatesPorRota: Array.from({ length: numeroDeRotas }, () => 0) }
}

// O progresso do bioma atual vai para a guarda e o do bioma escolhido volta dela.
export function escolherBioma<Tipo extends string>(
  estado: EstadoDoJogo<Tipo>,
  biomas: readonly { readonly era: number }[],
  bioma: number,
  agora: number,
): EstadoDoJogo<Tipo> {
  const dados = biomas[bioma]
  if (!Number.isInteger(bioma) || !dados) throw new RangeError(`bioma inexistente: ${bioma}`)
  if (dados.era > estado.era) throw new RangeError(`bioma da Era ${dados.era}`)
  if (bioma === estado.bioma) return estado
  const { [bioma]: guardado, ...demais } = estado.outrosBiomas
  const destino = guardado ?? progressoNovo(estado.abatesPorRota.length)
  const atual: ProgressoDoBioma = { rota: estado.rota, rotasLiberadas: estado.rotasLiberadas, abatesPorRota: estado.abatesPorRota }
  return { ...semEncontro(estado, agora), bioma, outrosBiomas: { ...demais, [estado.bioma]: atual }, ...destino }
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
    reserva: [...estado.reserva, { ...abrirMatriz(gerador, matriz), id: estado.proximoId, era: estado.era }],
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
