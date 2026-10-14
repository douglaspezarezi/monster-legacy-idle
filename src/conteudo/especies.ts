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
  // Serra Partida
  { nome: 'Seixote', tipos: ['Rocha'], bases: bases(45, 11, 14, 8, 9), tecnicas: ['Pedrisco', 'Investida'] },
  { nome: 'Cravelho', tipos: ['Liga'], bases: bases(45, 12, 13, 9, 9), tecnicas: ['Limalha', 'Martelada', 'Mordida'] },
  { nome: 'Grutilo', tipos: ['Rocha', 'Penumbra'], bases: bases(45, 10, 11, 13, 12), tecnicas: ['Pio Sombrio', 'Pedrisco', 'Mordida'] },
  { nome: 'Fagulhito', tipos: ['Faísca', 'Rocha'], bases: bases(40, 12, 9, 13, 15), tecnicas: ['Centelha', 'Pedrisco', 'Investida'] },
  { nome: 'Drusito', tipos: ['Cristal', 'Rocha'], bases: bases(50, 11, 14, 13, 8), tecnicas: ['Estilhaço', 'Pedrisco', 'Investida'] },
  { nome: 'Muralhão', tipos: ['Rocha', 'Liga'], bases: bases(60, 13, 16, 8, 5), tecnicas: ['Desmoronar', 'Martelada', 'Pedrisco'] },
  // Campo Bravio
  { nome: 'Trotelo', tipos: ['Fera'], bases: bases(45, 12, 10, 8, 12), tecnicas: ['Investida', 'Mordida'] },
  { nome: 'Saltico', tipos: ['Fera', 'Brisa'], bases: bases(40, 11, 9, 11, 15), tecnicas: ['Rajada', 'Mordida', 'Investida'] },
  { nome: 'Zoadeiro', tipos: ['Eco', 'Brisa'], bases: bases(45, 9, 10, 15, 13), tecnicas: ['Ressonância', 'Estalo', 'Rajada'] },
  { nome: 'Chifrudo', tipos: ['Fera', 'Rocha'], bases: bases(55, 14, 14, 7, 8), tecnicas: ['Investida', 'Pedrisco', 'Mordida'] },
  { nome: 'Lobruma', tipos: ['Fera', 'Bruma'], bases: bases(45, 13, 10, 12, 14), tecnicas: ['Cerração', 'Mordida', 'Investida'] },
  { nome: 'Tourado', tipos: ['Fera'], bases: bases(60, 15, 13, 7, 7), tecnicas: ['Investida', 'Mordida', 'Pedrisco'] },
  // Baía Turva
  { nome: 'Bolhim', tipos: ['Maré'], bases: bases(45, 9, 11, 12, 10), tecnicas: ['Jato de Lodo', 'Mordida'] },
  { nome: 'Siriço', tipos: ['Maré', 'Rocha'], bases: bases(45, 12, 15, 8, 8), tecnicas: ['Pedrisco', 'Jato de Lodo', 'Investida'] },
  { nome: 'Medusela', tipos: ['Maré', 'Peçonha'], bases: bases(45, 8, 10, 14, 13), tecnicas: ['Névoa Tóxica', 'Jato de Lodo', 'Ferrão'] },
  { nome: 'Geleiro', tipos: ['Geada', 'Maré'], bases: bases(50, 10, 12, 13, 10), tecnicas: ['Sopro Frio', 'Lasca Gélida', 'Jato de Lodo'] },
  { nome: 'Enguiço', tipos: ['Maré', 'Faísca'], bases: bases(40, 11, 9, 14, 16), tecnicas: ['Centelha', 'Jato de Lodo', 'Mordida'] },
  { nome: 'Abissão', tipos: ['Maré', 'Penumbra'], bases: bases(60, 12, 13, 12, 5), tecnicas: ['Onda Funda', 'Pio Sombrio', 'Jato de Lodo'] },
]

export const INICIAIS = ['Gelusco', 'Rebitim', 'Zumbilo'] as const
