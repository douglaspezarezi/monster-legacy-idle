import { describe, expect, it } from 'vitest'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { VERSAO_DO_SAVE, desserializar, serializar } from '../src/engine/save.ts'
import type { Membro } from '../src/engine/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

function semCampoEra(m: Membro) {
  const { era: _, ...resto } = m
  return resto
}

describe('save', () => {
  it('o estado volta igual, com luta em andamento e reserva', () => {
    const inicial = jogoCom(membro('Gelusco', 30, 12), { reserva: [membro('Brotelho', 4, 6, 2)], proximoId: 3 })
    const { estado } = simularCacada(CONFIGURACAO, inicial, 0, 61_234, criarGerador(4))
    expect(estado.encontro).not.toBeNull()

    const save = desserializar<Tipo>(serializar(estado, 61_234))
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.salvoEm).toBe(61_234)
    expect(save.estado).toEqual(estado)
  })

  it('continuar do save dá o mesmo resultado que não ter parado', () => {
    const inicial = jogoCom(membro('Rebitim', 12, 10))
    const direto = simularCacada(CONFIGURACAO, inicial, 0, 600_000, criarGerador(8))

    const gerador = criarGerador(8)
    const metade = simularCacada(CONFIGURACAO, inicial, 0, 300_000, gerador)
    const save = desserializar<Tipo>(serializar(metade.estado, 300_000))
    const resto = simularCacada(CONFIGURACAO, save.estado, save.salvoEm, 600_000, gerador)
    expect(resto.estado).toEqual(direto.estado)
  })

  it('recusa texto que não é save', () => {
    expect(() => desserializar('não é json')).toThrow(SyntaxError)
    expect(() => desserializar('{"versao":1}')).toThrow(SyntaxError)
    expect(() => desserializar('null')).toThrow(SyntaxError)
  })

  it('migra o save da versão 1, de antes da Forja e das Eras', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5), { reserva: [membro('Brotelho', 2, 5, 2)] })
    const { forja: _, era: __, equipamentos: ___, ...antigo } = atual
    const semEra = { ...antigo, ativa: semCampoEra(atual.ativa), reserva: atual.reserva.map(semCampoEra) }
    const save = desserializar<Tipo>(JSON.stringify({ versao: 1, salvoEm: 10, estado: semEra }))
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.estado).toEqual(atual)
  })

  it('recusa versão desconhecida', () => {
    const texto = serializar(jogoCom(membro('Gelusco', 1, 5)), 0).replace(`"versao":${VERSAO_DO_SAVE}`, '"versao":99')
    expect(() => desserializar(texto)).toThrow(RangeError)
  })
})
