import { describe, expect, it } from 'vitest'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { MERCADO } from '../src/conteudo/mercado.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { avancarJogo } from '../src/engine/avanco.ts'
import type { EstadoDoJogo } from '../src/engine/jogo.ts'
import { abrirMatrizDoInventario } from '../src/engine/jogo.ts'
import {
  atualizarMercado,
  comprarNoMercado,
  diaDoMercado,
  especiesDoMercado,
  impedimentoDaCompra,
  proximaTroca,
} from '../src/engine/mercado.ts'
import { jogoCom, membro } from './apoio.ts'

const HORA = 60 * 60 * 1000
// 23/10/2026, 12h em Brasília (15h UTC).
const MEIO_DIA = Date.UTC(2026, 9, 23, 15)

function naEra(era: number, ouro = 0): EstadoDoJogo<Tipo> {
  const estado = jogoCom(membro('Couraçor', 200, 15, 1, era), { era })
  return { ...estado, inventario: { ...estado.inventario, ouro } }
}

const aberto = (ouro = 0) => atualizarMercado(CONFIGURACAO, naEra(4, ouro), MEIO_DIA, criarGerador(1))

describe('Mercado da Cidade', () => {
  it('o estoque troca à meia-noite de Brasília', () => {
    const meiaNoite = Date.UTC(2026, 9, 24, 3)
    expect(diaDoMercado(MERCADO, meiaNoite - 1)).toBe(diaDoMercado(MERCADO, MEIO_DIA))
    expect(diaDoMercado(MERCADO, meiaNoite)).toBe(diaDoMercado(MERCADO, MEIO_DIA) + 1)
    expect(proximaTroca(MERCADO, MEIO_DIA)).toBe(meiaNoite)
  })

  it('abre na Era 4 com 3 épicas, 2 lendárias e 1 mítica de espécies diferentes, a preço fixo', () => {
    expect(atualizarMercado(CONFIGURACAO, naEra(3), MEIO_DIA, criarGerador(1)).mercado.ofertas).toEqual([])
    const { ofertas } = aberto().mercado
    expect(ofertas.map((o) => o.raridade)).toEqual(['epica', 'epica', 'epica', 'lendaria', 'lendaria', 'mitica'])
    expect(ofertas.map((o) => o.preco)).toEqual([1e6, 1e6, 1e6, 5e6, 5e6, 2e7])
    expect(new Set(ofertas.map((o) => o.especie)).size).toBe(6)
    const especies = especiesDoMercado(CONFIGURACAO)
    for (const oferta of ofertas) expect(especies).toContain(oferta.especie)
  })

  it('as espécies vêm das rotas dos 16 biomas', () => {
    const especies = especiesDoMercado(CONFIGURACAO)
    expect(especies).toContain('Brotelho')
    expect(especies).toContain('Permafrio')
    expect(new Set(especies).size).toBe(especies.length)
  })

  it('o estoque fica o dia todo e troca no dia seguinte', () => {
    const estado = aberto()
    expect(atualizarMercado(CONFIGURACAO, estado, MEIO_DIA + 10 * HORA, criarGerador(2))).toBe(estado)
    const amanha = atualizarMercado(CONFIGURACAO, estado, MEIO_DIA + 13 * HORA, criarGerador(2))
    expect(amanha.mercado.dia).toBe(estado.mercado.dia + 1)
    expect(amanha.mercado.ofertas).not.toEqual(estado.mercado.ofertas)
  })

  it('comprar gasta o ouro, põe a matriz no inventário e marca a oferta', () => {
    const estado = aberto(6e6)
    const depois = comprarNoMercado(MERCADO, estado, 3)
    const oferta = estado.mercado.ofertas[3]
    expect(depois.inventario.ouro).toBe(1e6)
    expect(depois.inventario.matrizes).toEqual([{ especie: oferta.especie, raridade: 'lendaria' }])
    expect(depois.mercado.ofertas[3].comprada).toBe(true)
    expect(impedimentoDaCompra(MERCADO, depois, 3)).toMatch(/já comprada/)
  })

  it('recusa sem ouro, oferta inexistente ou antes da Era 4', () => {
    expect(impedimentoDaCompra(MERCADO, aberto(1e6 - 1), 0)).toMatch(/ouro/)
    expect(impedimentoDaCompra(MERCADO, aberto(1e6), 0)).toBeNull()
    expect(impedimentoDaCompra(MERCADO, aberto(1e9), 6)).toMatch(/inexistente/)
    expect(impedimentoDaCompra(MERCADO, { ...aberto(1e9), era: 3 }, 0)).toMatch(/Era 4/)
    expect(() => comprarNoMercado(MERCADO, aberto(0), 0)).toThrow(RangeError)
  })

  it('a matriz comprada vira criatura na reserva', () => {
    const comprado = comprarNoMercado(MERCADO, aberto(2e7), 5)
    const aberta = abrirMatrizDoInventario(comprado, 0, criarGerador(3))
    expect(aberta.reserva).toHaveLength(1)
    expect(aberta.reserva[0]).toMatchObject({ especie: comprado.mercado.ofertas[5].especie, nivel: 1 })
  })

  it('o jogo sorteia o estoque ao avançar, sem mudar a caçada', () => {
    const estado = { ...naEra(4), bioma: 12, rota: 7, rotasLiberadas: 7, avancoAutomatico: false }
    const com = avancarJogo(CONFIGURACAO, estado, MEIO_DIA, MEIO_DIA + HORA, criarGerador(4))
    const semMercado = avancarJogo({ ...CONFIGURACAO, mercado: { ...MERCADO, era: 5 } }, estado, MEIO_DIA, MEIO_DIA + HORA, criarGerador(4))
    expect(com.estado.mercado.ofertas).toHaveLength(6)
    expect(com.eventos).toEqual(semMercado.eventos)
  })
})
