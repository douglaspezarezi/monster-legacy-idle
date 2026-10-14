// Genes e raridade (GDD, seção 7).
import type { Gerador } from './aleatorio.ts'
import { inteiroEntre } from './aleatorio.ts'

export const ATRIBUTOS = ['vida', 'ataque', 'defesa', 'foco', 'velocidade'] as const
export type Atributo = (typeof ATRIBUTOS)[number]

export type Genes = Readonly<Record<Atributo, number>>

export const GENE_MINIMO = 1
export const GENE_MAXIMO = 20

export type Raridade = 'fraca' | 'comum' | 'incomum' | 'rara' | 'epica' | 'lendaria' | 'mitica'

export type FaixaDeRaridade = {
  readonly raridade: Raridade
  readonly multiplicadorMinimo: number
  readonly multiplicadorMaximo: number
  readonly somaMinima: number
  readonly somaMaxima: number
  readonly permitePrismatica: boolean
}

export const FAIXAS_DE_RARIDADE: readonly FaixaDeRaridade[] = [
  { raridade: 'fraca', multiplicadorMinimo: 0.9, multiplicadorMaximo: 0.99, somaMinima: 5, somaMaxima: 20, permitePrismatica: false },
  { raridade: 'comum', multiplicadorMinimo: 1.0, multiplicadorMaximo: 1.09, somaMinima: 21, somaMaxima: 45, permitePrismatica: false },
  { raridade: 'incomum', multiplicadorMinimo: 1.1, multiplicadorMaximo: 1.24, somaMinima: 46, somaMaxima: 65, permitePrismatica: false },
  { raridade: 'rara', multiplicadorMinimo: 1.25, multiplicadorMaximo: 1.39, somaMinima: 66, somaMaxima: 80, permitePrismatica: false },
  { raridade: 'epica', multiplicadorMinimo: 1.4, multiplicadorMaximo: 1.54, somaMinima: 81, somaMaxima: 90, permitePrismatica: true },
  { raridade: 'lendaria', multiplicadorMinimo: 1.55, multiplicadorMaximo: 1.69, somaMinima: 91, somaMaxima: 96, permitePrismatica: true },
  { raridade: 'mitica', multiplicadorMinimo: 1.7, multiplicadorMaximo: 1.8, somaMinima: 97, somaMaxima: 100, permitePrismatica: true },
]

export function validarGenes(genes: Genes): void {
  for (const atributo of ATRIBUTOS) {
    const gene = genes[atributo]
    if (!Number.isInteger(gene) || gene < GENE_MINIMO || gene > GENE_MAXIMO) {
      throw new RangeError(`gene de ${atributo} fora de ${GENE_MINIMO} a ${GENE_MAXIMO}: ${gene}`)
    }
  }
}

export function somaDosGenes(genes: Genes): number {
  validarGenes(genes)
  return ATRIBUTOS.reduce((soma, atributo) => soma + genes[atributo], 0)
}

export function faixaPelaSoma(soma: number): FaixaDeRaridade {
  const faixa = FAIXAS_DE_RARIDADE.find((f) => soma >= f.somaMinima && soma <= f.somaMaxima)
  if (!faixa) throw new RangeError(`soma de genes fora de 5 a 100: ${soma}`)
  return faixa
}

export function raridadeDosGenes(genes: Genes): Raridade {
  return faixaPelaSoma(somaDosGenes(genes)).raridade
}

export function podeSerPrismatica(raridade: Raridade): boolean {
  return FAIXAS_DE_RARIDADE.some((f) => f.raridade === raridade && f.permitePrismatica)
}

export function faixaDaRaridade(raridade: Raridade): FaixaDeRaridade {
  const faixa = FAIXAS_DE_RARIDADE.find((f) => f.raridade === raridade)
  if (!faixa) throw new RangeError(`raridade desconhecida: ${raridade}`)
  return faixa
}

// Cresce em linha reta dentro da faixa, arredondado para duas casas.
// A conta é feita em centésimos para o arredondamento não depender de erro de ponto flutuante.
export function multiplicadorDeRaridade(genes: Genes): number {
  const soma = somaDosGenes(genes)
  const faixa = faixaPelaSoma(soma)
  const minimo = Math.round(faixa.multiplicadorMinimo * 100)
  const maximo = Math.round(faixa.multiplicadorMaximo * 100)
  const fracao = (soma - faixa.somaMinima) / (faixa.somaMaxima - faixa.somaMinima)
  return Math.round(minimo + (maximo - minimo) * fracao) / 100
}

// Sorteia os cinco genes com chance igual e repete até a soma cair na faixa da raridade.
export function sortearGenes(gerador: Gerador, raridade: Raridade): Genes {
  const faixa = faixaDaRaridade(raridade)
  for (;;) {
    const genes: Genes = {
      vida: inteiroEntre(gerador, GENE_MINIMO, GENE_MAXIMO),
      ataque: inteiroEntre(gerador, GENE_MINIMO, GENE_MAXIMO),
      defesa: inteiroEntre(gerador, GENE_MINIMO, GENE_MAXIMO),
      foco: inteiroEntre(gerador, GENE_MINIMO, GENE_MAXIMO),
      velocidade: inteiroEntre(gerador, GENE_MINIMO, GENE_MAXIMO),
    }
    const soma = somaDosGenes(genes)
    if (soma >= faixa.somaMinima && soma <= faixa.somaMaxima) return genes
  }
}
