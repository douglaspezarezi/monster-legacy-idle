// Rotas de um bioma (GDD, seção 4). Rotas de mesmo número rendem igual em qualquer bioma.
import type { DadosDeRota } from '../engine/cacada.ts'

export const ROTAS: readonly DadosDeRota[] = [
  { faixaDeNivel: [1, 10], xpBase: 10, multiplicadorDeVida: 1, quedaDeMatriz: { chance: 0.01, raridade: 'comum' }, raridadeDoEquipamento: 'comum' },
  { faixaDeNivel: [11, 25], xpBase: 35, multiplicadorDeVida: 1.5, quedaDeMatriz: { chance: 0.005, raridade: 'incomum' }, raridadeDoEquipamento: 'incomum' },
  { faixaDeNivel: [26, 50], xpBase: 100, multiplicadorDeVida: 2, quedaDeMatriz: { chance: 0.0025, raridade: 'rara' }, raridadeDoEquipamento: 'rara' },
  { faixaDeNivel: [51, 75], xpBase: 250, multiplicadorDeVida: 3, quedaDeMatriz: { chance: 0.001, raridade: 'epica' }, raridadeDoEquipamento: 'epica' },
  { faixaDeNivel: [76, 100], xpBase: 650, multiplicadorDeVida: 4, quedaDeMatriz: { chance: 0.0002, raridade: 'lendaria' }, raridadeDoEquipamento: 'lendaria' },
  // Só os biomas da Era 3 em diante têm a rota 6.
  { faixaDeNivel: [101, 150], xpBase: 1600, multiplicadorDeVida: 6, quedaDeMatriz: { chance: 0.0001, raridade: 'mitica' }, raridadeDoEquipamento: 'mitica' },
  // Só os biomas da Era 4 têm a rota 7.
  { faixaDeNivel: [151, 200], xpBase: 4000, multiplicadorDeVida: 8, quedaDeMatriz: { chance: 0.00005, raridade: 'mitica' }, raridadeDoEquipamento: 'mitica' },
]
