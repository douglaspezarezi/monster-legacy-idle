import { describe, expect, it } from 'vitest'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { estimarXpPorHora, melhorRota, rotasAbertas } from '../src/engine/estimativa.ts'
import { jogoCom, membro } from './apoio.ts'

describe('rotas abertas', () => {
  it('só biomas da Era atual, até as rotas liberadas de cada um', () => {
    const estado = jogoCom(membro('Gelusco', 30, 10), { rotasLiberadas: 3, outrosBiomas: { 2: { rota: 2, rotasLiberadas: 2, abatesPorRota: [0, 0, 0, 0, 0, 0, 0] } } })
    const rotas = rotasAbertas(CONFIGURACAO, estado)
    expect(rotas.filter((r) => r.bioma === 0).map((r) => r.rota)).toEqual([1, 2, 3])
    expect(rotas.filter((r) => r.bioma === 2).map((r) => r.rota)).toEqual([1, 2])
    expect(rotas.filter((r) => r.bioma === 1).map((r) => r.rota)).toEqual([1])
    expect(rotas.every((r) => CONFIGURACAO.biomas[r.bioma].era === 1)).toBe(true)
  })
})

describe('estimativa de XP por hora', () => {
  // Couraçor (Liga, Rocha) vence Geada: rende mais na Planície Gelada que nas Ruínas de Ferro (GDD, seção 4).
  const couracor = jogoCom(membro('Couraçor', 200, 17, 1, 4), { era: 4 })

  it('o tipo certo rende mais', () => {
    const geada = estimarXpPorHora(CONFIGURACAO, couracor, { bioma: 12, rota: 7 }, criarGerador(1))
    const ferro = estimarXpPorHora(CONFIGURACAO, couracor, { bioma: 13, rota: 7 }, criarGerador(1))
    expect(geada).toBeGreaterThan(ferro * 1.3)
  })

  it('não muda o estado e repete o resultado com a mesma semente', () => {
    const antes = JSON.stringify(couracor)
    const a = estimarXpPorHora(CONFIGURACAO, couracor, { bioma: 12, rota: 7 }, criarGerador(7))
    const b = estimarXpPorHora(CONFIGURACAO, couracor, { bioma: 12, rota: 7 }, criarGerador(7))
    expect(a).toBe(b)
    expect(JSON.stringify(couracor)).toBe(antes)
  })

  it('a melhor rota é a de mais XP por hora', () => {
    expect(melhorRota([])).toBeNull()
    expect(melhorRota([{ bioma: 0, rota: 1, xpPorHora: 10 }, { bioma: 1, rota: 2, xpPorHora: 30 }, { bioma: 2, rota: 1, xpPorHora: 30 }])).toEqual({ bioma: 1, rota: 2, xpPorHora: 30 })
  })
})
