import { describe, expect, it } from 'vitest'
import { CONFIGURACAO } from '../src/conteudo/jogo.ts'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { NIVEL_MAXIMO } from '../src/engine/atributos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { colocarNaForja, ouroPorHoraDaForja } from '../src/engine/base.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { TAXA_DE_CRUZAMENTO, taxaDeCruzamento } from '../src/engine/cruzamento.ts'
import type { Equipamento, Espaco } from '../src/engine/equipamentos.ts'
import { ESPACOS, bonus, despir, vestir } from '../src/engine/equipamentos.ts'
import type { EstadoDoJogo } from '../src/engine/jogo.ts'
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
