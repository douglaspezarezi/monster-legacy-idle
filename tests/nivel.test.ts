import { describe, expect, it } from 'vitest'
import { NIVEL_MAXIMO } from '../src/engine/atributos.ts'
import type { Criatura } from '../src/engine/criatura.ts'
import { ganharXp, xpParaSubir } from '../src/engine/nivel.ts'

const genes = { vida: 5, ataque: 5, defesa: 5, foco: 5, velocidade: 5 }
const criatura: Criatura = { especie: 'Brotelho', genes, prismatica: false, nivel: 1, xpNoNivel: 0 }

describe('XP e nível', () => {
  it('do nível n para o n + 1 são 6 × n²', () => {
    expect(xpParaSubir(1)).toBe(6)
    expect(xpParaSubir(10)).toBe(600)
  })

  it('abaixo do necessário só acumula', () => {
    expect(ganharXp(criatura, 5)).toMatchObject({ nivel: 1, xpNoNivel: 5 })
  })

  it('a sobra passa para o nível seguinte, mesmo subindo vários de uma vez', () => {
    // 6 para o 2, 24 para o 3: 35 dá nível 3 com 5 de sobra.
    expect(ganharXp(criatura, 35)).toMatchObject({ nivel: 3, xpNoNivel: 5 })
  })

  it('no nível máximo o XP para de contar', () => {
    const quase = { ...criatura, nivel: NIVEL_MAXIMO - 1, xpNoNivel: 0 }
    expect(ganharXp(quase, xpParaSubir(NIVEL_MAXIMO - 1) + 500)).toMatchObject({ nivel: NIVEL_MAXIMO, xpNoNivel: 0 })
  })
})
