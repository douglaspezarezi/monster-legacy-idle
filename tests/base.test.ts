import { describe, expect, it } from 'vitest'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { avancarJogo } from '../src/engine/avanco.ts'
import {
  AFINIDADE_CERTA,
  AFINIDADE_OPOSTA,
  afinidade,
  colocarNaForja,
  colocarNaMina,
  fragmentosPorHoraDaMina,
  ouroPorHoraDaForja,
  produzir,
  tirarDaForja,
  tirarDaMina,
} from '../src/engine/base.ts'
import { multiplicadorDeRaridade } from '../src/engine/genes.ts'
import { trocarAtiva } from '../src/engine/jogo.ts'
import { CATALOGO } from '../src/conteudo/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

const HORA = 60 * 60 * 1000
const { tabela, forja } = CONFIGURACAO

function comNaForja(...reserva: ReturnType<typeof membro>[]) {
  let estado = jogoCom(membro('Gelusco', 10, 10), { reserva, proximoId: 10 })
  for (const m of reserva) estado = colocarNaForja(CONFIGURACAO, estado, m.id)
  return estado
}

describe('afinidade com a Forja', () => {
  it('+25% com um tipo do posto, −50% com um tipo que vence o posto, 1× nos demais', () => {
    expect(afinidade(tabela, forja, ['Chama'])).toBe(AFINIDADE_CERTA)
    expect(afinidade(tabela, forja, ['Maré', 'Brota'])).toBe(AFINIDADE_OPOSTA)
    expect(afinidade(tabela, forja, ['Rocha'])).toBe(AFINIDADE_OPOSTA)
    expect(afinidade(tabela, forja, ['Bruma'])).toBe(AFINIDADE_OPOSTA)
    expect(afinidade(tabela, forja, ['Brota'])).toBe(1)
  })

  it('com as duas, fica a afinidade certa', () => {
    expect(afinidade(tabela, forja, ['Faísca', 'Rocha'])).toBe(AFINIDADE_CERTA)
  })
})

describe('Forja', () => {
  it('cada criatura produz 100 de ouro por hora × raridade × afinidade', () => {
    const brotelho = membro('Brotelho', 3, 10, 2)
    const sapolho = membro('Sapolho', 3, 10, 3)
    const estado = comNaForja(brotelho, sapolho)
    const raridade = multiplicadorDeRaridade(brotelho.genes)
    expect(ouroPorHoraDaForja(CONFIGURACAO, estado)).toBeCloseTo(100 * raridade + 100 * raridade * AFINIDADE_OPOSTA)
  })

  it('o ouro inteiro entra no inventário e a fração fica para depois', () => {
    const estado = comNaForja(membro('Brotelho', 3, 5, 2))
    const porHora = ouroPorHoraDaForja(CONFIGURACAO, estado)
    const metade = produzir(CONFIGURACAO, estado, 0, HORA / 2)
    const resto = produzir(CONFIGURACAO, metade.estado, HORA / 2, HORA)
    expect(metade.ouro).toBe(Math.floor(porHora / 2))
    expect(resto.estado.inventario.ouro).toBe(estado.inventario.ouro + Math.floor(porHora))
    expect(resto.estado.forja.ouroFracionario).toBeCloseTo(porHora - Math.floor(porHora))
  })

  it('produz também com a caçada pausada', () => {
    const estado = { ...comNaForja(membro('Brotelho', 3, 10, 2)), pausada: true }
    const r = avancarJogo(CONFIGURACAO, estado, 0, HORA, criarGerador(1))
    expect(r.ouroDaForja).toBeGreaterThan(0)
    expect(r.estado.inventario.ouro).toBe(estado.inventario.ouro + r.ouroDaForja)
  })

  it('tem 3 vagas', () => {
    const quatro = [2, 3, 4, 5].map((id) => membro('Brotelho', 1, 5, id))
    let estado = jogoCom(membro('Gelusco', 1, 5), { reserva: quatro })
    for (const m of quatro.slice(0, 3)) estado = colocarNaForja(CONFIGURACAO, estado, m.id)
    expect(() => colocarNaForja(CONFIGURACAO, estado, 5)).toThrow(RangeError)
    expect(colocarNaForja(CONFIGURACAO, tirarDaForja(estado, 2), 5).forja.trabalhadores).toEqual([3, 4, 5])
  })

  it('só aceita criatura da reserva', () => {
    expect(() => colocarNaForja(CONFIGURACAO, jogoCom(membro('Gelusco', 1, 5)), 1)).toThrow(RangeError)
  })

  it('criatura trabalhando não vira a ativa', () => {
    const estado = comNaForja(membro('Brotelho', 3, 10, 2))
    expect(() => trocarAtiva(estado, CATALOGO, 2, 0)).toThrow(RangeError)
    expect(trocarAtiva(tirarDaForja(estado, 2), CATALOGO, 2, 0).ativa.id).toBe(2)
  })
})

describe('Mina', () => {
  const { mina } = CONFIGURACAO

  it('afinidade com Rocha, Cristal e Liga; −50% com quem vence um deles', () => {
    expect(afinidade(tabela, mina, ['Liga'])).toBe(AFINIDADE_CERTA)
    expect(afinidade(tabela, mina, ['Cristal', 'Eco'])).toBe(AFINIDADE_CERTA)
    for (const tipo of ['Maré', 'Brota', 'Astro', 'Penumbra', 'Faísca', 'Eco'] as const) expect(afinidade(tabela, mina, [tipo])).toBe(AFINIDADE_OPOSTA)
    expect(afinidade(tabela, mina, ['Geada'])).toBe(1)
  })

  it('produz 10 Fragmentos por hora × raridade × afinidade, também com a caçada pausada', () => {
    const seixote = membro('Seixote', 3, 10, 2)
    const estado = { ...colocarNaMina(CONFIGURACAO, jogoCom(membro('Gelusco', 10, 10), { reserva: [seixote], proximoId: 3 }), 2), pausada: true }
    const porHora = 10 * multiplicadorDeRaridade(seixote.genes) * AFINIDADE_CERTA
    expect(fragmentosPorHoraDaMina(CONFIGURACAO, estado)).toBeCloseTo(porHora)
    const r = avancarJogo(CONFIGURACAO, estado, 0, 10 * HORA, criarGerador(1))
    expect(r.fragmentosDaMina).toBe(Math.floor(porHora * 10))
    expect(r.estado.inventario.fragmentos).toBe(r.fragmentosDaMina)
    expect(r.ouroDaForja).toBe(0)
  })

  it('o resto de um período fica para o seguinte', () => {
    const estado = colocarNaMina(CONFIGURACAO, jogoCom(membro('Gelusco', 10, 10), { reserva: [membro('Seixote', 3, 10, 2)], proximoId: 3 }), 2)
    const meia = produzir(CONFIGURACAO, estado, 0, HORA / 2)
    const outra = produzir(CONFIGURACAO, meia.estado, HORA / 2, HORA)
    expect(meia.fragmentos + outra.fragmentos).toBe(Math.floor(fragmentosPorHoraDaMina(CONFIGURACAO, estado)))
  })

  it('3 vagas; uma criatura trabalha num posto por vez e quem trabalha não é ativada', () => {
    const quatro = [2, 3, 4, 5].map((id) => membro('Seixote', 3, 5, id))
    let estado = jogoCom(membro('Gelusco', 10, 10), { reserva: quatro, proximoId: 6 })
    for (const m of quatro.slice(0, 3)) estado = colocarNaMina(CONFIGURACAO, estado, m.id)
    expect(() => colocarNaMina(CONFIGURACAO, estado, 5)).toThrow(RangeError)
    expect(() => colocarNaForja(CONFIGURACAO, estado, 2)).toThrow(RangeError)
    expect(() => trocarAtiva(estado, CATALOGO, 2, 0)).toThrow(RangeError)
    const livre = tirarDaMina(estado, 2)
    expect(livre.mina.trabalhadores).toEqual([3, 4])
    expect(colocarNaForja(CONFIGURACAO, livre, 2).forja.trabalhadores).toEqual([2])
  })
})
