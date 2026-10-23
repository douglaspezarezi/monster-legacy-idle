// Ilhas Lendárias (GDD, seção 11): uma por tipo da Era 4, com um guardião por andar.
import type { DadosDeIlha } from '../engine/ilhas.ts'

// Andares 1 a 3, 4 a 6, 7 a 9 e o andar 10.
function andares(primeiros: string, meio: string, ultimos: string, final: string): readonly string[] {
  return [primeiros, primeiros, primeiros, meio, meio, meio, ultimos, ultimos, ultimos, final]
}

export const ILHAS: readonly DadosDeIlha[] = [
  { nome: 'Ilha da Geada', guardioes: andares('Friagem', 'Geadouro', 'Invernal', 'Permafrio') },
  { nome: 'Ilha do Ferro', guardioes: andares('Parafusão', 'Sentinela', 'Blindarca', 'Colosferro') },
  { nome: 'Ilha do Eco', guardioes: andares('Ecoante', 'Trovoz', 'Retumbo', 'Sonarca') },
  { nome: 'Ilha da Estrela', guardioes: andares('Estelado', 'Nebulim', 'Constelar', 'Eclipsor') },
]
