// Atributos finais de uma criatura a partir da espécie, dos genes e do nível (GDD, seção 7).
import type { Combatente } from './combate.ts'
import type { Catalogo } from './especie.ts'
import { especieDo, tecnicasDa } from './especie.ts'
import type { Atributo, Genes } from './genes.ts'
import { ATRIBUTOS, multiplicadorDeRaridade } from './genes.ts'
import { valorDoAtributo } from './atributos.ts'
import { multiplicadorDaForma } from './evolucao.ts'
import { MULTIPLICADOR_DO_DESPERTAR, tecnicasDespertas } from './despertar.ts'

export type Atributos = Readonly<Record<Atributo, number>>

// O fator vem da evolução e do Despertar: 1 na primeira forma da linha, sem Despertar.
export function calcularAtributos(bases: Atributos, genes: Genes, nivel: number, prismatica: boolean, fatorDaForma = 1): Atributos {
  const multiplicador = multiplicadorDeRaridade(genes)
  const atributos = {} as Record<Atributo, number>
  for (const atributo of ATRIBUTOS) {
    const valor = valorDoAtributo({ base: bases[atributo], gene: genes[atributo], multiplicadorDeRaridade: multiplicador, prismatica }, nivel)
    atributos[atributo] = valor * fatorDaForma
  }
  return atributos
}

export type Criatura = {
  readonly especie: string
  readonly genes: Genes
  readonly prismatica: boolean
  readonly nivel: number
  readonly xpNoNivel: number
  // Só criaturas do jogador despertam; os selvagens não têm o campo.
  readonly despertada?: boolean
}

// Com a vida cheia. O multiplicador de Vida vale para selvagens e chefes (GDD, seção 4).
export function combatenteDe<Tipo extends string>(
  catalogo: Catalogo<Tipo>,
  criatura: Criatura,
  multiplicadorDeVida = 1,
): Combatente<Tipo> {
  const especie = especieDo(catalogo, criatura.especie)
  const fator = multiplicadorDaForma(catalogo, especie.nome) * (criatura.despertada ? MULTIPLICADOR_DO_DESPERTAR : 1)
  const calculados = calcularAtributos(especie.bases, criatura.genes, criatura.nivel, criatura.prismatica, fator)
  // Mais Vida e menos Ataque e Foco na mesma proporção: a luta fica longa sem aumentar o dano total.
  const atributos = {
    ...calculados,
    vida: calculados.vida * multiplicadorDeVida,
    ataque: calculados.ataque / multiplicadorDeVida,
    foco: calculados.foco / multiplicadorDeVida,
  }
  const tecnicas = criatura.despertada ? tecnicasDespertas(catalogo, especie, tecnicasDa(catalogo, especie)) : tecnicasDa(catalogo, especie)
  return { especie: especie.nome, tipos: especie.tipos, atributos, tecnicas, vida: atributos.vida }
}
