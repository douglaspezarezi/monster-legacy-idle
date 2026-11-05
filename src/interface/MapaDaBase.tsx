// Mapa da Base: os postos como construções e os trabalhadores andando perto delas. Só desenha o que o motor devolve.
import type { MouseEvent } from 'react'
import { useEffect, useRef } from 'react'
import { CATALOGO, CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { PRECO_DA_DESTILARIA, essenciasPorHoraDaDestilaria, fragmentosPorHoraDaMina, ouroPorHoraDaForja, perolasPorHoraDaPesca } from '../engine/base.ts'
import { especieDo } from '../engine/especie.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import { PRECO_DO_SANTUARIO, VAGAS_DA_CHOCADEIRA } from '../engine/ovos.ts'
import { desenharSprite } from './cena.ts'
import type { Construcao, IdDaConstrucao, Sinal, Situacao } from './mapa-da-base.ts'
import {
  ALTURA_DO_MAPA,
  CONSTRUCOES,
  DURACAO_DO_SINAL_MS,
  LARGURA_DO_MAPA,
  construcaoEm,
  desenharChao,
  desenharConstrucoes,
  desenharSinal,
  posicaoDoTrabalhador,
} from './mapa-da-base.ts'
import { COR_DO_TIPO } from './retrato.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo> }

const QUADRO_MS = 1000 / 30
const AMPLIACAO_MAXIMA = 3
const DESTAQUE_MS = 1200

type Posto = 'forja' | 'mina' | 'destilaria' | 'pesca'

function trabalhadores(estado: EstadoDoJogo<Tipo>, id: IdDaConstrucao): readonly number[] {
  if (id === 'forja' || id === 'mina' || id === 'destilaria' || id === 'pesca') return estado[id].trabalhadores
  return []
}

function situacaoDe(estado: EstadoDoJogo<Tipo>): Situacao {
  const ativa = (id: Posto) => estado[id].trabalhadores.length > 0
  return {
    ativa: {
      forja: ativa('forja'),
      mina: ativa('mina'),
      destilaria: ativa('destilaria') && estado.destilaria.tipo !== null,
      pesca: ativa('pesca'),
      chocadeira: estado.chocadeira.length > 0,
      santuario: estado.santuario.ovo !== null,
    },
    destilariaConstruida: estado.destilaria.construida,
    santuarioConstruido: estado.santuario.construido,
    santuarioComOvo: estado.santuario.ovo !== null,
    ovosNaChocadeira: estado.chocadeira.length,
  }
}

// O texto que aparece ao passar o mouse.
function descricao(estado: EstadoDoJogo<Tipo>, c: Construcao): string {
  const vagas = (id: Posto) => `${estado[id].trabalhadores.length}/${CONFIGURACAO[id].vagas}`
  switch (c.id) {
    case 'forja':
      return `Forja · ${vagas('forja')} · ${Math.floor(ouroPorHoraDaForja(CONFIGURACAO, estado))} de ouro por hora`
    case 'mina':
      return `Mina · ${vagas('mina')} · ${Math.floor(fragmentosPorHoraDaMina(CONFIGURACAO, estado))} Fragmentos por hora`
    case 'pesca':
      return `Pesca · ${vagas('pesca')} · ${Math.floor(perolasPorHoraDaPesca(CONFIGURACAO, estado))} Pérolas por hora`
    case 'destilaria':
      if (!estado.destilaria.construida) return `Destilaria · por construir, ${PRECO_DA_DESTILARIA} Diamantes`
      return `Destilaria · ${vagas('destilaria')} · ${essenciasPorHoraDaDestilaria(CONFIGURACAO, estado).toFixed(2).replace('.', ',')} Essências por hora`
    case 'chocadeira':
      return `Chocadeira · ${estado.chocadeira.length}/${VAGAS_DA_CHOCADEIRA} ovos`
    case 'santuario':
      if (!estado.santuario.construido) return `Santuário · por construir, ${PRECO_DO_SANTUARIO} Diamantes`
      return `Santuário · ${estado.santuario.ovo ? 'um ovo chocando' : 'vazio'}`
  }
}

// Quando a fração de um posto volta para baixo, uma unidade inteira acabou de sair.
function fracoes(estado: EstadoDoJogo<Tipo>): Readonly<Record<Posto, number>> {
  return {
    forja: estado.forja.ouroFracionario,
    mina: estado.mina.fragmentosFracionarios,
    destilaria: estado.destilaria.essenciasFracionarias,
    pesca: estado.pesca.perolasFracionarias,
  }
}

function corDoSinal(estado: EstadoDoJogo<Tipo>, posto: Posto): string {
  if (posto === 'forja') return '#f2c230'
  if (posto === 'mina') return '#9b59b6'
  if (posto === 'pesca') return '#f4efe2'
  return estado.destilaria.tipo ? COR_DO_TIPO[estado.destilaria.tipo] : '#ffffff'
}

// Leva ao painel da construção e o destaca por um instante.
function abrirPainel(c: Construcao) {
  const janela = document.querySelector<HTMLElement>(`[data-janela="${c.painel}"]`)
  if (!janela) return
  janela.scrollIntoView({ behavior: 'smooth', block: 'start' })
  janela.classList.add('destacada')
  setTimeout(() => janela.classList.remove('destacada'), DESTAQUE_MS)
}

export function MapaDaBase({ estado }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const moldura = useRef<HTMLDivElement>(null)
  const ultimo = useRef(estado)
  useEffect(() => {
    ultimo.current = estado
  }, [estado])

  // Amplia por número inteiro, para os pixels ficarem nítidos; abaixo de 1×, encolhe com a tela.
  useEffect(() => {
    const div = moldura.current
    const tela = canvas.current
    if (!div || !tela) return
    const observador = new ResizeObserver(([entrada]) => {
      const escala = Math.min(AMPLIACAO_MAXIMA, Math.floor(entrada.contentRect.width / LARGURA_DO_MAPA))
      tela.style.width = escala >= 1 ? `${LARGURA_DO_MAPA * escala}px` : '100%'
      tela.style.height = escala >= 1 ? `${ALTURA_DO_MAPA * escala}px` : 'auto'
    })
    observador.observe(div)
    return () => observador.disconnect()
  }, [])

  // O navegador só chama o quadro com a aba visível.
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const chao = document.createElement('canvas')
    chao.width = LARGURA_DO_MAPA
    chao.height = ALTURA_DO_MAPA
    const ctxDoChao = chao.getContext('2d')
    if (ctxDoChao) desenharChao(ctxDoChao)
    let anteriores = fracoes(ultimo.current)
    let sinais: Sinal[] = []
    let ultimoQuadro = -Infinity
    let pedido = 0
    const quadro = (agora: number) => {
      pedido = requestAnimationFrame(quadro)
      if (agora - ultimoQuadro < QUADRO_MS - 1) return
      ultimoQuadro = agora
      const atual = ultimo.current
      const novas = fracoes(atual)
      for (const posto of ['forja', 'mina', 'destilaria', 'pesca'] as const) {
        if (novas[posto] < anteriores[posto] && atual[posto].trabalhadores.length > 0) {
          const c = CONSTRUCOES.find((k) => k.id === posto)
          if (c) sinais.push({ x: c.x + c.l / 2, y: c.y + 6, cor: corDoSinal(atual, posto), desde: agora })
        }
      }
      anteriores = novas
      sinais = sinais.filter((s) => agora - s.desde < DURACAO_DO_SINAL_MS)

      ctx.drawImage(chao, 0, 0)
      desenharConstrucoes(ctx, situacaoDe(atual), agora)
      for (const c of CONSTRUCOES) {
        trabalhadores(atual, c.id).forEach((id, i) => {
          const membro = atual.reserva.find((m) => m.id === id)
          if (!membro) return
          const [x, y] = posicaoDoTrabalhador(c, i, agora)
          const passo = Math.floor(agora / 250 + i) % 2 === 0 ? -1 : 0
          const sprite = {
            especie: membro.especie,
            tipos: especieDo(CATALOGO, membro.especie).tipos,
            prismatica: membro.prismatica,
            desperta: membro.despertada === true,
            escala: 1,
            postura: 'em-pe' as const,
            atingido: false,
          }
          desenharSprite(ctx, sprite, x, y + passo, agora)
        })
      }
      for (const sinal of sinais) desenharSinal(ctx, sinal, agora)
    }
    pedido = requestAnimationFrame(quadro)
    return () => cancelAnimationFrame(pedido)
  }, [])

  // Converte o ponteiro para os pixels do mapa.
  function construcaoSob(ev: MouseEvent<HTMLCanvasElement>): Construcao | null {
    const caixa = ev.currentTarget.getBoundingClientRect()
    const x = ((ev.clientX - caixa.left) / caixa.width) * LARGURA_DO_MAPA
    const y = ((ev.clientY - caixa.top) / caixa.height) * ALTURA_DO_MAPA
    return construcaoEm(x, y)
  }

  return (
    <section className="painel mapa-da-base">
      <h3>Base</h3>
      <div className="cena" ref={moldura}>
        <canvas
          ref={canvas}
          width={LARGURA_DO_MAPA}
          height={ALTURA_DO_MAPA}
          aria-label="Mapa da Base"
          onMouseMove={(ev) => {
            const c = construcaoSob(ev)
            ev.currentTarget.title = c ? descricao(ultimo.current, c) : ''
            ev.currentTarget.style.cursor = c ? 'pointer' : 'default'
          }}
          onClick={(ev) => {
            const c = construcaoSob(ev)
            if (c) abrirPainel(c)
          }}
        />
      </div>
    </section>
  )
}
