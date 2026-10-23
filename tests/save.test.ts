import { describe, expect, it } from 'vitest'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { VERSAO_DO_SAVE, desserializar, serializar } from '../src/engine/save.ts'
import type { Membro } from '../src/engine/jogo.ts'
import { jogoCom, membro } from './apoio.ts'

const MODELO = jogoCom(membro('Gelusco', 1, 5))

function semCampoEra(m: Membro) {
  const { era: _, ...resto } = m
  return resto
}

describe('save', () => {
  it('o estado volta igual, com luta em andamento e reserva', () => {
    const inicial = jogoCom(membro('Gelusco', 30, 12), { reserva: [membro('Brotelho', 4, 6, 2)], proximoId: 3 })
    const { estado } = simularCacada(CONFIGURACAO, inicial, 0, 61_234, criarGerador(4))
    expect(estado.encontro).not.toBeNull()

    const save = desserializar<Tipo>(serializar(estado, 61_234), MODELO)
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.salvoEm).toBe(61_234)
    expect(save.estado).toEqual(estado)
  })

  it('continuar do save dá o mesmo resultado que não ter parado', () => {
    const inicial = jogoCom(membro('Rebitim', 12, 10))
    const direto = simularCacada(CONFIGURACAO, inicial, 0, 600_000, criarGerador(8))

    const gerador = criarGerador(8)
    const metade = simularCacada(CONFIGURACAO, inicial, 0, 300_000, gerador)
    const save = desserializar<Tipo>(serializar(metade.estado, 300_000), MODELO)
    const resto = simularCacada(CONFIGURACAO, save.estado, save.salvoEm, 600_000, gerador)
    expect(resto.estado).toEqual(direto.estado)
  })

  it('recusa texto que não é save', () => {
    expect(() => desserializar('não é json', MODELO)).toThrow(SyntaxError)
    expect(() => desserializar('{"versao":1}', MODELO)).toThrow(SyntaxError)
    expect(() => desserializar('null', MODELO)).toThrow(SyntaxError)
  })

  it('migra o save da versão 1, de antes da Forja e das Eras', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5), { reserva: [membro('Brotelho', 2, 5, 2)] })
    const { forja: _, era: __, equipamentos: ___, bioma: ____, outrosBiomas: _____, reposicao: ______, ...antigo } = atual
    const semEra = { ...antigo, ativa: semCampoEra(atual.ativa), reserva: atual.reserva.map(semCampoEra) }
    const save = desserializar<Tipo>(JSON.stringify({ versao: 1, salvoEm: 10, estado: semEra }), MODELO)
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.estado).toEqual(atual)
  })

  it('migra o save da versão 6: os contadores de chefe de cada bioma ganham as rotas 6 e 7', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5), { abatesPorRota: [4, 7, 0, 0, 0, 0, 0], outrosBiomas: { 2: { rota: 2, rotasLiberadas: 2, abatesPorRota: [1, 2, 0, 0, 0, 0, 0] } } })
    const antigo = { ...atual, abatesPorRota: [4, 7, 0, 0, 0], outrosBiomas: { 2: { rota: 2, rotasLiberadas: 2, abatesPorRota: [1, 2, 0, 0, 0] } } }
    const save = desserializar<Tipo>(JSON.stringify({ versao: 6, salvoEm: 10, estado: antigo }), MODELO)
    expect(save.estado).toEqual(atual)
  })

  it('migra o save da versão 8: Mina vazia, sem Fragmentos nem Essências', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5))
    const { mina: _, ...semMina } = atual
    const { fragmentos: __, essencias: ___, ...inventario } = atual.inventario
    const save = desserializar<Tipo>(JSON.stringify({ versao: 8, salvoEm: 10, estado: { ...semMina, inventario } }), MODELO)
    expect(save.estado).toEqual(atual)
  })

  it('migra o save da versão 9: sem Chaves da Ilha', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5))
    const { chaves: _, ...inventario } = atual.inventario
    const save = desserializar<Tipo>(JSON.stringify({ versao: 9, salvoEm: 10, estado: { ...atual, inventario } }), MODELO)
    expect(save.estado).toEqual(atual)
  })

  it('recusa save da versão atual com campo faltando', () => {
    const { bioma: _, ...semBioma } = jogoCom(membro('Gelusco', 3, 5))
    const texto = JSON.stringify({ versao: VERSAO_DO_SAVE, salvoEm: 0, estado: semBioma })
    expect(() => desserializar(texto, MODELO)).toThrow(/falta bioma/)
  })

  it('recusa versão desconhecida', () => {
    const texto = serializar(jogoCom(membro('Gelusco', 1, 5)), 0).replace(`"versao":${VERSAO_DO_SAVE}`, '"versao":99')
    expect(() => desserializar(texto, MODELO)).toThrow(RangeError)
  })
})
