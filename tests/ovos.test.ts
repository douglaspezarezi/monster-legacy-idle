import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { LINHAGENS } from '../src/conteudo/linhagens.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { avancarJogo } from '../src/engine/avanco.ts'
import type { Criatura } from '../src/engine/criatura.ts'
import { cruzar } from '../src/engine/cruzamento.ts'
import type { PedidoDeCruzamento } from '../src/engine/cruzamento.ts'
import { raridadeDosGenes } from '../src/engine/genes.ts'
import type { EstadoDoJogo } from '../src/engine/jogo.ts'
import { CHANCE_PRISMATICA } from '../src/engine/nascimento.ts'
import { creditarTempoFora, deslocarTempo } from '../src/engine/offline.ts'
import {
  MULTIPLICADOR_DO_SANTUARIO,
  PRECO_DO_SANTUARIO,
  SANTUARIO_VAZIO,
  TEMPO_DE_CHOCAR_MS,
  VAGAS_DA_CHOCADEIRA,
  botarOvo,
  chocarOvos,
  construirSantuario,
  impedimentoDoSantuario,
} from '../src/engine/ovos.ts'
import { VERSAO_DO_SAVE, desserializar } from '../src/engine/save.ts'
import { jogoCom, membro } from './apoio.ts'

const MINUTO = 60 * 1000
const HORA = 60 * MINUTO

const paiA = { ...membro('Brotelho', 12, 1, 2), genes: { vida: 18, ataque: 4, defesa: 15, foco: 3, velocidade: 9 } }
const paiB = { ...membro('Sapolho', 7, 1, 3), genes: { vida: 6, ataque: 17, defesa: 11, foco: 12, velocidade: 2 } }
const pedido: PedidoDeCruzamento = { paiA: 2, paiB: 3, especieDe: 3, herdados: ['vida', 'ataque', 'defesa'], tecnicaHerdada: 'Mordida' }

function comPais(campos: Partial<EstadoDoJogo<Tipo>> = {}): EstadoDoJogo<Tipo> {
  const estado = jogoCom(membro('Gelusco', 10, 10), { reserva: [paiA, paiB], proximoId: 4, ...campos })
  return { ...estado, inventario: { ...estado.inventario, ouro: 1000, diamantes: 1000 } }
}

function filhote(gene: number, especie = 'Brotelho'): Criatura {
  return { especie, genes: { vida: gene, ataque: gene, defesa: gene, foco: gene, velocidade: gene }, prismatica: false, nivel: 1, xpNoNivel: 0 }
}

describe('ovo do cruzamento', () => {
  it('o tempo de chocar dobra a cada raridade, de 10 minutos a 5 h 20', () => {
    expect(TEMPO_DE_CHOCAR_MS).toEqual({
      fraca: 10 * MINUTO,
      comum: 10 * MINUTO,
      incomum: 20 * MINUTO,
      rara: 40 * MINUTO,
      epica: 80 * MINUTO,
      lendaria: 160 * MINUTO,
      mitica: 320 * MINUTO,
    })
  })

  it('cruzar põe um ovo na Chocadeira; os pais saem e o filhote ainda não está na reserva', () => {
    const depois = cruzar(comPais(), CATALOGO, LINHAGENS, pedido, 1000, criarGerador(1))
    expect(depois.reserva).toEqual([])
    expect(depois.chocadeira).toHaveLength(1)
    const [ovo] = depois.chocadeira
    expect(ovo.filhote).toMatchObject({ especie: 'Sapolho', nivel: 1, prismatica: false, tecnicaAprendida: 'Mordida' })
    expect(ovo.filhote.genes).toMatchObject({ vida: 18, ataque: 17, defesa: 15 })
    expect(ovo.prontoEm).toBe(1000 + TEMPO_DE_CHOCAR_MS[raridadeDosGenes(ovo.filhote.genes)])
    expect(depois.inventario.ouro).toBe(1000 - 300)
    expect(depois.contadores.cruzamentos).toBe(1)
  })

  it('com a Chocadeira cheia, não cruza; o Santuário só aceita um ovo depois de construído', () => {
    const ovos = Array.from({ length: VAGAS_DA_CHOCADEIRA }, () => ({ filhote: filhote(10), prontoEm: HORA }))
    expect(() => cruzar(comPais({ chocadeira: ovos }), CATALOGO, LINHAGENS, pedido, 0, criarGerador(1))).toThrow(/Chocadeira está cheia/)
    expect(() => cruzar(comPais(), CATALOGO, LINHAGENS, { ...pedido, noSantuario: true }, 0, criarGerador(1))).toThrow(/não foi construído/)
    const construido = comPais({ chocadeira: ovos, santuario: { construido: true, ovo: null } })
    const noSantuario = cruzar(construido, CATALOGO, LINHAGENS, { ...pedido, noSantuario: true }, 0, criarGerador(1))
    expect(noSantuario.santuario.ovo?.filhote.especie).toBe('Sapolho')
    const ocupado = { ...comPais({ santuario: noSantuario.santuario }) }
    expect(() => cruzar(ocupado, CATALOGO, LINHAGENS, { ...pedido, noSantuario: true }, 0, criarGerador(1))).toThrow(/já tem um ovo/)
  })
})

describe('chocar', () => {
  it('o ovo choca na reserva, no nível 1 e na Era atual, só quando fica pronto', () => {
    // Genes 8 somam 40: comum, 10 minutos.
    const estado = botarOvo(jogoCom(membro('Gelusco', 10, 10, 1, 2), { era: 2, proximoId: 7 }), filhote(8), 0, false)
    expect(chocarOvos(estado, 10 * MINUTO - 1, criarGerador(1)).chocados).toEqual([])
    const { estado: depois, chocados } = chocarOvos(estado, 10 * MINUTO, criarGerador(1))
    expect(chocados).toHaveLength(1)
    expect(depois.chocadeira).toEqual([])
    expect(depois.reserva).toEqual([{ ...filhote(8), id: 7, era: 2 }])
    expect(depois.proximoId).toBe(8)
  })

  it('choca na ordem em que ficaram prontos, e com a reserva cheia o ovo espera', () => {
    let estado = jogoCom(membro('Gelusco', 10, 10), { espacosNaReserva: 1 })
    estado = botarOvo(estado, filhote(15, 'Sapolho'), 0, false)
    estado = botarOvo(estado, filhote(10, 'Brotelho'), 0, false)
    const primeiro = chocarOvos(estado, HORA, criarGerador(1))
    expect(primeiro.chocados.map((c) => c.filhote.especie)).toEqual(['Brotelho'])
    expect(primeiro.estado.chocadeira).toHaveLength(1)
    const comEspaco = { ...primeiro.estado, espacosNaReserva: 2 }
    expect(chocarOvos(comEspaco, HORA, criarGerador(1)).chocados.map((c) => c.filhote.especie)).toEqual(['Sapolho'])
  })

  it('só ovo épico ou melhor sai prismático: 2% na Chocadeira e 6% no Santuário', () => {
    const vezes = 4000
    const taxa = (gene: number, noSantuario: boolean) => {
      let prismaticos = 0
      const base = jogoCom(membro('Gelusco', 10, 10), { santuario: { construido: true, ovo: null } })
      for (let s = 0; s < vezes; s++) {
        const estado = botarOvo(base, filhote(gene), 0, noSantuario)
        if (chocarOvos(estado, Infinity, criarGerador(s)).estado.reserva[0].prismatica) prismaticos++
      }
      return prismaticos / vezes
    }
    expect(taxa(15, true)).toBe(0)
    expect(taxa(17, false)).toBeGreaterThan(CHANCE_PRISMATICA * 0.6)
    expect(taxa(17, false)).toBeLessThan(CHANCE_PRISMATICA * 1.4)
    // Critério do F21: um ovo épico no Santuário choca com chance prismática de 6%.
    const noSantuario = CHANCE_PRISMATICA * MULTIPLICADOR_DO_SANTUARIO
    expect(noSantuario).toBeCloseTo(0.06)
    expect(taxa(17, true)).toBeGreaterThan(noSantuario * 0.8)
    expect(taxa(17, true)).toBeLessThan(noSantuario * 1.2)
  })
})

describe('Santuário', () => {
  it('custa 300 Diamantes e é construído uma vez', () => {
    const estado = { ...jogoCom(membro('Gelusco', 1, 5)) }
    const rico = { ...estado, inventario: { ...estado.inventario, diamantes: 400 } }
    expect(impedimentoDoSantuario(estado)).toMatch(/300 Diamantes/)
    const construido = construirSantuario(rico)
    expect(construido.santuario).toEqual({ construido: true, ovo: null })
    expect(construido.inventario.diamantes).toBe(400 - PRECO_DO_SANTUARIO)
    expect(() => construirSantuario(construido)).toThrow(RangeError)
  })
})

describe('com o jogo fechado', () => {
  it('critério do F21: um ovo choca com o jogo fechado e avisa no resumo', () => {
    const estado = cruzar(comPais(), CATALOGO, LINHAGENS, pedido, 0, criarGerador(1))
    const fora = creditarTempoFora(CONFIGURACAO, estado, 0, 6 * HORA, criarGerador(2))
    expect(fora.estado.chocadeira).toEqual([])
    expect(fora.estado.reserva.map((m) => m.especie)).toContain('Sapolho')
    expect(fora.eventos.filter((e) => e.tipo === 'ovo')).toHaveLength(1)
  })

  it('o avanço do jogo marca o ovo que esperava espaço no início do período', () => {
    const estado = botarOvo(jogoCom(membro('Gelusco', 10, 10)), filhote(10), 0, false)
    const { eventos } = avancarJogo(CONFIGURACAO, estado, HORA, HORA + 100, criarGerador(1))
    expect(eventos).toContainEqual({ tipo: 'ovo', instante: HORA, especie: 'Brotelho', raridade: 'incomum', prismatica: false })
  })

  it('acima das 24 horas, o ovo também é adiado, como a caçada', () => {
    const estado = botarOvo(jogoCom(membro('Gelusco', 10, 10)), filhote(8), 0, false)
    const santuario = { construido: true, ovo: { filhote: filhote(17), prontoEm: 5 * HORA } }
    const adiado = deslocarTempo({ ...estado, santuario }, HORA)
    expect(adiado.chocadeira[0].prontoEm).toBe(10 * MINUTO + HORA)
    expect(adiado.santuario.ovo?.prontoEm).toBe(6 * HORA)
  })
})

describe('save', () => {
  it('migra o save da versão 13: Chocadeira vazia e Santuário por construir', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5))
    const { chocadeira: _, santuario: __, ...antigo } = atual
    const save = desserializar<Tipo>(JSON.stringify({ versao: 13, salvoEm: 10, estado: antigo }), jogoCom(membro('Gelusco', 1, 5)))
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.estado).toEqual({ ...atual, chocadeira: [], santuario: SANTUARIO_VAZIO })
  })
})
