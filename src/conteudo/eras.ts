// Eras (GDD, seção 7). A Era 4 entra quando houver biomas para ela.
import type { DadosDeEra } from '../engine/era.ts'

export const ERAS: readonly DadosDeEra[] = [
  { teto: 50, rotas: 3 },
  { teto: 100, rotas: 5 },
  { teto: 150, rotas: 6 },
]
