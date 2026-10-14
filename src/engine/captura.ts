// Captura ociosa com Cápsulas (GDD, seção 7).
import type { Criatura } from './criatura.ts'
import type { Raridade } from './genes.ts'
import { FAIXAS_DE_RARIDADE, raridadeDosGenes } from './genes.ts'

export const CHANCE_DE_CAPTURA: Readonly<Record<Raridade, number>> = {
  fraca: 0.6,
  comum: 0.5,
  incomum: 0.3,
  rara: 0.15,
  epica: 0.06,
  lendaria: 0.02,
  mitica: 0.01,
}

export const ESPACOS_NA_RESERVA = 50

export type FiltroDeCaptura = {
  readonly especies: readonly string[]
  readonly raridadeMinima: Raridade
}

export const FILTRO_VAZIO: FiltroDeCaptura = { especies: [], raridadeMinima: 'fraca' }

function ordemDaRaridade(raridade: Raridade): number {
  return FAIXAS_DE_RARIDADE.findIndex((f) => f.raridade === raridade)
}

export function passaNoFiltro(filtro: FiltroDeCaptura, criatura: Criatura): boolean {
  return (
    filtro.especies.includes(criatura.especie) &&
    ordemDaRaridade(raridadeDosGenes(criatura.genes)) >= ordemDaRaridade(filtro.raridadeMinima)
  )
}
