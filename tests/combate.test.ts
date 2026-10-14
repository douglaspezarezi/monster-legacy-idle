import { describe, expect, it } from 'vitest'
import { DADOS_DOS_TIPOS } from '../src/conteudo/tipos.ts'
import type { AvancoDaLuta } from '../src/engine/combate.ts'
import { CURA_DO_TONICO, avancarLuta, iniciarLuta, lutar } from '../src/engine/combate.ts'
import { criarTabelaDeTipos } from '../src/engine/multiplicador-de-tipo.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { BRASA, ESPINHO, LABAREDA, combatente } from './apoio.ts'

const tabela = criarTabelaDeTipos(DADOS_DOS_TIPOS)

describe('luta', () => {
  it('só com ataque básico: 500 de vida, 20 por golpe, o jogador age primeiro no empate', () => {
    // 100 × 0,4 × 0,5 = 20 por golpe; 25 golpes para cair, um a cada 2 s.
    const r = lutar(tabela, combatente(['Fera'], 100), combatente(['Fera'], 100), 0, Infinity)
    expect(r).toEqual({ vencedor: 'jogador', fim: 50_000, vidaDoJogador: 20, vidaDoSelvagem: 0 })
  })

  it('a vantagem de tipo decide a luta', () => {
    const jogador = combatente(['Chama'], 100, [BRASA])
    const selvagem = combatente(['Brota'], 100, [ESPINHO])
    expect(lutar(tabela, jogador, selvagem, 0, Infinity).vencedor).toBe('jogador')
    // Mesmos atributos com os tipos trocados: agora Chama leva a vantagem contra si.
    const brotaContraChama = lutar(tabela, combatente(['Brota'], 100, [ESPINHO]), combatente(['Chama'], 100, [BRASA]), 0, Infinity)
    expect(brotaContraChama.vencedor).toBe('selvagem')
  })

  it('usa a técnica quando pronta e o básico durante a recarga', () => {
    // Brasa contra Brota: 100 × 0,6 × 0,5 × 2 = 60. Básico: 20.
    const jogador = combatente(['Fera'], 100, [BRASA])
    const alvo = { ...combatente(['Brota'], 100), vida: 80 }
    // 2 s: brasa, 60 (recarga até 5 s); 4 s: básico, 20, e o alvo cai.
    expect(lutar(tabela, jogador, alvo, 0, Infinity)).toMatchObject({ vencedor: 'jogador', fim: 4000 })
  })

  it('para no limite sem vencedor', () => {
    const r = lutar(tabela, combatente(['Fera'], 100), combatente(['Fera'], 100), 0, 10_000)
    expect(r.vencedor).toBeNull()
    expect(r.fim).toBe(10_000)
    expect(r.vidaDoJogador).toBe(400)
  })

  it('imunidade de tipo não impede o ataque básico', () => {
    const rocha = { nome: 'pedrada', tipo: 'Rocha', categoria: 'fisica', poder: 100, recargaMs: 0 } as const
    const r = lutar(tabela, combatente(['Rocha'], 100, [rocha]), combatente(['Bruma'], 100), 0, 60_000)
    expect(r.vidaDoSelvagem).toBe(500)
    expect(r.vencedor).toBe('selvagem')
  })
})

describe('luta em passos', () => {
  it('avançar em passos de 250 ms dá o mesmo resultado que de uma vez', () => {
    const jogador = combatente(['Chama'], 100, [LABAREDA, BRASA])
    const selvagem = combatente(['Brota'], 110, [ESPINHO])
    const deUmaVez = avancarLuta(tabela, iniciarLuta(jogador, selvagem, 0), Infinity)

    let passo: AvancoDaLuta<Tipo> = { luta: iniciarLuta(jogador, selvagem, 0), vencedor: null, instante: 0, tonicosDeCuraUsados: 0 }
    let limite = 0
    while (passo.vencedor === null) {
      limite += 250
      passo = avancarLuta(tabela, passo.luta, limite)
    }
    expect(passo.vencedor).toBe(deUmaVez.vencedor)
    expect(passo.instante).toBe(deUmaVez.instante)
    expect(passo.luta).toEqual(deUmaVez.luta)
  })

  it('sem vencedor a luta guarda as vidas e continua de onde parou', () => {
    const r = avancarLuta(tabela, iniciarLuta(combatente(['Fera'], 100), combatente(['Fera'], 100), 0), 10_000)
    expect(r.vencedor).toBeNull()
    // 5 golpes de cada lado, de 20.
    expect(r.luta.jogador.vida).toBe(400)
    expect(r.luta.selvagem.vida).toBe(400)
    expect(r.luta.ritmoDoJogador.proximaAcao).toBe(12_000)
  })
})

describe('Tônico de Cura', () => {
  // Básico de 20 por golpe contra 500 de vida; gatilho em 30% (150).
  const fera = combatente(['Fera'], 100)

  it('cura 50% da Vida máxima logo depois do golpe que passa do gatilho', () => {
    const jogador = { ...fera, vida: 160 }
    const r = avancarLuta(tabela, iniciarLuta(jogador, fera, 0), 2000, { gatilho: 0.3, tonicos: 5 })
    // Aos 2 s o jogador bate e leva 20: 160 → 140, abaixo de 150, e o Tônico leva a 390.
    expect(r.tonicosDeCuraUsados).toBe(1)
    expect(r.luta.jogador.vida).toBe(140 + 500 * CURA_DO_TONICO)
    expect(r.luta.selvagem.vida).toBe(480)
  })

  it('não passa da Vida máxima', () => {
    // 480 → 460, abaixo de 99%: a cura de 250 para em 500.
    const r = avancarLuta(tabela, iniciarLuta({ ...fera, vida: 480 }, fera, 0), 2000, { gatilho: 0.99, tonicos: 5 })
    expect(r.luta.jogador.vida).toBe(500)
  })

  it('sem Tônico não cura, e o golpe que derruba não aciona', () => {
    const semTonico = avancarLuta(tabela, iniciarLuta({ ...fera, vida: 160 }, fera, 0), 2000, { gatilho: 0.3, tonicos: 0 })
    expect(semTonico.luta.jogador.vida).toBe(140)
    const derrubado = avancarLuta(tabela, iniciarLuta({ ...fera, vida: 20 }, fera, 0), Infinity, { gatilho: 0.3, tonicos: 5 })
    expect(derrubado).toMatchObject({ vencedor: 'selvagem', tonicosDeCuraUsados: 0 })
  })

  it('gasta no máximo os Tônicos disponíveis', () => {
    const r = avancarLuta(tabela, iniciarLuta(fera, combatente(['Fera'], 200), 0), Infinity, { gatilho: 0.3, tonicos: 3 })
    expect(r.vencedor).toBe('selvagem')
    expect(r.tonicosDeCuraUsados).toBe(3)
  })
})
