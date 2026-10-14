// Desenho do retrato provisório em pixel art: grade 8×8 espelhada, gerada do nome da espécie,
// nas cores dos tipos. Fica até a arte final chegar.
import type { Tipo } from '../conteudo/tipos.ts'
import { criarGerador } from '../engine/aleatorio.ts'

const COR_DO_TIPO: Readonly<Record<Tipo, string>> = {
  Chama: '#e8603c',
  Maré: '#3b82c4',
  Brota: '#5aa548',
  Rocha: '#9a7b4f',
  Brisa: '#bfe3d0',
  Geada: '#7fd0f0',
  Faísca: '#f2c230',
  Liga: '#9aa4b0',
  Peçonha: '#9b59b6',
  Penumbra: '#5b4a8a',
  Aurora: '#f7a6c9',
  Eco: '#6fb8a0',
  Cristal: '#c6f1f1',
  Fera: '#b5651d',
  Bruma: '#a7a9be',
  Astro: '#3f4fb0',
}

export const LADO = 8

// FNV-1a: o mesmo nome dá sempre o mesmo desenho.
function hashDoNome(nome: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < nome.length; i++) {
    hash ^= nome.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export type Pixel = { readonly x: number; readonly y: number; readonly cor: string }

export function pixelsDoRetrato(especie: string, tipos: readonly Tipo[]): Pixel[] {
  const sorteio = criarGerador(hashDoNome(especie))
  const principal = COR_DO_TIPO[tipos[0]]
  const secundaria = COR_DO_TIPO[tipos[1] ?? tipos[0]]
  const pixels: Pixel[] = []
  for (let y = 0; y < LADO; y++) {
    for (let x = 0; x < LADO / 2; x++) {
      // O centro do corpo é sempre cheio; as bordas rareiam.
      const chance = x >= 2 && y >= 2 && y <= 6 ? 0.85 : 0.4
      if (sorteio() >= chance) continue
      const cor = sorteio() < 0.3 ? secundaria : principal
      pixels.push({ x, y, cor }, { x: LADO - 1 - x, y, cor })
    }
  }
  // Os olhos ficam por cima do corpo.
  pixels.push({ x: 2, y: 3, cor: '#14161c' }, { x: LADO - 3, y: 3, cor: '#14161c' })
  return pixels
}
