import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { ROTAS } from '../src/conteudo/rotas.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { ESPACOS_NA_RESERVA } from '../src/engine/captura.ts'
import { raridadeDosGenes } from '../src/engine/genes.ts'
import {
  INVENTARIO_INICIAL,
  abrirMatrizDoInventario,
  comprar,
  definirGatilhoDeCura,
  escolherRota,
  novoJogo,
  retomarCacada,
  trocarAtiva,
  vidaAtual,
  vidaMaxima,
} from '../src/engine/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

describe('início do jogo', () => {
  it('inicial no nível 1, comum, vida cheia, rota 1 e o inventário do GDD', () => {
    const jogo = novoJogo(CATALOGO, ROTAS.length, 'Rebitim', 0, criarGerador(1))
    expect(jogo.ativa).toMatchObject({ id: 1, especie: 'Rebitim', nivel: 1, xpNoNivel: 0, prismatica: false })
    expect(raridadeDosGenes(jogo.ativa.genes)).toBe('comum')
    expect(jogo.vidaDaAtiva).toBe(vidaMaxima(CATALOGO, jogo.ativa))
    expect(jogo.inventario).toEqual({ ouro: 200, capsulas: 10, tonicosDeCura: 5, tonicosDeRetorno: 5, matrizes: [] })
    expect(jogo).toMatchObject({ rota: 1, rotasLiberadas: 1, gatilhoDeCura: 0.3, reserva: [], pausada: false })
  })
})

describe('Loja da Cidade', () => {
  const jogo = jogoCom(membro('Gelusco', 1, 5))

  it('troca ouro pelo item, no preço do GDD', () => {
    expect(comprar(jogo, 'capsula', 2).inventario).toMatchObject({ ouro: 100, capsulas: 12 })
    expect(comprar(jogo, 'tonicoDeCura', 1).inventario).toMatchObject({ ouro: 175, tonicosDeCura: 6 })
    expect(comprar(jogo, 'tonicoDeRetorno', 1).inventario).toMatchObject({ ouro: 50, tonicosDeRetorno: 6 })
  })

  it('recusa sem ouro suficiente ou quantidade inválida', () => {
    expect(() => comprar(jogo, 'tonicoDeRetorno', 2)).toThrow(RangeError)
    expect(() => comprar(jogo, 'capsula', 0)).toThrow(RangeError)
  })
})

describe('time e reserva', () => {
  const reserva = [membro('Brotelho', 7, 5, 2)]

  it('trocar a criatura ativa encerra a luta, sem XP nem derrota', () => {
    const emLuta = simularCacada(CONFIGURACAO, jogoCom(membro('Gelusco', 5, 10), { reserva }), 0, 1500, criarGerador(2)).estado
    expect(emLuta.encontro).not.toBeNull()
    const trocado = trocarAtiva(emLuta, CATALOGO, 2, 1500)
    expect(trocado.encontro).toBeNull()
    expect(trocado.ativa.especie).toBe('Brotelho')
    expect(trocado.reserva.map((m) => m.especie)).toEqual(['Gelusco'])
    expect(trocado.ativa.xpNoNivel).toBe(0)
    expect(trocado.vidaDaAtiva).toBe(vidaMaxima(CATALOGO, reserva[0]))
    expect(trocado.proximoSelvagemEm).toBe(1500)
  })

  it('recusa criatura que não está na reserva', () => {
    expect(() => trocarAtiva(jogoCom(membro('Gelusco', 1, 5)), CATALOGO, 9, 0)).toThrow(RangeError)
  })

  it('abrir uma matriz põe a criatura na reserva e gasta a matriz', () => {
    const matrizes = [{ especie: 'Sapolho', raridade: 'incomum' }, { especie: 'Ferroa', raridade: 'rara' }] as const
    const jogo = jogoCom(membro('Gelusco', 1, 5), { inventario: { ...INVENTARIO_INICIAL, matrizes } })
    const aberto = abrirMatrizDoInventario(jogo, 1, criarGerador(3))
    expect(aberto.inventario.matrizes).toEqual([matrizes[0]])
    expect(aberto.reserva).toHaveLength(1)
    expect(aberto.reserva[0]).toMatchObject({ id: jogo.proximoId, especie: 'Ferroa', nivel: 1 })
    expect(raridadeDosGenes(aberto.reserva[0].genes)).toBe('rara')
    expect(aberto.proximoId).toBe(jogo.proximoId + 1)
  })

  it('com a reserva cheia a matriz não abre', () => {
    const cheia = Array.from({ length: ESPACOS_NA_RESERVA }, (_, i) => membro('Brotelho', 1, 5, 10 + i))
    const matrizes = [{ especie: 'Sapolho', raridade: 'comum' }] as const
    const jogo = jogoCom(membro('Gelusco', 1, 5), { reserva: cheia, inventario: { ...INVENTARIO_INICIAL, matrizes } })
    expect(() => abrirMatrizDoInventario(jogo, 0, criarGerador(4))).toThrow(RangeError)
  })
})

describe('rotas e configurações', () => {
  it('só escolhe rota liberada; trocar de rota encerra a luta', () => {
    const jogo = jogoCom(membro('Gelusco', 1, 5), { rotasLiberadas: 2 })
    expect(() => escolherRota(jogo, 3, 0)).toThrow(RangeError)
    const emLuta = simularCacada(CONFIGURACAO, jogo, 0, 1500, criarGerador(5)).estado
    const naRota2 = escolherRota(emLuta, 2, 1500)
    expect(naRota2).toMatchObject({ rota: 2, encontro: null })
    expect(naRota2.vidaDaAtiva).toBe(vidaAtual(emLuta))
  })

  it('o gatilho de cura fica entre 0 e 1', () => {
    const jogo = jogoCom(membro('Gelusco', 1, 5))
    expect(definirGatilhoDeCura(jogo, 0.5).gatilhoDeCura).toBe(0.5)
    expect(() => definirGatilhoDeCura(jogo, 1.5)).toThrow(RangeError)
  })

  it('retomar a caçada pausada devolve a vida cheia, sem gastar Tônico', () => {
    const ativa = membro('Gelusco', 1, 5)
    const pausada = jogoCom(ativa, { pausada: true, vidaDaAtiva: 0 })
    const retomada = retomarCacada(pausada, CATALOGO, 1000)
    expect(retomada).toMatchObject({ pausada: false, vidaDaAtiva: vidaMaxima(CATALOGO, ativa), proximoSelvagemEm: 1000 })
    expect(retomada.inventario).toEqual(pausada.inventario)
  })
})
