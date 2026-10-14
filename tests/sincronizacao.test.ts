import { describe, expect, it } from 'vitest'
import { decidir } from '../src/nuvem/sincronizacao.ts'

describe('sincronização ao entrar na nuvem', () => {
  it('sem save nos dois lados não faz nada', () => {
    expect(decidir(null, null, null)).toBe('nada')
  })

  it('só o navegador tem save: envia', () => {
    expect(decidir({ salvoEm: 5 }, null, null)).toBe('enviar')
  })

  it('só a nuvem tem save: baixa', () => {
    expect(decidir(null, { salvoEm: 5 }, null)).toBe('baixar')
  })

  it('o mesmo save nos dois lados não faz nada', () => {
    expect(decidir({ salvoEm: 5 }, { salvoEm: 5 }, 5)).toBe('nada')
  })

  it('a nuvem tem o último save trocado com este navegador: envia sem perguntar', () => {
    expect(decidir({ salvoEm: 90 }, { salvoEm: 60 }, 60)).toBe('enviar')
  })

  it('outro dispositivo gravou na nuvem depois da última troca: pergunta', () => {
    expect(decidir({ salvoEm: 90 }, { salvoEm: 75 }, 60)).toBe('perguntar')
  })

  it('primeira vez neste navegador com saves nos dois lados: pergunta', () => {
    expect(decidir({ salvoEm: 90 }, { salvoEm: 75 }, null)).toBe('perguntar')
  })
})
