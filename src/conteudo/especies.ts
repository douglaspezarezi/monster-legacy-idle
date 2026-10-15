// Espécies (GDD, seção 7). Bases no nível 1: Vida, Ataque, Defesa, Foco e Velocidade.
import type { DadosDeEspecie } from '../engine/especie.ts'
import type { Tipo } from './tipos.ts'

function bases(vida: number, ataque: number, defesa: number, foco: number, velocidade: number) {
  return { vida, ataque, defesa, foco, velocidade }
}

export const ESPECIES: readonly DadosDeEspecie<Tipo>[] = [
  { nome: 'Gelusco', tipos: ['Geada'], bases: bases(50, 13, 11, 13, 12), tecnicas: ['Sopro Frio', 'Lasca Gélida', 'Mordida', 'Rajada'], evolucao: { especie: 'Gelundo', nivel: 75 } },
  { nome: 'Rebitim', tipos: ['Liga'], bases: bases(55, 13, 15, 9, 9), tecnicas: ['Limalha', 'Martelada', 'Investida', 'Pedrisco'], evolucao: { especie: 'Rebitaço', nivel: 75 } },
  { nome: 'Zumbilo', tipos: ['Eco'], bases: bases(45, 9, 10, 15, 14), tecnicas: ['Ressonância', 'Estalo', 'Pio Sombrio', 'Rajada'], evolucao: { especie: 'Zumbrado', nivel: 75 } },
  { nome: 'Brotelho', tipos: ['Brota'], bases: bases(45, 10, 12, 10, 10), tecnicas: ['Esporos', 'Golpe de Galho', 'Mordida'], evolucao: { especie: 'Raizudo', nivel: 75 } },
  { nome: 'Formigaço', tipos: ['Fera', 'Peçonha'], bases: bases(40, 13, 10, 8, 12), tecnicas: ['Investida', 'Mordida', 'Ferrão'] },
  { nome: 'Sapolho', tipos: ['Maré', 'Brota'], bases: bases(55, 9, 11, 13, 8), tecnicas: ['Esporos', 'Jato de Lodo', 'Golpe de Galho'] },
  { nome: 'Ferroa', tipos: ['Peçonha', 'Brisa'], bases: bases(40, 12, 9, 12, 15), tecnicas: ['Névoa Tóxica', 'Ferrão', 'Rajada'] },
  { nome: 'Raizudo', tipos: ['Brota', 'Rocha'], bases: bases(60, 13, 15, 8, 6), tecnicas: ['Esporos', 'Pedrisco', 'Golpe de Galho'] },
  { nome: 'Penugem', tipos: ['Penumbra', 'Brisa'], bases: bases(45, 10, 10, 14, 13), tecnicas: ['Pio Sombrio', 'Rajada', 'Mordida'] },
  // Formas evoluídas dos iniciais
  { nome: 'Gelundo', tipos: ['Geada'], bases: bases(58, 15, 13, 15, 13), tecnicas: ['Sopro Frio', 'Lasca Gélida', 'Mordida', 'Rajada'], evolucao: { especie: 'Glaciarca', nivel: 150 } },
  { nome: 'Glaciarca', tipos: ['Geada', 'Brisa'], bases: bases(66, 17, 15, 17, 14), tecnicas: ['Avalanche', 'Sopro Frio', 'Lasca Gélida', 'Rajada'] },
  { nome: 'Rebitaço', tipos: ['Liga'], bases: bases(63, 15, 17, 10, 10), tecnicas: ['Limalha', 'Martelada', 'Investida', 'Pedrisco'], evolucao: { especie: 'Couraçor', nivel: 150 } },
  { nome: 'Couraçor', tipos: ['Liga', 'Rocha'], bases: bases(72, 17, 20, 11, 10), tecnicas: ['Prensa', 'Martelada', 'Limalha', 'Desmoronar'] },
  { nome: 'Zumbrado', tipos: ['Eco', 'Brisa'], bases: bases(52, 10, 11, 17, 16), tecnicas: ['Ressonância', 'Estalo', 'Pio Sombrio', 'Rajada'], evolucao: { especie: 'Estrondor', nivel: 150 } },
  { nome: 'Estrondor', tipos: ['Eco', 'Penumbra'], bases: bases(59, 11, 12, 20, 18), tecnicas: ['Ressonância', 'Pio Sombrio', 'Estalo', 'Rajada'] },
  // Serra Partida
  { nome: 'Seixote', tipos: ['Rocha'], bases: bases(45, 11, 14, 8, 9), tecnicas: ['Pedrisco', 'Investida'], evolucao: { especie: 'Muralhão', nivel: 75 } },
  { nome: 'Cravelho', tipos: ['Liga'], bases: bases(45, 12, 13, 9, 9), tecnicas: ['Limalha', 'Martelada', 'Mordida'] },
  { nome: 'Grutilo', tipos: ['Rocha', 'Penumbra'], bases: bases(45, 10, 11, 13, 12), tecnicas: ['Pio Sombrio', 'Pedrisco', 'Mordida'] },
  { nome: 'Fagulhito', tipos: ['Faísca', 'Rocha'], bases: bases(40, 12, 9, 13, 15), tecnicas: ['Centelha', 'Pedrisco', 'Investida'] },
  { nome: 'Drusito', tipos: ['Cristal', 'Rocha'], bases: bases(50, 11, 14, 13, 8), tecnicas: ['Estilhaço', 'Pedrisco', 'Investida'] },
  { nome: 'Muralhão', tipos: ['Rocha', 'Liga'], bases: bases(60, 13, 16, 8, 5), tecnicas: ['Desmoronar', 'Martelada', 'Pedrisco'] },
  // Campo Bravio
  { nome: 'Trotelo', tipos: ['Fera'], bases: bases(45, 12, 10, 8, 12), tecnicas: ['Investida', 'Mordida'], evolucao: { especie: 'Tourado', nivel: 75 } },
  { nome: 'Saltico', tipos: ['Fera', 'Brisa'], bases: bases(40, 11, 9, 11, 15), tecnicas: ['Rajada', 'Mordida', 'Investida'] },
  { nome: 'Zoadeiro', tipos: ['Eco', 'Brisa'], bases: bases(45, 9, 10, 15, 13), tecnicas: ['Ressonância', 'Estalo', 'Rajada'] },
  { nome: 'Chifrudo', tipos: ['Fera', 'Rocha'], bases: bases(55, 14, 14, 7, 8), tecnicas: ['Investida', 'Pedrisco', 'Mordida'] },
  { nome: 'Lobruma', tipos: ['Fera', 'Bruma'], bases: bases(45, 13, 10, 12, 14), tecnicas: ['Cerração', 'Mordida', 'Investida'] },
  { nome: 'Tourado', tipos: ['Fera'], bases: bases(60, 15, 13, 7, 7), tecnicas: ['Investida', 'Mordida', 'Pedrisco'] },
  // Baía Turva
  { nome: 'Bolhim', tipos: ['Maré'], bases: bases(45, 9, 11, 12, 10), tecnicas: ['Jato de Lodo', 'Mordida'], evolucao: { especie: 'Abissão', nivel: 75 } },
  { nome: 'Siriço', tipos: ['Maré', 'Rocha'], bases: bases(45, 12, 15, 8, 8), tecnicas: ['Pedrisco', 'Jato de Lodo', 'Investida'] },
  { nome: 'Medusela', tipos: ['Maré', 'Peçonha'], bases: bases(45, 8, 10, 14, 13), tecnicas: ['Névoa Tóxica', 'Jato de Lodo', 'Ferrão'] },
  { nome: 'Geleiro', tipos: ['Geada', 'Maré'], bases: bases(50, 10, 12, 13, 10), tecnicas: ['Sopro Frio', 'Lasca Gélida', 'Jato de Lodo'] },
  { nome: 'Enguiço', tipos: ['Maré', 'Faísca'], bases: bases(40, 11, 9, 14, 16), tecnicas: ['Centelha', 'Jato de Lodo', 'Mordida'] },
  { nome: 'Abissão', tipos: ['Maré', 'Penumbra'], bases: bases(60, 12, 13, 12, 5), tecnicas: ['Onda Funda', 'Pio Sombrio', 'Jato de Lodo'] },
  // Encosta Rubra
  { nome: 'Cinzelo', tipos: ['Chama'], bases: bases(45, 12, 10, 11, 9), tecnicas: ['Tição', 'Mordida'], evolucao: { especie: 'Fornalho', nivel: 75 } },
  { nome: 'Brasino', tipos: ['Chama', 'Fera'], bases: bases(42, 13, 9, 8, 14), tecnicas: ['Tição', 'Investida', 'Mordida'] },
  { nome: 'Fumarel', tipos: ['Chama', 'Bruma'], bases: bases(45, 9, 10, 14, 13), tecnicas: ['Fornalha', 'Cerração', 'Tição'] },
  { nome: 'Lavrudo', tipos: ['Chama', 'Rocha'], bases: bases(55, 13, 15, 8, 7), tecnicas: ['Tição', 'Pedrisco', 'Desmoronar'] },
  { nome: 'Pirilume', tipos: ['Chama', 'Aurora'], bases: bases(42, 9, 10, 16, 15), tecnicas: ['Fornalha', 'Clarão', 'Tição'] },
  { nome: 'Fornalho', tipos: ['Chama'], bases: bases(60, 15, 13, 8, 6), tecnicas: ['Fornalha', 'Tição', 'Investida'] },
  // Chapada Trovão
  { nome: 'Choquim', tipos: ['Faísca'], bases: bases(45, 10, 10, 12, 10), tecnicas: ['Centelha', 'Mordida'], evolucao: { especie: 'Trovejão', nivel: 75 } },
  { nome: 'Zapeta', tipos: ['Faísca', 'Brisa'], bases: bases(40, 10, 9, 12, 15), tecnicas: ['Centelha', 'Rajada'] },
  { nome: 'Magnetil', tipos: ['Faísca', 'Liga'], bases: bases(50, 12, 14, 10, 7), tecnicas: ['Descarga', 'Martelada', 'Limalha'] },
  { nome: 'Trovisco', tipos: ['Faísca', 'Fera'], bases: bases(48, 14, 10, 10, 13), tecnicas: ['Descarga', 'Investida', 'Mordida'] },
  { nome: 'Nimbeiro', tipos: ['Faísca', 'Bruma'], bases: bases(45, 9, 10, 15, 13), tecnicas: ['Centelha', 'Cerração', 'Rajada'] },
  { nome: 'Trovejão', tipos: ['Faísca'], bases: bases(60, 14, 12, 10, 6), tecnicas: ['Descarga', 'Centelha', 'Investida'] },
  // Pântano Amargo
  { nome: 'Lodilho', tipos: ['Peçonha'], bases: bases(45, 10, 11, 11, 10), tecnicas: ['Ferrão', 'Mordida'], evolucao: { especie: 'Atoleiro', nivel: 75 } },
  { nome: 'Mosquel', tipos: ['Peçonha', 'Brisa'], bases: bases(38, 11, 8, 12, 16), tecnicas: ['Ferrão', 'Rajada'] },
  { nome: 'Mofento', tipos: ['Peçonha', 'Brota'], bases: bases(50, 9, 12, 13, 8), tecnicas: ['Névoa Tóxica', 'Esporos'] },
  { nome: 'Rastejo', tipos: ['Peçonha', 'Fera'], bases: bases(48, 14, 10, 9, 13), tecnicas: ['Ferrão', 'Investida', 'Mordida'] },
  { nome: 'Brumoso', tipos: ['Peçonha', 'Bruma'], bases: bases(45, 9, 11, 15, 12), tecnicas: ['Névoa Tóxica', 'Cerração'] },
  { nome: 'Atoleiro', tipos: ['Peçonha', 'Maré'], bases: bases(62, 13, 14, 8, 5), tecnicas: ['Névoa Tóxica', 'Jato de Lodo', 'Ferrão'] },
  // Bosque Sem Lua
  { nome: 'Sombrito', tipos: ['Penumbra'], bases: bases(45, 10, 10, 12, 10), tecnicas: ['Pio Sombrio', 'Mordida'], evolucao: { especie: 'Noitarão', nivel: 75 } },
  { nome: 'Noctino', tipos: ['Penumbra', 'Brisa'], bases: bases(40, 10, 9, 12, 15), tecnicas: ['Pio Sombrio', 'Rajada'] },
  { nome: 'Vigília', tipos: ['Penumbra', 'Eco'], bases: bases(45, 9, 10, 15, 13), tecnicas: ['Ressonância', 'Pio Sombrio', 'Estalo'] },
  { nome: 'Lobreu', tipos: ['Penumbra', 'Fera'], bases: bases(50, 14, 11, 8, 12), tecnicas: ['Sombra Cortante', 'Mordida', 'Investida'] },
  { nome: 'Breuzal', tipos: ['Penumbra', 'Bruma'], bases: bases(48, 9, 11, 14, 11), tecnicas: ['Cerração', 'Pio Sombrio'] },
  { nome: 'Noitarão', tipos: ['Penumbra'], bases: bases(60, 14, 13, 10, 5), tecnicas: ['Sombra Cortante', 'Pio Sombrio', 'Investida'] },
]

export const INICIAIS = ['Gelusco', 'Rebitim', 'Zumbilo'] as const
