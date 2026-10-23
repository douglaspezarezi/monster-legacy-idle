import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { NIVEL_MAXIMO } from '../src/engine/atributos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { colocarNaForja, colocarNaMina, fragmentosPorHoraDaMina, ouroPorHoraDaForja } from '../src/engine/base.ts'
import { ABATES_PARA_O_CHEFE, abatesParaOChefe, simularCacada } from '../src/engine/cacada.ts'
import { TAXA_DE_CRUZAMENTO, taxaDeCruzamento } from '../src/engine/cruzamento.ts'
import type { Equipamento, Espaco } from '../src/engine/equipamentos.ts'
import { ESPACOS, bonus, despir, vestir } from '../src/engine/equipamentos.ts'
import type { EstadoDoJogo } from '../src/engine/jogo.ts'
import { raridadeDosGenes } from '../src/engine/genes.ts'
import { abrirMatrizDoInventario } from '../src/engine/jogo.ts'
import { CHANCES_DE_RARIDADE_DO_SELVAGEM, chancesDeRaridadeDoSelvagem } from '../src/engine/nascimento.ts'
import { cruzar } from '../src/engine/cruzamento.ts'
import { LINHAGENS } from '../src/conteudo/linhagens.ts'
import { reiniciarEra } from '../src/engine/era.ts'
import { jogoCom, membro } from './apoio.ts'

const MINUTO = 60 * 1000
const SEM_TETO = { ...CONFIGURACAO, eras: [{ teto: NIVEL_MAXIMO, rotas: 5 }] }

function vestido(estado: EstadoDoJogo<Tipo>, espaco: Espaco, raridade: Equipamento['raridade'] = 'rara'): EstadoDoJogo<Tipo> {
  return vestir({ ...estado, equipamentos: { ...estado.equipamentos, guardados: [{ espaco, raridade }] } }, 0)
}

describe('vestir e despir', () => {
  it('a peça vai para o espaço dela e a anterior volta para os guardados', () => {
    let estado = jogoCom(membro('Gelusco', 10, 10))
    estado = vestido(estado, 'cabeca', 'comum')
    expect(bonus(estado, 'cabeca')).toBe(5)
    estado = vestido(estado, 'cabeca', 'epica')
    expect(bonus(estado, 'cabeca')).toBe(20)
    expect(estado.equipamentos.guardados).toEqual([{ espaco: 'cabeca', raridade: 'comum' }])
    estado = despir(estado, 'cabeca')
    expect(bonus(estado, 'cabeca')).toBe(0)
    expect(estado.equipamentos.guardados).toHaveLength(2)
  })

  it('efeito de 5% a 25% conforme a raridade', () => {
    const estado = jogoCom(membro('Gelusco', 10, 10))
    expect(['comum', 'incomum', 'rara', 'epica', 'lendaria'].map((r) => bonus(vestido(estado, 'peito', r as Equipamento['raridade']), 'peito'))).toEqual([5, 10, 15, 20, 25])
  })
})

describe('queda nos chefes', () => {
  it('cerca de 10% das vitórias sobre chefes dão uma peça, da raridade da rota, de qualquer espaço', () => {
    const gerador = criarGerador(5)
    let quedas = 0
    const espacos = new Set<Espaco>()
    const vitorias = 600
    for (let i = 0; i < vitorias; i++) {
      const estado = jogoCom(membro('Gelusco', 120, 20), { rota: 2, rotasLiberadas: 2, abatesPorRota: [0, 100, 0, 0, 0], avancoAutomatico: false })
      const r = simularCacada(SEM_TETO, estado, 0, MINUTO, gerador)
      for (const e of r.eventos) {
        if (e.tipo !== 'equipamento') continue
        quedas++
        expect(e.equipamento.raridade).toBe('incomum')
        espacos.add(e.equipamento.espaco)
      }
    }
    expect(quedas / vitorias).toBeGreaterThan(0.07)
    expect(quedas / vitorias).toBeLessThan(0.13)
    expect(espacos.size).toBe(ESPACOS.length)
  })
})

describe('efeitos', () => {
  const base = jogoCom(membro('Gelusco', 120, 20), { rota: 3, rotasLiberadas: 3, avancoAutomatico: false })

  it('Cabeça e Peito aumentam o XP e o ouro de cada abate', () => {
    const r = simularCacada(SEM_TETO, vestido(vestido(base, 'cabeca', 'rara'), 'peito', 'lendaria'), 0, 5 * MINUTO, criarGerador(1))
    const abate = r.eventos.find((e) => e.tipo === 'abate' && !e.chefe)
    expect(abate).toMatchObject({ xp: 115, ouro: 62 })
  })

  it('Pernas encurtam a espera entre selvagens', () => {
    const sem = simularCacada(SEM_TETO, base, 0, 30 * MINUTO, criarGerador(2))
    const com = simularCacada(SEM_TETO, vestido(base, 'pernas', 'lendaria'), 0, 30 * MINUTO, criarGerador(2))
    const abates = (r: typeof sem) => r.eventos.filter((e) => e.tipo === 'abate').length
    expect(abates(com)).toBeGreaterThan(abates(sem))
  })

  it('Arma secundária dá desconto na taxa de cruzamento', () => {
    expect(taxaDeCruzamento(base)).toBe(TAXA_DE_CRUZAMENTO)
    expect(taxaDeCruzamento(vestido(base, 'armaSecundaria', 'epica'))).toBe(240)
  })

  it('Cinto aumenta a produção da Forja', () => {
    const naForja = colocarNaForja(CONFIGURACAO, { ...base, reserva: [membro('Brotelho', 3, 10, 2)] }, 2)
    expect(ouroPorHoraDaForja(CONFIGURACAO, vestido(naForja, 'cinto', 'rara'))).toBeCloseTo(ouroPorHoraDaForja(CONFIGURACAO, naForja) * 1.15)
  })

  it('Arma principal aumenta as capturas', () => {
    const cacando = { ...base, filtroDeCaptura: { especies: ['Formigaço', 'Sapolho', 'Ferroa'], raridadeMinima: 'fraca' as const }, inventario: { ...base.inventario, capsulas: 10_000 } }
    // Caçadas curtas, para a reserva não encher; a mesma semente sorteia os mesmos números nas duas.
    const capturas = (estado: EstadoDoJogo<Tipo>) => {
      let total = 0
      for (let semente = 1; semente <= 20; semente++) {
        const r = simularCacada(SEM_TETO, estado, 0, 2 * MINUTO, criarGerador(semente))
        total += r.eventos.filter((e) => e.tipo === 'captura' && e.sucesso).length
      }
      return total
    }
    expect(capturas(vestido(cacando, 'armaPrincipal', 'lendaria'))).toBeGreaterThan(capturas(cacando))
  })

  it('os equipamentos atravessam o reset de Era', () => {
    const noTeto = vestido(jogoCom(membro('Gelusco', 50, 10)), 'cabeca', 'rara')
    expect(reiniciarEra(CONFIGURACAO, noTeto, 0).equipamentos).toEqual(noTeto.equipamentos)
  })
})

describe('espaços do F16', () => {
  const HORA = 60 * MINUTO
  const MAIS_QUE_RARA = ['rara', 'epica', 'lendaria', 'mitica']

  it('Luvas sobem as chances de rara a mítica na proporção do efeito, tirando da fraca', () => {
    const com = Object.fromEntries(chancesDeRaridadeDoSelvagem(25))
    const sem = Object.fromEntries(CHANCES_DE_RARIDADE_DO_SELVAGEM)
    expect(com.rara).toBeCloseTo(0.05)
    expect(com.epica).toBeCloseTo(0.01125)
    expect(com.mitica).toBeCloseTo(0.000125)
    expect(com.comum).toBe(sem.comum)
    expect(com.fraca).toBeCloseTo(0.2375)
    expect(Object.values(com).reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })

  it('Luvas fazem a caçada encontrar mais selvagens raros ou melhores', () => {
    const base = jogoCom(membro('Gelusco', 120, 20), { rota: 3, rotasLiberadas: 3, avancoAutomatico: false })
    // O primeiro selvagem de cada semente; com Luvas, toda semente que dava raro continua dando.
    const raros = (estado: EstadoDoJogo<Tipo>) => {
      let total = 0
      for (let semente = 1; semente <= 2000; semente++) {
        const encontro = simularCacada(SEM_TETO, estado, 0, 1, criarGerador(semente)).estado.encontro
        if (encontro && MAIS_QUE_RARA.includes(raridadeDosGenes(encontro.selvagem.genes))) total++
      }
      return total
    }
    expect(raros(vestido(base, 'luvas', 'lendaria'))).toBeGreaterThan(raros(base))
  })

  it('Joias aumentam as quedas de matriz, Essência e Chave', () => {
    const base = jogoCom(membro('Rebitaço', 95, 18, 1, 2), { era: 2, bioma: 4, rota: 5, rotasLiberadas: 5, avancoAutomatico: false })
    const cacando = { ...base, inventario: { ...base.inventario, ouro: 1e6 }, reposicao: { capsula: 0, tonicoDeCura: 20, tonicoDeRetorno: 5 } }
    const quedas = (estado: EstadoDoJogo<Tipo>) => {
      let total = 0
      for (let semente = 1; semente <= 3; semente++) {
        const r = simularCacada(CONFIGURACAO, estado, 0, 24 * HORA, criarGerador(semente))
        total += r.eventos.filter((e) => e.tipo === 'matriz' || e.tipo === 'essencia' || e.tipo === 'chave').length
      }
      return total
    }
    expect(quedas(vestido(cacando, 'joias', 'lendaria'))).toBeGreaterThan(quedas(cacando))
  })

  it('Insígnia faz o chefe aparecer com menos abates', () => {
    const base = jogoCom(membro('Gelusco', 120, 20), { avancoAutomatico: false })
    expect(abatesParaOChefe(base)).toBe(ABATES_PARA_O_CHEFE)
    const comInsignia = vestido(base, 'insignia', 'lendaria')
    expect(abatesParaOChefe(comInsignia)).toBe(75)
    expect(abatesParaOChefe(vestido(base, 'insignia', 'rara'))).toBe(85)
    const abatidos = simularCacada(SEM_TETO, comInsignia, 0, 2 * HORA, criarGerador(1)).eventos.filter((e) => e.tipo === 'abate')
    expect(abatidos.findIndex((e) => e.tipo === 'abate' && e.chefe)).toBe(75)
  })

  it('Brasão aumenta a chance de prismática na matriz e no cruzamento', () => {
    const comMatriz = jogoCom(membro('Gelusco', 10, 10), { inventario: { ...jogoCom(membro('Gelusco', 10, 10)).inventario, matrizes: [{ especie: 'Gelusco', raridade: 'epica' }] } })
    const prismaticas = (estado: EstadoDoJogo<Tipo>) => {
      let total = 0
      for (let semente = 1; semente <= 3000; semente++) if (abrirMatrizDoInventario(estado, 0, criarGerador(semente)).reserva[0].prismatica) total++
      return total
    }
    expect(prismaticas(vestido(comMatriz, 'brasao', 'lendaria'))).toBeGreaterThan(prismaticas(comMatriz))

    const paiA = membro('Gelusco', 10, 20, 2)
    const paiB = membro('Gelundo', 10, 20, 3)
    const paraCruzar = jogoCom(membro('Rebitim', 10, 10), { reserva: [paiA, paiB], proximoId: 4 })
    const comOuro = { ...paraCruzar, inventario: { ...paraCruzar.inventario, ouro: 1000 } }
    const pedido = { paiA: 2, paiB: 3, especieDe: 2, herdados: ['vida', 'ataque', 'defesa'] as const }
    const filhotes = (estado: EstadoDoJogo<Tipo>) => {
      let total = 0
      for (let semente = 1; semente <= 3000; semente++) {
        if (cruzar(estado, CATALOGO, LINHAGENS, { ...pedido, herdados: [...pedido.herdados] }, criarGerador(semente)).reserva[0].prismatica) total++
      }
      return total
    }
    expect(filhotes(vestido(comOuro, 'brasao', 'lendaria'))).toBeGreaterThan(filhotes(comOuro))
  })

  it('Cinto também aumenta a produção da Mina', () => {
    const base = jogoCom(membro('Gelusco', 10, 10), { reserva: [membro('Seixote', 3, 10, 2)], proximoId: 3 })
    const naMina = colocarNaMina(CONFIGURACAO, base, 2)
    expect(fragmentosPorHoraDaMina(CONFIGURACAO, vestido(naMina, 'cinto', 'rara'))).toBeCloseTo(fragmentosPorHoraDaMina(CONFIGURACAO, naMina) * 1.15)
  })
})
