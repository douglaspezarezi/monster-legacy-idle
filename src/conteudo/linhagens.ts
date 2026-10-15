// Linhagens compatíveis para o cruzamento (GDD, seção 10).
import type { Linhagem } from '../engine/cruzamento.ts'

export const LINHAGENS: readonly Linhagem[] = [
  { nome: 'Raiz', especies: ['Brotelho', 'Sapolho', 'Raizudo', 'Mofento', 'Orvalim'] },
  { nome: 'Enxame', especies: ['Formigaço', 'Ferroa', 'Medusela', 'Lodilho', 'Atoleiro', 'Mosquel'] },
  { nome: 'Asa', especies: ['Penugem', 'Zumbilo', 'Zumbrado', 'Estrondor', 'Zoadeiro', 'Saltico', 'Noctino', 'Vigília', 'Gaviel'] },
  { nome: 'Gelo', especies: ['Gelusco', 'Gelundo', 'Glaciarca', 'Geleiro', 'Saraivo'] },
  { nome: 'Metal', especies: ['Rebitim', 'Rebitaço', 'Couraçor', 'Cravelho', 'Magnetil'] },
  { nome: 'Pedra', especies: ['Seixote', 'Drusito', 'Muralhão', 'Escarpim'] },
  { nome: 'Gruta', especies: ['Grutilo', 'Sombrito', 'Noitarão', 'Espelhim'] },
  { nome: 'Faísca', especies: ['Fagulhito', 'Enguiço', 'Choquim', 'Trovejão', 'Zapeta'] },
  { nome: 'Manada', especies: ['Trotelo', 'Chifrudo', 'Lobruma', 'Tourado', 'Trovisco', 'Rastejo', 'Lobreu', 'Alvorel'] },
  { nome: 'Concha', especies: ['Bolhim', 'Siriço', 'Abissão'] },
  { nome: 'Brasa', especies: ['Cinzelo', 'Fornalho', 'Brasino', 'Soalheiro'] },
  { nome: 'Fumaça', especies: ['Lavrudo', 'Pirilume'] },
  { nome: 'Névoa', especies: ['Fumarel', 'Nimbeiro', 'Brumoso', 'Breuzal', 'Vultinho', 'Miragel'] },
  { nome: 'Vento', especies: ['Ventilho', 'Ventaval', 'Furacor', 'Pluminho'] },
  { nome: 'Lasca', especies: ['Lasquim', 'Lascardo', 'Lapidão', 'Geodim', 'Facetor'] },
  { nome: 'Véu', especies: ['Neblim', 'Neblinor', 'Brumarca', 'Garoel'] },
  { nome: 'Luz', especies: ['Raiolim', 'Raiante', 'Zenital', 'Orvelim', 'Halim', 'Brilhote'] },
]
