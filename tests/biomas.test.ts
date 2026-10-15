import { describe, expect, it } from 'vitest'
import { BIOMAS } from '../src/conteudo/biomas.ts'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { reiniciarEra } from '../src/engine/era.ts'
import { escolherBioma } from '../src/engine/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

const MINUTO = 60 * 1000

describe('biomas', () => {
  it('a caçada encontra as espécies do bioma escolhido', () => {
    const estado = escolherBioma(jogoCom(membro('Gelusco', 20, 15), { avancoAutomatico: false }), BIOMAS, 3, 0)
    const r = simularCacada(CONFIGURACAO, estado, 0, 10 * MINUTO, criarGerador(1))
    const especies = new Set(r.eventos.flatMap((e) => (e.tipo === 'abate' ? [e.especie] : [])))
    expect([...especies].sort()).toEqual([...BIOMAS[3].especiesPorRota[0]].sort())
  })

  it('cada bioma guarda a rota, as rotas liberadas e os contadores de chefe', () => {
    const naMata = jogoCom(membro('Gelusco', 20, 15), { rota: 2, rotasLiberadas: 3, abatesPorRota: [5, 40, 0, 0, 0] })
    const naSerra = escolherBioma(naMata, BIOMAS, 1, 1000)
    expect(naSerra).toMatchObject({ bioma: 1, rota: 1, rotasLiberadas: 1, abatesPorRota: [0, 0, 0, 0, 0], encontro: null, proximoSelvagemEm: 1000 })
    const deVolta = escolherBioma({ ...naSerra, abatesPorRota: [7, 0, 0, 0, 0] }, BIOMAS, 0, 2000)
    expect(deVolta).toMatchObject({ bioma: 0, rota: 2, rotasLiberadas: 3, abatesPorRota: [5, 40, 0, 0, 0] })
    expect(deVolta.outrosBiomas[1]).toEqual({ rota: 1, rotasLiberadas: 1, abatesPorRota: [7, 0, 0, 0, 0] })
  })

  it('bioma da Era 2 só abre a partir da Era 2', () => {
    const naEra1 = jogoCom(membro('Gelusco', 10, 10))
    expect(() => escolherBioma(naEra1, BIOMAS, 4, 0)).toThrow(RangeError)
    const naEra2 = jogoCom(membro('Gelusco', 10, 10, 1, 2), { era: 2 })
    expect(escolherBioma(naEra2, BIOMAS, 4, 0).bioma).toBe(4)
  })

  it('bioma da Era 3 só abre a partir da Era 3', () => {
    const naEra2 = jogoCom(membro('Gelusco', 10, 10, 1, 2), { era: 2 })
    expect(() => escolherBioma(naEra2, BIOMAS, 8, 0)).toThrow(RangeError)
    const naEra3 = jogoCom(membro('Gelusco', 10, 10, 1, 3), { era: 3 })
    expect(escolherBioma(naEra3, BIOMAS, 8, 0).bioma).toBe(8)
  })

  it('bioma da Era 4 só abre a partir da Era 4', () => {
    const naEra3 = jogoCom(membro('Gelusco', 10, 10, 1, 3), { era: 3 })
    expect(() => escolherBioma(naEra3, BIOMAS, 12, 0)).toThrow(RangeError)
    const naEra4 = jogoCom(membro('Gelusco', 10, 10, 1, 4), { era: 4 })
    expect(escolherBioma(naEra4, BIOMAS, 12, 0).bioma).toBe(12)
  })

  it('recusa bioma inexistente e não muda nada ao escolher o mesmo', () => {
    const estado = jogoCom(membro('Gelusco', 1, 5))
    expect(() => escolherBioma(estado, BIOMAS, 99, 0)).toThrow(RangeError)
    expect(escolherBioma(estado, BIOMAS, 0, 0)).toBe(estado)
  })

  it('o reset de Era volta todos os biomas à rota 1', () => {
    const naMata = jogoCom(membro('Gelusco', 50, 15), { rotasLiberadas: 3, rota: 3 })
    const naSerra = { ...escolherBioma(naMata, BIOMAS, 1, 0), rotasLiberadas: 2, rota: 2 }
    const depois = reiniciarEra(CONFIGURACAO, naSerra, 0)
    expect(depois).toMatchObject({ bioma: 1, rota: 1, rotasLiberadas: 1, outrosBiomas: {} })
  })
})
