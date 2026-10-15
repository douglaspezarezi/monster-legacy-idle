// Linhagens compatíveis para o cruzamento (GDD, seção 10).
import type { Linhagem } from '../engine/cruzamento.ts'

export const LINHAGENS: readonly Linhagem[] = [
  { nome: 'Raiz', especies: ['Brotelho', 'Sapolho', 'Raizudo', 'Mofento', 'Orvalim'] },
  { nome: 'Enxame', especies: ['Formigaço', 'Ferroa', 'Medusela', 'Lodilho', 'Atoleiro', 'Mosquel'] },
  { nome: 'Asa', especies: ['Penugem', 'Zumbilo', 'Zumbrado', 'Estrondor', 'Zoadeiro', 'Saltico', 'Noctino', 'Vigília', 'Gaviel', 'Morcegal'] },
  { nome: 'Gelo', especies: ['Gelusco', 'Gelundo', 'Glaciarca', 'Geleiro', 'Saraivo', 'Friozim', 'Friagem', 'Invernal', 'Nevisco'] },
  { nome: 'Metal', especies: ['Rebitim', 'Rebitaço', 'Couraçor', 'Cravelho', 'Magnetil', 'Parafim', 'Parafusão', 'Blindarca', 'Ferrugo', 'Sentinela', 'Colosferro'] },
  { nome: 'Pedra', especies: ['Seixote', 'Drusito', 'Muralhão', 'Escarpim', 'Permafrio', 'Meteorim'] },
  { nome: 'Gruta', especies: ['Grutilo', 'Sombrito', 'Noitarão', 'Espelhim', 'Geadouro'] },
  { nome: 'Faísca', especies: ['Fagulhito', 'Enguiço', 'Choquim', 'Trovejão', 'Zapeta', 'Engrenil', 'Trovoz'] },
  { nome: 'Manada', especies: ['Trotelo', 'Chifrudo', 'Lobruma', 'Tourado', 'Trovisco', 'Rastejo', 'Lobreu', 'Alvorel', 'Grilão'] },
  { nome: 'Concha', especies: ['Bolhim', 'Siriço', 'Abissão', 'Morsudo'] },
  { nome: 'Brasa', especies: ['Cinzelo', 'Fornalho', 'Brasino', 'Soalheiro', 'Cometo'] },
  { nome: 'Fumaça', especies: ['Lavrudo', 'Pirilume'] },
  { nome: 'Névoa', especies: ['Fumarel', 'Nimbeiro', 'Brumoso', 'Breuzal', 'Vultinho', 'Miragel', 'Nebulim'] },
  { nome: 'Vento', especies: ['Ventilho', 'Ventaval', 'Furacor', 'Pluminho', 'Lâmino'] },
  { nome: 'Lasca', especies: ['Lasquim', 'Lascardo', 'Lapidão', 'Geodim', 'Facetor', 'Cristagelo'] },
  { nome: 'Véu', especies: ['Neblim', 'Neblinor', 'Brumarca', 'Garoel'] },
  { nome: 'Luz', especies: ['Raiolim', 'Raiante', 'Zenital', 'Orvelim', 'Halim', 'Brilhote'] },
  { nome: 'Coro', especies: ['Ecoim', 'Ecoante', 'Retumbo', 'Sinim', 'Sonarca'] },
  { nome: 'Estrela', especies: ['Estelim', 'Estelado', 'Constelar', 'Luarel', 'Eclipsor'] },
]
