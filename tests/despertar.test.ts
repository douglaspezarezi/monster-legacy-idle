import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { LINHAGENS } from '../src/conteudo/linhagens.ts'
import { TECNICAS_DO_DESPERTAR } from '../src/conteudo/tecnicas.ts'
import { TIPOS } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { avancarJogo } from '../src/engine/avanco.ts'
import { colocarNaMina } from '../src/engine/base.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { combatenteDe } from '../src/engine/criatura.ts'
import { cruzar } from '../src/engine/cruzamento.ts'
import {
  ESSENCIAS_DO_DESPERTAR,
  FRAGMENTOS_DO_DESPERTAR,
  MULTIPLICADOR_DO_DESPERTAR,
  despertar,
  impedimentoDoDespertar,
} from '../src/engine/despertar.ts'
import { evoluir, voltarAoNivel1 } from '../src/engine/evolucao.ts'
import type { EstadoDoJogo } from '../src/engine/jogo.ts'
import { vidaMaxima } from '../src/engine/jogo.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { jogoCom, membro } from './apoio.ts'

const MINUTO = 60 * 1000

// Glaciarca (Geada, Brisa) no nível 150, com o que o Despertar pede.
function pronto(campos: Partial<EstadoDoJogo<Tipo>> = {}): EstadoDoJogo<Tipo> {
  const estado = jogoCom(membro('Glaciarca', 150, 15, 1, 4), { era: 4, reserva: [membro('Rebitaço', 150, 12, 2, 4)], proximoId: 3 })
  return {
    ...estado,
    inventario: { ...estado.inventario, fragmentos: FRAGMENTOS_DO_DESPERTAR, essencias: { Geada: ESSENCIAS_DO_DESPERTAR, Liga: ESSENCIAS_DO_DESPERTAR } },
    ...campos,
  }
}

describe('Despertar', () => {
  it('cada tipo tem uma técnica exclusiva cadastrada, com poder 100 e recarga de 9 s', () => {
    for (const tipo of TIPOS) {
      const tecnica = CATALOGO.tecnicas[TECNICAS_DO_DESPERTAR[tipo]]
      expect(tecnica).toMatchObject({ tipo, poder: 100, recargaMs: 9000 })
    }
  })

  it('gasta Fragmentos e Essências do primeiro tipo e marca a criatura', () => {
    const depois = despertar(CATALOGO, pronto(), 1, 0)
    expect(depois.ativa.despertada).toBe(true)
    expect(depois.inventario.fragmentos).toBe(0)
    expect(depois.inventario.essencias).toEqual({ Geada: 0, Liga: ESSENCIAS_DO_DESPERTAR })
  })

  it('multiplica os atributos por 1,15 e põe a técnica exclusiva no topo da fila, tirando a última', () => {
    const antes = combatenteDe(CATALOGO, membro('Glaciarca', 150, 15))
    const depois = combatenteDe(CATALOGO, { ...membro('Glaciarca', 150, 15), despertada: true })
    expect(depois.atributos.vida).toBeCloseTo(antes.atributos.vida * MULTIPLICADOR_DO_DESPERTAR)
    expect(depois.atributos.foco).toBeCloseTo(antes.atributos.foco * MULTIPLICADOR_DO_DESPERTAR)
    expect(antes.tecnicas.map((t) => t.nome)).toEqual(['Avalanche', 'Sopro Frio', 'Lasca Gélida', 'Rajada'])
    expect(depois.tecnicas.map((t) => t.nome)).toEqual(['Coração de Gelo', 'Avalanche', 'Sopro Frio', 'Lasca Gélida'])
  })

  it('a ativa desperta com a vida cheia e a luta em andamento acaba', () => {
    const emLuta = simularCacada(CONFIGURACAO, pronto({ bioma: 12, rota: 6, rotasLiberadas: 6, avancoAutomatico: false }), 0, 500, criarGerador(1)).estado
    expect(emLuta.encontro).not.toBeNull()
    const depois = despertar(CATALOGO, emLuta, 1, 500)
    expect(depois.encontro).toBeNull()
    expect(depois.vidaDaAtiva).toBeCloseTo(vidaMaxima(CATALOGO, depois.ativa))
  })

  it('desperta uma criatura da reserva sem mexer na caçada', () => {
    const estado = pronto()
    const depois = despertar(CATALOGO, estado, 2, 0)
    expect(depois.reserva[0].despertada).toBe(true)
    expect(depois.ativa).toBe(estado.ativa)
    expect(depois.inventario.essencias.Liga).toBe(0)
  })

  it('recusa abaixo do nível 150, sem recursos, duas vezes ou com a criatura num posto', () => {
    expect(impedimentoDoDespertar(CATALOGO, pronto(), 1)).toBeNull()
    expect(impedimentoDoDespertar(CATALOGO, pronto({ ativa: membro('Glaciarca', 149, 15, 1, 4) }), 1)).toMatch(/nível 150/)
    const semFragmentos = pronto()
    expect(impedimentoDoDespertar(CATALOGO, { ...semFragmentos, inventario: { ...semFragmentos.inventario, fragmentos: 299 } }, 1)).toMatch(/Fragmentos/)
    expect(impedimentoDoDespertar(CATALOGO, { ...semFragmentos, inventario: { ...semFragmentos.inventario, essencias: { Geada: 9 } } }, 1)).toMatch(/Essências de Geada/)
    expect(impedimentoDoDespertar(CATALOGO, despertar(CATALOGO, pronto(), 1, 0), 1)).toMatch(/já despertou/)
    expect(impedimentoDoDespertar(CATALOGO, colocarNaMina(CONFIGURACAO, pronto(), 2), 2)).toMatch(/posto/)
    expect(() => despertar(CATALOGO, pronto({ ativa: membro('Glaciarca', 100, 15, 1, 4) }), 1, 0)).toThrow(RangeError)
  })

  it('fica com a criatura no reset de Era e na evolução; a técnica segue o primeiro tipo da forma atual', () => {
    const desperto = { ...membro('Gelundo', 150, 15), despertada: true }
    const evoluido = evoluir(CATALOGO, desperto)
    expect(evoluido).toMatchObject({ especie: 'Glaciarca', despertada: true })
    const deVolta = voltarAoNivel1(CATALOGO, evoluido)
    expect(deVolta).toMatchObject({ especie: 'Gelusco', nivel: 1, despertada: true })
    expect(combatenteDe(CATALOGO, deVolta).tecnicas[0].nome).toBe('Coração de Gelo')
  })

  it('o filhote de cruzamento não herda o Despertar', () => {
    const paiA = { ...membro('Gelusco', 150, 15, 2), despertada: true }
    const paiB = { ...membro('Gelundo', 150, 14, 3), despertada: true }
    const estado = jogoCom(membro('Rebitim', 10, 10), { reserva: [paiA, paiB], proximoId: 4 })
    const comOuro = { ...estado, inventario: { ...estado.inventario, ouro: 1000 } }
    const depois = cruzar(comOuro, CATALOGO, LINHAGENS, { paiA: 2, paiB: 3, especieDe: 2, herdados: ['vida', 'ataque', 'defesa'] }, criarGerador(1))
    expect(depois.reserva[0].despertada).toBeUndefined()
  })
})

describe('Essências', () => {
  it('caem nas rotas 5 a 7, do tipo do bioma', () => {
    // Encosta Rubra, rota 5, por 8 horas: cerca de 0,2% dos abates.
    const estado = jogoCom(membro('Rebitaço', 95, 18, 1, 2), { era: 2, bioma: 4, rota: 5, rotasLiberadas: 5, avancoAutomatico: false })
    const comTonicos = { ...estado, inventario: { ...estado.inventario, ouro: 1e6 }, reposicao: { capsula: 0, tonicoDeCura: 20, tonicoDeRetorno: 5 } }
    const r = avancarJogo(CONFIGURACAO, comTonicos, 0, 8 * 60 * MINUTO, criarGerador(5))
    const abates = r.eventos.filter((e) => e.tipo === 'abate').length
    const essencias = r.eventos.filter((e) => e.tipo === 'essencia')
    expect(essencias.length).toBeGreaterThan(0)
    expect(essencias.length).toBeLessThan(abates * 0.006)
    expect(r.estado.inventario.essencias).toEqual({ Chama: essencias.length })
  })

  it('não caem nas rotas 1 a 4', () => {
    const estado = jogoCom(membro('Gelusco', 60, 18, 1, 2), { era: 2, bioma: 4, rota: 4, rotasLiberadas: 4, avancoAutomatico: false })
    const r = simularCacada(CONFIGURACAO, estado, 0, 60 * MINUTO, criarGerador(2))
    expect(r.eventos.some((e) => e.tipo === 'essencia')).toBe(false)
  })
})
