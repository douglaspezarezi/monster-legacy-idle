import { describe, expect, it } from 'vitest'
import { MATA_FUNDA } from '../src/conteudo/biomas.ts'
import { ESPECIES } from '../src/conteudo/especies.ts'
import { TECNICAS } from '../src/conteudo/tecnicas.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { combatenteDe } from '../src/engine/criatura.ts'
import { porNome } from '../src/engine/especie.ts'
import { raridadeDosGenes } from '../src/engine/genes.ts'
import {
  CHANCES_DE_RARIDADE_DO_SELVAGEM,
  abrirMatriz,
  criarCriatura,
  criarInicial,
  especieDoChefe,
  faixaDoSelvagem,
  gerarChefe,
  gerarSelvagem,
  sortearRaridadeDoSelvagem,
} from '../src/engine/nascimento.ts'

const catalogo = { especies: porNome(ESPECIES), tecnicas: porNome(TECNICAS) }

describe('nascimento de criaturas', () => {
  it('as chances de raridade do selvagem somam 100%', () => {
    const total = CHANCES_DE_RARIDADE_DO_SELVAGEM.reduce((soma, [, chance]) => soma + chance, 0)
    expect(total).toBeCloseTo(1, 10)
  })

  it('sorteia a raridade do selvagem nas proporções da tabela', () => {
    const gerador = criarGerador(1)
    const contagem = new Map<string, number>()
    const n = 200_000
    for (let i = 0; i < n; i++) {
      const raridade = sortearRaridadeDoSelvagem(gerador)
      contagem.set(raridade, (contagem.get(raridade) ?? 0) + 1)
    }
    expect((contagem.get('fraca') ?? 0) / n).toBeCloseTo(0.25, 2)
    expect((contagem.get('comum') ?? 0) / n).toBeCloseTo(0.55, 2)
    expect((contagem.get('rara') ?? 0) / n).toBeCloseTo(0.04, 2)
  })

  it('selvagem: espécie da rota, nível na faixa e genes na raridade sorteada', () => {
    const gerador = criarGerador(2)
    for (let i = 0; i < 200; i++) {
      const selvagem = gerarSelvagem(gerador, MATA_FUNDA.especiesPorRota[1], [11, 25])
      expect(MATA_FUNDA.especiesPorRota[1]).toContain(selvagem.especie)
      expect(selvagem.nivel).toBeGreaterThanOrEqual(11)
      expect(selvagem.nivel).toBeLessThanOrEqual(25)
      expect(selvagem.xpNoNivel).toBe(0)
    }
  })

  it('o nível do selvagem não passa do nível da criatura ativa nem sai da faixa da rota', () => {
    expect(faixaDoSelvagem([1, 10], 1)).toEqual([1, 1])
    expect(faixaDoSelvagem([1, 10], 6)).toEqual([1, 6])
    expect(faixaDoSelvagem([1, 10], 40)).toEqual([1, 10])
    expect(faixaDoSelvagem([11, 25], 4)).toEqual([11, 11])
  })

  it('variação prismática só a partir da épica, com 2% de chance', () => {
    const gerador = criarGerador(3)
    expect(Array.from({ length: 500 }, () => criarCriatura(gerador, 'Brotelho', 'rara', 1)).some((c) => c.prismatica)).toBe(false)
    const n = 20_000
    let prismaticas = 0
    for (let i = 0; i < n; i++) if (criarCriatura(gerador, 'Brotelho', 'epica', 1).prismatica) prismaticas++
    expect(prismaticas / n).toBeCloseTo(0.02, 2)
  })

  it('o chefe é a espécie de maior soma de bases, no nível máximo, rara', () => {
    // Rota 5: Ferroa 88, Raizudo 102, Penugem 92.
    expect(especieDoChefe(catalogo, MATA_FUNDA.especiesPorRota[4])).toBe('Raizudo')
    const chefe = gerarChefe(catalogo, criarGerador(4), MATA_FUNDA.especiesPorRota[4], [76, 100])
    expect(chefe).toMatchObject({ especie: 'Raizudo', nivel: 100, prismatica: false })
    expect(raridadeDosGenes(chefe.genes)).toBe('rara')
  })

  it('matriz gera a criatura no nível 1, na raridade da matriz', () => {
    const criatura = abrirMatriz(criarGerador(5), { especie: 'Sapolho', raridade: 'incomum' })
    expect(criatura).toMatchObject({ especie: 'Sapolho', nivel: 1, xpNoNivel: 0 })
    expect(raridadeDosGenes(criatura.genes)).toBe('incomum')
  })

  it('inicial começa no nível 1, comum', () => {
    const inicial = criarInicial(criarGerador(6), 'Gelusco')
    expect(inicial).toMatchObject({ especie: 'Gelusco', nivel: 1, prismatica: false })
    expect(raridadeDosGenes(inicial.genes)).toBe('comum')
  })

  it('o combatente vem com a vida cheia e a Vida multiplicada', () => {
    const criatura = criarInicial(criarGerador(7), 'Brotelho')
    const normal = combatenteDe(catalogo, criatura)
    const rota5 = combatenteDe(catalogo, criatura, 4)
    expect(normal).toMatchObject({ especie: 'Brotelho', tipos: ['Brota'] })
    expect(normal.tecnicas.map((t) => t.nome)).toEqual(['Esporos', 'Golpe de Galho', 'Mordida'])
    expect(rota5.atributos.vida).toBeCloseTo(normal.atributos.vida * 4)
    expect(rota5.vida).toBe(rota5.atributos.vida)
    expect(rota5.atributos.ataque).toBe(normal.atributos.ataque)
  })
})
