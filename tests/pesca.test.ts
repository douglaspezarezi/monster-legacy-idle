import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { avancarJogo } from '../src/engine/avanco.ts'
import { AFINIDADE_CERTA, AFINIDADE_OPOSTA, PESCA_VAZIA, afinidade, colocarNaMina, colocarNaPesca, perolasPorHoraDaPesca, tirarDaPesca } from '../src/engine/base.ts'
import { vestir } from '../src/engine/equipamentos.ts'
import { multiplicadorDeRaridade } from '../src/engine/genes.ts'
import type { EstadoDoJogo, Membro } from '../src/engine/jogo.ts'
import { trocarAtiva } from '../src/engine/jogo.ts'
import { creditarTempoFora } from '../src/engine/offline.ts'
import { PRECO_DA_ENCOMENDA, encomendar, impedimentoDaEncomenda, raridadeMaximaDaEncomenda } from '../src/engine/pesca.ts'
import { VERSAO_DO_SAVE, desserializar } from '../src/engine/save.ts'
import { jogoCom, membro } from './apoio.ts'

const HORA = 60 * 60 * 1000
const { pesca, rotas } = CONFIGURACAO

function pescando(reserva: Membro[], campos: Partial<EstadoDoJogo<Tipo>> = {}): EstadoDoJogo<Tipo> {
  const estado = jogoCom(membro('Gelusco', 10, 10), { reserva, proximoId: 20, ...campos })
  return reserva.reduce((e, m) => colocarNaPesca(CONFIGURACAO, e, m.id), estado)
}

function comPerolas(estado: EstadoDoJogo<Tipo>, perolas: number): EstadoDoJogo<Tipo> {
  return { ...estado, inventario: { ...estado.inventario, perolas } }
}

describe('produção', () => {
  it('10 Pérolas por hora × raridade × afinidade, também com a caçada pausada', () => {
    const tres = [2, 3, 4].map((id) => membro('Bolhim', 5, 15, id))
    const estado = pescando(tres)
    const porHora = 3 * pesca.porHora * multiplicadorDeRaridade(tres[0].genes) * AFINIDADE_CERTA
    expect(perolasPorHoraDaPesca(CONFIGURACAO, estado)).toBeCloseTo(porHora)
    const r = avancarJogo(CONFIGURACAO, { ...estado, pausada: true }, 0, 2 * HORA, criarGerador(1))
    expect(r.perolasDaPesca).toBe(Math.floor(porHora * 2))
    expect(r.estado.inventario.perolas).toBe(r.perolasDaPesca)
  })

  it('afinidade: +25% com Maré, −50% com quem vence Maré (Brota, Geada, Peçonha), 1× nos demais', () => {
    expect(afinidade(CONFIGURACAO.tabela, pesca, ['Maré'])).toBe(AFINIDADE_CERTA)
    for (const tipo of ['Brota', 'Geada', 'Peçonha'] as const) expect(afinidade(CONFIGURACAO.tabela, pesca, [tipo])).toBe(AFINIDADE_OPOSTA)
    expect(afinidade(CONFIGURACAO.tabela, pesca, CATALOGO.especies.Cinzelo.tipos)).toBe(1)
  })

  it('a fração passa de um período para o outro', () => {
    const estado = pescando([membro('Cinzelo', 5, 10, 2)])
    const um = avancarJogo(CONFIGURACAO, estado, 0, HORA / 4, criarGerador(1)).estado
    expect(um.pesca.perolasFracionarias).toBeGreaterThan(0)
    const dois = avancarJogo(CONFIGURACAO, um, HORA / 4, HORA, criarGerador(1)).estado
    expect(dois.inventario.perolas).toBe(Math.floor(perolasPorHoraDaPesca(CONFIGURACAO, estado)))
  })
})

describe('trabalhadores', () => {
  it('3 vagas; quem pesca não vai para outro posto e não é ativada', () => {
    const quatro = [2, 3, 4, 5].map((id) => membro('Bolhim', 5, 10, id))
    const estado = pescando(quatro.slice(0, 3), { reserva: quatro })
    expect(() => colocarNaPesca(CONFIGURACAO, estado, 5)).toThrow(/sem vaga/)
    expect(() => colocarNaMina(CONFIGURACAO, estado, 2)).toThrow(/outro posto/)
    expect(() => trocarAtiva(estado, CATALOGO, 2, 0)).toThrow(RangeError)
    expect(tirarDaPesca(estado, 2).pesca.trabalhadores).toEqual([3, 4])
  })
})

describe('encomenda', () => {
  it('o preço dobra a cada raridade, de 20 a 320 Pérolas', () => {
    expect(Object.values(PRECO_DA_ENCOMENDA)).toEqual([20, 40, 80, 160, 320])
  })

  it('a raridade máxima segue a rota mais alta liberada em qualquer bioma, até lendária', () => {
    const estado = jogoCom(membro('Gelusco', 10, 10))
    expect(raridadeMaximaDaEncomenda(rotas, estado)).toBe('comum')
    expect(raridadeMaximaDaEncomenda(rotas, { ...estado, rotasLiberadas: 3 })).toBe('rara')
    const outro = { rota: 1, rotasLiberadas: 4, abatesPorRota: [0, 0, 0, 0, 0, 0, 0] }
    expect(raridadeMaximaDaEncomenda(rotas, { ...estado, outrosBiomas: { 2: outro } })).toBe('epica')
    expect(raridadeMaximaDaEncomenda(rotas, { ...estado, rotasLiberadas: 7 })).toBe('lendaria')
  })

  it('a peça do espaço escolhido entra nos guardados e gasta as Pérolas', () => {
    const estado = comPerolas(jogoCom(membro('Gelusco', 10, 10), { rotasLiberadas: 3 }), 100)
    const depois = encomendar(rotas, estado, 'brasao', 'rara')
    expect(depois.equipamentos.guardados).toEqual([{ espaco: 'brasao', raridade: 'rara' }])
    expect(depois.inventario.perolas).toBe(20)
  })

  it('recusa raridade acima do limite e Pérolas a menos', () => {
    const estado = comPerolas(jogoCom(membro('Gelusco', 10, 10), { rotasLiberadas: 3 }), 100)
    expect(impedimentoDaEncomenda(rotas, estado, 'epica')).toMatch(/rota mais alta/)
    expect(() => encomendar(rotas, estado, 'cabeca', 'epica')).toThrow(RangeError)
    expect(impedimentoDaEncomenda(rotas, comPerolas(estado, 79), 'rara')).toMatch(/80 Pérolas/)
    expect(impedimentoDaEncomenda(rotas, estado, 'rara')).toBeNull()
  })
})

describe('com o jogo fechado', () => {
  it('critério do F25: uma peça encomendada com Pérolas pescadas com o jogo fechado é vestida no espaço escolhido', () => {
    const tres = [2, 3, 4].map((id) => membro('Bolhim', 5, 15, id))
    const estado = pescando(tres, { rotasLiberadas: 5 })
    const fora = creditarTempoFora(CONFIGURACAO, estado, 0, 8 * HORA, criarGerador(1))
    expect(fora.perolasDaPesca).toBeGreaterThanOrEqual(PRECO_DA_ENCOMENDA.lendaria)
    expect(fora.estado.inventario.perolas).toBeGreaterThanOrEqual(fora.perolasDaPesca)
    const encomendado = encomendar(rotas, fora.estado, 'insignia', 'lendaria')
    const indice = encomendado.equipamentos.guardados.findIndex((p) => p.espaco === 'insignia' && p.raridade === 'lendaria')
    expect(vestir(encomendado, indice).equipamentos.vestidos.insignia).toEqual({ espaco: 'insignia', raridade: 'lendaria' })
  })
})

describe('save', () => {
  it('migra o save da versão 15: Pesca vazia e Pérolas em 0', () => {
    const atual = jogoCom(membro('Gelusco', 3, 5))
    const { pesca: _, ...semPesca } = atual
    const { perolas: __, ...inventario } = atual.inventario
    const antigo = { ...semPesca, inventario }
    const save = desserializar<Tipo>(JSON.stringify({ versao: 15, salvoEm: 10, estado: antigo }), jogoCom(membro('Gelusco', 1, 5)))
    expect(save.versao).toBe(VERSAO_DO_SAVE)
    expect(save.estado).toEqual({ ...atual, pesca: PESCA_VAZIA })
  })
})
