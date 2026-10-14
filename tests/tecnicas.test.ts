import { describe, expect, it } from 'vitest'
import { escolherTecnica } from '../src/engine/tecnicas.ts'

describe('fila de técnicas', () => {
  it('usa a primeira técnica fora de recarga', () => {
    expect(escolherTecnica([0, 0, 0, 0], 10)).toBe(0)
    expect(escolherTecnica([20, 5, 0, 0], 10)).toBe(1)
  })

  it('a recarga termina exatamente no instante marcado', () => {
    expect(escolherTecnica([10, 0], 10)).toBe(0)
  })

  it('usa o ataque básico quando todas recarregam', () => {
    expect(escolherTecnica([11, 12, 13, 14], 10)).toBeNull()
    expect(escolherTecnica([], 10)).toBeNull()
  })

  it('recusa mais de 4 técnicas', () => {
    expect(() => escolherTecnica([0, 0, 0, 0, 0], 0)).toThrow(RangeError)
  })
})
