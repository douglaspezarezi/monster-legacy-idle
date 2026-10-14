// Biomas (GDD, seção 4). Espécies de cada rota, com chance igual.
import type { DadosDeBioma } from '../engine/cacada.ts'
import type { Tipo } from './tipos.ts'

export const MATA_FUNDA: DadosDeBioma<Tipo> = {
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

export const SERRA_PARTIDA: DadosDeBioma<Tipo> = {
  nome: 'Serra Partida',
  tipo: 'Rocha',
  especiesPorRota: [
    ['Seixote', 'Cravelho'],
    ['Seixote', 'Cravelho', 'Grutilo'],
    ['Cravelho', 'Grutilo', 'Fagulhito'],
    ['Grutilo', 'Fagulhito', 'Drusito'],
    ['Fagulhito', 'Drusito', 'Muralhão'],
  ],
}

export const CAMPO_BRAVIO: DadosDeBioma<Tipo> = {
  nome: 'Campo Bravio',
  tipo: 'Fera',
  especiesPorRota: [
    ['Trotelo', 'Saltico'],
    ['Trotelo', 'Saltico', 'Zoadeiro'],
    ['Saltico', 'Zoadeiro', 'Chifrudo'],
    ['Zoadeiro', 'Chifrudo', 'Lobruma'],
    ['Chifrudo', 'Lobruma', 'Tourado'],
  ],
}

export const BAIA_TURVA: DadosDeBioma<Tipo> = {
  nome: 'Baía Turva',
  tipo: 'Maré',
  especiesPorRota: [
    ['Bolhim', 'Siriço'],
    ['Bolhim', 'Siriço', 'Medusela'],
    ['Siriço', 'Medusela', 'Geleiro'],
    ['Medusela', 'Geleiro', 'Enguiço'],
    ['Geleiro', 'Enguiço', 'Abissão'],
  ],
}

// Os biomas da Era 1, todos abertos desde o começo.
export const BIOMAS: readonly DadosDeBioma<Tipo>[] = [MATA_FUNDA, SERRA_PARTIDA, CAMPO_BRAVIO, BAIA_TURVA]
