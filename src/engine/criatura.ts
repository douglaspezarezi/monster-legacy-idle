// Atributos finais de uma criatura a partir da espécie, dos genes e do nível (GDD, seção 7).
import type { Atributo, Genes } from './genes.ts'
import { ATRIBUTOS, multiplicadorDeRaridade } from './genes.ts'
import { valorDoAtributo } from './atributos.ts'

export type Atributos = Readonly<Record<Atributo, number>>

export function calcularAtributos(bases: Atributos, genes: Genes, nivel: number, prismatica: boolean): Atributos {
  const multiplicador = multiplicadorDeRaridade(genes)
  const atributos = {} as Record<Atributo, number>
  for (const atributo of ATRIBUTOS) {
    atributos[atributo] = valorDoAtributo(
      { base: bases[atributo], gene: genes[atributo], multiplicadorDeRaridade: multiplicador, prismatica },
      nivel,
    )
  }
  return atributos
}
