// Save versionado do estado do jogo (GDD, seção 5). Onde guardar o texto fica com a tela.
import { FORJA_VAZIA } from './base.ts'
import { SEM_EQUIPAMENTOS } from './equipamentos.ts'
import type { EstadoDoJogo } from './jogo.ts'
import { SEM_REPOSICAO } from './jogo.ts'

export const VERSAO_DO_SAVE = 7

// Contadores de chefe que cada bioma guarda desde a versão 7, que trouxe a rota 6.
const ROTAS_NA_VERSAO_7 = 6

// Cada migração leva o estado salvo da versão do índice para a seguinte.
const MIGRACOES: Readonly<Record<number, (estado: Record<string, unknown>) => Record<string, unknown>>> = {
  // A versão 2 trouxe a Forja.
  1: (estado) => ({ ...estado, forja: FORJA_VAZIA }),
  // A versão 3 trouxe as Eras: tudo o que existia é da Era 1.
  2: (estado) => ({
    ...estado,
    era: 1,
    ativa: naEra1(estado.ativa),
    reserva: Array.isArray(estado.reserva) ? estado.reserva.map(naEra1) : estado.reserva,
  }),
  // A versão 4 trouxe os equipamentos.
  3: (estado) => ({ ...estado, equipamentos: SEM_EQUIPAMENTOS }),
  // A versão 5 trouxe os biomas: o progresso que existia é da Mata Funda.
  4: (estado) => ({ ...estado, bioma: 0, outrosBiomas: {} }),
  // A versão 6 trouxe a reposição automática, desligada.
  5: (estado) => ({ ...estado, reposicao: SEM_REPOSICAO }),
  // A versão 7 trouxe a rota 6: os contadores de chefe de cada bioma ganham uma posição zerada.
  6: (estado) => ({
    ...estado,
    abatesPorRota: comRota6(estado.abatesPorRota),
    outrosBiomas: ehObjeto(estado.outrosBiomas)
      ? Object.fromEntries(
          Object.entries(estado.outrosBiomas).map(([bioma, progresso]) => [
            bioma,
            ehObjeto(progresso) ? { ...progresso, abatesPorRota: comRota6(progresso.abatesPorRota) } : progresso,
          ]),
        )
      : estado.outrosBiomas,
  }),
}

function comRota6(abatesPorRota: unknown): unknown {
  if (!Array.isArray(abatesPorRota)) return abatesPorRota
  return [...abatesPorRota, ...Array.from({ length: Math.max(0, ROTAS_NA_VERSAO_7 - abatesPorRota.length) }, () => 0)]
}

function naEra1(membro: unknown): unknown {
  return typeof membro === 'object' && membro !== null ? { ...membro, era: 1 } : membro
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

// Recusa texto que não é save, versões que o jogo não conhece e estados sem algum campo do modelo,
// que é um jogo novo: um save gravado com a versão certa e campos faltando não pode abrir.
export function desserializar<Tipo extends string>(texto: string, modelo: EstadoDoJogo<Tipo>): Save<Tipo> {
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
  const faltando = Object.keys(modelo).filter((campo) => !(campo in estado))
  if (faltando.length > 0) throw new SyntaxError(`save incompleto: falta ${faltando.join(', ')}`)
  return { versao, salvoEm: dados.salvoEm, estado: estado as EstadoDoJogo<Tipo> }
}
