// Linhagens compatíveis para o cruzamento (GDD, seção 10).
import type { Linhagem } from '../engine/cruzamento.ts'

export const LINHAGENS: readonly Linhagem[] = [
  { nome: 'Raiz', especies: ['Brotelho', 'Sapolho', 'Raizudo'] },
  { nome: 'Enxame', especies: ['Formigaço', 'Ferroa', 'Medusela'] },
  { nome: 'Asa', especies: ['Penugem', 'Zumbilo', 'Zumbrado', 'Estrondor', 'Zoadeiro', 'Saltico'] },
  { nome: 'Gelo', especies: ['Gelusco', 'Gelundo', 'Glaciarca', 'Geleiro'] },
  { nome: 'Metal', especies: ['Rebitim', 'Rebitaço', 'Couraçor', 'Cravelho'] },
  { nome: 'Pedra', especies: ['Seixote', 'Drusito', 'Muralhão'] },
  { nome: 'Gruta', especies: ['Grutilo'] },
  { nome: 'Faísca', especies: ['Fagulhito', 'Enguiço'] },
  { nome: 'Manada', especies: ['Trotelo', 'Chifrudo', 'Lobruma', 'Tourado'] },
  { nome: 'Concha', especies: ['Bolhim', 'Siriço', 'Abissão'] },
]
