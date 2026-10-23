// Cenário provisório da cena da caçada: paleta e um elemento em pixel art por tipo de bioma.
// Fica até a arte final chegar.
import type { Tipo } from '../conteudo/tipos.ts'

// No desenho do elemento, "a" e "b" são as duas cores dele; "." fica vazio.
export type Cenario = {
  readonly ceu: readonly [topo: string, horizonte: string]
  readonly morro: string
  readonly chao: string
  readonly chaoEscuro: string
  readonly elemento: readonly string[]
  readonly cores: readonly [a: string, b: string]
  readonly estrelas?: boolean
  // O elemento fica no céu, como a nuvem, em vez de no chão.
  readonly noCeu?: boolean
}

const ARVORE = [
  '..aaaa..',
  '.aaaaaa.',
  'aaaaaaaa',
  'aaaaaaaa',
  '.aaaaaa.',
  '...bb...',
  '...bb...',
  '...bb...',
  '...bb...',
]

const CHAMA = [
  '...a....',
  '..aa..a.',
  '..aaa.a.',
  '.aabaaa.',
  '.abbbaa.',
  'aabbbbaa',
  'aabbbbaa',
  '.aabbaa.',
]

const ONDA = [
  '..aaa...',
  '.a...a..',
  '.....ab.',
  'bbbbbbbb',
  'bbbbbbbb',
]

const PEDRA = [
  '...aaa..',
  '..aaaaa.',
  '.aaabaaa',
  '.aabbaaa',
  'aaaaaaba',
  'aabaaaaa',
  'aaaaaaaa',
]

const NUVEM = [
  '..aaa.....',
  '.aaaaa.aa.',
  'aaaaaaaaaa',
  'abbbbbbbba',
]

const PINHEIRO = [
  '...a....',
  '..aaa...',
  '.abbba..',
  '..aaa...',
  '.abbbba.',
  'abbbbbba',
  '...bb...',
  '...bb...',
]

const RAIO = [
  '....aa',
  '...aa.',
  '..aa..',
  '.aaaa.',
  '...aa.',
  '..aa..',
  '.aa...',
  '.a....',
  '.b....',
  'bbb...',
]

const PILAR = [
  'aaaaaa',
  '.bbbb.',
  '.baab.',
  '.baab.',
  '.bab..',
  '.ba...',
  '.baab.',
  'aaaaaa',
]

const COGUMELO = [
  '..aaaa..',
  '.abaaba.',
  'aaaaaaaa',
  '...bb...',
  '...bb...',
  '..bbbb..',
]

const GALHO_SECO = [
  'a.....a.',
  '.a...a..',
  '.a..a...',
  '..aa..a.',
  '..aaaa..',
  '...aa...',
  '...aa...',
  '..aaaa..',
]

const FLOR = [
  '.a.a.',
  'aabaa',
  '.a.a.',
  '..b..',
  '.bb..',
  '..b..',
  '..b..',
]

const AGULHA = [
  '..a...',
  '..aa..',
  '.aaa..',
  '.aaba.',
  '.aaba.',
  'aaabba',
  'aaaaba',
  'aaaaaa',
]

const CRISTAL = [
  '...a....',
  '..aba...',
  '..aba.a.',
  '.aabaaba',
  '.aabaaba',
  '.aabaaba',
  'aaaaaaaa',
]

const CAPIM = [
  'a...a..a',
  'a.a.a.aa',
  'aaa.aaa.',
  'abaaabaa',
  'bbbbbbbb',
]

const NEVOA = [
  '.aaaaa......',
  'aaaaaaaa....',
  '....bbbbbbb.',
  '...bbbbbbbbb',
]

const CRATERA = [
  '..aaaa..',
  '.abbbba.',
  'abbbbbba',
  'aaaaaaaa',
]

export const CENARIOS: Readonly<Record<Tipo, Cenario>> = {
  Brota: { ceu: ['#7ec4e8', '#cfeccd'], morro: '#4e8a4a', chao: '#5aa548', chaoEscuro: '#447f37', elemento: ARVORE, cores: ['#2f7a3a', '#6b4a2b'] },
  Chama: { ceu: ['#5a2a2a', '#e8925a'], morro: '#7a3a2a', chao: '#8a4a32', chaoEscuro: '#6a3424', elemento: CHAMA, cores: ['#f2a03c', '#f2d23c'] },
  Maré: { ceu: ['#5aa0d8', '#bfe0f2'], morro: '#3b6fa4', chao: '#d8c48a', chaoEscuro: '#b8a46a', elemento: ONDA, cores: ['#ffffff', '#3b82c4'] },
  Rocha: { ceu: ['#a8b8c8', '#e0d4bc'], morro: '#8a7458', chao: '#9a7b4f', chaoEscuro: '#7a5f3a', elemento: PEDRA, cores: ['#a08a6a', '#6f5a3f'] },
  Brisa: { ceu: ['#6fb4f0', '#e4f4fb'], morro: '#9fcfb4', chao: '#8fc49a', chaoEscuro: '#74a880', elemento: NUVEM, cores: ['#ffffff', '#d4e6f0'], noCeu: true },
  Geada: { ceu: ['#9fc4e0', '#eef6fb'], morro: '#cfe4f0', chao: '#eef4f8', chaoEscuro: '#c8dce8', elemento: PINHEIRO, cores: ['#ffffff', '#2f6a5a'] },
  Faísca: { ceu: ['#3a3f5a', '#8a8fa8'], morro: '#5a5f6a', chao: '#a89a6a', chaoEscuro: '#887a4a', elemento: RAIO, cores: ['#f2c230', '#5a5f6a'] },
  Liga: { ceu: ['#6a7480', '#c0c4c8'], morro: '#5a626c', chao: '#7a828c', chaoEscuro: '#5f666f', elemento: PILAR, cores: ['#9aa4b0', '#6a5040'] },
  Peçonha: { ceu: ['#4a3a5a', '#a89ab8'], morro: '#4a5a3a', chao: '#5a6a3a', chaoEscuro: '#45522a', elemento: COGUMELO, cores: ['#9b59b6', '#e8e0c8'] },
  Penumbra: { ceu: ['#141628', '#3a3460'], morro: '#2a2640', chao: '#3a3450', chaoEscuro: '#2a2640', elemento: GALHO_SECO, cores: ['#14161c', '#14161c'], estrelas: true },
  Aurora: { ceu: ['#f7c6d9', '#fff2e0'], morro: '#e8a8c0', chao: '#c8e0a0', chaoEscuro: '#a8c480', elemento: FLOR, cores: ['#f7a6c9', '#5a9a48'] },
  Eco: { ceu: ['#8ab8c0', '#e0ece8'], morro: '#a07a5a', chao: '#b08a6a', chaoEscuro: '#8f6c4f', elemento: AGULHA, cores: ['#a07a5a', '#6fb8a0'] },
  Cristal: { ceu: ['#5a4a8a', '#c6b8e8'], morro: '#6a5a9a', chao: '#7a6a8a', chaoEscuro: '#5f5070', elemento: CRISTAL, cores: ['#c6f1f1', '#7fd0f0'] },
  Fera: { ceu: ['#e8b86a', '#f8e8b0'], morro: '#b08a4a', chao: '#c8a85a', chaoEscuro: '#a88a3f', elemento: CAPIM, cores: ['#d8b85a', '#8a6a2a'] },
  Bruma: { ceu: ['#8a8ca0', '#d8d8e0'], morro: '#9a9cb0', chao: '#7a8070', chaoEscuro: '#636858', elemento: NEVOA, cores: ['#e8e8f0', '#c8c8d8'] },
  Astro: { ceu: ['#0a0c24', '#2a2a5a'], morro: '#3a3a5a', chao: '#4a4a62', chaoEscuro: '#36364c', elemento: CRATERA, cores: ['#6a6a8a', '#2a2a40'], estrelas: true },
}
