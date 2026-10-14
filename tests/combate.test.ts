import { describe, expect, it } from 'vitest'
import { DADOS_DOS_TIPOS } from '../src/conteudo/tipos.ts'
import { lutar } from '../src/engine/combate.ts'
import { criarTabelaDeTipos } from '../src/engine/multiplicador-de-tipo.ts'
import { BRASA, ESPINHO, combatente } from './apoio.ts'

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
