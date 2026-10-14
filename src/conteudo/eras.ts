// Eras (GDD, seção 7). As Eras 3 e 4 entram quando houver biomas para elas.
import type { DadosDeEra } from '../engine/era.ts'

export const ERAS: readonly DadosDeEra[] = [
  { teto: 50, rotas: 3 },
  { teto: 100, rotas: 5 },
]
