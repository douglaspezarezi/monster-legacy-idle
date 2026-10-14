// Crédito do tempo fora do jogo (GDD, seção 5).
import type { Gerador } from './aleatorio.ts'
import type { ConfiguracaoDaCacada, Evento } from './cacada.ts'
import { simularCacada } from './cacada.ts'
import type { Ritmo } from './combate.ts'
import type { EstadoDoJogo } from './jogo.ts'

export const LIMITE_DO_TEMPO_FORA_MS = 24 * 60 * 60 * 1000

function deslocarRitmo(ritmo: Ritmo, delta: number): Ritmo {
  return { proximaAcao: ritmo.proximaAcao + delta, prontaEm: ritmo.prontaEm.map((t) => t + delta) }
}

// Adia os instantes agendados da caçada. A Fadiga fica: ela corre em tempo real.
export function deslocarTempo<Tipo extends string>(estado: EstadoDoJogo<Tipo>, delta: number): EstadoDoJogo<Tipo> {
  const { encontro } = estado
  return {
    ...estado,
    proximoSelvagemEm: estado.proximoSelvagemEm + delta,
    encontro: encontro && {
      ...encontro,
      luta: {
        ...encontro.luta,
        ritmoDoJogador: deslocarRitmo(encontro.luta.ritmoDoJogador, delta),
        ritmoDoSelvagem: deslocarRitmo(encontro.luta.ritmoDoSelvagem, delta),
      },
    },
  }
}

export type TempoFora<Tipo extends string> = {
  readonly estado: EstadoDoJogo<Tipo>
  readonly eventos: readonly Evento[]
  readonly creditadoMs: number
}

// Acima do limite, só as últimas 24 horas contam.
export function creditarTempoFora<Tipo extends string>(
  configuracao: ConfiguracaoDaCacada<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  salvoEm: number,
  agora: number,
  gerador: Gerador,
): TempoFora<Tipo> {
  const fora = agora - salvoEm
  if (fora <= 0) return { estado, eventos: [], creditadoMs: 0 }
  const creditadoMs = Math.min(fora, LIMITE_DO_TEMPO_FORA_MS)
  const deslocado = deslocarTempo(estado, fora - creditadoMs)
  const resultado = simularCacada(configuracao, deslocado, agora - creditadoMs, agora, gerador)
  return { ...resultado, creditadoMs }
}

export type Resumo = {
  readonly abates: number
  readonly xp: number
  readonly ouro: number
  readonly niveis: number
  readonly capturas: number
  readonly matrizes: number
  readonly derrotas: number
}

export function resumir(eventos: readonly Evento[]): Resumo {
  const resumo = { abates: 0, xp: 0, ouro: 0, niveis: 0, capturas: 0, matrizes: 0, derrotas: 0 }
  for (const evento of eventos) {
    if (evento.tipo === 'abate') {
      resumo.abates++
      resumo.xp += evento.xp
      resumo.ouro += evento.ouro
    } else if (evento.tipo === 'nivel') resumo.niveis++
    else if (evento.tipo === 'captura' && evento.sucesso) resumo.capturas++
    else if (evento.tipo === 'matriz') resumo.matrizes++
    else if (evento.tipo === 'derrota') resumo.derrotas++
  }
  return resumo
}
