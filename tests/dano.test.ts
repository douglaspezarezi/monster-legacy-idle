import { describe, expect, it } from 'vitest'
import { calcularDano, intervaloDeAcao } from '../src/engine/dano.ts'

describe('dano', () => {
  it('com atributos iguais, poder 100 tira metade do ataque', () => {
    expect(calcularDano(200, 200, 100, 1)).toBe(100)
  })

  it('aplica o multiplicador de tipo e arredonda para baixo', () => {
    expect(calcularDano(200, 200, 100, 2)).toBe(200)
    expect(calcularDano(200, 200, 100, 0.25)).toBe(25)
    expect(calcularDano(100, 50, 60, 1)).toBe(40)
    expect(calcularDano(100, 100, 45, 1)).toBe(22)
  })

  it('causa no mínimo 1, salvo imunidade', () => {
    expect(calcularDano(1, 1000, 10, 0.25)).toBe(1)
    expect(calcularDano(1000, 1, 100, 0)).toBe(0)
  })
})

describe('ritmo', () => {
  it('velocidades iguais agem a cada 2 s', () => {
    expect(intervaloDeAcao(50, 50)).toBe(2000)
  })

  it('o dobro da velocidade age a cada 1,33 s e a metade a cada 2,67 s', () => {
    expect(intervaloDeAcao(100, 50)).toBeCloseTo(1333.33, 1)
    expect(intervaloDeAcao(50, 100)).toBeCloseTo(2666.67, 1)
  })

  it('fica entre 0,5 s e 4 s', () => {
    expect(intervaloDeAcao(1_000_000, 1)).toBe(500)
    expect(intervaloDeAcao(7, 1)).toBe(500)
    expect(intervaloDeAcao(1, 1_000_000)).toBeLessThanOrEqual(4000)
    expect(intervaloDeAcao(1, 1_000_000)).toBeGreaterThan(3999)
  })

  it('recusa velocidade zero', () => {
    expect(() => intervaloDeAcao(0, 10)).toThrow(RangeError)
  })
})
