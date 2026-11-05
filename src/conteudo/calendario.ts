// Prêmios das 28 casas do calendário de presença (GDD, seção 13).
import type { Premio } from '../engine/calendario.ts'

function semana(diamantes: number): Premio[] {
  return [
    { item: 'capsulas', quantidade: 5 },
    { item: 'tonicosDeRetorno', quantidade: 3 },
    { item: 'perolas', quantidade: 40 },
    { item: 'tonicosDeCura', quantidade: 10 },
    { item: 'fragmentos', quantidade: 100 },
    { item: 'perolas', quantidade: 40 },
    { item: 'diamantes', quantidade: diamantes },
  ]
}

export const CALENDARIO: readonly Premio[] = [...semana(10), ...semana(10), ...semana(10), ...semana(20)]
