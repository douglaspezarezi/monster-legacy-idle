import { describe, expect, it } from 'vitest'
import type { CrescimentoDeAtributo } from '../src/engine/atributos.ts'
import { ganhoPorNivel, valorDoAtributo } from '../src/engine/atributos.ts'

const crescimento: CrescimentoDeAtributo = { base: 50, gene: 10, multiplicadorDeRaridade: 1.2, prismatica: false }

describe('atributos', () => {
  it('ganho por nível é gene vezes multiplicador da raridade', () => {
    expect(ganhoPorNivel(10, 1.2)).toBeCloseTo(12)
  })

  it('no nível 1 vale a base', () => {
    expect(valorDoAtributo(crescimento, 1)).toBe(50)
  })

  it('cresce o ganho cheio até o nível 150', () => {
    expect(valorDoAtributo(crescimento, 150)).toBeCloseTo(50 + 12 * 149)
  })

  it('depois do 150 cada nível rende 25% do ganho', () => {
    expect(valorDoAtributo(crescimento, 151)).toBeCloseTo(50 + 12 * 149 + 3)
    expect(valorDoAtributo(crescimento, 200)).toBeCloseTo(50 + 12 * 149 + 3 * 50)
  })

  it('prismática soma 10% ao valor final', () => {
    expect(valorDoAtributo({ ...crescimento, prismatica: true }, 11)).toBeCloseTo((50 + 12 * 10) * 1.1)
  })

  it('recusa nível fora de 1 a 200', () => {
    expect(() => valorDoAtributo(crescimento, 0)).toThrow(RangeError)
    expect(() => valorDoAtributo(crescimento, 201)).toThrow(RangeError)
  })
})
