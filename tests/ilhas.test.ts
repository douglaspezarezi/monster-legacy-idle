import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { ILHAS } from '../src/conteudo/ilhas.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { combatenteDe } from '../src/engine/criatura.ts'
import {
  CHANCE_DE_MITICA,
  FRAGMENTOS_POR_ANDAR,
  explorarIlha,
  guardiao,
  impedimentoDaIlha,
  nivelDoGuardiao,
  raridadeDoGuardiao,
} from '../src/engine/ilhas.ts'
import type { EstadoDoJogo, Membro } from '../src/engine/jogo.ts'
import { vidaMaxima } from '../src/engine/jogo.ts'
import { criarCriatura } from '../src/engine/nascimento.ts'
import { jogoCom, membro } from './apoio.ts'

const MINUTO = 60 * 1000

// Na Era 4 com uma Chave e 5 Tônicos de Cura.
function naIlha(ativa: Membro, campos: Partial<EstadoDoJogo<Tipo>> = {}): EstadoDoJogo<Tipo> {
  const estado = jogoCom(ativa, { era: 4 })
  return { ...estado, inventario: { ...estado.inventario, chaves: 1, tonicosDeCura: 5 }, ...campos }
}

const fraco = membro('Glaciarca', 150, 10, 1, 4)
// Couraçor lendário e desperto vence a Ilha da Geada (GDD, seção 11).
const forte: Membro = { ...membro('Couraçor', 200, 19, 1, 4), despertada: true }

describe('Ilhas Lendárias', () => {
  it('quatro ilhas de 10 andares, com guardiões cadastrados', () => {
    expect(ILHAS.map((i) => i.nome)).toEqual(['Ilha da Geada', 'Ilha do Ferro', 'Ilha do Eco', 'Ilha da Estrela'])
    for (const ilha of ILHAS) {
      expect(ilha.guardioes).toHaveLength(10)
      for (const especie of ilha.guardioes) expect(CATALOGO.especies[especie]).toBeDefined()
    }
    expect(ILHAS[0].guardioes).toEqual(['Friagem', 'Friagem', 'Friagem', 'Geadouro', 'Geadouro', 'Geadouro', 'Invernal', 'Invernal', 'Invernal', 'Permafrio'])
  })

  it('o guardião do andar n tem nível 150 + 5n, é épico e lendário no andar 10, com Vida ×4 e Ataque e Foco ÷2', () => {
    expect([1, 10].map(nivelDoGuardiao)).toEqual([155, 200])
    expect(raridadeDoGuardiao(ILHAS[0], 9)).toBe('epica')
    expect(raridadeDoGuardiao(ILHAS[0], 10)).toBe('lendaria')
    const g = guardiao(CATALOGO, ILHAS[0], 4, criarGerador(3))
    const comum = combatenteDe(CATALOGO, criarCriatura(criarGerador(3), 'Geadouro', 'epica', 170))
    expect(g.especie).toBe('Geadouro')
    expect(g.vida).toBeCloseTo(comum.atributos.vida * 4)
    expect(g.atributos.ataque).toBeCloseTo(comum.atributos.ataque / 2)
    expect(g.atributos.foco).toBeCloseTo(comum.atributos.foco / 2)
    expect(g.atributos.defesa).toBeCloseTo(comum.atributos.defesa)
  })

  it('abrem na Era 4 e pedem uma Chave', () => {
    expect(impedimentoDaIlha(naIlha(fraco))).toBeNull()
    expect(impedimentoDaIlha(naIlha(fraco, { era: 3 }))).toMatch(/Era 4/)
    const semChave = naIlha(fraco)
    expect(impedimentoDaIlha({ ...semChave, inventario: { ...semChave.inventario, chaves: 0 } })).toMatch(/Chave/)
    expect(() => explorarIlha(CONFIGURACAO, naIlha(fraco, { era: 3 }), 0, 0, criarGerador(1))).toThrow(RangeError)
    expect(() => explorarIlha(CONFIGURACAO, naIlha(fraco), 4, 0, criarGerador(1))).toThrow(RangeError)
  })

  it('perder gasta a Chave e expulsa sem perda de XP e sem Fadiga, ficando com os Fragmentos dos andares vencidos', () => {
    const estado = naIlha({ ...fraco, xpNoNivel: 500 })
    const r = explorarIlha(CONFIGURACAO, estado, 0, 1000, criarGerador(1))
    expect(r.andaresVencidos).toBeLessThan(10)
    expect(r.matriz).toBeNull()
    expect(r.fragmentos).toBe(r.andaresVencidos * FRAGMENTOS_POR_ANDAR)
    expect(r.estado.inventario.fragmentos).toBe(r.fragmentos)
    expect(r.estado.inventario.chaves).toBe(0)
    expect(r.estado.ativa).toEqual(estado.ativa)
    expect(r.estado.fadigaAte).toBe(estado.fadigaAte)
    expect(r.estado.vidaDaAtiva).toBeCloseTo(vidaMaxima(CATALOGO, estado.ativa))
  })

  it('usa os Tônicos de Cura pelo gatilho e a Vida não volta entre andares', () => {
    const r = explorarIlha(CONFIGURACAO, naIlha(fraco), 0, 0, criarGerador(1))
    expect(r.tonicosDeCuraUsados).toBe(5)
    expect(r.estado.inventario.tonicosDeCura).toBe(0)
    const semTonicos = naIlha(fraco)
    const sem = explorarIlha(CONFIGURACAO, { ...semTonicos, inventario: { ...semTonicos.inventario, tonicosDeCura: 0 } }, 0, 0, criarGerador(1))
    expect(sem.andaresVencidos).toBeLessThanOrEqual(r.andaresVencidos)
  })

  it('vencer o andar 10 dá 300 Fragmentos e a matriz lendária do guardião final', () => {
    const r = explorarIlha(CONFIGURACAO, naIlha(forte), 0, 0, criarGerador(2))
    expect(r.andaresVencidos).toBe(10)
    expect(r.fragmentos).toBe(10 * FRAGMENTOS_POR_ANDAR)
    expect(r.matriz?.especie).toBe('Permafrio')
    expect(r.estado.inventario.matrizes).toEqual([r.matriz])
  })

  it('a matriz final sai mítica em cerca de 10% das vitórias', () => {
    let miticas = 0
    const vezes = 300
    for (let s = 0; s < vezes; s++) {
      const r = explorarIlha(CONFIGURACAO, naIlha(forte), 0, 0, criarGerador(s))
      if (r.matriz?.raridade === 'mitica') miticas++
      else expect(r.matriz?.raridade).toBe('lendaria')
    }
    expect(miticas / vezes).toBeGreaterThan(CHANCE_DE_MITICA / 2)
    expect(miticas / vezes).toBeLessThan(CHANCE_DE_MITICA * 2)
  })

  it('a luta da caçada acaba e a ativa volta a ela com a vida cheia', () => {
    const emLuta = simularCacada(CONFIGURACAO, naIlha(forte, { bioma: 12, rota: 7, rotasLiberadas: 7, avancoAutomatico: false }), 0, 500, criarGerador(1)).estado
    expect(emLuta.encontro).not.toBeNull()
    const r = explorarIlha(CONFIGURACAO, emLuta, 0, 500, criarGerador(1))
    expect(r.estado.encontro).toBeNull()
    expect(r.estado.proximoSelvagemEm).toBe(500)
    expect(r.estado.vidaDaAtiva).toBeCloseTo(vidaMaxima(CATALOGO, forte))
  })
})

describe('Chaves da Ilha', () => {
  it('caem na rota 5, em 0,05% dos abates', () => {
    expect(CONFIGURACAO.rotas.map((r) => r.chanceDeChave)).toEqual([0, 0, 0, 0, 0.0005, 0, 0])
    // Chance alta na rota 5, para uma hora de caçada bastar.
    const rotas = CONFIGURACAO.rotas.map((rota, i) => (i === 4 ? { ...rota, chanceDeChave: 0.02 } : rota))
    const estado = jogoCom(membro('Rebitaço', 95, 18, 1, 2), { era: 2, bioma: 4, rota: 5, rotasLiberadas: 5, avancoAutomatico: false })
    const comTonicos = { ...estado, inventario: { ...estado.inventario, ouro: 1e6 }, reposicao: { capsula: 0, tonicoDeCura: 20, tonicoDeRetorno: 5 } }
    const r = simularCacada({ ...CONFIGURACAO, rotas }, comTonicos, 0, 60 * MINUTO, criarGerador(5))
    const abates = r.eventos.filter((e) => e.tipo === 'abate').length
    const chaves = r.eventos.filter((e) => e.tipo === 'chave').length
    expect(chaves).toBeGreaterThan(abates * 0.01)
    expect(chaves).toBeLessThan(abates * 0.03)
    expect(r.estado.inventario.chaves).toBe(chaves)
  })

  it('não caem nas rotas 4 e 6', () => {
    for (const [rota, nivel, bioma, era] of [[4, 75, 4, 2], [6, 150, 12, 4]]) {
      const estado = jogoCom(membro('Couraçor', nivel, 18, 1, era), { era, bioma, rota, rotasLiberadas: rota, avancoAutomatico: false })
      const r = simularCacada(CONFIGURACAO, estado, 0, 60 * MINUTO, criarGerador(2))
      expect(r.eventos.some((e) => e.tipo === 'chave')).toBe(false)
    }
  })
})
