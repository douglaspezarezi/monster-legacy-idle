// Nascimento de criaturas: selvagens, chefes, matrizes e iniciais (GDD, seções 4 e 7).
import type { Gerador } from './aleatorio.ts'
import { inteiroEntre } from './aleatorio.ts'
import type { Criatura } from './criatura.ts'
import type { Catalogo } from './especie.ts'
import { especieDo, somaDasBases } from './especie.ts'
import type { Raridade } from './genes.ts'
import { podeSerPrismatica, sortearGenes } from './genes.ts'

// Gera uma criatura nova da espécie e raridade indicadas.
export type Matriz = {
  readonly especie: string
  readonly raridade: Raridade
}

export const CHANCES_DE_RARIDADE_DO_SELVAGEM: readonly (readonly [Raridade, number])[] = [
  ['fraca', 0.25],
  ['comum', 0.55],
  ['incomum', 0.15],
  ['rara', 0.04],
  ['epica', 0.009],
  ['lendaria', 0.0009],
  ['mitica', 0.0001],
]

export const CHANCE_PRISMATICA = 0.02
export const RARIDADE_DO_CHEFE: Raridade = 'rara'
export const RARIDADE_DO_INICIAL: Raridade = 'comum'

export function sortearRaridadeDoSelvagem(gerador: Gerador): Raridade {
  let sorteio = gerador()
  for (const [raridade, chance] of CHANCES_DE_RARIDADE_DO_SELVAGEM) {
    if (sorteio < chance) return raridade
    sorteio -= chance
  }
  // Sobra de arredondamento das chances.
  return 'mitica'
}

// Só sorteia quando a raridade permite a variação prismática.
export function criarCriatura(gerador: Gerador, especie: string, raridade: Raridade, nivel: number): Criatura {
  const genes = sortearGenes(gerador, raridade)
  const prismatica = podeSerPrismatica(raridade) && gerador() < CHANCE_PRISMATICA
  return { especie, genes, prismatica, nivel, xpNoNivel: 0 }
}

// Quantos níveis abaixo da criatura ativa fica o teto do selvagem.
export const MARGEM_DO_SELVAGEM = 2

// O teto do selvagem fica abaixo do nível da criatura ativa e não passa do teto da rota; abaixo do piso da rota, fica no piso.
export function faixaDoSelvagem(faixaDaRota: readonly [number, number], nivelDaAtiva: number): readonly [number, number] {
  const [minimo, maximo] = faixaDaRota
  return [minimo, Math.max(minimo, Math.min(maximo, nivelDaAtiva - MARGEM_DO_SELVAGEM))]
}

export function gerarSelvagem(
  gerador: Gerador,
  especies: readonly string[],
  faixaDeNivel: readonly [number, number],
): Criatura {
  const especie = especies[inteiroEntre(gerador, 0, especies.length - 1)]
  const nivel = inteiroEntre(gerador, faixaDeNivel[0], faixaDeNivel[1])
  return criarCriatura(gerador, especie, sortearRaridadeDoSelvagem(gerador), nivel)
}

// A espécie da rota com maior soma de valores base; no empate, a primeira da lista.
export function especieDoChefe(catalogo: Catalogo<string>, especies: readonly string[]): string {
  let melhor = especies[0]
  for (const nome of especies) {
    if (somaDasBases(especieDo(catalogo, nome)) > somaDasBases(especieDo(catalogo, melhor))) melhor = nome
  }
  return melhor
}

export function gerarChefe(
  catalogo: Catalogo<string>,
  gerador: Gerador,
  especies: readonly string[],
  faixaDeNivel: readonly [number, number],
): Criatura {
  return criarCriatura(gerador, especieDoChefe(catalogo, especies), RARIDADE_DO_CHEFE, faixaDeNivel[1])
}

export function abrirMatriz(gerador: Gerador, matriz: Matriz): Criatura {
  return criarCriatura(gerador, matriz.especie, matriz.raridade, 1)
}

export function criarInicial(gerador: Gerador, especie: string): Criatura {
  return criarCriatura(gerador, especie, RARIDADE_DO_INICIAL, 1)
}
