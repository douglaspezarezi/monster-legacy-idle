// Eras (GDD, seção 7). A Era 4 é a última: o nível 200 é o máximo do jogo.
import type { DadosDeEra } from '../engine/era.ts'

export const ERAS: readonly DadosDeEra[] = [
  { teto: 50, rotas: 3 },
  { teto: 100, rotas: 5 },
  { teto: 150, rotas: 6 },
  { teto: 200, rotas: 7 },
]
