import { describe, expect, it } from 'vitest'
import { ROTAS } from '../src/conteudo/rotas.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { DADOS_DOS_TIPOS } from '../src/conteudo/tipos.ts'
import { criarGerador, inteiroEntre } from '../src/engine/aleatorio.ts'
import type { Cacador, ConfiguracaoDaCacada } from '../src/engine/cacada.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import type { Combatente } from '../src/engine/combate.ts'
import { calcularAtributos } from '../src/engine/criatura.ts'
import { DURACAO_DA_FADIGA_MS } from '../src/engine/derrota.ts'
import { sortearGenes } from '../src/engine/genes.ts'
import { criarTabelaDeTipos } from '../src/engine/multiplicador-de-tipo.ts'
import { BRASA, ESPINHO, LABAREDA, combatente } from './apoio.ts'

const UMA_HORA = 60 * 60 * 1000
const FAIXA_DE_NIVEL_POR_ROTA = [[1, 10], [11, 25], [26, 50], [51, 75], [76, 100]] as const
const BASES = { vida: 60, ataque: 12, defesa: 12, foco: 12, velocidade: 12 }

// Selvagem de Brota com genes comuns, num nível da faixa da rota.
function gerarSelvagem(rota: number, gerador: () => number): Combatente<Tipo> {
  const [minimo, maximo] = FAIXA_DE_NIVEL_POR_ROTA[rota - 1]
  const atributos = calcularAtributos(BASES, sortearGenes(gerador, 'comum'), inteiroEntre(gerador, minimo, maximo), false)
  return { especie: 'selvagem de teste', tipos: ['Brota'], atributos, tecnicas: [ESPINHO], vida: atributos.vida }
}

const configuracao: ConfiguracaoDaCacada<Tipo> = {
  tabela: criarTabelaDeTipos(DADOS_DOS_TIPOS),
  gerarSelvagem,
  rotas: ROTAS,
  intervaloEntreSelvagensMs: 1000,
}

function cacador(criatura: Combatente<Tipo>, rota: number, tonicosDeRetorno: number, fadigaAte = 0): Cacador<Tipo> {
  return { cacada: { rota, xpNoNivel: 0, tonicosDeRetorno, fadigaAte, pausada: false }, criatura, matrizes: [] }
}

const forte = combatente(['Chama'], 5000, [LABAREDA, BRASA])
const fraco = combatente(['Brota'], 300, [ESPINHO])

describe('caçada', () => {
  it('simula 1 hora em menos de 1 segundo', () => {
    const inicio = performance.now()
    const r = simularCacada(configuracao, cacador(combatente(['Chama'], 400, [LABAREDA, BRASA]), 3, 50), 0, UMA_HORA, criarGerador(1))
    expect(performance.now() - inicio).toBeLessThan(1000)
    expect(r.abates).toBeGreaterThan(100)
  })

  it('a mesma semente dá o mesmo resultado', () => {
    const inicial = cacador(combatente(['Chama'], 400, [LABAREDA, BRASA]), 3, 50)
    expect(simularCacada(configuracao, inicial, 0, UMA_HORA, criarGerador(5))).toEqual(
      simularCacada(configuracao, inicial, 0, UMA_HORA, criarGerador(5)),
    )
  })

  it('cada abate rende o XP base da rota', () => {
    const r = simularCacada(configuracao, cacador(forte, 3, 0), 0, UMA_HORA, criarGerador(2))
    expect(r.derrotas).toBe(0)
    expect(r.cacador.cacada.xpNoNivel).toBe(r.abates * ROTAS[2].xpBase)
  })

  it('com Fadiga o XP cai pela metade, arredondado para baixo', () => {
    const r = simularCacada(configuracao, cacador(forte, 2, 0, UMA_HORA), 0, DURACAO_DA_FADIGA_MS, criarGerador(3))
    expect(r.abates).toBeGreaterThan(0)
    expect(r.cacador.cacada.xpNoNivel).toBe(r.abates * Math.floor(ROTAS[1].xpBase / 2))
  })

  it('cada derrota gasta um Tônico e recua a rota até os Tônicos acabarem', () => {
    const r = simularCacada(configuracao, cacador(fraco, 5, 3), 0, UMA_HORA, criarGerador(4))
    // Três derrotas com Tônico (rota 5 → 2) e a quarta, sem Tônico, pausa.
    expect(r.derrotas).toBe(4)
    expect(r.cacador.cacada.tonicosDeRetorno).toBe(0)
    expect(r.cacador.cacada.rota).toBe(2)
    expect(r.cacador.cacada.pausada).toBe(true)
  })

  it('o Tônico de Retorno devolve a vida cheia', () => {
    // O próximo selvagem só viria depois do fim, então a vida fica como o Tônico deixou.
    const umSelvagem = { ...configuracao, intervaloEntreSelvagensMs: UMA_HORA }
    const r = simularCacada(umSelvagem, cacador(fraco, 5, 1), 0, UMA_HORA, criarGerador(4))
    expect(r.derrotas).toBe(1)
    expect(r.cacador.criatura.vida).toBe(fraco.atributos.vida)
  })

  it('sem Tônico a caçada pausa e o tempo restante não rende', () => {
    const r = simularCacada(configuracao, cacador(fraco, 5, 0), 0, UMA_HORA, criarGerador(6))
    expect(r.derrotas).toBe(1)
    expect(r.cacador.cacada.pausada).toBe(true)
    expect(r.cacador.cacada.rota).toBe(5)
    expect(r.cacador.criatura.vida).toBe(0)
  })

  it('caçada pausada não simula nada', () => {
    const pausado = cacador(forte, 1, 0)
    const r = simularCacada(configuracao, { ...pausado, cacada: { ...pausado.cacada, pausada: true } }, 0, UMA_HORA, criarGerador(7))
    expect(r.abates).toBe(0)
  })

  it('matrizes caem na taxa da rota, da espécie abatida e na raridade da rota', () => {
    const r = simularCacada(configuracao, cacador(forte, 1, 0), 0, 10 * UMA_HORA, criarGerador(8))
    const { matrizes } = r.cacador
    // 1% de queda na rota 1: a contagem fica perto de 1% dos abates.
    expect(matrizes.length).toBeGreaterThan(r.abates * 0.007)
    expect(matrizes.length).toBeLessThan(r.abates * 0.013)
    expect(new Set(matrizes.map((m) => `${m.especie}/${m.raridade}`))).toEqual(new Set(['selvagem de teste/comum']))
  })

  it('sem chance de queda não cai matriz', () => {
    const semQueda = { ...configuracao, rotas: ROTAS.map((rota) => ({ ...rota, quedaDeMatriz: { ...rota.quedaDeMatriz, chance: 0 } })) }
    expect(simularCacada(semQueda, cacador(forte, 1, 0), 0, UMA_HORA, criarGerador(8)).cacador.matrizes).toEqual([])
  })
})
