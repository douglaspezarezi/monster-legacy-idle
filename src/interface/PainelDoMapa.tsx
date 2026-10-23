// Mapa-múndi: os biomas por Era, com miniatura, trancas e a melhor rota do monstro ativo.
import { useEffect, useRef } from 'react'
import { BIOMAS } from '../conteudo/biomas.ts'
import { CATALOGO, CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { especieDo } from '../engine/especie.ts'
import type { Estimativa } from '../engine/estimativa.ts'
import { melhorRota } from '../engine/estimativa.ts'
import type { EstadoDoJogo, Membro } from '../engine/jogo.ts'
import { escolherBioma } from '../engine/jogo.ts'
import { ALTURA, CHAO, LARGURA, desenharFundo, desenharSprite } from './cena.ts'
import { CENARIOS } from './cenario.ts'
import { formatarXp } from './textos.ts'
import type { Estimativas } from './useEstimativas.ts'
import type { Comando } from './useJogo.ts'

type Props = {
  readonly estado: EstadoDoJogo<Tipo>
  readonly estimativas: Estimativas
  readonly executar: (comando: Comando) => void
}

const ERAS = [...new Set(BIOMAS.map((b) => b.era))]

// Fundo parado do bioma; no bioma da caçada, com o monstro ativo.
function Miniatura({ tipo, ativa }: { readonly tipo: Tipo; readonly ativa: Membro | null }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const especie = ativa?.especie
  const prismatica = ativa?.prismatica === true
  const desperta = ativa?.despertada === true
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    desenharFundo(ctx, CENARIOS[tipo], 0)
    if (especie) {
      const sprite = { especie, tipos: especieDo(CATALOGO, especie).tipos, prismatica, desperta, escala: 2, postura: 'em-pe' as const, atingido: false }
      desenharSprite(ctx, sprite, LARGURA / 2, CHAO, 0)
    }
  }, [tipo, especie, prismatica, desperta])
  return <canvas ref={canvas} width={LARGURA} height={ALTURA} aria-hidden="true" />
}

function rotasLiberadasDe(estado: EstadoDoJogo<Tipo>, bioma: number): number {
  return bioma === estado.bioma ? estado.rotasLiberadas : (estado.outrosBiomas[bioma]?.rotasLiberadas ?? 1)
}

export function PainelDoMapa({ estado, estimativas, executar }: Props) {
  const melhor = estimativas.calculando ? null : melhorRota(estimativas.lista)
  const melhorDoBioma = (bioma: number): Estimativa | null => melhorRota(estimativas.lista.filter((e) => e.bioma === bioma))
  const teto = CONFIGURACAO.eras[estado.era - 1].rotas

  return (
    <section className="painel mapa">
      <header>
        <h3>Mapa</h3>
        <span className="dica">
          {estimativas.calculando
            ? 'Calculando a melhor rota…'
            : melhor
              ? `Melhor rota para ${estado.ativa.especie}: ${BIOMAS[melhor.bioma].nome}, rota ${melhor.rota}, cerca de ${formatarXp(melhor.xpPorHora)} de XP por hora`
              : ''}
        </span>
      </header>
      <div className="eras-do-mapa">
        {ERAS.map((era) => (
          <div key={era} className="era-do-mapa">
            <h4>Era {era}</h4>
            <div className="biomas-do-mapa">
              {BIOMAS.map((b, i) => {
                if (b.era !== era) return null
                const trancado = b.era > estado.era
                const atual = i === estado.bioma
                const doBioma = trancado || estimativas.calculando ? null : melhorDoBioma(i)
                const ehMelhor = melhor !== null && melhor.bioma === i
                const total = Math.min(teto, b.especiesPorRota.length)
                return (
                  <button
                    key={b.nome}
                    className={['cartao-do-bioma', atual && 'escolhida', trancado && 'trancado', ehMelhor && 'melhor'].filter(Boolean).join(' ')}
                    disabled={trancado}
                    onClick={() => executar((e, t) => escolherBioma(e, BIOMAS, i, t))}
                  >
                    <Miniatura tipo={b.tipo} ativa={atual ? estado.ativa : null} />
                    <strong>
                      {ehMelhor && '★ '}
                      {b.nome}
                    </strong>
                    <small>{b.tipo}</small>
                    <small>{trancado ? `Abre na Era ${b.era}` : `Rotas ${Math.min(rotasLiberadasDe(estado, i), total)} de ${total}`}</small>
                    {doBioma && <small>até {formatarXp(doBioma.xpPorHora)} XP/h</small>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
