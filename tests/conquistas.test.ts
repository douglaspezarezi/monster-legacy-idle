import { describe, expect, it } from 'vitest'
import { CONQUISTAS } from '../src/conteudo/conquistas.ts'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { LINHAGENS } from '../src/conteudo/linhagens.ts'
import { MERCADO } from '../src/conteudo/mercado.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { aprenderTecnica } from '../src/engine/aprendizado.ts'
import { avancarJogo } from '../src/engine/avanco.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { ESPACOS_NA_RESERVA } from '../src/engine/captura.ts'
import {
  CONTADORES_ZERADOS,
  ESPACOS_POR_COMPRA,
  MAXIMO_DE_ESPACOS,
  PRECO_DOS_ESPACOS,
  comprarEspacos,
  conferirConquistas,
  impedimentoDosEspacos,
  progresso,
} from '../src/engine/conquistas.ts'
import { cruzar } from '../src/engine/cruzamento.ts'
import { explorarIlha } from '../src/engine/ilhas.ts'
import type { EstadoDoJogo, Membro } from '../src/engine/jogo.ts'
import { abrirMatrizDoInventario } from '../src/engine/jogo.ts'
import { atualizarMercado, comprarNoMercado } from '../src/engine/mercado.ts'
import { VERSAO_DO_SAVE, desserializar } from '../src/engine/save.ts'
import { jogoCom, membro } from './apoio.ts'

const HORA = 60 * 60 * 1000

function comDiamantes(estado: EstadoDoJogo<Tipo>, diamantes: number): EstadoDoJogo<Tipo> {
  return { ...estado, inventario: { ...estado.inventario, diamantes } }
}

function conferir(estado: EstadoDoJogo<Tipo>) {
  return conferirConquistas(CONQUISTAS, CATALOGO, estado)
}

describe('conteúdo das conquistas', () => {
  it('são 33, com identificadores únicos, e pagam 1.110 Diamantes', () => {
    expect(CONQUISTAS).toHaveLength(33)
    expect(new Set(CONQUISTAS.map((c) => c.id)).size).toBe(33)
    expect(CONQUISTAS.reduce((total, c) => total + c.diamantes, 0)).toBe(1110)
  })

  it('a meta mais alta do registro cabe no catálogo', () => {
    const registro = Math.max(...CONQUISTAS.filter((c) => c.medida === 'registro').map((c) => c.meta))
    expect(registro).toBeLessThanOrEqual(Object.keys(CATALOGO.especies).length)
  })
})

describe('conferência', () => {
  it('um jogo novo não tem conquista nem Diamante', () => {
    const { estado, concluidas } = conferir(jogoCom(membro('Gelusco', 1, 5)))
    expect(concluidas).toEqual([])
    expect(estado.inventario.diamantes).toBe(0)
  })

  it('paga a conquista que alcança a meta, uma vez só', () => {
    const estado = jogoCom(membro('Gelusco', 1, 5), { contadores: { ...CONTADORES_ZERADOS, abates: 1000 } })
    const primeira = conferir(estado)
    expect(primeira.concluidas.map((c) => c.id)).toEqual(['abates-1'])
    expect(primeira.estado.inventario.diamantes).toBe(10)
    const segunda = conferir(primeira.estado)
    expect(segunda.concluidas).toEqual([])
    expect(segunda.estado.inventario.diamantes).toBe(10)
  })

  it('paga de uma vez todas as que o estado já mostra', () => {
    const estado = jogoCom(membro('Glaciarca', 150, 19, 1, 3), { era: 3 })
    const { concluidas, estado: depois } = conferir(estado)
    // Genes 19 em tudo dão soma 95, lendária; a Glaciarca é a terceira forma.
    expect(concluidas.map((c) => c.id).sort()).toEqual(['epica', 'era-2', 'era-3', 'forma-2', 'forma-3', 'lendaria'])
    expect(depois.inventario.diamantes).toBe(10 + 30 + 40 + 15 + 30 + 20)
  })

  it('o registro guarda as espécies da ativa e da reserva, e não as perde quando saem da conta', () => {
    const estado = jogoCom(membro('Gelusco', 1, 5), { reserva: [membro('Brotelho', 1, 5, 2), membro('Brotelho', 1, 5, 3)], registro: ['Gelusco'] })
    const registrado = conferir(estado).estado
    expect(registrado.registro).toEqual(['Gelusco', 'Brotelho'])
    expect(conferir({ ...registrado, reserva: [] }).estado.registro).toEqual(['Gelusco', 'Brotelho'])
  })

  it('mede o nível, a raridade, a variação prismática e o Despertar entre a ativa e a reserva', () => {
    const reserva: Membro[] = [{ ...membro('Brotelho', 80, 20, 2), prismatica: true }, { ...membro('Couraçor', 190, 15, 3), despertada: true }]
    const estado = jogoCom(membro('Gelusco', 5, 5), { reserva })
    expect(progresso(CATALOGO, estado, 'nivel')).toBe(190)
    expect(progresso(CATALOGO, estado, 'forma')).toBe(3)
    expect(progresso(CATALOGO, estado, 'epicas')).toBe(1)
    expect(progresso(CATALOGO, estado, 'miticas')).toBe(1)
    expect(progresso(CATALOGO, estado, 'prismaticas')).toBe(1)
    expect(progresso(CATALOGO, estado, 'despertas')).toBe(1)
  })

  it('o avanço do jogo confere as conquistas e avisa no registro', () => {
    const estado = jogoCom(membro('Gelusco', 1, 5), { era: 2 })
    const { estado: depois, eventos } = avancarJogo(CONFIGURACAO, estado, 0, 1, criarGerador(1))
    expect(eventos).toContainEqual({ tipo: 'conquista', instante: 1, nome: 'Chegar à Era 2', diamantes: 30 })
    expect(depois.inventario.diamantes).toBe(30)
    expect(depois.conquistas).toContain('era-2')
  })
})

describe('contadores', () => {
  it('a caçada conta abates, chefes e capturas', () => {
    const filtro = { especies: ['Brotelho', 'Formigaço', 'Penugem', 'Sapolho', 'Zumbilo'], raridadeMinima: 'fraca' as const }
    const estado = jogoCom(membro('Gelusco', 40, 15), { filtroDeCaptura: filtro })
    const { estado: depois, eventos } = simularCacada(CONFIGURACAO, estado, 0, HORA, criarGerador(4))
    const abates = eventos.filter((e) => e.tipo === 'abate')
    expect(depois.contadores.abates).toBe(abates.length)
    expect(depois.contadores.chefes).toBe(abates.filter((e) => e.tipo === 'abate' && e.chefe).length)
    expect(depois.contadores.chefes).toBeGreaterThan(0)
    expect(depois.contadores.capturas).toBe(eventos.filter((e) => e.tipo === 'captura' && e.sucesso).length)
    expect(depois.contadores.capturas).toBeGreaterThan(0)
  })

  it('o cruzamento, o Mercado e o Pergaminho contam', () => {
    const pais = jogoCom(membro('Gelusco', 10, 10), { reserva: [membro('Brotelho', 12, 8, 2), membro('Sapolho', 7, 8, 3)], proximoId: 4 })
    const cruzado = cruzar(
      { ...pais, inventario: { ...pais.inventario, ouro: 1000 } },
      CATALOGO,
      LINHAGENS,
      { paiA: 2, paiB: 3, especieDe: 2, herdados: ['vida', 'ataque', 'defesa'] },
      criarGerador(1),
    )
    expect(cruzado.contadores.cruzamentos).toBe(1)

    const naEra4 = jogoCom(membro('Couraçor', 200, 15, 1, 4), { era: 4 })
    const mercado = atualizarMercado(CONFIGURACAO, { ...naEra4, inventario: { ...naEra4.inventario, ouro: 1e6 } }, Date.UTC(2026, 9, 23, 15), criarGerador(1))
    expect(comprarNoMercado(MERCADO, mercado, 0).contadores.comprasNoMercado).toBe(1)

    const comPergaminho = { ...naEra4, inventario: { ...naEra4.inventario, pergaminhos: { Fornalha: 1 } } }
    expect(aprenderTecnica(CATALOGO, comPergaminho, 1, 'Fornalha', 0).contadores.pergaminhosUsados).toBe(1)
  })

  it('vencer o andar 10 conta a ilha uma vez só', () => {
    const forte: Membro = { ...membro('Couraçor', 200, 19, 1, 4), despertada: true }
    const estado = jogoCom(forte, { era: 4 })
    const comChaves = { ...estado, inventario: { ...estado.inventario, chaves: 2, tonicosDeCura: 10 } }
    const primeira = explorarIlha(CONFIGURACAO, comChaves, 0, 0, criarGerador(2))
    expect(primeira.andaresVencidos).toBe(10)
    expect(primeira.estado.contadores.ilhasVencidas).toEqual([0])
    const segunda = explorarIlha(CONFIGURACAO, primeira.estado, 0, 0, criarGerador(2))
    expect(segunda.andaresVencidos).toBe(10)
    expect(segunda.estado.contadores.ilhasVencidas).toEqual([0])
  })
})

describe('espaços na reserva', () => {
  it('100 Diamantes compram 10 espaços, até 100', () => {
    let estado = comDiamantes(jogoCom(membro('Gelusco', 1, 5)), 1000)
    expect(estado.espacosNaReserva).toBe(ESPACOS_NA_RESERVA)
    estado = comprarEspacos(estado)
    expect(estado.espacosNaReserva).toBe(ESPACOS_NA_RESERVA + ESPACOS_POR_COMPRA)
    expect(estado.inventario.diamantes).toBe(1000 - PRECO_DOS_ESPACOS)
    while (impedimentoDosEspacos(estado) === null) estado = comprarEspacos(estado)
    expect(estado.espacosNaReserva).toBe(MAXIMO_DE_ESPACOS)
    expect(estado.inventario.diamantes).toBe(500)
    expect(() => comprarEspacos(estado)).toThrow(RangeError)
  })

  it('sem Diamantes suficientes, não compra', () => {
    expect(() => comprarEspacos(comDiamantes(jogoCom(membro('Gelusco', 1, 5)), PRECO_DOS_ESPACOS - 1))).toThrow(RangeError)
  })

  it('os espaços comprados recebem matrizes e capturas', () => {
    const cheia = Array.from({ length: ESPACOS_NA_RESERVA }, (_, i) => membro('Brotelho', 1, 5, 10 + i))
    const base = jogoCom(membro('Gelusco', 40, 15), { reserva: cheia, proximoId: 100 })
    const comMatriz = { ...base, inventario: { ...base.inventario, matrizes: [{ especie: 'Sapolho', raridade: 'comum' as const }] } }
    expect(() => abrirMatrizDoInventario(comMatriz, 0, criarGerador(1))).toThrow(RangeError)
    const ampliada = { ...comMatriz, espacosNaReserva: ESPACOS_NA_RESERVA + ESPACOS_POR_COMPRA }
    expect(abrirMatrizDoInventario(ampliada, 0, criarGerador(1)).reserva).toHaveLength(ESPACOS_NA_RESERVA + 1)

    const filtro = { especies: ['Brotelho', 'Formigaço', 'Penugem', 'Sapolho', 'Zumbilo'], raridadeMinima: 'fraca' as const }
    const cacando = { ...ampliada, filtroDeCaptura: filtro }
    const { estado } = simularCacada(CONFIGURACAO, cacando, 0, HORA, criarGerador(4))
    expect(estado.reserva.length).toBeGreaterThan(ESPACOS_NA_RESERVA)
    expect(estado.reserva.length).toBeLessThanOrEqual(ESPACOS_NA_RESERVA + ESPACOS_POR_COMPRA)
  })

  it('critério do F20: uma conquista concluída paga Diamantes, e eles compram 10 espaços a mais na reserva', () => {
    // A Glaciarca épica na Era 3 conclui conquistas que somam mais de 100 Diamantes.
    const estado = jogoCom(membro('Glaciarca', 150, 16, 1, 3), { era: 3 })
    const { estado: depois } = avancarJogo(CONFIGURACAO, estado, 0, 1, criarGerador(1))
    expect(depois.inventario.diamantes).toBeGreaterThanOrEqual(PRECO_DOS_ESPACOS)
    expect(comprarEspacos(depois).espacosNaReserva).toBe(ESPACOS_NA_RESERVA + ESPACOS_POR_COMPRA)
  })
})

describe('save', () => {
  it('migra o save da versão 12: sem Diamantes, contadores zerados e registro com as espécies que o jogador tem', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5), { reserva: [membro('Brotelho', 2, 5, 2)] })
    const { espacosNaReserva: _, registro: __, conquistas: ___, contadores: ____, ...antigo } = atual
    const { diamantes: _____, ...inventario } = atual.inventario
    const modelo = jogoCom(membro('Gelusco', 1, 5))
    const save = desserializar<Tipo>(JSON.stringify({ versao: 12, salvoEm: 10, estado: { ...antigo, inventario } }), modelo)
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.estado).toEqual({ ...atual, registro: ['Gelusco', 'Brotelho'] })
  })
})
