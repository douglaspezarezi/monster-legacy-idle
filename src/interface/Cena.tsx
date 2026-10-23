// Cena da caçada: o monstro anda pelo bioma e luta com o selvagem. Só desenha o que o motor devolve.
import { useEffect, useRef } from 'react'
import { BIOMAS } from '../conteudo/biomas.ts'
import { CATALOGO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import type { Evento } from '../engine/cacada.ts'
import type { Criatura } from '../engine/criatura.ts'
import { especieDo } from '../engine/especie.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import { ALTURA, CHAO, LARGURA, desenharFundo, desenharSprite } from './cena.ts'
import type { Sprite } from './cena.ts'
import { CENARIOS } from './cenario.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly eventos: readonly Evento[] }

const QUADRO_MS = 1000 / 30
// Pixels por segundo do chão enquanto o monstro anda.
const VELOCIDADE = 24
const ENTRADA_MS = 500
const GOLPE_MS = 200
const PISCADA_MS = 150
const SAIDA_MS = 400
const QUEDA_MS = 1000
const X_DO_MONSTRO = 40
const X_DO_SELVAGEM = 116
const AVANCO = 4
// Acima disso a cena empurra o painel para fora da tela.
const AMPLIACAO_MAXIMA = 3

// O que a cena lembra de um quadro para o outro, em tempo da tela.
type Memoria = {
  selvagem: Criatura | null
  chefe: boolean
  entradaEm: number
  vidaDoMonstro: number
  vidaDoSelvagem: number
  golpeDoMonstroEm: number
  golpeDoSelvagemEm: number
  saindo: { readonly criatura: Criatura; readonly chefe: boolean; readonly desde: number } | null
  quedaEm: number
  eventosVistos: readonly Evento[] | null
  deslocamento: number
  ultimoQuadro: number
}

function memoriaNova(): Memoria {
  return {
    selvagem: null,
    chefe: false,
    entradaEm: -Infinity,
    vidaDoMonstro: 0,
    vidaDoSelvagem: 0,
    golpeDoMonstroEm: -Infinity,
    golpeDoSelvagemEm: -Infinity,
    saindo: null,
    quedaEm: -Infinity,
    eventosVistos: null,
    deslocamento: 0,
    ultimoQuadro: -Infinity,
  }
}

// Avança e volta: sobe até 1 na metade do golpe e desce até 0 no fim.
function avancoDoGolpe(desde: number): number {
  if (desde < 0 || desde > GOLPE_MS) return 0
  return 1 - Math.abs(desde / (GOLPE_MS / 2) - 1)
}

function piscando(desde: number, duracao: number): boolean {
  return desde >= 0 && desde < duracao && Math.floor(desde / 50) % 2 === 0
}

function spriteDe(criatura: Criatura, escala: number, campos: Partial<Sprite> = {}): Sprite {
  return {
    especie: criatura.especie,
    tipos: especieDo(CATALOGO, criatura.especie).tipos,
    prismatica: criatura.prismatica,
    desperta: criatura.despertada === true,
    escala,
    postura: 'em-pe',
    atingido: false,
    ...campos,
  }
}

// Lê os eventos e a luta do último passo do motor e anota o que a cena precisa animar.
function lembrar(memoria: Memoria, estado: EstadoDoJogo<Tipo>, eventos: readonly Evento[], agora: number) {
  let venceu = false
  if (eventos !== memoria.eventosVistos) {
    memoria.eventosVistos = eventos
    for (const evento of eventos) {
      if (evento.tipo === 'abate') {
        venceu = true
        memoria.golpeDoMonstroEm = agora
      } else if (evento.tipo === 'derrota') {
        memoria.quedaEm = agora
        memoria.golpeDoSelvagemEm = agora
      }
    }
  }

  const encontro = estado.encontro
  if (memoria.selvagem && encontro?.selvagem !== memoria.selvagem) {
    // O selvagem vencido pisca antes de sumir; o que sai por troca de rota ou de monstro some na hora.
    memoria.saindo = venceu ? { criatura: memoria.selvagem, chefe: memoria.chefe, desde: agora } : null
    memoria.selvagem = null
  }
  if (encontro && encontro.selvagem !== memoria.selvagem) {
    memoria.selvagem = encontro.selvagem
    memoria.chefe = encontro.chefe
    memoria.entradaEm = agora
    memoria.vidaDoMonstro = encontro.luta.jogador.vida
    memoria.vidaDoSelvagem = encontro.luta.selvagem.vida
  }
  if (encontro) {
    if (encontro.luta.selvagem.vida < memoria.vidaDoSelvagem) memoria.golpeDoMonstroEm = agora
    if (encontro.luta.jogador.vida < memoria.vidaDoMonstro) memoria.golpeDoSelvagemEm = agora
    memoria.vidaDoMonstro = encontro.luta.jogador.vida
    memoria.vidaDoSelvagem = encontro.luta.selvagem.vida
  }
}

function desenhar(ctx: CanvasRenderingContext2D, memoria: Memoria, estado: EstadoDoJogo<Tipo>, agora: number, passoMs: number) {
  const caido = estado.pausada || agora - memoria.quedaEm < QUEDA_MS
  const andando = !estado.encontro && !caido && !memoria.saindo
  if (andando) memoria.deslocamento += (VELOCIDADE * passoMs) / 1000

  desenharFundo(ctx, CENARIOS[BIOMAS[estado.bioma].tipo], memoria.deslocamento)

  // O monstro balança 1 pixel enquanto anda e avança na direção do selvagem ao golpear.
  const balanco = andando && Math.floor(agora / 250) % 2 === 0 ? -1 : 0
  const xDoMonstro = X_DO_MONSTRO + AVANCO * avancoDoGolpe(agora - memoria.golpeDoMonstroEm)
  const monstroAtingido = piscando(agora - memoria.golpeDoSelvagemEm, PISCADA_MS)
  desenharSprite(
    ctx,
    spriteDe(estado.ativa, 2, { postura: caido ? 'deitado' : 'em-pe', atingido: monstroAtingido }),
    xDoMonstro,
    CHAO + balanco,
    agora,
  )

  if (memoria.selvagem) {
    // Entra pela direita e para no lugar da luta.
    const entrada = Math.min(1, (agora - memoria.entradaEm) / ENTRADA_MS)
    const xDeEntrada = LARGURA + 16 + (X_DO_SELVAGEM - LARGURA - 16) * (1 - (1 - entrada) ** 2)
    const xDoSelvagem = xDeEntrada - AVANCO * avancoDoGolpe(agora - memoria.golpeDoSelvagemEm)
    const atingido = piscando(agora - memoria.golpeDoMonstroEm, PISCADA_MS)
    desenharSprite(ctx, spriteDe(memoria.selvagem, memoria.chefe ? 3 : 2, { atingido }), xDoSelvagem, CHAO, agora)
  } else if (memoria.saindo) {
    const desde = agora - memoria.saindo.desde
    if (desde >= SAIDA_MS) memoria.saindo = null
    else if (Math.floor(desde / 80) % 2 === 0) {
      desenharSprite(ctx, spriteDe(memoria.saindo.criatura, memoria.saindo.chefe ? 3 : 2), X_DO_SELVAGEM, CHAO, agora)
    }
  }
}

export function Cena({ estado, eventos }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const moldura = useRef<HTMLDivElement>(null)
  // O laço de quadros lê sempre o último estado sem recomeçar a cada passo do motor.
  const ultimo = useRef({ estado, eventos })
  useEffect(() => {
    ultimo.current = { estado, eventos }
  }, [estado, eventos])

  // Amplia por número inteiro, para os pixels ficarem nítidos.
  useEffect(() => {
    const div = moldura.current
    const tela = canvas.current
    if (!div || !tela) return
    const observador = new ResizeObserver(([entrada]) => {
      const escala = Math.max(1, Math.min(AMPLIACAO_MAXIMA, Math.floor(entrada.contentRect.width / LARGURA)))
      tela.style.width = `${LARGURA * escala}px`
      tela.style.height = `${ALTURA * escala}px`
    })
    observador.observe(div)
    return () => observador.disconnect()
  }, [])

  // O navegador só chama o quadro com a aba visível.
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const memoria = memoriaNova()
    let pedido = 0
    const quadro = (agora: number) => {
      pedido = requestAnimationFrame(quadro)
      const passo = agora - memoria.ultimoQuadro
      if (passo < QUADRO_MS - 1) return
      memoria.ultimoQuadro = agora
      const { estado: atual, eventos: recentes } = ultimo.current
      lembrar(memoria, atual, recentes, agora)
      desenhar(ctx, memoria, atual, agora, Math.min(passo, 100))
    }
    pedido = requestAnimationFrame(quadro)
    return () => cancelAnimationFrame(pedido)
  }, [])

  return (
    <div className="cena" ref={moldura}>
      <canvas ref={canvas} width={LARGURA} height={ALTURA} aria-label="Cena da caçada" />
    </div>
  )
}
