// Rotas de um bioma (GDD, seção 4). Rotas de mesmo número rendem igual em qualquer bioma.
import type { DadosDeRota } from '../engine/cacada.ts'

export const ROTAS: readonly DadosDeRota[] = [
  { xpBase: 10, quedaDeMatriz: { chance: 0.01, raridade: 'comum' } },
  { xpBase: 35, quedaDeMatriz: { chance: 0.005, raridade: 'incomum' } },
  { xpBase: 100, quedaDeMatriz: { chance: 0.0025, raridade: 'rara' } },
  { xpBase: 250, quedaDeMatriz: { chance: 0.001, raridade: 'epica' } },
  { xpBase: 650, quedaDeMatriz: { chance: 0.0002, raridade: 'lendaria' } },
]
