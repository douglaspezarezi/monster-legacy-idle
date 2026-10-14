import { describe, expect, it } from 'vitest'
import { calcularAtributos } from '../src/engine/criatura.ts'

describe('atributos da criatura', () => {
  const bases = { vida: 100, ataque: 20, defesa: 20, foco: 20, velocidade: 20 }
  // Soma 29, Comum, multiplicador 1,03.
  const genes = { vida: 5, ataque: 6, defesa: 6, foco: 6, velocidade: 6 }

  it('usa o gene de cada atributo e o multiplicador da soma', () => {
    const atributos = calcularAtributos(bases, genes, 11, false)
    expect(atributos.vida).toBeCloseTo(100 + 5 * 1.03 * 10)
    expect(atributos.ataque).toBeCloseTo(20 + 6 * 1.03 * 10)
  })

  it('aplica o bônus prismático', () => {
    expect(calcularAtributos(bases, genes, 1, true).vida).toBeCloseTo(110)
  })
})
