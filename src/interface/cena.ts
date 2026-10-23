// Desenho da cena da caçada em Canvas, em 160 × 90 pixels (GDD, seção 3).
import type { Tipo } from '../conteudo/tipos.ts'
import type { Cenario } from './cenario.ts'
import type { Pixel } from './retrato.ts'
import { LADO, pixelsDoRetrato } from './retrato.ts'

export const LARGURA = 160
export const ALTURA = 90
// Linha do chão, onde ficam os pés dos monstros.
export const CHAO = 74
const HORIZONTE = 66
const ESPACO_ENTRE_ELEMENTOS = 44

export type Postura = 'em-pe' | 'deitado'

export type Sprite = {
  readonly especie: string
  readonly tipos: readonly Tipo[]
  readonly prismatica: boolean
  readonly desperta: boolean
  // Pixels por pixel do desenho: 2 para o monstro, 3 para o chefe.
  readonly escala: number
  readonly postura: Postura
  // Desenha só a silhueta branca, no quadro em que o monstro é atingido.
  readonly atingido: boolean
}

const cacheDePixels = new Map<string, Pixel[]>()

function pixelsDe(especie: string, tipos: readonly Tipo[]): Pixel[] {
  let pixels = cacheDePixels.get(especie)
  if (!pixels) {
    pixels = pixelsDoRetrato(especie, tipos)
    cacheDePixels.set(especie, pixels)
  }
  return pixels
}

// Deitado, o desenho gira um quarto de volta e fica rente ao chão.
function posicao(p: Pixel, postura: Postura): readonly [number, number] {
  return postura === 'em-pe' ? [p.x, p.y] : [p.y, LADO - 1 - p.x]
}

// x é o centro do monstro; os pés ficam no chão.
export function desenharSprite(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, chao: number, instante: number) {
  const { escala, postura } = sprite
  const lado = LADO * escala
  const esquerda = Math.round(x - lado / 2)
  const topo = Math.round(chao - lado)
  const pixels = pixelsDe(sprite.especie, sprite.tipos)
  const pintar = (cor: string, dx = 0, dy = 0) => {
    ctx.fillStyle = cor
    for (const p of pixels) {
      const [px, py] = posicao(p, postura)
      ctx.fillRect(esquerda + px * escala + dx, topo + py * escala + dy, escala, escala)
    }
  }

  if (sprite.atingido) {
    pintar('#ffffff')
    return
  }
  // Contorno de 1 pixel para o monstro não sumir num fundo da mesma cor; dourado no Despertar, como no retrato.
  const contorno = sprite.desperta ? '#f2c46b' : '#14161c'
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) pintar(contorno, dx, dy)
  ctx.save()
  if (sprite.prismatica) ctx.filter = 'hue-rotate(160deg) saturate(1.4)'
  for (const p of pixels) {
    const [px, py] = posicao(p, postura)
    ctx.fillStyle = p.cor
    ctx.fillRect(esquerda + px * escala, topo + py * escala, escala, escala)
  }
  ctx.restore()
  // O brilho da prismática pisca num canto do monstro.
  if (sprite.prismatica && Math.floor(instante / 300) % 3 === 0) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(esquerda + lado - 1, topo, 1, 3)
    ctx.fillRect(esquerda + lado - 2, topo + 1, 3, 1)
  }
}

function desenharElemento(ctx: CanvasRenderingContext2D, cenario: Cenario, x: number, base: number) {
  const { elemento, cores } = cenario
  const topo = base - elemento.length
  elemento.forEach((linha, y) => {
    for (let i = 0; i < linha.length; i++) {
      const c = linha[i]
      if (c === '.') continue
      ctx.fillStyle = c === 'a' ? cores[0] : cores[1]
      ctx.fillRect(Math.round(x) + i, topo + y, 1, 1)
    }
  })
}

// Resto sempre positivo, para o fundo rolar sem saltos.
function modulo(valor: number, divisor: number): number {
  return ((valor % divisor) + divisor) % divisor
}

// O deslocamento cresce enquanto o monstro anda; cada camada rola numa velocidade.
export function desenharFundo(ctx: CanvasRenderingContext2D, cenario: Cenario, deslocamento: number) {
  const ceu = ctx.createLinearGradient(0, 0, 0, HORIZONTE)
  ceu.addColorStop(0, cenario.ceu[0])
  ceu.addColorStop(1, cenario.ceu[1])
  ctx.fillStyle = ceu
  ctx.fillRect(0, 0, LARGURA, HORIZONTE)

  if (cenario.estrelas) {
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < 24; i++) ctx.fillRect((i * 37) % LARGURA, (i * 23) % 40, 1, 1)
  }

  // Morros ao longe, quase parados.
  ctx.fillStyle = cenario.morro
  const morros = deslocamento * 0.15
  for (let x = 0; x < LARGURA; x++) {
    const altura = 8 + Math.round(5 * Math.sin((x + morros) / 17) + 3 * Math.sin((x + morros) / 7))
    ctx.fillRect(x, HORIZONTE - altura, 1, altura)
  }

  // Elementos do bioma no meio do caminho; a nuvem fica no céu.
  const meio = modulo(deslocamento * 0.5, ESPACO_ENTRE_ELEMENTOS)
  for (let x = -meio; x < LARGURA; x += ESPACO_ENTRE_ELEMENTOS) {
    desenharElemento(ctx, cenario, x + 10, cenario.noCeu ? 22 : HORIZONTE + 2)
  }

  ctx.fillStyle = cenario.chao
  ctx.fillRect(0, HORIZONTE, LARGURA, ALTURA - HORIZONTE)
  ctx.fillStyle = cenario.chaoEscuro
  const perto = modulo(deslocamento, 12)
  for (let x = -perto; x < LARGURA; x += 12) {
    ctx.fillRect(Math.round(x), CHAO + 3, 3, 1)
    ctx.fillRect(Math.round(x) + 6, CHAO + 9, 2, 1)
  }
}
