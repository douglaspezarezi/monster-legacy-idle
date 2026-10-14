// Biomas (GDD, seção 4). Espécies de cada rota, com chance igual.
import type { Tipo } from './tipos.ts'

export type DadosDeBioma = {
  readonly nome: string
  readonly tipo: Tipo
  // Índice 0 para a rota 1.
  readonly especiesPorRota: readonly (readonly string[])[]
}

export const MATA_FUNDA: DadosDeBioma = {
  nome: 'Mata Funda',
  tipo: 'Brota',
  especiesPorRota: [
    ['Brotelho', 'Formigaço'],
    ['Brotelho', 'Formigaço', 'Sapolho'],
    ['Formigaço', 'Sapolho', 'Ferroa'],
    ['Sapolho', 'Ferroa', 'Raizudo'],
    ['Ferroa', 'Raizudo', 'Penugem'],
  ],
}
