// Moldura de um painel da caçada: ordem e escala do layout e, no modo de edição, a barra para arrastar e escalar.
import type { ReactNode } from 'react'
import { useContext, useState } from 'react'
import { EdicaoDoLayout } from './edicao.ts'
import type { IdDoPainel, Layout } from './layout.ts'
import { ESCALA_MAXIMA, ESCALA_MINIMA, escalaDe, escalar, moverPara, trocar } from './layout.ts'

const NOMES: Readonly<Record<IdDoPainel, string>> = {
  luta: 'Luta',
  mapa: 'Mapa',
  rotas: 'Rotas',
  inventario: 'Inventário',
  captura: 'Captura',
  reserva: 'Reserva',
  mapaDaBase: 'Mapa da Base',
  base: 'Base',
  ovos: 'Chocadeira',
  pergaminhos: 'Pergaminhos',
  ilhas: 'Ilhas',
  mercado: 'Mercado',
  equipamentos: 'Equipamentos',
  conquistas: 'Conquistas',
  registro: 'Acontecimentos',
  calendario: 'Calendário',
}

function painelEm(x: number, y: number): IdDoPainel | null {
  const elemento = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-janela]')
  return (elemento?.dataset.janela as IdDoPainel | undefined) ?? null
}

// O vizinho na tela: painéis que não aparecem, como as Ilhas antes da Era 4, ficam de fora.
function vizinho(layout: Layout, id: IdDoPainel, direcao: -1 | 1): IdDoPainel | null {
  const visiveis = layout.ordem.filter((p) => document.querySelector(`[data-janela="${p}"]`)?.getClientRects().length)
  return visiveis[visiveis.indexOf(id) + direcao] ?? null
}

type Props = { readonly id: IdDoPainel; readonly children: ReactNode }

export function Janela({ id, children }: Props) {
  const { layout, editando, mudarLayout } = useContext(EdicaoDoLayout)
  const [alvo, setAlvo] = useState<IdDoPainel | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const escala = escalaDe(layout, id)
  const classes = ['janela', `janela-${id}`, arrastando && 'arrastando'].filter(Boolean).join(' ')

  function mover(direcao: -1 | 1) {
    const outro = vizinho(layout, id, direcao)
    if (outro) mudarLayout(trocar(layout, id, outro))
  }

  return (
    <div className={classes} data-janela={id} style={{ order: layout.ordem.indexOf(id), zoom: escala }}>
      {editando && (
        <div className="barra-da-janela">
          <span
            className="alca"
            title="Arraste para outro painel"
            onPointerDown={(ev) => {
              ev.currentTarget.setPointerCapture(ev.pointerId)
              setArrastando(true)
            }}
            onPointerMove={(ev) => {
              if (!arrastando) return
              const sob = painelEm(ev.clientX, ev.clientY)
              setAlvo(sob === id ? null : sob)
              document.querySelectorAll('.janela.alvo').forEach((e) => e.classList.remove('alvo'))
              if (sob && sob !== id) document.querySelector(`[data-janela="${sob}"]`)?.classList.add('alvo')
            }}
            onPointerUp={() => {
              document.querySelectorAll('.janela.alvo').forEach((e) => e.classList.remove('alvo'))
              if (alvo) mudarLayout(moverPara(layout, id, alvo))
              setAlvo(null)
              setArrastando(false)
            }}
            onPointerCancel={() => {
              document.querySelectorAll('.janela.alvo').forEach((e) => e.classList.remove('alvo'))
              setAlvo(null)
              setArrastando(false)
            }}
          >
            ⠿ {NOMES[id]}
          </span>
          <button aria-label="Mover para antes" onClick={() => mover(-1)}>
            ◀
          </button>
          <button aria-label="Mover para depois" onClick={() => mover(1)}>
            ▶
          </button>
          <button aria-label="Diminuir" disabled={escala <= ESCALA_MINIMA} onClick={() => mudarLayout(escalar(layout, id, -1))}>
            −
          </button>
          <output>{Math.round(escala * 100)}%</output>
          <button aria-label="Aumentar" disabled={escala >= ESCALA_MAXIMA} onClick={() => mudarLayout(escalar(layout, id, 1))}>
            +
          </button>
        </div>
      )}
      {children}
    </div>
  )
}
