import { describe, expect, it } from 'vitest'
import { CATALOGO, CONFIGURACAO } from '../src/conteudo/jogo.ts'
import { LINHAGENS } from '../src/conteudo/linhagens.ts'
import { NIVEL_MAXIMO } from '../src/engine/atributos.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import { simularCacada } from '../src/engine/cacada.ts'
import { calcularAtributos, combatenteDe } from '../src/engine/criatura.ts'
import { cruzar } from '../src/engine/cruzamento.ts'
import { especieDo } from '../src/engine/especie.ts'
import { reiniciarEra } from '../src/engine/era.ts'
import { evoluir, formaDa, multiplicadorDaForma, primeiraForma } from '../src/engine/evolucao.ts'
import { trocarAtiva } from '../src/engine/jogo.ts'
import { xpParaSubir } from '../src/engine/nivel.ts'
import { jogoCom, membro } from './apoio.ts'

const SEM_TETO = { ...CONFIGURACAO, eras: [{ teto: NIVEL_MAXIMO, rotas: 5 }] }

describe('linhas de evolução', () => {
  it('forma e primeira forma de cada linha', () => {
    expect([formaDa(CATALOGO, 'Gelusco'), formaDa(CATALOGO, 'Gelundo'), formaDa(CATALOGO, 'Glaciarca')]).toEqual([1, 2, 3])
    expect(primeiraForma(CATALOGO, 'Glaciarca')).toBe('Gelusco')
    expect(primeiraForma(CATALOGO, 'Raizudo')).toBe('Brotelho')
    expect(primeiraForma(CATALOGO, 'Ferroa')).toBe('Ferroa')
  })

  it('cada forma multiplica os atributos: ×1, ×1,10 e ×1,20', () => {
    expect([multiplicadorDaForma(CATALOGO, 'Gelusco'), multiplicadorDaForma(CATALOGO, 'Gelundo'), multiplicadorDaForma(CATALOGO, 'Glaciarca')]).toEqual([1, 1.1, 1.2])
    const gelundo = membro('Gelundo', 80, 10)
    const semForma = calcularAtributos(especieDo(CATALOGO, 'Gelundo').bases, gelundo.genes, 80, false)
    expect(combatenteDe(CATALOGO, gelundo).atributos.vida).toBeCloseTo(semForma.vida * 1.1)
  })

  it('evolui ao alcançar o nível, inclusive duas formas de uma vez', () => {
    expect(evoluir(CATALOGO, membro('Gelusco', 74, 10)).especie).toBe('Gelusco')
    expect(evoluir(CATALOGO, membro('Gelusco', 75, 10)).especie).toBe('Gelundo')
    expect(evoluir(CATALOGO, membro('Gelusco', 150, 10)).especie).toBe('Glaciarca')
    const ferroa = membro('Ferroa', 120, 10)
    expect(evoluir(CATALOGO, ferroa)).toBe(ferroa)
  })
})

describe('evolução na caçada', () => {
  it('a ativa evolui ao subir para o nível 75, com aviso, mantendo genes e nível', () => {
    const ativa = { ...membro('Gelusco', 74, 12), xpNoNivel: xpParaSubir(74) - 1 }
    const estado = jogoCom(ativa, { rota: 1, avancoAutomatico: false })
    const r = simularCacada(SEM_TETO, estado, 0, 60_000, criarGerador(1))
    expect(r.estado.ativa).toMatchObject({ especie: 'Gelundo', nivel: 75, genes: ativa.genes })
    expect(r.eventos).toContainEqual(expect.objectContaining({ tipo: 'evolucao', de: 'Gelusco', para: 'Gelundo' }))
  })
})

describe('volta à primeira forma', () => {
  it('no reset de Era', () => {
    const naEra2 = jogoCom(membro('Gelundo', 100, 12, 1, 2), { era: 2 })
    const comMaisEras = { ...CONFIGURACAO, eras: [...CONFIGURACAO.eras, { teto: 150, rotas: 5 }] }
    expect(reiniciarEra(comMaisEras, naEra2, 0).ativa).toMatchObject({ especie: 'Gelusco', nivel: 1, era: 3 })
  })

  it('ao ativar da reserva uma criatura de Era anterior', () => {
    const estado = jogoCom(membro('Gelusco', 1, 10, 1, 2), { era: 2, reserva: [membro('Raizudo', 80, 8, 2, 1)] })
    expect(trocarAtiva(estado, CATALOGO, 2, 0).ativa).toMatchObject({ especie: 'Brotelho', nivel: 1 })
  })

  it('no cruzamento, o filhote nasce na primeira forma do pai escolhido', () => {
    const base = jogoCom(membro('Gelusco', 10, 10), { reserva: [membro('Raizudo', 60, 10, 2), membro('Sapolho', 40, 10, 3)], proximoId: 4 })
    const estado = { ...base, inventario: { ...base.inventario, ouro: 1000 } }
    const depois = cruzar(estado, CATALOGO, LINHAGENS, { paiA: 2, paiB: 3, especieDe: 2, herdados: ['vida', 'ataque', 'defesa'] }, criarGerador(1))
    expect(depois.reserva[0]).toMatchObject({ especie: 'Brotelho', nivel: 1 })
  })
})
