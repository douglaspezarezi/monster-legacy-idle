import { describe, expect, it } from 'vitest'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { PRECOS, definirReposicao, repor } from '../src/engine/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

const HORA = 60 * 60 * 1000

function comOuro(ouro: number) {
  const estado = jogoCom(membro('Gelusco', 10, 10))
  return { ...estado, inventario: { ...estado.inventario, ouro, tonicosDeCura: 0, tonicosDeRetorno: 0, capsulas: 0 } }
}

describe('reposição automática', () => {
  it('começa desligada e não compra nada', () => {
    const estado = comOuro(1000)
    expect(repor(estado)).toBe(estado)
  })

  it('compra o que falta para o mínimo ao definir', () => {
    const estado = definirReposicao(comOuro(1000), 'tonicoDeCura', 4)
    expect(estado.inventario).toMatchObject({ tonicosDeCura: 4, ouro: 1000 - 4 * PRECOS.tonicoDeCura })
  })

  it('não passa do ouro e repõe primeiro o Tônico de Retorno', () => {
    let estado = definirReposicao(comOuro(0), 'tonicoDeCura', 10)
    estado = definirReposicao(estado, 'tonicoDeRetorno', 2)
    estado = repor({ ...estado, inventario: { ...estado.inventario, ouro: 175 } })
    expect(estado.inventario).toMatchObject({ tonicosDeRetorno: 1, tonicosDeCura: 1, ouro: 0 })
  })

  it('recusa mínimo inválido', () => {
    expect(() => definirReposicao(comOuro(0), 'capsula', -1)).toThrow(RangeError)
    expect(() => definirReposicao(comOuro(0), 'capsula', 1.5)).toThrow(RangeError)
  })

  it('repõe durante a caçada, depois de cada luta', () => {
    // Zumbilo perde para Brota: gasta Tônicos de Cura na Mata Funda.
    let estado = jogoCom(membro('Zumbilo', 9, 6))
    estado = { ...estado, inventario: { ...estado.inventario, ouro: 5000 } }
    estado = definirReposicao(estado, 'tonicoDeCura', 5)
    const r = simularCacada(CONFIGURACAO, estado, 0, HORA, criarGerador(3))
    expect(r.estado.inventario.tonicosDeCura).toBe(5)
    const gastos = 5000 + r.eventos.reduce((total, e) => total + (e.tipo === 'abate' ? e.ouro : 0), 0) - r.estado.inventario.ouro
    expect(gastos).toBeGreaterThan(0)
    expect(gastos % PRECOS.tonicoDeCura).toBe(0)
  })
})
