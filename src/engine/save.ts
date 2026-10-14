// Save versionado do estado do jogo (GDD, seção 5). Onde guardar o texto fica com a tela.
import { FORJA_VAZIA } from './base.ts'
import type { EstadoDoJogo } from './jogo.ts'

export const VERSAO_DO_SAVE = 2

// Cada migração leva o estado salvo da versão do índice para a seguinte.
const MIGRACOES: Readonly<Record<number, (estado: Record<string, unknown>) => Record<string, unknown>>> = {
  // A versão 2 trouxe a Forja.
  1: (estado) => ({ ...estado, forja: FORJA_VAZIA }),
}

export type Save<Tipo extends string> = {
  readonly versao: number
  // Instante simulado em que o estado foi salvo.
  readonly salvoEm: number
  readonly estado: EstadoDoJogo<Tipo>
}

export function serializar<Tipo extends string>(estado: EstadoDoJogo<Tipo>, salvoEm: number): string {
  const save: Save<Tipo> = { versao: VERSAO_DO_SAVE, salvoEm, estado }
  return JSON.stringify(save)
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

// Recusa texto que não é save e versões que o jogo não conhece.
export function desserializar<Tipo extends string>(texto: string): Save<Tipo> {
  let dados: unknown
  try {
    dados = JSON.parse(texto)
  } catch {
    throw new SyntaxError('save ilegível')
  }
  if (!ehObjeto(dados) || typeof dados.salvoEm !== 'number' || !ehObjeto(dados.estado)) throw new SyntaxError('save ilegível')
  let { versao, estado } = dados
  if (typeof versao !== 'number' || !Number.isInteger(versao) || versao < 1 || versao > VERSAO_DO_SAVE) {
    throw new RangeError(`versão de save desconhecida: ${String(versao)}`)
  }
  while (versao < VERSAO_DO_SAVE) {
    estado = MIGRACOES[versao](estado)
    versao++
  }
  return { versao, salvoEm: dados.salvoEm, estado: estado as EstadoDoJogo<Tipo> }
}
