import { describe, expect, it } from 'vitest'
import { CALENDARIO } from '../src/conteudo/calendario.ts'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { CALENDARIO_INICIAL, diaLocal, podeResgatar, resgatar } from '../src/engine/calendario.ts'
import { creditarTempoFora } from '../src/engine/offline.ts'
import { VERSAO_DO_SAVE, desserializar } from '../src/engine/save.ts'
import { jogoCom, membro } from './apoio.ts'

const DIA = 24 * 60 * 60 * 1000
const inicio = () => jogoCom(membro('Gelusco', 3, 5))

describe('prêmios', () => {
  it('28 casas, com 50 Diamantes por ciclo: 10 no dia 7 das semanas 1 a 3 e 20 na semana 4', () => {
    expect(CALENDARIO).toHaveLength(28)
    const diamantes = CALENDARIO.map((p, i) => (p.item === 'diamantes' ? [i + 1, p.quantidade] : null)).filter((x) => x !== null)
    expect(diamantes).toEqual([
      [7, 10],
      [14, 10],
      [21, 10],
      [28, 20],
    ])
    expect(CALENDARIO.slice(0, 7).map((p) => `${p.quantidade} ${p.item}`)).toEqual([
      '5 capsulas',
      '3 tonicosDeRetorno',
      '40 perolas',
      '10 tonicosDeCura',
      '100 fragmentos',
      '40 perolas',
      '10 diamantes',
    ])
  })
})

describe('dia local', () => {
  it('vira à meia-noite do fuso da tela', () => {
    // 03:00 em UTC, que é meia-noite no fuso de −3 h (getTimezoneOffset 180).
    const madrugada = Date.UTC(2026, 10, 5, 3, 0)
    expect(diaLocal(madrugada, 180)).toBe(diaLocal(madrugada - 1, 180) + 1)
    expect(diaLocal(madrugada, 0)).toBe(diaLocal(madrugada - 3 * 60 * 60 * 1000, 0))
  })
})

describe('resgate', () => {
  it('entrega o prêmio da casa e avança uma casa', () => {
    const depois = resgatar(CALENDARIO, inicio(), 100)
    expect(depois.inventario.capsulas).toBe(inicio().inventario.capsulas + 5)
    expect(depois.calendario).toEqual({ casa: 1, ultimoDia: 100 })
  })

  it('critério do F26: resgatar num dia libera a próxima casa só no dia seguinte, e faltar dias não pula casa', () => {
    const hoje = resgatar(CALENDARIO, inicio(), 100)
    expect(podeResgatar(hoje, 100)).toBe(false)
    expect(() => resgatar(CALENDARIO, hoje, 100)).toThrow(RangeError)
    expect(podeResgatar(hoje, 101)).toBe(true)
    // Cinco dias fora: só a casa seguinte, a 2, e nenhuma acumulada.
    const volta = resgatar(CALENDARIO, hoje, 106)
    expect(volta.calendario).toEqual({ casa: 2, ultimoDia: 106 })
    expect(volta.inventario.tonicosDeRetorno).toBe(inicio().inventario.tonicosDeRetorno + 3)
    expect(podeResgatar(volta, 106)).toBe(false)
  })

  it('depois da casa 28 o ciclo recomeça, com 50 Diamantes pagos', () => {
    let estado = inicio()
    for (let dia = 0; dia < 28; dia++) estado = resgatar(CALENDARIO, estado, dia)
    expect(estado.calendario.casa).toBe(0)
    expect(estado.inventario.diamantes).toBe(50)
    expect(estado.inventario.perolas).toBe(8 * 40)
    expect(estado.inventario.fragmentos).toBe(4 * 100)
  })

  it('um relógio voltado para trás não libera casa', () => {
    const hoje = resgatar(CALENDARIO, inicio(), 100)
    expect(podeResgatar(hoje, 99)).toBe(false)
  })

  it('o tempo fora não resgata nada sozinho: o resgate é um comando do jogador', () => {
    const fora = creditarTempoFora(CONFIGURACAO, inicio(), 0, 3 * DIA, criarGerador(1))
    expect(fora.estado.calendario).toEqual(CALENDARIO_INICIAL)
  })
})

describe('save', () => {
  it('migra o save da versão 16: calendário na primeira casa', () => {
    const atual = inicio()
    const { calendario: _, ...antigo } = atual
    const save = desserializar<Tipo>(JSON.stringify({ versao: 16, salvoEm: 10, estado: antigo }), jogoCom(membro('Gelusco', 1, 5)))
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.estado).toEqual({ ...atual, calendario: CALENDARIO_INICIAL })
  })
})
