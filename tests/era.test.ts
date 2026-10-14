import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { ERAS } from '../src/conteudo/eras.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { podeReiniciarEra, reiniciarEra } from '../src/engine/era.ts'
import { trocarAtiva, vidaMaxima } from '../src/engine/jogo.ts'
import { ganharXp, xpParaSubir } from '../src/engine/nivel.ts'
import { jogoCom, membro } from './apoio.ts'

const HORA = 60 * 60 * 1000

describe('teto da Era', () => {
  it('a criatura não passa do teto e o XP para de contar nele', () => {
    const quase = membro('Gelusco', 49, 10)
    expect(ganharXp(quase, xpParaSubir(49) + 1000, 50)).toMatchObject({ nivel: 50, xpNoNivel: 0 })
  })

  it('na Era 1 a caçada não passa do nível 50', () => {
    const r = simularCacada(CONFIGURACAO, jogoCom(membro('Gelusco', 49, 20), { rota: 1, avancoAutomatico: false }), 0, HORA, criarGerador(1))
    expect(r.estado.ativa.nivel).toBe(50)
    expect(r.estado.ativa.xpNoNivel).toBe(0)
  })

  it('na Era 1 o chefe da rota 3 não libera a rota 4', () => {
    const estado = jogoCom(membro('Gelusco', 50, 20), { rota: 3, rotasLiberadas: 3, abatesPorRota: [0, 0, 100, 0, 0] })
    const r = simularCacada(CONFIGURACAO, estado, 0, 5 * 60 * 1000, criarGerador(2))
    expect(r.eventos).toContainEqual(expect.objectContaining({ tipo: 'abate', chefe: true }))
    expect(r.estado.rotasLiberadas).toBe(3)
    expect(r.estado.rota).toBe(3)
  })

  it('na Era 2 o chefe da rota 3 libera a rota 4', () => {
    const estado = jogoCom(membro('Gelusco', 60, 20, 1, 2), { era: 2, rota: 3, rotasLiberadas: 3, abatesPorRota: [0, 0, 100, 0, 0], avancoAutomatico: false })
    const r = simularCacada(CONFIGURACAO, estado, 0, 5 * 60 * 1000, criarGerador(2))
    expect(r.estado.rotasLiberadas).toBe(4)
  })
})

describe('reset de Era', () => {
  it('só com a criatura ativa no teto e com uma Era seguinte', () => {
    expect(podeReiniciarEra(ERAS, jogoCom(membro('Gelusco', 49, 10)))).toBe(false)
    expect(podeReiniciarEra(ERAS, jogoCom(membro('Gelusco', 50, 10)))).toBe(true)
    expect(podeReiniciarEra(ERAS, jogoCom(membro('Gelusco', 100, 10, 1, 2), { era: 2 }))).toBe(false)
    expect(() => reiniciarEra(CONFIGURACAO, jogoCom(membro('Gelusco', 49, 10)), 0)).toThrow(RangeError)
  })

  it('a ativa volta ao nível 1 com os mesmos genes; rotas e chefes voltam ao começo; o resto fica', () => {
    const ativa = { ...membro('Gelusco', 50, 13), xpNoNivel: 0 }
    const reserva = [membro('Brotelho', 20, 8, 2)]
    const antes = jogoCom(ativa, { reserva, rota: 3, rotasLiberadas: 3, abatesPorRota: [40, 20, 70, 0, 0] })
    const depois = reiniciarEra(CONFIGURACAO, antes, 5000)
    expect(depois.era).toBe(2)
    expect(depois.ativa).toEqual({ ...ativa, nivel: 1, era: 2 })
    expect(depois.vidaDaAtiva).toBe(vidaMaxima(CATALOGO, depois.ativa))
    expect(depois).toMatchObject({ rota: 1, rotasLiberadas: 1, abatesPorRota: [0, 0, 0, 0, 0], encontro: null, proximoSelvagemEm: 5000 })
    expect(depois.reserva).toEqual(reserva)
    expect(depois.inventario).toEqual(antes.inventario)
    expect(depois.forja).toEqual(antes.forja)
  })

  it('criatura da reserva de uma Era anterior volta ao nível 1 ao ser ativada', () => {
    const estado = jogoCom(membro('Gelusco', 1, 10, 1, 2), { era: 2, reserva: [membro('Brotelho', 30, 8, 2, 1), membro('Sapolho', 12, 8, 3, 2)] })
    const antiga = trocarAtiva(estado, CATALOGO, 2, 0)
    expect(antiga.ativa).toMatchObject({ id: 2, nivel: 1, xpNoNivel: 0, era: 2 })
    const atual = trocarAtiva(estado, CATALOGO, 3, 0)
    expect(atual.ativa).toMatchObject({ id: 3, nivel: 12, era: 2 })
  })

  it('o que nasce ou é capturado entra com a Era atual', () => {
    const estado = jogoCom(membro('Gelusco', 30, 20, 1, 2), {
      era: 2,
      filtroDeCaptura: { especies: ['Brotelho', 'Formigaço'], raridadeMinima: 'fraca' },
      avancoAutomatico: false,
    })
    const r = simularCacada(CONFIGURACAO, estado, 0, HORA, criarGerador(3))
    expect(r.estado.reserva.length).toBeGreaterThan(0)
    expect(r.estado.reserva.every((m) => m.era === 2)).toBe(true)
  })
})
