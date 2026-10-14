import { describe, expect, it } from 'vitest'
import type { TabelaDeTipos } from '../src/engine/multiplicador-de-tipo.ts'
import { multiplicadorDeTipo } from '../src/engine/multiplicador-de-tipo.ts'

// Tabela fictícia, só para o teste; a do jogo vem do conteúdo.
type Tipo = 'a' | 'b' | 'c' | 'd' | 'e'
const tabela: TabelaDeTipos<Tipo> = (tecnica, defensor) => {
  if (tecnica !== 'a') return 'neutra'
  if (defensor === 'b' || defensor === 'c') return 'vantagem'
  if (defensor === 'd') return 'resistencia'
  if (defensor === 'e') return 'imunidade'
  return 'neutra'
}

describe('multiplicador de tipo', () => {
  it.each<[Tipo[], number]>([
    [['a'], 1],
    [['b'], 2],
    [['b', 'c'], 4],
    [['d'], 0.5],
    [['d', 'd'], 0.25],
    [['e'], 0],
    [['b', 'e'], 0],
    [['b', 'd'], 1],
  ])('contra %j vale %d', (defensor, esperado) => {
    expect(multiplicadorDeTipo(tabela, 'a', defensor)).toBe(esperado)
  })

  it('recusa criatura sem tipo ou com mais de dois', () => {
    expect(() => multiplicadorDeTipo(tabela, 'a', [])).toThrow(RangeError)
    expect(() => multiplicadorDeTipo(tabela, 'a', ['b', 'c', 'd'])).toThrow(RangeError)
  })
})
