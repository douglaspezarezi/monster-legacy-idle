import { describe, expect, it } from 'vitest'
import { criarGerador, inteiroEntre } from '../src/engine/aleatorio.ts'

describe('gerador com semente', () => {
  it('a mesma semente repete a sequência', () => {
    const a = criarGerador(42)
    const b = criarGerador(42)
    for (let i = 0; i < 100; i++) expect(a()).toBe(b())
  })

  it('sementes diferentes dão sequências diferentes', () => {
    expect(criarGerador(1)()).not.toBe(criarGerador(2)())
  })

  it('inteiroEntre cobre os dois extremos e não sai deles', () => {
    const gerador = criarGerador(7)
    const vistos = new Set<number>()
    for (let i = 0; i < 2000; i++) vistos.add(inteiroEntre(gerador, 1, 20))
    expect([...vistos].sort((x, y) => x - y)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  })
})
