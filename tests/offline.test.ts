import { describe, expect, it } from 'vitest'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import type { Evento } from '../src/engine/cacada.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { DURACAO_DA_FADIGA_MS } from '../src/engine/derrota.ts'
import { LIMITE_DO_TEMPO_FORA_MS, creditarTempoFora, deslocarTempo, resumir } from '../src/engine/offline.ts'
import { jogoCom, membro } from './apoio.ts'

const HORA = 60 * 60 * 1000
const forte = membro('Gelusco', 40, 15)

describe('tempo fora do jogo', () => {
  it('credita o tempo fora com as regras da caçada', () => {
    const estado = jogoCom(forte)
    const fora = creditarTempoFora(CONFIGURACAO, estado, 0, 2 * HORA, criarGerador(3))
    const aberto = simularCacada(CONFIGURACAO, estado, 0, 2 * HORA, criarGerador(3))
    expect(fora.creditadoMs).toBe(2 * HORA)
    expect(fora.estado).toEqual(aberto.estado)
    expect(fora.eventos).toEqual(aberto.eventos)
  })

  it('acima de 24 horas credita só as últimas 24', () => {
    const estado = jogoCom(forte)
    const longe = creditarTempoFora(CONFIGURACAO, estado, 0, 30 * HORA, criarGerador(5))
    const limite = creditarTempoFora(CONFIGURACAO, estado, 0, 24 * HORA, criarGerador(5))
    expect(longe.creditadoMs).toBe(LIMITE_DO_TEMPO_FORA_MS)
    expect(longe.estado.ativa).toEqual(limite.estado.ativa)
    expect(longe.estado.inventario).toEqual(limite.estado.inventario)
    expect(longe.eventos.length).toBe(limite.eventos.length)
    expect(longe.estado.proximoSelvagemEm - limite.estado.proximoSelvagemEm).toBeCloseTo(6 * HORA)
  })

  it('sem tempo fora não muda nada', () => {
    const estado = jogoCom(forte)
    expect(creditarTempoFora(CONFIGURACAO, estado, 1000, 1000, criarGerador(1))).toEqual({ estado, eventos: [], ouroDaForja: 0, creditadoMs: 0 })
    expect(creditarTempoFora(CONFIGURACAO, estado, 1000, 500, criarGerador(1)).creditadoMs).toBe(0)
  })

  it('a Fadiga em andamento vale no começo do tempo fora', () => {
    const estado = jogoCom(forte, { fadigaAte: DURACAO_DA_FADIGA_MS, avancoAutomatico: false })
    const fora = creditarTempoFora(CONFIGURACAO, estado, 0, HORA, criarGerador(2))
    const abates = fora.eventos.filter((e) => e.tipo === 'abate')
    expect(abates[0].xp).toBe(5)
    expect(abates[abates.length - 1].xp).toBe(10)
  })

  it('deslocar adia o próximo selvagem e a luta, mas não a Fadiga', () => {
    const { estado } = simularCacada(CONFIGURACAO, jogoCom(forte, { fadigaAte: 5000 }), 0, 1500, criarGerador(6))
    const luta = estado.encontro!.luta
    const deslocado = deslocarTempo(estado, 1000)
    expect(deslocado.proximoSelvagemEm).toBe(estado.proximoSelvagemEm + 1000)
    expect(deslocado.fadigaAte).toBe(5000)
    expect(deslocado.encontro!.luta.ritmoDoJogador.proximaAcao).toBe(luta.ritmoDoJogador.proximaAcao + 1000)
    expect(deslocado.encontro!.luta.ritmoDoSelvagem.prontaEm).toEqual(luta.ritmoDoSelvagem.prontaEm.map((t) => t + 1000))
  })
})

describe('resumo da volta', () => {
  it('soma abates, XP, ouro, níveis, capturas que deram certo, matrizes e derrotas', () => {
    const eventos: Evento[] = [
      { tipo: 'abate', instante: 1, especie: 'Brotelho', chefe: false, xp: 10, ouro: 5 },
      { tipo: 'abate', instante: 2, especie: 'Formigaço', chefe: false, xp: 10, ouro: 5 },
      { tipo: 'nivel', instante: 2, nivel: 3 },
      { tipo: 'captura', instante: 2, especie: 'Formigaço', raridade: 'comum', sucesso: true },
      { tipo: 'captura', instante: 3, especie: 'Brotelho', raridade: 'comum', sucesso: false },
      { tipo: 'matriz', instante: 3, matriz: { especie: 'Brotelho', raridade: 'comum' } },
      { tipo: 'derrota', instante: 4, especie: 'Brotelho', chefe: true, pausou: false },
    ]
    expect(resumir(eventos)).toEqual({ abates: 2, xp: 20, ouro: 10, niveis: 1, capturas: 1, matrizes: 1, derrotas: 1 })
  })
})
