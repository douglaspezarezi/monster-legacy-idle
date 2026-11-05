// Calendário de presença (GDD, seção 13): uma casa por dia em que o jogo é aberto, sem perder casa ao faltar.
import type { EstadoDoJogo, Inventario } from './jogo.ts'

// Só campos numéricos do inventário.
export type ItemDoCalendario = Extract<keyof Inventario, 'capsulas' | 'tonicosDeCura' | 'tonicosDeRetorno' | 'perolas' | 'fragmentos' | 'diamantes'>

export type Premio = { readonly item: ItemDoCalendario; readonly quantidade: number }

export type Calendario = {
  // Índice da próxima casa a resgatar, de 0 a 27.
  readonly casa: number
  // Dia local do último resgate, em dias desde 01/01/1970; null antes do primeiro.
  readonly ultimoDia: number | null
}

export const CALENDARIO_INICIAL: Calendario = { casa: 0, ultimoDia: null }

const DIA_MS = 24 * 60 * 60 * 1000

// A tela informa o fuso, em minutos como o Date.getTimezoneOffset; o motor não lê o relógio.
export function diaLocal(agora: number, fusoEmMinutos: number): number {
  return Math.floor((agora - fusoEmMinutos * 60 * 1000) / DIA_MS)
}

// Uma casa por dia; os dias perdidos não acumulam casas.
export function podeResgatar<Tipo extends string>(estado: EstadoDoJogo<Tipo>, dia: number): boolean {
  return estado.calendario.ultimoDia === null || dia > estado.calendario.ultimoDia
}

export function resgatar<Tipo extends string>(premios: readonly Premio[], estado: EstadoDoJogo<Tipo>, dia: number): EstadoDoJogo<Tipo> {
  if (!podeResgatar(estado, dia)) throw new RangeError(`casa de hoje já resgatada: dia ${dia}`)
  const premio = premios[estado.calendario.casa]
  if (!premio) throw new RangeError(`casa inexistente: ${estado.calendario.casa}`)
  return {
    ...estado,
    inventario: { ...estado.inventario, [premio.item]: estado.inventario[premio.item] + premio.quantidade },
    calendario: { casa: (estado.calendario.casa + 1) % premios.length, ultimoDia: dia },
  }
}
