import { describe, expect, it } from 'vitest'
import type { Genes } from '../src/engine/genes.ts'
import { faixaPelaSoma, podeSerPrismatica, raridadeDosGenes, somaDosGenes } from '../src/engine/genes.ts'

function genesIguais(valor: number): Genes {
  return { vida: valor, ataque: valor, defesa: valor, foco: valor, velocidade: valor }
}

describe('genes e raridade', () => {
  it('soma os cinco genes', () => {
    expect(somaDosGenes({ vida: 1, ataque: 2, defesa: 3, foco: 4, velocidade: 5 })).toBe(15)
  })

  it('recusa gene fora de 1 a 20 ou fracionário', () => {
    expect(() => somaDosGenes({ ...genesIguais(10), vida: 0 })).toThrow(RangeError)
    expect(() => somaDosGenes({ ...genesIguais(10), foco: 21 })).toThrow(RangeError)
    expect(() => somaDosGenes({ ...genesIguais(10), ataque: 2.5 })).toThrow(RangeError)
  })

  it.each([
    [5, 'fraca'], [20, 'fraca'], [21, 'comum'], [45, 'comum'], [46, 'incomum'], [65, 'incomum'],
    [66, 'rara'], [80, 'rara'], [81, 'epica'], [90, 'epica'], [91, 'lendaria'], [96, 'lendaria'],
    [97, 'mitica'], [100, 'mitica'],
  ])('soma %i é %s', (soma, raridade) => {
    expect(faixaPelaSoma(soma).raridade).toBe(raridade)
  })

  it('as faixas cobrem de 5 a 100 sem buraco', () => {
    for (let soma = 5; soma <= 100; soma++) expect(() => faixaPelaSoma(soma)).not.toThrow()
    expect(() => faixaPelaSoma(4)).toThrow(RangeError)
    expect(() => faixaPelaSoma(101)).toThrow(RangeError)
  })

  it('deriva a raridade dos genes', () => {
    expect(raridadeDosGenes(genesIguais(1))).toBe('fraca')
    expect(raridadeDosGenes(genesIguais(20))).toBe('mitica')
  })

  it('variação prismática só a partir da épica', () => {
    expect(podeSerPrismatica('rara')).toBe(false)
    expect(podeSerPrismatica('epica')).toBe(true)
    expect(podeSerPrismatica('mitica')).toBe(true)
  })
})
