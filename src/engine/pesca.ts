// Encomenda de equipamentos com as Pérolas da Pesca (GDD, seção 9).
import type { DadosDeRota } from './cacada.ts'
import type { Equipamento, Espaco } from './equipamentos.ts'
import { ESPACOS } from './equipamentos.ts'
import type { Raridade } from './genes.ts'
import type { EstadoDoJogo } from './jogo.ts'

// O preço dobra a cada raridade. A mítica não é encomendada: tem o mesmo efeito da lendária.
export const PRECO_DA_ENCOMENDA = { comum: 20, incomum: 40, rara: 80, epica: 160, lendaria: 320 } as const satisfies Partial<Record<Raridade, number>>

export type RaridadeDaEncomenda = keyof typeof PRECO_DA_ENCOMENDA

export const RARIDADES_DA_ENCOMENDA = Object.keys(PRECO_DA_ENCOMENDA) as RaridadeDaEncomenda[]

function ehDaEncomenda(raridade: Raridade): raridade is RaridadeDaEncomenda {
  return raridade in PRECO_DA_ENCOMENDA
}

// A raridade que o chefe da rota mais alta já liberada, em qualquer bioma, daria; a mítica conta como lendária.
export function raridadeMaximaDaEncomenda<Tipo extends string>(rotas: readonly DadosDeRota[], estado: EstadoDoJogo<Tipo>): RaridadeDaEncomenda | null {
  const liberadas = Math.max(estado.rotasLiberadas, ...Object.values(estado.outrosBiomas).map((p) => p.rotasLiberadas))
  const raridade = rotas[Math.min(liberadas, rotas.length) - 1]?.raridadeDoEquipamento
  if (raridade === undefined || raridade === 'fraca') return null
  return ehDaEncomenda(raridade) ? raridade : 'lendaria'
}

// Por que a encomenda não pode ser feita; null quando pode.
export function impedimentoDaEncomenda<Tipo extends string>(rotas: readonly DadosDeRota[], estado: EstadoDoJogo<Tipo>, raridade: RaridadeDaEncomenda): string | null {
  const maxima = raridadeMaximaDaEncomenda(rotas, estado)
  if (maxima === null || RARIDADES_DA_ENCOMENDA.indexOf(raridade) > RARIDADES_DA_ENCOMENDA.indexOf(maxima)) return 'libere uma rota mais alta'
  if (estado.inventario.perolas < PRECO_DA_ENCOMENDA[raridade]) return `precisa de ${PRECO_DA_ENCOMENDA[raridade]} Pérolas`
  return null
}

// A peça encomendada entra nos guardados, como a do chefe.
export function encomendar<Tipo extends string>(
  rotas: readonly DadosDeRota[],
  estado: EstadoDoJogo<Tipo>,
  espaco: Espaco,
  raridade: RaridadeDaEncomenda,
): EstadoDoJogo<Tipo> {
  if (!ESPACOS.includes(espaco)) throw new RangeError(`espaço desconhecido: ${espaco}`)
  const impedimento = impedimentoDaEncomenda(rotas, estado, raridade)
  if (impedimento) throw new RangeError(`não pode encomendar: ${impedimento}`)
  const peca: Equipamento = { espaco, raridade }
  return {
    ...estado,
    inventario: { ...estado.inventario, perolas: estado.inventario.perolas - PRECO_DA_ENCOMENDA[raridade] },
    equipamentos: { ...estado.equipamentos, guardados: [...estado.equipamentos.guardados, peca] },
  }
}
