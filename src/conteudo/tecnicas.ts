// Técnicas (GDD, seção 5).
import type { Tecnica } from '../engine/dano.ts'
import type { Tipo } from './tipos.ts'

const s = 1000

export const TECNICAS: readonly Tecnica<Tipo>[] = [
  { nome: 'Golpe de Galho', tipo: 'Brota', categoria: 'fisica', poder: 55, recargaMs: 3 * s },
  { nome: 'Esporos', tipo: 'Brota', categoria: 'especial', poder: 80, recargaMs: 6 * s },
  { nome: 'Mordida', tipo: 'Fera', categoria: 'fisica', poder: 60, recargaMs: 3 * s },
  { nome: 'Investida', tipo: 'Fera', categoria: 'fisica', poder: 90, recargaMs: 8 * s },
  { nome: 'Ferrão', tipo: 'Peçonha', categoria: 'fisica', poder: 55, recargaMs: 3 * s },
  { nome: 'Névoa Tóxica', tipo: 'Peçonha', categoria: 'especial', poder: 85, recargaMs: 7 * s },
  { nome: 'Rajada', tipo: 'Brisa', categoria: 'especial', poder: 55, recargaMs: 3 * s },
  { nome: 'Pio Sombrio', tipo: 'Penumbra', categoria: 'especial', poder: 70, recargaMs: 5 * s },
  { nome: 'Jato de Lodo', tipo: 'Maré', categoria: 'especial', poder: 60, recargaMs: 4 * s },
  { nome: 'Pedrisco', tipo: 'Rocha', categoria: 'fisica', poder: 60, recargaMs: 4 * s },
  { nome: 'Lasca Gélida', tipo: 'Geada', categoria: 'fisica', poder: 55, recargaMs: 3 * s },
  { nome: 'Sopro Frio', tipo: 'Geada', categoria: 'especial', poder: 85, recargaMs: 7 * s },
  { nome: 'Martelada', tipo: 'Liga', categoria: 'fisica', poder: 60, recargaMs: 3 * s },
  { nome: 'Limalha', tipo: 'Liga', categoria: 'especial', poder: 80, recargaMs: 6 * s },
  { nome: 'Estalo', tipo: 'Eco', categoria: 'especial', poder: 55, recargaMs: 3 * s },
  { nome: 'Ressonância', tipo: 'Eco', categoria: 'especial', poder: 90, recargaMs: 8 * s },
]
