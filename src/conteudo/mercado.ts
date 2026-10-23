// Mercado da Cidade (GDD, seção 13).
import type { DadosDoMercado } from '../engine/mercado.ts'

export const MERCADO: DadosDoMercado = {
  era: 4,
  fusoMs: -3 * 60 * 60 * 1000,
  estoque: [
    ['epica', 3],
    ['lendaria', 2],
    ['mitica', 1],
  ],
  precos: { epica: 1_000_000, lendaria: 5_000_000, mitica: 20_000_000 },
}
