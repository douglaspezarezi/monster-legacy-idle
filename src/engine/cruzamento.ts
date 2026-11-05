// Cruzamento com herança de genes (GDD, seção 10).
import type { Gerador } from './aleatorio.ts'
import { inteiroEntre } from './aleatorio.ts'
import type { Criatura } from './criatura.ts'
import type { Atributo, Genes } from './genes.ts'
import { ATRIBUTOS, GENE_MAXIMO, GENE_MINIMO, podeSerPrismatica, raridadeDosGenes } from './genes.ts'
import type { EstadoDoJogo } from './jogo.ts'
import type { Catalogo } from './especie.ts'
import { primeiraForma } from './evolucao.ts'
import { CHANCE_PRISMATICA } from './nascimento.ts'
import { aumentar, reduzir } from './equipamentos.ts'
import { trabalhando } from './base.ts'
import { impedimentoDaTecnica, tecnicasHerdaveis } from './aprendizado.ts'

export const TAXA_DE_CRUZAMENTO = 300
export const GENES_HERDADOS = 3
// Com a Pedra do Destino.
export const GENES_HERDADOS_COM_PEDRA = 4

// A Arma secundária dá desconto na taxa.
export function taxaDeCruzamento<Tipo extends string>(estado: EstadoDoJogo<Tipo>): number {
  return Math.round(reduzir(TAXA_DE_CRUZAMENTO, estado, 'armaSecundaria'))
}

export type Linhagem = {
  readonly nome: string
  readonly especies: readonly string[]
}

export function linhagemDe(linhagens: readonly Linhagem[], especie: string): Linhagem | undefined {
  return linhagens.find((l) => l.especies.includes(especie))
}

export function mesmaLinhagem(linhagens: readonly Linhagem[], a: string, b: string): boolean {
  const linhagem = linhagemDe(linhagens, a)
  return linhagem !== undefined && linhagem.especies.includes(b)
}

// Cada atributo herdado recebe o maior gene dos pais; os outros são sorteados de 1 a 20.
export function genesDoFilhote(paiA: Genes, paiB: Genes, herdados: readonly Atributo[], gerador: Gerador): Genes {
  const genes = {} as Record<Atributo, number>
  for (const atributo of ATRIBUTOS) {
    genes[atributo] = herdados.includes(atributo)
      ? Math.max(paiA[atributo], paiB[atributo])
      : inteiroEntre(gerador, GENE_MINIMO, GENE_MAXIMO)
  }
  return genes
}

export function nascerDoCruzamento(
  paiA: Criatura,
  paiB: Criatura,
  especie: string,
  herdados: readonly Atributo[],
  gerador: Gerador,
  chancePrismatica = CHANCE_PRISMATICA,
): Criatura {
  const genes = genesDoFilhote(paiA.genes, paiB.genes, herdados, gerador)
  const prismatica = podeSerPrismatica(raridadeDosGenes(genes)) && gerador() < chancePrismatica
  return { especie, genes, prismatica, nivel: 1, xpNoNivel: 0 }
}

export type PedidoDeCruzamento = {
  readonly paiA: number
  readonly paiB: number
  // Id do pai que define a espécie do filhote.
  readonly especieDe: number
  readonly herdados: readonly Atributo[]
  // Técnica da fila de um dos pais que o filhote já nasce sabendo.
  readonly tecnicaHerdada?: string
  // Gasta uma Pedra do Destino para herdar 4 atributos.
  readonly pedraDoDestino?: boolean
}

// Técnicas que o filhote da espécie pode herdar dos dois pais, sem repetir.
export function tecnicasDoCruzamento<Tipo extends string>(catalogo: Catalogo<Tipo>, paiA: Criatura, paiB: Criatura, especie: string): string[] {
  const filhote = primeiraForma(catalogo, especie)
  return [...new Set([...tecnicasHerdaveis(catalogo, paiA), ...tecnicasHerdaveis(catalogo, paiB)])].filter(
    (tecnica) => impedimentoDaTecnica(catalogo, filhote, tecnica) === null,
  )
}

// Os pais saem da reserva para sempre; o filhote entra no lugar.
export function cruzar<Tipo extends string>(
  estado: EstadoDoJogo<Tipo>,
  catalogo: Catalogo<Tipo>,
  linhagens: readonly Linhagem[],
  pedido: PedidoDeCruzamento,
  gerador: Gerador,
): EstadoDoJogo<Tipo> {
  const { paiA, paiB, especieDe, herdados, tecnicaHerdada, pedraDoDestino = false } = pedido
  if (paiA === paiB) throw new RangeError('os pais precisam ser duas criaturas')
  const a = estado.reserva.find((m) => m.id === paiA)
  const b = estado.reserva.find((m) => m.id === paiB)
  if (!a || !b) throw new RangeError('os pais precisam estar na reserva')
  if (trabalhando(estado, paiA) || trabalhando(estado, paiB)) {
    throw new RangeError('criatura trabalhando não cruza')
  }
  if (!mesmaLinhagem(linhagens, a.especie, b.especie)) throw new RangeError(`linhagens diferentes: ${a.especie} e ${b.especie}`)
  if (especieDe !== paiA && especieDe !== paiB) throw new RangeError('a espécie vem de um dos pais')
  const quantos = pedraDoDestino ? GENES_HERDADOS_COM_PEDRA : GENES_HERDADOS
  if (herdados.length !== quantos || new Set(herdados).size !== quantos || herdados.some((h) => !ATRIBUTOS.includes(h))) {
    throw new RangeError(`escolha ${quantos} atributos diferentes`)
  }
  if (pedraDoDestino && estado.inventario.pedrasDoDestino < 1) throw new RangeError('sem Pedra do Destino')
  const taxa = taxaDeCruzamento(estado)
  if (estado.inventario.ouro < taxa) throw new RangeError(`ouro insuficiente: ${estado.inventario.ouro}`)

  // O filhote nasce na primeira forma da linha do pai escolhido.
  const especie = primeiraForma(catalogo, especieDe === paiA ? a.especie : b.especie)
  if (tecnicaHerdada !== undefined && !tecnicasDoCruzamento(catalogo, a, b, especie).includes(tecnicaHerdada)) {
    throw new RangeError(`técnica que o filhote não herda: ${tecnicaHerdada}`)
  }
  const nascido = nascerDoCruzamento(a, b, especie, herdados, gerador, aumentar(CHANCE_PRISMATICA, estado, 'brasao'))
  const filhote = { ...nascido, tecnicaAprendida: tecnicaHerdada, id: estado.proximoId, era: estado.era }
  return {
    ...estado,
    reserva: [...estado.reserva.filter((m) => m.id !== paiA && m.id !== paiB), filhote],
    proximoId: estado.proximoId + 1,
    contadores: { ...estado.contadores, cruzamentos: estado.contadores.cruzamentos + 1 },
    inventario: {
      ...estado.inventario,
      ouro: estado.inventario.ouro - taxa,
      pedrasDoDestino: estado.inventario.pedrasDoDestino - (pedraDoDestino ? 1 : 0),
    },
  }
}
