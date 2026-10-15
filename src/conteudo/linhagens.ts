// Linhagens compatíveis para o cruzamento (GDD, seção 10).
import type { Linhagem } from '../engine/cruzamento.ts'

export const LINHAGENS: readonly Linhagem[] = [
  { nome: 'Raiz', especies: ['Brotelho', 'Sapolho', 'Raizudo', 'Mofento'] },
  { nome: 'Enxame', especies: ['Formigaço', 'Ferroa', 'Medusela', 'Lodilho', 'Atoleiro', 'Mosquel'] },
  { nome: 'Asa', especies: ['Penugem', 'Zumbilo', 'Zumbrado', 'Estrondor', 'Zoadeiro', 'Saltico', 'Noctino', 'Vigília'] },
  { nome: 'Gelo', especies: ['Gelusco', 'Gelundo', 'Glaciarca', 'Geleiro'] },
  { nome: 'Metal', especies: ['Rebitim', 'Rebitaço', 'Couraçor', 'Cravelho', 'Magnetil'] },
  { nome: 'Pedra', especies: ['Seixote', 'Drusito', 'Muralhão'] },
  { nome: 'Gruta', especies: ['Grutilo', 'Sombrito', 'Noitarão'] },
  { nome: 'Faísca', especies: ['Fagulhito', 'Enguiço', 'Choquim', 'Trovejão', 'Zapeta'] },
  { nome: 'Manada', especies: ['Trotelo', 'Chifrudo', 'Lobruma', 'Tourado', 'Trovisco', 'Rastejo', 'Lobreu'] },
  { nome: 'Concha', especies: ['Bolhim', 'Siriço', 'Abissão'] },
  { nome: 'Brasa', especies: ['Cinzelo', 'Fornalho', 'Brasino'] },
  { nome: 'Fumaça', especies: ['Lavrudo', 'Pirilume'] },
  { nome: 'Névoa', especies: ['Fumarel', 'Nimbeiro', 'Brumoso', 'Breuzal'] },
]
