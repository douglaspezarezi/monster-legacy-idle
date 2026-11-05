// Desenho do mapa da Base em Canvas, em 480 × 192 pixels (GDD, seção 9). Arte provisória até a arte final do F7.
import { criarGerador } from '../engine/aleatorio.ts'

export const LARGURA_DO_MAPA = 480
export const ALTURA_DO_MAPA = 192

export type IdDaConstrucao = 'forja' | 'mina' | 'chocadeira' | 'santuario' | 'destilaria' | 'pesca'

type Retangulo = { readonly x: number; readonly y: number; readonly l: number; readonly a: number }

export type Construcao = Retangulo & {
  readonly id: IdDaConstrucao
  readonly nome: string
  // Onde os trabalhadores andam, na frente da construção.
  readonly zona: Retangulo
  // Painel que o clique abre.
  readonly painel: 'base' | 'ovos'
}

// A disposição é fixa: é sempre a mesma Base.
export const CONSTRUCOES: readonly Construcao[] = [
  { id: 'forja', nome: 'Forja', x: 28, y: 22, l: 60, a: 50, zona: { x: 24, y: 78, l: 68, a: 14 }, painel: 'base' },
  { id: 'mina', nome: 'Mina', x: 116, y: 14, l: 72, a: 58, zona: { x: 116, y: 78, l: 72, a: 14 }, painel: 'base' },
  { id: 'chocadeira', nome: 'Chocadeira', x: 214, y: 30, l: 52, a: 42, zona: { x: 214, y: 78, l: 52, a: 10 }, painel: 'ovos' },
  { id: 'santuario', nome: 'Santuário', x: 296, y: 18, l: 52, a: 54, zona: { x: 296, y: 78, l: 52, a: 10 }, painel: 'ovos' },
  { id: 'destilaria', nome: 'Destilaria', x: 378, y: 22, l: 68, a: 50, zona: { x: 376, y: 78, l: 72, a: 14 }, painel: 'base' },
  { id: 'pesca', nome: 'Pesca', x: 296, y: 126, l: 30, a: 30, zona: { x: 262, y: 160, l: 64, a: 14 }, painel: 'base' },
]

const LAGO: Retangulo = { x: 330, y: 116, l: 134, a: 64 }
const TRILHA_Y = 96
const PIER: Retangulo = { x: 326, y: 142, l: 34, a: 6 }

export type Situacao = {
  readonly ativa: Readonly<Record<IdDaConstrucao, boolean>>
  readonly destilariaConstruida: boolean
  readonly santuarioConstruido: boolean
  readonly santuarioComOvo: boolean
  readonly ovosNaChocadeira: number
}

function ret(ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, l: number, a: number) {
  ctx.fillStyle = cor
  ctx.fillRect(Math.round(x), Math.round(y), l, a)
}

// Elipse cheia, linha a linha, para os pixels ficarem nítidos.
function elipse(ctx: CanvasRenderingContext2D, cor: string, cx: number, cy: number, rx: number, ry: number) {
  ctx.fillStyle = cor
  for (let dy = -ry; dy <= ry; dy++) {
    const meia = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)))
    ctx.fillRect(Math.round(cx - meia), Math.round(cy + dy), meia * 2, 1)
  }
}

// Telhado em degraus: cada linha encolhe 1 pixel de cada lado.
function telhado(ctx: CanvasRenderingContext2D, cor: string, sombra: string, x: number, y: number, l: number, a: number) {
  for (let i = 0; i < a; i++) {
    const recuo = Math.round(((a - i) * l) / (2 * a))
    ret(ctx, i % 3 === 2 ? sombra : cor, x + recuo, y + i, l - recuo * 2, 1)
  }
}

function dentro(r: Retangulo, x: number, y: number, margem = 0): boolean {
  return x >= r.x - margem && x < r.x + r.l + margem && y >= r.y - margem && y < r.y + r.a + margem
}

export function construcaoEm(x: number, y: number): Construcao | null {
  return CONSTRUCOES.find((c) => dentro(c, x, y, 2)) ?? null
}

function arvore(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ret(ctx, '#6b4a2b', x + 5, y + 11, 3, 5)
  elipse(ctx, '#2f6b2a', x + 6, y + 7, 6, 6)
  elipse(ctx, '#3f8a34', x + 5, y + 6, 4, 4)
  ret(ctx, '#6fb64a', x + 3, y + 3, 2, 1)
}

function arbusto(ctx: CanvasRenderingContext2D, x: number, y: number) {
  elipse(ctx, '#2f6b2a', x + 4, y + 3, 4, 2)
  ret(ctx, '#4f9a3c', x + 2, y + 2, 3, 1)
}

function pedras(ctx: CanvasRenderingContext2D, x: number, y: number) {
  elipse(ctx, '#7d8088', x + 3, y + 3, 3, 2)
  elipse(ctx, '#9da1a8', x + 7, y + 3, 2, 2)
  ret(ctx, '#c4c7cc', x + 2, y + 2, 2, 1)
}

// Grama, trilhas, lago e enfeites não mudam: são desenhados uma vez numa tela à parte.
export function desenharChao(ctx: CanvasRenderingContext2D) {
  ret(ctx, '#4f9a3c', 0, 0, LARGURA_DO_MAPA, ALTURA_DO_MAPA)
  const sorteio = criarGerador(27)
  for (let i = 0; i < 900; i++) {
    const x = Math.floor(sorteio() * LARGURA_DO_MAPA)
    const y = Math.floor(sorteio() * ALTURA_DO_MAPA)
    ret(ctx, sorteio() < 0.5 ? '#5aa548' : '#448a33', x, y, 1, sorteio() < 0.3 ? 2 : 1)
  }

  // A trilha principal e os ramos até cada construção.
  ret(ctx, '#b08a5a', 0, TRILHA_Y, LARGURA_DO_MAPA, 7)
  for (const c of CONSTRUCOES) {
    const meio = c.x + Math.floor(c.l / 2) - 3
    if (c.y < TRILHA_Y) ret(ctx, '#b08a5a', meio, c.y + c.a, 7, TRILHA_Y - c.y - c.a)
    else ret(ctx, '#b08a5a', meio, TRILHA_Y + 7, 7, c.y - TRILHA_Y - 7)
  }
  for (let x = 0; x < LARGURA_DO_MAPA; x += 5) ret(ctx, '#9a7548', x + ((x / 5) % 2) * 2, TRILHA_Y + 2 + ((x / 5) % 3), 1, 1)

  elipse(ctx, '#2c5d8a', LAGO.x + LAGO.l / 2, LAGO.y + LAGO.a / 2, LAGO.l / 2, LAGO.a / 2)
  elipse(ctx, '#3b82c4', LAGO.x + LAGO.l / 2, LAGO.y + LAGO.a / 2 - 1, LAGO.l / 2 - 3, LAGO.a / 2 - 3)
  ret(ctx, '#7a5634', PIER.x, PIER.y, PIER.l, PIER.a)
  for (let x = PIER.x; x < PIER.x + PIER.l; x += 4) ret(ctx, '#5c3f24', x, PIER.y, 1, PIER.a)

  // Enfeites longe das construções, da trilha e do lago.
  const enfeites = criarGerador(41)
  const livres: [number, number][] = []
  for (let tentativa = 0; tentativa < 400 && livres.length < 34; tentativa++) {
    const x = Math.floor(enfeites() * (LARGURA_DO_MAPA - 14))
    const y = Math.floor(enfeites() * (ALTURA_DO_MAPA - 16))
    const ocupado =
      CONSTRUCOES.some((c) => dentro(c, x + 6, y + 8, 12) || dentro(c.zona, x + 6, y + 8, 8)) ||
      dentro(LAGO, x + 6, y + 8, 10) ||
      Math.abs(y + 8 - TRILHA_Y - 3) < 14 ||
      livres.some(([lx, ly]) => Math.abs(lx - x) < 14 && Math.abs(ly - y) < 14)
    if (!ocupado) livres.push([x, y])
  }
  livres.sort((a, b) => a[1] - b[1])
  livres.forEach(([x, y], i) => (i % 3 === 0 ? pedras(ctx, x, y + 10) : i % 3 === 1 ? arbusto(ctx, x, y + 10) : arvore(ctx, x, y)))
}

function placa(ctx: CanvasRenderingContext2D, c: Construcao) {
  // Terreno cercado, por construir.
  ret(ctx, '#8a6a3f', c.x + 4, c.y + c.a - 30, c.l - 8, 1)
  ret(ctx, '#8a6a3f', c.x + 4, c.y + c.a - 6, c.l - 8, 1)
  for (let x = c.x + 4; x <= c.x + c.l - 5; x += 6) ret(ctx, '#6b4a2b', x, c.y + c.a - 32, 2, 28)
  ret(ctx, '#6b4a2b', c.x + c.l / 2, c.y + c.a - 22, 2, 10)
  ret(ctx, '#d9c08a', c.x + c.l / 2 - 7, c.y + c.a - 28, 16, 8)
  ret(ctx, '#6b4a2b', c.x + c.l / 2 - 4, c.y + c.a - 25, 10, 1)
}

function fumaca(ctx: CanvasRenderingContext2D, x: number, y: number, instante: number) {
  for (let i = 0; i < 3; i++) {
    const fase = ((instante / 1400 + i / 3) % 1 + 1) % 1
    ctx.globalAlpha = 0.6 * (1 - fase)
    elipse(ctx, '#d6d6d6', x + Math.sin(fase * 6 + i) * 2, y - fase * 16, 2 + fase * 2, 2 + fase * 2)
  }
  ctx.globalAlpha = 1
}

function desenharForja(ctx: CanvasRenderingContext2D, c: Construcao, ativa: boolean, instante: number) {
  ret(ctx, '#3b3f47', c.x + 46, c.y + 4, 7, 18)
  telhado(ctx, '#a8432e', '#7f3020', c.x, c.y + 8, c.l, 16)
  ret(ctx, '#8a8f99', c.x + 4, c.y + 24, c.l - 8, c.a - 24)
  for (let y = c.y + 27; y < c.y + c.a; y += 5) ret(ctx, '#737882', c.x + 4, y, c.l - 8, 1)
  ret(ctx, '#3a2a1c', c.x + c.l / 2 - 5, c.y + c.a - 14, 10, 14)
  const brasa = ativa ? (Math.floor(instante / 200) % 2 === 0 ? '#f2a23c' : '#e8603c') : '#4a4f58'
  ret(ctx, brasa, c.x + 10, c.y + 30, 8, 6)
  ret(ctx, brasa, c.x + c.l - 18, c.y + 30, 8, 6)
  if (ativa) fumaca(ctx, c.x + 49, c.y + 2, instante)
}

function desenharMina(ctx: CanvasRenderingContext2D, c: Construcao, ativa: boolean, instante: number) {
  for (let i = 0; i < 6; i++) ret(ctx, i % 2 ? '#7a6248' : '#8c7254', c.x + 8 - i * 1.5, c.y + 14 + i * 7, c.l - 16 + i * 3, 7)
  elipse(ctx, '#8c7254', c.x + c.l / 2, c.y + 16, 22, 10)
  elipse(ctx, '#9e8463', c.x + c.l / 2 - 6, c.y + 12, 8, 4)
  ret(ctx, '#5c3f24', c.x + c.l / 2 - 11, c.y + c.a - 24, 22, 3)
  ret(ctx, '#5c3f24', c.x + c.l / 2 - 11, c.y + c.a - 24, 3, 24)
  ret(ctx, '#5c3f24', c.x + c.l / 2 + 8, c.y + c.a - 24, 3, 24)
  ret(ctx, '#17130f', c.x + c.l / 2 - 8, c.y + c.a - 21, 16, 21)
  // Cristais na encosta e o carrinho na saída.
  ret(ctx, '#c6f1f1', c.x + 14, c.y + 30, 2, 3)
  ret(ctx, '#9b59b6', c.x + c.l - 18, c.y + 24, 2, 3)
  ret(ctx, '#4a4f58', c.x + c.l - 12, c.y + c.a - 8, 10, 6)
  ret(ctx, '#9aa4b0', c.x + c.l - 11, c.y + c.a - 10, 8, 2)
  if (ativa) {
    const luz = Math.floor(instante / 300) % 3 !== 0 ? '#f2c230' : '#c79a1e'
    ret(ctx, luz, c.x + c.l / 2 - 1, c.y + c.a - 19, 2, 2)
  }
}

function desenharChocadeira(ctx: CanvasRenderingContext2D, c: Construcao, ovos: number) {
  telhado(ctx, '#d9b44a', '#b8932e', c.x, c.y, c.l, 16)
  ret(ctx, '#9a6b3f', c.x + 6, c.y + 16, c.l - 12, c.a - 16)
  for (let x = c.x + 6; x < c.x + c.l - 6; x += 4) ret(ctx, '#83592f', x, c.y + 16, 1, c.a - 16)
  ret(ctx, '#3a2a1c', c.x + c.l / 2 - 5, c.y + c.a - 12, 10, 12)
  // O ninho na frente, com um ovo por ovo chocando.
  elipse(ctx, '#c9a35a', c.x + c.l - 6, c.y + c.a - 2, 9, 3)
  for (let i = 0; i < Math.min(3, ovos); i++) elipse(ctx, '#f4efe2', c.x + c.l - 11 + i * 5, c.y + c.a - 5, 2, 3)
}

function desenharSantuario(ctx: CanvasRenderingContext2D, c: Construcao, comOvo: boolean, instante: number) {
  ret(ctx, '#d8d4cc', c.x + 2, c.y + c.a - 8, c.l - 4, 8)
  ret(ctx, '#bdb8ae', c.x + 6, c.y + c.a - 12, c.l - 12, 4)
  for (const x of [c.x + 8, c.x + c.l - 14]) {
    ret(ctx, '#ece8e0', x, c.y + 14, 6, c.a - 26)
    ret(ctx, '#bdb8ae', x - 1, c.y + 12, 8, 3)
  }
  ret(ctx, '#ece8e0', c.x + 4, c.y + 8, c.l - 8, 5)
  // O cristal pulsa; com um ovo no Santuário, brilha mais.
  const brilho = 0.6 + 0.4 * Math.sin(instante / (comOvo ? 250 : 700))
  ctx.globalAlpha = brilho
  elipse(ctx, '#f7a6c9', c.x + c.l / 2, c.y + c.a - 22, 5, 7)
  ctx.globalAlpha = 1
  ret(ctx, '#ffffff', c.x + c.l / 2 - 1, c.y + c.a - 26, 1, 3)
}

function desenharDestilaria(ctx: CanvasRenderingContext2D, c: Construcao, ativa: boolean, instante: number) {
  telhado(ctx, '#3f4fb0', '#2f3c88', c.x, c.y, 40, 14)
  ret(ctx, '#a7a9be', c.x + 4, c.y + 14, 32, c.a - 14)
  ret(ctx, '#3a2a1c', c.x + 14, c.y + c.a - 13, 10, 13)
  // Alambique de cobre ao lado, com o cano até a casa.
  elipse(ctx, '#c47a3a', c.x + 52, c.y + c.a - 14, 12, 12)
  elipse(ctx, '#e09a55', c.x + 49, c.y + c.a - 18, 4, 4)
  ret(ctx, '#9a5a28', c.x + 50, c.y + 6, 4, c.a - 30)
  ret(ctx, '#9a5a28', c.x + 36, c.y + 6, 18, 3)
  if (ativa) {
    for (let i = 0; i < 3; i++) {
      const fase = ((instante / 900 + i / 3) % 1 + 1) % 1
      ctx.globalAlpha = 1 - fase
      ret(ctx, '#bfe3d0', c.x + 48 + i * 3, c.y + 2 - fase * 10, 2, 2)
    }
    ctx.globalAlpha = 1
  }
}

function desenharPesca(ctx: CanvasRenderingContext2D, c: Construcao, ativa: boolean, instante: number) {
  telhado(ctx, '#3b82c4', '#2c5d8a', c.x, c.y, c.l, 12)
  ret(ctx, '#9a6b3f', c.x + 4, c.y + 12, c.l - 8, c.a - 12)
  ret(ctx, '#3a2a1c', c.x + c.l / 2 - 4, c.y + c.a - 10, 8, 10)
  // Ondas no lago e, com gente pescando, a boia na ponta do píer.
  for (let i = 0; i < 6; i++) {
    const x = LAGO.x + 22 + ((i * 37 + Math.floor(instante / 120)) % (LAGO.l - 44))
    const y = LAGO.y + 14 + ((i * 13) % (LAGO.a - 26))
    ret(ctx, '#7fc0ea', x, y, 4, 1)
  }
  if (ativa) {
    const boia = Math.floor(instante / 500) % 2
    ret(ctx, '#e8603c', PIER.x + PIER.l + 6, PIER.y + 1 + boia, 2, 2)
    ret(ctx, '#ffffff', PIER.x + PIER.l + 6, PIER.y + boia, 2, 1)
  }
}

export function desenharConstrucoes(ctx: CanvasRenderingContext2D, situacao: Situacao, instante: number) {
  for (const c of CONSTRUCOES) {
    if (c.id === 'forja') desenharForja(ctx, c, situacao.ativa.forja, instante)
    else if (c.id === 'mina') desenharMina(ctx, c, situacao.ativa.mina, instante)
    else if (c.id === 'chocadeira') desenharChocadeira(ctx, c, situacao.ovosNaChocadeira)
    else if (c.id === 'santuario') {
      if (situacao.santuarioConstruido) desenharSantuario(ctx, c, situacao.santuarioComOvo, instante)
      else placa(ctx, c)
    } else if (c.id === 'destilaria') {
      if (situacao.destilariaConstruida) desenharDestilaria(ctx, c, situacao.ativa.destilaria, instante)
      else placa(ctx, c)
    } else desenharPesca(ctx, c, situacao.ativa.pesca, instante)
  }
}

// Onde o trabalhador está agora: anda de um lado para o outro da zona, cada um no seu ritmo.
export function posicaoDoTrabalhador(c: Construcao, indice: number, instante: number): readonly [number, number] {
  const periodo = 7000 + indice * 1900
  const fase = (instante / periodo) * Math.PI * 2 + indice * 2.1
  const x = c.zona.x + 6 + (c.zona.l - 12) * (0.5 + 0.5 * Math.sin(fase))
  const y = c.zona.y + 8 + Math.round(((c.zona.a - 8) * indice) / 2)
  return [x, y]
}

export type Sinal = { readonly x: number; readonly y: number; readonly cor: string; readonly desde: number }

export const DURACAO_DO_SINAL_MS = 1200

// O sinal de produção sobe e some acima da construção.
export function desenharSinal(ctx: CanvasRenderingContext2D, sinal: Sinal, instante: number) {
  const fase = (instante - sinal.desde) / DURACAO_DO_SINAL_MS
  if (fase < 0 || fase > 1) return
  const y = sinal.y - fase * 14
  ctx.globalAlpha = 1 - fase * fase
  ret(ctx, '#14161c', sinal.x - 3, y - 3, 6, 6)
  ret(ctx, sinal.cor, sinal.x - 2, y - 2, 4, 4)
  ret(ctx, '#ffffff', sinal.x - 2, y - 2, 1, 1)
  ctx.globalAlpha = 1
}
