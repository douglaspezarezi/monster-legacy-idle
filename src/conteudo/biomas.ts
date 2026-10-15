// Biomas (GDD, seção 4): um por tipo, 4 por Era. Espécies de cada rota, com chance igual.
import type { DadosDeBioma } from '../engine/cacada.ts'
import type { Tipo } from './tipos.ts'

export const MATA_FUNDA: DadosDeBioma<Tipo> = {
  nome: 'Mata Funda',
  tipo: 'Brota',
  era: 1,
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
  era: 1,
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
  era: 1,
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
  era: 1,
  especiesPorRota: [
    ['Bolhim', 'Siriço'],
    ['Bolhim', 'Siriço', 'Medusela'],
    ['Siriço', 'Medusela', 'Geleiro'],
    ['Medusela', 'Geleiro', 'Enguiço'],
    ['Geleiro', 'Enguiço', 'Abissão'],
  ],
}

export const ENCOSTA_RUBRA: DadosDeBioma<Tipo> = {
  nome: 'Encosta Rubra',
  tipo: 'Chama',
  era: 2,
  especiesPorRota: [
    ['Cinzelo', 'Brasino'],
    ['Cinzelo', 'Brasino', 'Fumarel'],
    ['Brasino', 'Fumarel', 'Lavrudo'],
    ['Fumarel', 'Lavrudo', 'Pirilume'],
    ['Lavrudo', 'Pirilume', 'Fornalho'],
  ],
}

export const CHAPADA_TROVAO: DadosDeBioma<Tipo> = {
  nome: 'Chapada Trovão',
  tipo: 'Faísca',
  era: 2,
  especiesPorRota: [
    ['Choquim', 'Zapeta'],
    ['Choquim', 'Zapeta', 'Magnetil'],
    ['Zapeta', 'Magnetil', 'Trovisco'],
    ['Magnetil', 'Trovisco', 'Nimbeiro'],
    ['Trovisco', 'Nimbeiro', 'Trovejão'],
  ],
}

export const PANTANO_AMARGO: DadosDeBioma<Tipo> = {
  nome: 'Pântano Amargo',
  tipo: 'Peçonha',
  era: 2,
  especiesPorRota: [
    ['Lodilho', 'Mosquel'],
    ['Lodilho', 'Mosquel', 'Mofento'],
    ['Mosquel', 'Mofento', 'Rastejo'],
    ['Mofento', 'Rastejo', 'Brumoso'],
    ['Rastejo', 'Brumoso', 'Atoleiro'],
  ],
}

export const BOSQUE_SEM_LUA: DadosDeBioma<Tipo> = {
  nome: 'Bosque Sem Lua',
  tipo: 'Penumbra',
  era: 2,
  especiesPorRota: [
    ['Sombrito', 'Noctino'],
    ['Sombrito', 'Noctino', 'Vigília'],
    ['Noctino', 'Vigília', 'Lobreu'],
    ['Vigília', 'Lobreu', 'Breuzal'],
    ['Lobreu', 'Breuzal', 'Noitarão'],
  ],
}

// Os da Era 1 abrem desde o começo; os da Era 2, a partir dela. A ordem não muda: o save guarda o índice.
export const BIOMAS: readonly DadosDeBioma<Tipo>[] = [
  MATA_FUNDA,
  SERRA_PARTIDA,
  CAMPO_BRAVIO,
  BAIA_TURVA,
  ENCOSTA_RUBRA,
  CHAPADA_TROVAO,
  PANTANO_AMARGO,
  BOSQUE_SEM_LUA,
]
