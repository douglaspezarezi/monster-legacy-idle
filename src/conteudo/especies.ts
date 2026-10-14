// Espécies (GDD, seção 7). Bases no nível 1: Vida, Ataque, Defesa, Foco e Velocidade.
import type { DadosDeEspecie } from '../engine/especie.ts'
import type { Tipo } from './tipos.ts'

function bases(vida: number, ataque: number, defesa: number, foco: number, velocidade: number) {
  return { vida, ataque, defesa, foco, velocidade }
}

export const ESPECIES: readonly DadosDeEspecie<Tipo>[] = [
  { nome: 'Gelusco', tipos: ['Geada'], bases: bases(50, 13, 11, 13, 12), tecnicas: ['Sopro Frio', 'Lasca Gélida', 'Mordida', 'Rajada'] },
  { nome: 'Rebitim', tipos: ['Liga'], bases: bases(55, 13, 15, 9, 9), tecnicas: ['Limalha', 'Martelada', 'Investida', 'Pedrisco'] },
  { nome: 'Zumbilo', tipos: ['Eco'], bases: bases(45, 9, 10, 15, 14), tecnicas: ['Ressonância', 'Estalo', 'Pio Sombrio', 'Rajada'] },
  { nome: 'Brotelho', tipos: ['Brota'], bases: bases(45, 10, 12, 10, 10), tecnicas: ['Esporos', 'Golpe de Galho', 'Mordida'] },
  { nome: 'Formigaço', tipos: ['Fera', 'Peçonha'], bases: bases(40, 13, 10, 8, 12), tecnicas: ['Investida', 'Mordida', 'Ferrão'] },
  { nome: 'Sapolho', tipos: ['Maré', 'Brota'], bases: bases(55, 9, 11, 13, 8), tecnicas: ['Esporos', 'Jato de Lodo', 'Golpe de Galho'] },
  { nome: 'Ferroa', tipos: ['Peçonha', 'Brisa'], bases: bases(40, 12, 9, 12, 15), tecnicas: ['Névoa Tóxica', 'Ferrão', 'Rajada'] },
  { nome: 'Raizudo', tipos: ['Brota', 'Rocha'], bases: bases(60, 13, 15, 8, 6), tecnicas: ['Esporos', 'Pedrisco', 'Golpe de Galho'] },
  { nome: 'Penugem', tipos: ['Penumbra', 'Brisa'], bases: bases(45, 10, 10, 14, 13), tecnicas: ['Pio Sombrio', 'Rajada', 'Mordida'] },
]

export const INICIAIS = ['Gelusco', 'Rebitim', 'Zumbilo'] as const
