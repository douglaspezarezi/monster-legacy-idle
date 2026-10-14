// XP e nível (GDD, seção 7).
import { NIVEL_MAXIMO } from './atributos.ts'
import type { Criatura } from './criatura.ts'

export function xpParaSubir(nivel: number): number {
  return 6 * nivel * nivel
}

// O que sobra passa para o nível seguinte; no teto o XP para de contar.
export function ganharXp(criatura: Criatura, xp: number, teto = NIVEL_MAXIMO): Criatura {
  let { nivel, xpNoNivel } = criatura
  xpNoNivel += xp
  while (nivel < teto && xpNoNivel >= xpParaSubir(nivel)) {
    xpNoNivel -= xpParaSubir(nivel)
    nivel++
  }
  if (nivel >= teto) xpNoNivel = 0
  return { ...criatura, nivel, xpNoNivel }
}
