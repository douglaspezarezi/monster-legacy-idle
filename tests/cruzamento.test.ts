import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { LINHAGENS } from '../src/conteudo/linhagens.ts'
import { ESPECIES } from '../src/conteudo/especies.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { colocarNaForja } from '../src/engine/base.ts'
import type { PedidoDeCruzamento } from '../src/engine/cruzamento.ts'
import { TAXA_DE_CRUZAMENTO, cruzar, genesDoFilhote, mesmaLinhagem } from '../src/engine/cruzamento.ts'
import type { Genes } from '../src/engine/genes.ts'
import { raridadeDosGenes } from '../src/engine/genes.ts'
import type { Membro } from '../src/engine/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

function comGenes(base: Membro, genes: Genes): Membro {
  return { ...base, genes }
}

const paiA = comGenes(membro('Brotelho', 12, 1, 2), { vida: 18, ataque: 4, defesa: 15, foco: 3, velocidade: 9 })
const paiB = comGenes(membro('Sapolho', 7, 1, 3), { vida: 6, ataque: 17, defesa: 11, foco: 12, velocidade: 2 })
const pedido: PedidoDeCruzamento = { paiA: 2, paiB: 3, especieDe: 3, herdados: ['vida', 'ataque', 'defesa'] }

function comPais(campos = {}) {
  const estado = jogoCom(membro('Gelusco', 10, 10), { reserva: [paiA, paiB], proximoId: 4 })
  return { ...estado, inventario: { ...estado.inventario, ouro: 1000 }, ...campos }
}

describe('linhagens', () => {
  it('toda espécie tem exatamente uma linhagem', () => {
    for (const especie of ESPECIES) {
      expect(LINHAGENS.filter((l) => l.especies.includes(especie.nome))).toHaveLength(1)
    }
  })

  it('cruzam espécies da mesma linhagem, inclusive a mesma espécie', () => {
    expect(mesmaLinhagem(LINHAGENS, 'Brotelho', 'Raizudo')).toBe(true)
    expect(mesmaLinhagem(LINHAGENS, 'Gelusco', 'Gelusco')).toBe(true)
    expect(mesmaLinhagem(LINHAGENS, 'Brotelho', 'Ferroa')).toBe(false)
    expect(mesmaLinhagem(LINHAGENS, 'Gelusco', 'Rebitim')).toBe(false)
  })
})

describe('herança de genes', () => {
  it('os atributos escolhidos recebem o maior gene dos pais; os outros são sorteados de 1 a 20', () => {
    const gerador = criarGerador(3)
    const sorteados = new Set<number>()
    for (let i = 0; i < 500; i++) {
      const genes = genesDoFilhote(paiA.genes, paiB.genes, ['vida', 'ataque', 'defesa'], gerador)
      expect(genes).toMatchObject({ vida: 18, ataque: 17, defesa: 15 })
      sorteados.add(genes.foco).add(genes.velocidade)
    }
    expect(Math.min(...sorteados)).toBe(1)
    expect(Math.max(...sorteados)).toBe(20)
  })
})

describe('cruzamento', () => {
  it('os pais saem da reserva, o filhote entra no nível 1 e a taxa é paga', () => {
    const estado = comPais()
    const depois = cruzar(estado, CATALOGO, LINHAGENS, pedido, criarGerador(1))
    expect(depois.reserva).toHaveLength(1)
    const filhote = depois.reserva[0]
    expect(filhote).toMatchObject({ id: 4, especie: 'Sapolho', nivel: 1, xpNoNivel: 0 })
    expect(filhote.genes).toMatchObject({ vida: 18, ataque: 17, defesa: 15 })
    expect(depois.proximoId).toBe(5)
    expect(depois.inventario.ouro).toBe(estado.inventario.ouro - TAXA_DE_CRUZAMENTO)
  })

  it('a espécie vem do pai escolhido', () => {
    const depois = cruzar(comPais(), CATALOGO, LINHAGENS, { ...pedido, especieDe: 2 }, criarGerador(1))
    expect(depois.reserva[0].especie).toBe('Brotelho')
  })

  it('a raridade do filhote sai da soma dos genes', () => {
    const gerador = criarGerador(9)
    for (let i = 0; i < 50; i++) {
      const filhote = cruzar(comPais(), CATALOGO, LINHAGENS, pedido, gerador).reserva[0]
      expect(filhote.prismatica && ['fraca', 'comum', 'incomum', 'rara'].includes(raridadeDosGenes(filhote.genes))).toBe(false)
    }
  })

  it('recusa pedidos inválidos', () => {
    const g = criarGerador(1)
    expect(() => cruzar(comPais(), CATALOGO, LINHAGENS, { ...pedido, paiB: 2 }, g)).toThrow(RangeError)
    expect(() => cruzar(comPais(), CATALOGO, LINHAGENS, { ...pedido, paiA: 1 }, g)).toThrow(RangeError)
    expect(() => cruzar(comPais(), CATALOGO, LINHAGENS, { ...pedido, especieDe: 1 }, g)).toThrow(RangeError)
    expect(() => cruzar(comPais(), CATALOGO, LINHAGENS, { ...pedido, herdados: ['vida', 'vida', 'ataque'] }, g)).toThrow(RangeError)
    expect(() => cruzar(comPais(), CATALOGO, LINHAGENS, { ...pedido, herdados: ['vida', 'ataque'] }, g)).toThrow(RangeError)
    const semOuro = comPais()
    expect(() => cruzar({ ...semOuro, inventario: { ...semOuro.inventario, ouro: TAXA_DE_CRUZAMENTO - 1 } }, CATALOGO, LINHAGENS, pedido, g)).toThrow(RangeError)
  })

  it('recusa linhagens diferentes', () => {
    const ferroa = membro('Ferroa', 5, 10, 3)
    expect(() => cruzar(comPais({ reserva: [paiA, ferroa] }), CATALOGO, LINHAGENS, pedido, criarGerador(1))).toThrow(RangeError)
  })

  it('criatura trabalhando não cruza', () => {
    const naForja = colocarNaForja(CONFIGURACAO, comPais(), 2)
    expect(() => cruzar(naForja, CATALOGO, LINHAGENS, pedido, criarGerador(1))).toThrow(RangeError)
  })

  it('cruzar os melhores filhotes melhora a linhagem', () => {
    const gerador = criarGerador(12)
    let estado = comPais({ inventario: { ...comPais().inventario, ouro: 100_000 } })
    const somaInicial = Math.max(...estado.reserva.map((m) => Object.values(m.genes).reduce((a, b) => a + b)))
    for (let i = 0; i < 10; i++) {
      // Junta um par: o melhor da reserva e um Brotelho comum novo.
      const novo = membro('Brotelho', 1, 8, estado.proximoId)
      estado = { ...estado, reserva: [...estado.reserva, novo], proximoId: estado.proximoId + 1 }
      const [melhor] = [...estado.reserva].sort((a, b) => soma(b) - soma(a))
      const ordem = (Object.keys(melhor.genes) as (keyof Genes)[]).sort((a, b) => Math.max(melhor.genes[b], novo.genes[b]) - Math.max(melhor.genes[a], novo.genes[a]))
      estado = cruzar(estado, CATALOGO, LINHAGENS, { paiA: melhor.id, paiB: novo.id, especieDe: melhor.id, herdados: ordem.slice(0, 3) }, gerador)
    }
    expect(Math.max(...estado.reserva.map(soma))).toBeGreaterThan(somaInicial)
  })
})

function soma(m: Membro): number {
  return Object.values(m.genes).reduce((a, b) => a + b)
}
