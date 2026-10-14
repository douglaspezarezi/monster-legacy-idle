// Atributos finais de uma criatura a partir da espécie, dos genes e do nível (GDD, seção 7).
import type { Combatente } from './combate.ts'
import type { Catalogo } from './especie.ts'
import { especieDo, tecnicasDa } from './especie.ts'
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

export type Criatura = {
  readonly especie: string
  readonly genes: Genes
  readonly prismatica: boolean
  readonly nivel: number
  readonly xpNoNivel: number
}

// Com a vida cheia. O multiplicador de Vida vale para selvagens e chefes (GDD, seção 4).
export function combatenteDe<Tipo extends string>(
  catalogo: Catalogo<Tipo>,
  criatura: Criatura,
  multiplicadorDeVida = 1,
): Combatente<Tipo> {
  const especie = especieDo(catalogo, criatura.especie)
  const calculados = calcularAtributos(especie.bases, criatura.genes, criatura.nivel, criatura.prismatica)
  const atributos = { ...calculados, vida: calculados.vida * multiplicadorDeVida }
  return { especie: especie.nome, tipos: especie.tipos, atributos, tecnicas: tecnicasDa(catalogo, especie), vida: atributos.vida }
}
