// Mercado da Cidade: matrizes à vista por preço fixo em ouro, com estoque do dia (GDD, seção 13).
import type { Gerador } from './aleatorio.ts'
import { inteiroEntre } from './aleatorio.ts'
import type { Raridade } from './genes.ts'
import type { EstadoDoJogo } from './jogo.ts'

export type DadosDoMercado = {
  // Era a partir da qual o Mercado abre.
  readonly era: number
  // Diferença do horário de troca do estoque para o UTC; −3 horas troca à meia-noite de Brasília.
  readonly fusoMs: number
  // Quantas ofertas de cada raridade o estoque do dia tem.
  readonly estoque: readonly (readonly [Raridade, number])[]
  readonly precos: Readonly<Partial<Record<Raridade, number>>>
}

export type Oferta = {
  readonly especie: string
  readonly raridade: Raridade
  readonly preco: number
  readonly comprada: boolean
}

export type Mercado = {
  // Dia do estoque atual; −1 antes do primeiro estoque.
  readonly dia: number
  readonly ofertas: readonly Oferta[]
}

export const MERCADO_VAZIO: Mercado = { dia: -1, ofertas: [] }

export type ConfiguracaoDoMercado = {
  readonly mercado: DadosDoMercado
  // As espécies à venda são as que aparecem nas rotas dos biomas.
  readonly biomas: readonly { readonly especiesPorRota: readonly (readonly string[])[] }[]
}

const DIA_MS = 24 * 60 * 60 * 1000

export function diaDoMercado(dados: DadosDoMercado, agora: number): number {
  return Math.floor((agora + dados.fusoMs) / DIA_MS)
}

// Instante em que o estoque atual é trocado.
export function proximaTroca(dados: DadosDoMercado, agora: number): number {
  return (diaDoMercado(dados, agora) + 1) * DIA_MS - dados.fusoMs
}

export function especiesDoMercado(configuracao: ConfiguracaoDoMercado): string[] {
  return [...new Set(configuracao.biomas.flatMap((b) => b.especiesPorRota.flat()))]
}

function precoDe(dados: DadosDoMercado, raridade: Raridade): number {
  const preco = dados.precos[raridade]
  if (preco === undefined) throw new RangeError(`sem preço para ${raridade}`)
  return preco
}

// Sorteia o estoque na primeira vez que o jogo passa por um dia novo; as espécies não se repetem no dia.
export function atualizarMercado<Tipo extends string>(
  configuracao: ConfiguracaoDoMercado,
  estado: EstadoDoJogo<Tipo>,
  agora: number,
  gerador: Gerador,
): EstadoDoJogo<Tipo> {
  const dados = configuracao.mercado
  const dia = diaDoMercado(dados, agora)
  if (estado.era < dados.era || estado.mercado.dia === dia) return estado
  const restantes = especiesDoMercado(configuracao)
  const ofertas: Oferta[] = []
  for (const [raridade, quantidade] of dados.estoque) {
    for (let i = 0; i < quantidade && restantes.length > 0; i++) {
      const [especie] = restantes.splice(inteiroEntre(gerador, 0, restantes.length - 1), 1)
      ofertas.push({ especie, raridade, preco: precoDe(dados, raridade), comprada: false })
    }
  }
  return { ...estado, mercado: { dia, ofertas } }
}

// Por que a oferta não pode ser comprada; null quando pode.
export function impedimentoDaCompra<Tipo extends string>(dados: DadosDoMercado, estado: EstadoDoJogo<Tipo>, indice: number): string | null {
  if (estado.era < dados.era) return `o Mercado abre na Era ${dados.era}`
  const oferta = estado.mercado.ofertas[indice]
  if (!oferta) return 'oferta inexistente'
  if (oferta.comprada) return 'já comprada hoje'
  if (estado.inventario.ouro < oferta.preco) return `precisa de ${oferta.preco} de ouro`
  return null
}

// A matriz comprada vai para o inventário.
export function comprarNoMercado<Tipo extends string>(dados: DadosDoMercado, estado: EstadoDoJogo<Tipo>, indice: number): EstadoDoJogo<Tipo> {
  const impedimento = impedimentoDaCompra(dados, estado, indice)
  if (impedimento) throw new RangeError(`não pode comprar: ${impedimento}`)
  const oferta = estado.mercado.ofertas[indice]
  return {
    ...estado,
    inventario: {
      ...estado.inventario,
      ouro: estado.inventario.ouro - oferta.preco,
      matrizes: [...estado.inventario.matrizes, { especie: oferta.especie, raridade: oferta.raridade }],
    },
    mercado: { ...estado.mercado, ofertas: estado.mercado.ofertas.map((o, i) => (i === indice ? { ...o, comprada: true } : o)) },
  }
}
