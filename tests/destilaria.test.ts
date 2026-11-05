import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { LINHAGENS } from '../src/conteudo/linhagens.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { avancarJogo } from '../src/engine/avanco.ts'
import {
  AFINIDADE_CERTA,
  AFINIDADE_OPOSTA,
  DESTILARIA_VAZIA,
  PRECO_DA_DESTILARIA,
  afinidade,
  colocarNaDestilaria,
  colocarNaMina,
  construirDestilaria,
  escolherTipoDaDestilaria,
  essenciasPorHoraDaDestilaria,
  impedimentoDaDestilaria,
  produzir,
  tirarDaDestilaria,
} from '../src/engine/base.ts'
import { cruzar } from '../src/engine/cruzamento.ts'
import { multiplicadorDeRaridade } from '../src/engine/genes.ts'
import type { EstadoDoJogo, Membro } from '../src/engine/jogo.ts'
import { trocarAtiva } from '../src/engine/jogo.ts'
import { creditarTempoFora } from '../src/engine/offline.ts'
import { VERSAO_DO_SAVE, desserializar } from '../src/engine/save.ts'
import { jogoCom, membro } from './apoio.ts'

const HORA = 60 * 60 * 1000
const { destilaria } = CONFIGURACAO

// Destilaria construída, com a reserva indicada e o tipo escolhido.
function construida(reserva: Membro[], tipo: Tipo | null = 'Chama'): EstadoDoJogo<Tipo> {
  const estado = jogoCom(membro('Gelusco', 10, 10), { reserva, proximoId: 20 })
  return { ...estado, destilaria: { ...DESTILARIA_VAZIA, construida: true, tipo } }
}

function trabalhando(estado: EstadoDoJogo<Tipo>, ...ids: number[]): EstadoDoJogo<Tipo> {
  return ids.reduce((e, id) => colocarNaDestilaria(CONFIGURACAO, e, id), estado)
}

describe('construção', () => {
  it('custa 300 Diamantes e é construída uma vez', () => {
    const estado = jogoCom(membro('Gelusco', 1, 5))
    expect(impedimentoDaDestilaria(estado)).toMatch(/300 Diamantes/)
    const rico = { ...estado, inventario: { ...estado.inventario, diamantes: 350 } }
    const depois = construirDestilaria(rico)
    expect(depois.destilaria).toEqual({ ...DESTILARIA_VAZIA, construida: true })
    expect(depois.inventario.diamantes).toBe(350 - PRECO_DA_DESTILARIA)
    expect(() => construirDestilaria(depois)).toThrow(RangeError)
  })

  it('antes de construída, não recebe trabalhador nem tipo', () => {
    const estado = jogoCom(membro('Gelusco', 10, 10), { reserva: [membro('Cinzelo', 5, 10, 2)] })
    expect(() => colocarNaDestilaria(CONFIGURACAO, estado, 2)).toThrow(/não foi construída/)
    expect(() => escolherTipoDaDestilaria(estado, 'Chama')).toThrow(/não foi construída/)
  })
})

describe('produção', () => {
  it('0,15 Essência por hora × raridade × afinidade, do tipo escolhido', () => {
    const tres = [2, 3, 4].map((id) => membro('Cinzelo', 5, 15, id))
    const estado = trabalhando(construida(tres), 2, 3, 4)
    const porHora = 3 * destilaria.porHora * multiplicadorDeRaridade(tres[0].genes) * AFINIDADE_CERTA
    expect(essenciasPorHoraDaDestilaria(CONFIGURACAO, estado)).toBeCloseTo(porHora)
    expect(porHora).toBeCloseTo(0.75, 2)
    const r = avancarJogo(CONFIGURACAO, estado, 0, 10 * HORA, criarGerador(1))
    expect(r.essenciasDaDestilaria).toBe(Math.floor(porHora * 10))
    expect(r.estado.inventario.essencias.Chama).toBe(r.essenciasDaDestilaria)
  })

  it('a afinidade segue o tipo escolhido: −50% para quem vence o tipo, 1× para os demais', () => {
    const chama = { ...destilaria, tipos: ['Chama' as const] }
    expect(afinidade(CONFIGURACAO.tabela, chama, CATALOGO.especies.Seixote.tipos)).toBe(AFINIDADE_OPOSTA)
    expect(afinidade(CONFIGURACAO.tabela, chama, CATALOGO.especies.Brotelho.tipos)).toBe(1)
    const seixote = trabalhando(construida([membro('Seixote', 5, 15, 2)]), 2)
    expect(essenciasPorHoraDaDestilaria(CONFIGURACAO, seixote)).toBeCloseTo(destilaria.porHora * multiplicadorDeRaridade(seixote.reserva[0].genes) * AFINIDADE_OPOSTA)
  })

  it('sem tipo escolhido, não produz', () => {
    const estado = trabalhando(construida([membro('Cinzelo', 5, 15, 2)], null), 2)
    expect(essenciasPorHoraDaDestilaria(CONFIGURACAO, estado)).toBe(0)
    expect(produzir(CONFIGURACAO, estado, 0, 10 * HORA).essencias).toBe(0)
  })

  it('trocar de tipo perde só a fração em andamento', () => {
    const estado = trabalhando(construida([membro('Cinzelo', 5, 15, 2)]), 2)
    const meio = produzir(CONFIGURACAO, estado, 0, HORA).estado
    expect(meio.destilaria.essenciasFracionarias).toBeGreaterThan(0)
    const trocado = escolherTipoDaDestilaria(meio, 'Geada')
    expect(trocado.destilaria).toMatchObject({ tipo: 'Geada', essenciasFracionarias: 0, trabalhadores: [2] })
    expect(escolherTipoDaDestilaria(trocado, 'Geada')).toBe(trocado)
  })
})

describe('trabalhadores', () => {
  it('3 vagas; quem destila não vai para outro posto, não cruza e não é ativada', () => {
    const quatro = [2, 3, 4, 5].map((id) => membro('Cinzelo', 5, 10, id))
    const estado = trabalhando(construida(quatro), 2, 3, 4)
    expect(() => colocarNaDestilaria(CONFIGURACAO, estado, 5)).toThrow(/sem vaga/)
    expect(() => colocarNaMina(CONFIGURACAO, estado, 2)).toThrow(/outro posto/)
    expect(() => trocarAtiva(estado, CATALOGO, 2, 0)).toThrow(RangeError)
    const comOuro = { ...estado, inventario: { ...estado.inventario, ouro: 1000 } }
    expect(() => cruzar(comOuro, CATALOGO, LINHAGENS, { paiA: 2, paiB: 5, especieDe: 2, herdados: ['vida', 'ataque', 'defesa'] }, 0, criarGerador(1))).toThrow(
      /trabalhando/,
    )
    expect(tirarDaDestilaria(estado, 2).destilaria.trabalhadores).toEqual([3, 4])
  })
})

describe('com o jogo fechado', () => {
  it('critério do F22: uma Essência de um tipo que o jogador não caça sai da Destilaria com o jogo fechado', () => {
    // Caçando na Mata Funda, de Brota, e destilando Chama.
    const estado = trabalhando(construida([2, 3, 4].map((id) => membro('Cinzelo', 5, 15, id))), 2, 3, 4)
    expect(CONFIGURACAO.biomas[estado.bioma].tipo).toBe('Brota')
    const fora = creditarTempoFora(CONFIGURACAO, estado, 0, 12 * HORA, criarGerador(1))
    expect(fora.essenciasDaDestilaria).toBe(9)
    expect(fora.estado.inventario.essencias.Chama).toBe(9)
  })
})

describe('save', () => {
  it('migra o save da versão 14: Destilaria por construir', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5))
    const { destilaria: _, ...antigo } = atual
    const save = desserializar<Tipo>(JSON.stringify({ versao: 14, salvoEm: 10, estado: antigo }), jogoCom(membro('Gelusco', 1, 5)))
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.estado).toEqual({ ...atual, destilaria: DESTILARIA_VAZIA })
  })
})
