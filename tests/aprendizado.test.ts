import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { TIPOS } from '../src/conteudo/tipos.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import {
  CHANCE_DE_PERGAMINHO,
  aprenderTecnica,
  esquecerTecnica,
  impedimentoDoAprendizado,
  tecnicasDoPergaminho,
} from '../src/engine/aprendizado.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { combatenteDe } from '../src/engine/criatura.ts'
import { estimarXpPorHora } from '../src/engine/estimativa.ts'
import type { EstadoDoJogo, Membro } from '../src/engine/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

const nomes = (criatura: Membro) => combatenteDe(CATALOGO, criatura).tecnicas.map((t) => t.nome)

// Glaciarca (Geada, Brisa) ativa e Rebitaço na reserva, com Pergaminhos.
function comPergaminhos(pergaminhos: Record<string, number>, campos: Partial<EstadoDoJogo<Tipo>> = {}): EstadoDoJogo<Tipo> {
  const estado = jogoCom(membro('Glaciarca', 150, 15, 1, 4), { era: 4, reserva: [membro('Rebitaço', 100, 12, 2, 4)], proximoId: 3 })
  return { ...estado, inventario: { ...estado.inventario, pergaminhos }, ...campos }
}

describe('fila com técnica aprendida', () => {
  it('a aprendida entra em primeiro lugar e tira a última', () => {
    expect(nomes(membro('Glaciarca', 150, 15))).toEqual(['Avalanche', 'Sopro Frio', 'Lasca Gélida', 'Rajada'])
    expect(nomes({ ...membro('Glaciarca', 150, 15), tecnicaAprendida: 'Fornalha' })).toEqual(['Fornalha', 'Avalanche', 'Sopro Frio', 'Lasca Gélida'])
  })

  it('numa fila curta, não tira nenhuma', () => {
    expect(nomes({ ...membro('Brotelho', 10, 10), tecnicaAprendida: 'Tição' })).toEqual(['Tição', 'Esporos', 'Golpe de Galho', 'Mordida'])
  })

  it('na criatura desperta, fica em segundo, depois da técnica do Despertar', () => {
    const desperta = { ...membro('Glaciarca', 150, 15), despertada: true, tecnicaAprendida: 'Fornalha' }
    expect(nomes(desperta)).toEqual(['Coração de Gelo', 'Fornalha', 'Avalanche', 'Sopro Frio'])
  })

  it('não aparece duas vezes se a forma já tem a técnica, como depois de uma evolução', () => {
    expect(nomes({ ...membro('Glaciarca', 150, 15), tecnicaAprendida: 'Rajada' })).toEqual(['Rajada', 'Avalanche', 'Sopro Frio', 'Lasca Gélida'])
  })
})

describe('Pergaminhos', () => {
  it('cada tipo de bioma tem técnica para ensinar, e a do Despertar fica de fora', () => {
    for (const tipo of TIPOS) {
      const tecnicas = tecnicasDoPergaminho(CATALOGO, tipo)
      expect(tecnicas.length).toBeGreaterThan(0)
      expect(tecnicas).not.toContain(CATALOGO.tecnicasDoDespertar[tipo])
      for (const nome of tecnicas) expect(CATALOGO.tecnicas[nome].tipo).toBe(tipo)
    }
    expect(TIPOS.flatMap((tipo) => tecnicasDoPergaminho(CATALOGO, tipo))).toHaveLength(39)
  })

  it('aprender gasta o Pergaminho e põe a técnica no topo, na ativa e na reserva', () => {
    const ativa = aprenderTecnica(CATALOGO, comPergaminhos({ Fornalha: 2 }), 1, 'Fornalha', 0)
    expect(ativa.ativa.tecnicaAprendida).toBe('Fornalha')
    expect(ativa.inventario.pergaminhos).toEqual({ Fornalha: 1 })
    const reserva = aprenderTecnica(CATALOGO, ativa, 2, 'Fornalha', 0)
    expect(reserva.reserva[0].tecnicaAprendida).toBe('Fornalha')
    expect(reserva.inventario.pergaminhos).toEqual({ Fornalha: 0 })
  })

  it('aprender outra apaga a anterior, e esquecer é livre', () => {
    const primeira = aprenderTecnica(CATALOGO, comPergaminhos({ Fornalha: 1, Mortalha: 1 }), 1, 'Fornalha', 0)
    const segunda = aprenderTecnica(CATALOGO, primeira, 1, 'Mortalha', 0)
    expect(segunda.ativa.tecnicaAprendida).toBe('Mortalha')
    expect(segunda.inventario.pergaminhos).toEqual({ Fornalha: 0, Mortalha: 0 })
    const esquecida = esquecerTecnica(segunda, 1, 0)
    expect(esquecida.ativa.tecnicaAprendida).toBeUndefined()
    expect(esquecida.inventario).toEqual(segunda.inventario)
    expect(nomes(esquecida.ativa)).toEqual(['Avalanche', 'Sopro Frio', 'Lasca Gélida', 'Rajada'])
  })

  it('aprender na ativa encerra a luta em andamento', () => {
    const lutando = simularCacada(CONFIGURACAO, comPergaminhos({ Fornalha: 1 }), 0, 1500, criarGerador(1)).estado
    expect(lutando.encontro).not.toBeNull()
    const depois = aprenderTecnica(CATALOGO, lutando, 1, 'Fornalha', 1500)
    expect(depois.encontro).toBeNull()
    expect(depois.proximoSelvagemEm).toBe(1500)
  })

  it('recusa sem Pergaminho, técnica do Despertar, técnica que a espécie já sabe e a mesma aprendida', () => {
    const estado = comPergaminhos({ Fornalha: 1, Rajada: 1, 'Coração de Brasa': 1 })
    expect(impedimentoDoAprendizado(CATALOGO, estado, 1, 'Mortalha')).toMatch(/sem Pergaminho/)
    expect(impedimentoDoAprendizado(CATALOGO, estado, 1, 'Coração de Brasa')).toMatch(/Despertar/)
    expect(impedimentoDoAprendizado(CATALOGO, estado, 1, 'Rajada')).toMatch(/já sabe/)
    expect(impedimentoDoAprendizado(CATALOGO, estado, 9, 'Fornalha')).toMatch(/inexistente/)
    const aprendida = aprenderTecnica(CATALOGO, { ...estado, inventario: { ...estado.inventario, pergaminhos: { Fornalha: 2 } } }, 1, 'Fornalha', 0)
    expect(impedimentoDoAprendizado(CATALOGO, aprendida, 1, 'Fornalha')).toMatch(/já aprendeu/)
    expect(() => aprenderTecnica(CATALOGO, estado, 1, 'Rajada', 0)).toThrow(RangeError)
  })

  it('o chefe de rota deixa um Pergaminho do tipo do bioma', () => {
    // Na Mata Funda, de Brota.
    const estado = jogoCom(membro('Glaciarca', 150, 20, 1, 4), { abatesPorRota: [100, 0, 0, 0, 0, 0, 0], avancoAutomatico: false })
    const brota = tecnicasDoPergaminho(CATALOGO, 'Brota')
    let encontrados = 0
    for (let semente = 1; semente <= 200 && encontrados < 3; semente++) {
      const { estado: depois, eventos } = simularCacada(CONFIGURACAO, estado, 0, 5_000, criarGerador(semente))
      const pergaminho = eventos.find((e) => e.tipo === 'pergaminho')
      if (!pergaminho || pergaminho.tipo !== 'pergaminho') continue
      encontrados++
      expect(eventos.find((e) => e.tipo === 'abate')).toMatchObject({ chefe: true })
      expect(brota).toContain(pergaminho.tecnica)
      expect(depois.inventario.pergaminhos).toEqual({ [pergaminho.tecnica]: 1 })
    }
    expect(encontrados).toBe(3)
  })

  it('só o chefe deixa Pergaminho, em cerca de 5% das vitórias', () => {
    let chefes = 0
    let pergaminhos = 0
    let comuns = 0
    for (let semente = 1; semente <= 400; semente++) {
      const estado = jogoCom(membro('Glaciarca', 150, 20, 1, 4), { abatesPorRota: [100, 0, 0, 0, 0, 0, 0], avancoAutomatico: false })
      const { eventos } = simularCacada(CONFIGURACAO, estado, 0, 5_000, criarGerador(semente))
      chefes += eventos.filter((e) => e.tipo === 'abate' && e.chefe).length
      comuns += eventos.filter((e) => e.tipo === 'abate' && !e.chefe).length
      pergaminhos += eventos.filter((e) => e.tipo === 'pergaminho').length
    }
    expect(comuns).toBeGreaterThan(0)
    expect(pergaminhos / chefes).toBeGreaterThan(CHANCE_DE_PERGAMINHO / 2.5)
    expect(pergaminhos / chefes).toBeLessThan(CHANCE_DE_PERGAMINHO * 2)
  })
})

describe('critério do F19', () => {
  it('uma técnica de outro tipo faz o monstro render mais num bioma onde rendia menos', () => {
    // Couraçor (Liga, Rocha) na Cratera Estelar, rota 7, com Investida (Fera).
    const couracor = jogoCom(membro('Couraçor', 200, 15, 1, 4), { era: 4 })
    const comInvestida = { ...couracor, ativa: { ...couracor.ativa, tecnicaAprendida: 'Investida' } }
    const sem = estimarXpPorHora(CONFIGURACAO, couracor, { bioma: 15, rota: 7 }, criarGerador(3))
    const com = estimarXpPorHora(CONFIGURACAO, comInvestida, { bioma: 15, rota: 7 }, criarGerador(3))
    expect(com).toBeGreaterThan(sem * 1.2)
  })
})
