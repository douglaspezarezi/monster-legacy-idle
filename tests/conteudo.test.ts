import { describe, expect, it } from 'vitest'
import { BIOMAS } from '../src/conteudo/biomas.ts'
import { ESPECIES, INICIAIS } from '../src/conteudo/especies.ts'
import { ROTAS } from '../src/conteudo/rotas.ts'
import { TECNICAS } from '../src/conteudo/tecnicas.ts'
import { TIPOS } from '../src/conteudo/tipos.ts'
import { TECNICAS_POR_CRIATURA } from '../src/engine/tecnicas.ts'

const nomesDeEspecies = new Set(ESPECIES.map((e) => e.nome))
const nomesDeTecnicas = new Set(TECNICAS.map((t) => t.nome))

describe('conteúdo', () => {
  it('nomes de espécies e técnicas não se repetem', () => {
    expect(nomesDeEspecies.size).toBe(ESPECIES.length)
    expect(nomesDeTecnicas.size).toBe(TECNICAS.length)
  })

  it.each(ESPECIES)('$nome tem 1 ou 2 tipos, bases positivas e técnicas cadastradas', (especie) => {
    expect(especie.tipos.length).toBeGreaterThanOrEqual(1)
    expect(especie.tipos.length).toBeLessThanOrEqual(2)
    for (const tipo of especie.tipos) expect(TIPOS).toContain(tipo)
    for (const valor of Object.values(especie.bases)) expect(valor).toBeGreaterThan(0)
    expect(especie.tecnicas.length).toBeGreaterThan(0)
    expect(especie.tecnicas.length).toBeLessThanOrEqual(TECNICAS_POR_CRIATURA)
    for (const tecnica of especie.tecnicas) expect(nomesDeTecnicas).toContain(tecnica)
  })

  it('iniciais e espécies dos biomas existem', () => {
    for (const nome of INICIAIS) expect(nomesDeEspecies).toContain(nome)
    for (const bioma of BIOMAS) {
      expect(bioma.especiesPorRota).toHaveLength(ROTAS.length)
      for (const especies of bioma.especiesPorRota) {
        expect(especies.length).toBeGreaterThan(0)
        for (const nome of especies) expect(nomesDeEspecies).toContain(nome)
      }
    }
  })

  it('nomes únicos e toda espécie que não é inicial aparece em algum bioma', () => {
    expect(nomesDeEspecies.size).toBe(ESPECIES.length)
    expect(nomesDeTecnicas.size).toBe(TECNICAS.length)
    const nosBiomas = new Set(BIOMAS.flatMap((b) => b.especiesPorRota.flat()))
    for (const nome of nomesDeEspecies) {
      if (!(INICIAIS as readonly string[]).includes(nome)) expect(nosBiomas).toContain(nome)
    }
  })

  it('a Era 1 tem quatro biomas de tipos diferentes', () => {
    expect(BIOMAS.map((b) => b.tipo)).toEqual(['Brota', 'Rocha', 'Fera', 'Maré'])
  })

  it('as faixas de nível das rotas são contíguas', () => {
    expect(ROTAS[0].faixaDeNivel[0]).toBe(1)
    for (let i = 1; i < ROTAS.length; i++) {
      expect(ROTAS[i].faixaDeNivel[0]).toBe(ROTAS[i - 1].faixaDeNivel[1] + 1)
    }
  })
})
