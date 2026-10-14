import { describe, expect, it } from 'vitest'
import type { Tipo } from '../src/conteudo/tipos.ts'
import { DADOS_DOS_TIPOS, TIPOS } from '../src/conteudo/tipos.ts'
import { criarTabelaDeTipos, multiplicadorDeTipo } from '../src/engine/multiplicador-de-tipo.ts'

const tabela = criarTabelaDeTipos(DADOS_DOS_TIPOS)
const fator = (tecnica: Tipo, defensor: Tipo) => multiplicadorDeTipo(tabela, tecnica, [defensor])

describe('tabela de tipos (GDD, seção 6)', () => {
  it('tem os 16 tipos', () => {
    expect(TIPOS).toHaveLength(16)
    expect(Object.keys(DADOS_DOS_TIPOS).sort()).toEqual([...TIPOS].sort())
  })

  it.each(TIPOS)('%s vence 2 ou 3 e resiste a 2 ou 3', (tipo) => {
    const vence = TIPOS.filter((d) => fator(tipo, d) === 2).length
    const resiste = TIPOS.filter((a) => fator(a, tipo) < 1).length
    expect(vence).toBeGreaterThanOrEqual(2)
    expect(vence).toBeLessThanOrEqual(3)
    expect(resiste).toBeGreaterThanOrEqual(2)
    expect(resiste).toBeLessThanOrEqual(3)
  })

  it('nenhum tipo vence e resiste ao mesmo atacante', () => {
    for (const tipo of TIPOS) {
      const dados = DADOS_DOS_TIPOS[tipo]
      for (const alvo of dados.vence) {
        expect(DADOS_DOS_TIPOS[alvo].resiste).not.toContain(tipo)
        expect(DADOS_DOS_TIPOS[alvo].imuneA).not.toContain(tipo)
      }
    }
  })

  it('tem no máximo 4 imunidades', () => {
    expect(TIPOS.flatMap((t) => DADOS_DOS_TIPOS[t].imuneA)).toHaveLength(3)
  })

  it('nenhum tipo é estritamente melhor que outro em ataque e defesa', () => {
    for (const a of TIPOS) {
      for (const b of TIPOS) {
        if (a === b) continue
        const diferencas = [
          ...TIPOS.map((d) => fator(a, d) - fator(b, d)),
          ...TIPOS.map((x) => fator(x, b) - fator(x, a)),
        ]
        const domina = diferencas.every((d) => d >= 0) && diferencas.some((d) => d > 0)
        expect(domina, `${a} domina ${b}`).toBe(false)
      }
    }
  })

  it('aplica as imunidades', () => {
    expect(fator('Peçonha', 'Liga')).toBe(0)
    expect(fator('Rocha', 'Bruma')).toBe(0)
    expect(fator('Eco', 'Astro')).toBe(0)
  })

  it('combina dois tipos do defensor', () => {
    expect(multiplicadorDeTipo(tabela, 'Chama', ['Brota', 'Geada'])).toBe(4)
    expect(multiplicadorDeTipo(tabela, 'Maré', ['Chama', 'Brota'])).toBe(1)
  })
})
