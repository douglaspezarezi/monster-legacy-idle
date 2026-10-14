import { describe, expect, it } from 'vitest'
import type { EstadoDaCacada } from '../src/engine/derrota.ts'
import { DURACAO_DA_FADIGA_MS, aplicarDerrota, multiplicadorDeFadiga } from '../src/engine/derrota.ts'

const estado: EstadoDaCacada = { rota: 3, xpNoNivel: 1000, tonicosDeRetorno: 2, fadigaAte: 0, pausada: false }

describe('derrota na caçada', () => {
  it('consome um Tônico, recua a rota, tira 5% do XP do nível e aplica Fadiga', () => {
    expect(aplicarDerrota(estado, 5000)).toEqual({
      rota: 2,
      xpNoNivel: 950,
      tonicosDeRetorno: 1,
      fadigaAte: 5000 + DURACAO_DA_FADIGA_MS,
      pausada: false,
    })
  })

  it('na rota 1 continua na rota 1', () => {
    expect(aplicarDerrota({ ...estado, rota: 1 }, 0).rota).toBe(1)
  })

  it('a perda de XP arredonda para baixo', () => {
    expect(aplicarDerrota({ ...estado, xpNoNivel: 39 }, 0).xpNoNivel).toBe(38)
  })

  it('sem Tônico a caçada pausa e nada mais muda', () => {
    expect(aplicarDerrota({ ...estado, tonicosDeRetorno: 0 }, 0)).toEqual({ ...estado, tonicosDeRetorno: 0, pausada: true })
  })

  it('Fadiga corta XP e ouro pela metade por 10 minutos', () => {
    const derrotada = aplicarDerrota(estado, 0)
    expect(multiplicadorDeFadiga(derrotada, 0)).toBe(0.5)
    expect(multiplicadorDeFadiga(derrotada, DURACAO_DA_FADIGA_MS - 1)).toBe(0.5)
    expect(multiplicadorDeFadiga(derrotada, DURACAO_DA_FADIGA_MS)).toBe(1)
  })
})
