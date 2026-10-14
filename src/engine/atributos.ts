// Crescimento de atributos por nível (GDD, seção 7).

export const NIVEL_MAXIMO = 200
export const NIVEL_DO_LIMITE_SUAVE = 150
export const GANHO_APOS_LIMITE_SUAVE = 0.25
export const BONUS_PRISMATICO = 1.1

export type CrescimentoDeAtributo = {
  readonly base: number
  readonly gene: number
  readonly multiplicadorDeRaridade: number
  readonly prismatica: boolean
}

export function ganhoPorNivel(gene: number, multiplicadorDeRaridade: number): number {
  return gene * multiplicadorDeRaridade
}

// Níveis acima do limite suave contam como 25% de um nível normal.
function niveisEfetivos(nivel: number): number {
  const ateLimite = Math.min(nivel, NIVEL_DO_LIMITE_SUAVE) - 1
  const aposLimite = Math.max(0, nivel - NIVEL_DO_LIMITE_SUAVE)
  return ateLimite + aposLimite * GANHO_APOS_LIMITE_SUAVE
}

export function valorDoAtributo(crescimento: CrescimentoDeAtributo, nivel: number): number {
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > NIVEL_MAXIMO) {
    throw new RangeError(`nível fora de 1 a ${NIVEL_MAXIMO}: ${nivel}`)
  }
  const ganho = ganhoPorNivel(crescimento.gene, crescimento.multiplicadorDeRaridade)
  const bonus = crescimento.prismatica ? BONUS_PRISMATICO : 1
  return (crescimento.base + ganho * niveisEfetivos(nivel)) * bonus
}
