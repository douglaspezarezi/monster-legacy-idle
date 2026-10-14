import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { ROTAS } from '../src/conteudo/rotas.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import type { Evento, ResultadoDaCacada } from '../src/engine/cacada.ts'
import { ABATES_PARA_O_CHEFE, simularCacada } from '../src/engine/cacada.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { NIVEL_MAXIMO } from '../src/engine/atributos.ts'
import { ESPACOS_NA_RESERVA } from '../src/engine/captura.ts'
import { DURACAO_DA_FADIGA_MS } from '../src/engine/derrota.ts'
import type { EstadoDoJogo } from '../src/engine/jogo.ts'
import { vidaMaxima } from '../src/engine/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

const MINUTO = 60 * 1000
const UMA_HORA = 60 * MINUTO
const TODAS_AS_ROTAS = { rotasLiberadas: ROTAS.length }
// Um selvagem só: o próximo viria depois do fim do período.
const UM_SELVAGEM = { ...CONFIGURACAO, intervaloEntreSelvagensMs: 10 * UMA_HORA }
// Sem teto de Era, para criaturas acima do nível 50.
const SEM_TETO = { ...CONFIGURACAO, eras: [{ teto: NIVEL_MAXIMO, rotas: ROTAS.length }] }

// Nível 200 e genes míticos: vence qualquer selvagem da Mata Funda.
const forte = membro('Gelusco', 200, 20)
// Nível 1 e genes no mínimo: perde para qualquer selvagem acima da rota 1.
const fraco = membro('Zumbilo', 1, 1)

function contar(eventos: readonly Evento[], tipo: Evento['tipo']): number {
  return eventos.filter((e) => e.tipo === tipo).length
}

function abates(r: ResultadoDaCacada<Tipo>): number {
  return contar(r.eventos, 'abate')
}

function cacar(estado: EstadoDoJogo<Tipo>, duracao: number, semente: number, configuracao = CONFIGURACAO) {
  return simularCacada(configuracao, estado, 0, duracao, criarGerador(semente))
}

describe('caçada', () => {
  it('simula 1 hora em menos de 1 segundo', () => {
    const inicio = performance.now()
    const r = cacar(jogoCom(membro('Gelusco', 40, 10), { rota: 3, ...TODAS_AS_ROTAS }), UMA_HORA, 1)
    expect(performance.now() - inicio).toBeLessThan(1000)
    expect(abates(r)).toBeGreaterThan(100)
  })

  it('a mesma semente dá o mesmo resultado', () => {
    const inicial = jogoCom(membro('Gelusco', 40, 10), { rota: 3, ...TODAS_AS_ROTAS })
    expect(cacar(inicial, UMA_HORA, 5)).toEqual(cacar(inicial, UMA_HORA, 5))
  })

  it('avançar em passos de 250 ms dá o mesmo resultado que de uma vez', () => {
    const inicial = jogoCom(membro('Rebitim', 30, 10), { rota: 2, ...TODAS_AS_ROTAS })
    const deUmaVez = cacar(inicial, 10 * MINUTO, 9)
    const gerador = criarGerador(9)
    let estado = inicial
    const eventos: Evento[] = []
    for (let t = 0; t < 10 * MINUTO; t += 250) {
      const r = simularCacada(CONFIGURACAO, estado, t, t + 250, gerador)
      estado = r.estado
      eventos.push(...r.eventos)
    }
    expect(eventos).toEqual(deUmaVez.eventos)
    expect(estado).toEqual(deUmaVez.estado)
  })

  it('o selvagem nasce pelo menos 2 níveis abaixo da criatura ativa', () => {
    for (let semente = 1; semente <= 50; semente++) {
      const r = cacar(jogoCom(membro('Gelusco', 6, 10)), 100, semente)
      expect(r.estado.encontro?.selvagem.nivel).toBeLessThanOrEqual(4)
    }
  })

  it('a luta que não termina fica guardada no estado', () => {
    const r = cacar(jogoCom(forte), 100, 2)
    expect(abates(r)).toBe(0)
    expect(r.estado.encontro).not.toBeNull()
  })

  it('cada abate rende o XP base da rota e metade dele em ouro', () => {
    // No nível 199 não sobe de nível em 30 minutos; sem avanço, fica na rota 3.
    const r = cacar(jogoCom(membro('Gelusco', 199, 20), { rota: 3, ...TODAS_AS_ROTAS, avancoAutomatico: false }), 30 * MINUTO, 2, SEM_TETO)
    expect(contar(r.eventos, 'derrota')).toBe(0)
    expect(r.estado.ativa.xpNoNivel).toBe(abates(r) * 100)
    expect(r.estado.inventario.ouro).toBe(200 + abates(r) * 50)
  })

  it('com Fadiga XP e ouro caem pela metade, arredondados para baixo', () => {
    const inicial = jogoCom(membro('Gelusco', 199, 20), { rota: 2, ...TODAS_AS_ROTAS, avancoAutomatico: false, fadigaAte: UMA_HORA })
    const r = cacar(inicial, DURACAO_DA_FADIGA_MS, 3, SEM_TETO)
    expect(abates(r)).toBeGreaterThan(0)
    expect(r.estado.ativa.xpNoNivel).toBe(abates(r) * 17)
    expect(r.estado.inventario.ouro).toBe(200 + abates(r) * 8)
  })

  it('depois da vitória a vida volta cheia, com a Vida máxima do nível novo', () => {
    // Falta 1 de XP para o nível 2; sem cura, para a luta gastar vida.
    const ativa = { ...membro('Gelusco', 1, 10), xpNoNivel: 5 }
    const r = cacar(jogoCom(ativa, { gatilhoDeCura: 0 }), UMA_HORA, 7, UM_SELVAGEM)

    expect(abates(r)).toBe(1)
    expect(r.estado.ativa).toMatchObject({ nivel: 2, xpNoNivel: 9 })
    expect(r.estado.vidaDaAtiva).toBe(vidaMaxima(CATALOGO, { ...ativa, nivel: 2 }))
    expect(r.eventos).toContainEqual(expect.objectContaining({ tipo: 'nivel', nivel: 2 }))
  })

  it('gasta Tônicos de Cura quando a vida passa do gatilho', () => {
    const r = cacar(jogoCom(membro('Zumbilo', 8, 8)), 30 * MINUTO, 5)
    expect(r.estado.inventario.tonicosDeCura).toBeLessThan(5)
  })
})

describe('derrota na caçada', () => {
  it('cada derrota gasta um Tônico e recua a rota até os Tônicos acabarem', () => {
    const inicial = jogoCom(fraco, { rota: 5, ...TODAS_AS_ROTAS })
    const r = cacar({ ...inicial, inventario: { ...inicial.inventario, tonicosDeRetorno: 3 } }, UMA_HORA, 4)
    // Três derrotas com Tônico (rota 5 → 2) e a quarta, sem Tônico, pausa.
    expect(contar(r.eventos, 'derrota')).toBe(4)
    expect(r.estado.inventario.tonicosDeRetorno).toBe(0)
    expect(r.estado).toMatchObject({ rota: 2, pausada: true, vidaDaAtiva: 0 })
  })

  it('o Tônico de Retorno devolve a vida cheia', () => {
    const r = cacar(jogoCom(fraco, { rota: 5, ...TODAS_AS_ROTAS }), UMA_HORA, 4, UM_SELVAGEM)
    expect(contar(r.eventos, 'derrota')).toBe(1)
    expect(r.estado.vidaDaAtiva).toBe(vidaMaxima(CATALOGO, fraco))
  })

  it('caçada pausada não simula nada', () => {
    expect(cacar(jogoCom(forte, { pausada: true }), UMA_HORA, 7).eventos).toEqual([])
  })
})

describe('chefe de rota', () => {
  it('aparece depois de 100 abates e, vencido, libera e passa para a rota seguinte', () => {
    const r = cacar(jogoCom(forte), UMA_HORA, 8)
    const abatidos = r.eventos.filter((e) => e.tipo === 'abate')
    expect(abatidos.findIndex((e) => e.chefe)).toBe(ABATES_PARA_O_CHEFE)
    expect(abatidos[ABATES_PARA_O_CHEFE]).toMatchObject({ especie: 'Brotelho' })
    const liberada = r.eventos.find((e) => e.tipo === 'rota-liberada')
    expect(liberada).toMatchObject({ rota: 2, instante: abatidos[ABATES_PARA_O_CHEFE].instante })
    expect(r.estado.rotasLiberadas).toBeGreaterThanOrEqual(2)
    expect(r.estado.rota).toBe(r.estado.rotasLiberadas)
  })

  it('com o avanço automático desligado, libera a rota mas fica na atual', () => {
    const r = cacar(jogoCom(forte, { avancoAutomatico: false }), UMA_HORA, 8)
    expect(r.estado).toMatchObject({ rota: 1, rotasLiberadas: 2 })
    expect(r.estado.abatesPorRota[0]).toBeLessThan(ABATES_PARA_O_CHEFE)
  })

  it('perder para o chefe segue a derrota e zera o contador da rota', () => {
    const inicial = jogoCom(fraco, { abatesPorRota: [ABATES_PARA_O_CHEFE, 0, 0, 0, 0] })
    const r = cacar(inicial, UMA_HORA, 9, UM_SELVAGEM)
    expect(r.eventos[0]).toMatchObject({ tipo: 'derrota', chefe: true })
    expect(r.estado.abatesPorRota[0]).toBe(0)
    expect(r.estado.inventario.tonicosDeRetorno).toBe(4)
  })

  it('cada rota guarda o próprio contador', () => {
    const r = cacar(jogoCom(forte, { rota: 2, ...TODAS_AS_ROTAS, abatesPorRota: [50, 0, 0, 0, 0] }), 2 * MINUTO, 10)
    expect(abates(r)).toBeLessThan(ABATES_PARA_O_CHEFE)
    expect(r.estado.abatesPorRota[0]).toBe(50)
    expect(r.estado.abatesPorRota[1]).toBe(abates(r))
  })
})

describe('matrizes', () => {
  it('caem na taxa da rota, da espécie abatida e na raridade da rota', () => {
    const r = cacar(jogoCom(forte, { avancoAutomatico: false }), 10 * UMA_HORA, 8)
    const { matrizes } = r.estado.inventario
    // 1% de queda na rota 1: a contagem fica perto de 1% dos abates.
    expect(matrizes.length).toBeGreaterThan(abates(r) * 0.007)
    expect(matrizes.length).toBeLessThan(abates(r) * 0.013)
    expect(new Set(matrizes.map((m) => m.raridade))).toEqual(new Set(['comum']))
    for (const m of matrizes) expect(CONFIGURACAO.biomas[0].especiesPorRota[0]).toContain(m.especie)
  })
})

describe('captura', () => {
  const filtroDaRota1 = { especies: ['Brotelho', 'Formigaço'], raridadeMinima: 'fraca' } as const

  it('gasta uma Cápsula por selvagem que passa no filtro e guarda os capturados na reserva', () => {
    const r = cacar(jogoCom(forte, { filtroDeCaptura: filtroDaRota1, avancoAutomatico: false }), 10 * MINUTO, 11)
    const tentativas = r.eventos.filter((e) => e.tipo === 'captura')
    expect(tentativas).toHaveLength(10)
    expect(r.estado.inventario.capsulas).toBe(0)
    const capturas = tentativas.filter((e) => e.sucesso)
    expect(r.estado.reserva).toHaveLength(capturas.length)
    expect(r.estado.reserva.map((m) => m.id)).toEqual(capturas.map((_, i) => 2 + i))
    for (const m of r.estado.reserva) expect(m.nivel).toBeLessThanOrEqual(10)
  })

  it('não tenta fora do filtro', () => {
    const filtro = { especies: ['Brotelho'], raridadeMinima: 'mitica' } as const
    const r = cacar(jogoCom(forte, { filtroDeCaptura: filtro }), 10 * MINUTO, 12)
    expect(contar(r.eventos, 'captura')).toBe(0)
  })

  it('com a reserva cheia não tenta e não gasta Cápsula', () => {
    const reserva = Array.from({ length: ESPACOS_NA_RESERVA }, (_, i) => membro('Brotelho', 1, 5, 10 + i))
    const r = cacar(jogoCom(forte, { filtroDeCaptura: filtroDaRota1, reserva }), 10 * MINUTO, 13)
    expect(contar(r.eventos, 'captura')).toBe(0)
    expect(r.estado.inventario.capsulas).toBe(10)
  })

  it('o chefe não pode ser capturado', () => {
    const filtro = { especies: ['Brotelho'], raridadeMinima: 'fraca' } as const
    const inicial = jogoCom(forte, { filtroDeCaptura: filtro, abatesPorRota: [ABATES_PARA_O_CHEFE, 0, 0, 0, 0] })
    const r = cacar(inicial, UMA_HORA, 14, UM_SELVAGEM)
    expect(r.eventos[0]).toMatchObject({ tipo: 'abate', chefe: true, especie: 'Brotelho' })
    expect(contar(r.eventos, 'captura')).toBe(0)
  })
})
