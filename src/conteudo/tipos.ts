// Tipos e tabela de vantagens (GDD, seção 6).
import type { DadosDeTipo } from '../engine/multiplicador-de-tipo.ts'

export const TIPOS = [
  'Chama', 'Maré', 'Brota', 'Rocha', 'Brisa', 'Geada', 'Faísca', 'Liga',
  'Peçonha', 'Penumbra', 'Aurora', 'Eco', 'Cristal', 'Fera', 'Bruma', 'Astro',
] as const

export type Tipo = (typeof TIPOS)[number]

export const DADOS_DOS_TIPOS: Readonly<Record<Tipo, DadosDeTipo<Tipo>>> = {
  Chama: { vence: ['Brota', 'Geada', 'Bruma'], resiste: ['Geada', 'Fera', 'Peçonha'], imuneA: [] },
  Maré: { vence: ['Chama', 'Rocha'], resiste: ['Chama', 'Rocha', 'Eco'], imuneA: [] },
  Brota: { vence: ['Maré', 'Rocha', 'Eco'], resiste: ['Maré', 'Rocha', 'Faísca'], imuneA: [] },
  Rocha: { vence: ['Brisa', 'Faísca', 'Chama'], resiste: ['Chama', 'Brisa', 'Peçonha'], imuneA: [] },
  Brisa: { vence: ['Bruma', 'Peçonha', 'Brota'], resiste: ['Fera', 'Maré', 'Brota'], imuneA: [] },
  Geada: { vence: ['Maré', 'Brota', 'Brisa'], resiste: ['Maré', 'Geada', 'Brisa'], imuneA: [] },
  Faísca: { vence: ['Liga', 'Fera'], resiste: ['Liga', 'Brisa', 'Faísca'], imuneA: [] },
  Liga: { vence: ['Cristal', 'Geada', 'Rocha'], resiste: ['Brota', 'Brisa'], imuneA: ['Peçonha'] },
  Peçonha: { vence: ['Fera', 'Brota', 'Maré'], resiste: ['Peçonha', 'Brota', 'Fera'], imuneA: [] },
  Penumbra: { vence: ['Eco', 'Aurora', 'Cristal'], resiste: ['Brisa', 'Liga', 'Peçonha'], imuneA: [] },
  Aurora: { vence: ['Penumbra', 'Bruma', 'Peçonha'], resiste: ['Geada', 'Astro', 'Brota'], imuneA: [] },
  Eco: { vence: ['Cristal', 'Fera', 'Liga'], resiste: ['Rocha', 'Fera', 'Chama'], imuneA: [] },
  Cristal: { vence: ['Penumbra', 'Brisa', 'Peçonha'], resiste: ['Aurora', 'Peçonha', 'Geada'], imuneA: [] },
  Fera: { vence: ['Penumbra', 'Bruma', 'Astro'], resiste: ['Bruma', 'Rocha'], imuneA: [] },
  Bruma: { vence: ['Faísca', 'Aurora', 'Astro'], resiste: ['Maré', 'Peçonha'], imuneA: ['Rocha'] },
  Astro: { vence: ['Rocha', 'Geada', 'Eco'], resiste: ['Brisa', 'Geada'], imuneA: ['Eco'] },
}
