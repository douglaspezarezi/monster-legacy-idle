// Preferências deste navegador, fora do save e da nuvem (GDD, seção 3).
import { useCallback, useEffect, useState } from 'react'
import { guardar, lerGuardado } from './arquivo.ts'
import type { Layout } from './layout.ts'
import { LAYOUT_PADRAO, normalizarLayout } from './layout.ts'

export type Preferencias = {
  // De 0 a 1.
  readonly volumeDaMusica: number
  readonly volumeDosEfeitos: number
  // De 0,35 a 1: o fundo dos painéis.
  readonly opacidadeDoVidro: number
  // Sem a cena da caçada.
  readonly modoLeve: boolean
  // Ordem e escala dos painéis da caçada.
  readonly layout: Layout
}

export const OPACIDADE_MINIMA = 0.35

const CHAVE_DAS_PREFERENCIAS = 'monsterlegacy:preferencias'
// Guardada sozinha antes do F23.
const CHAVE_DO_MODO_LEVE = 'monsterlegacy:modo-leve'

const PADRAO: Preferencias = { volumeDaMusica: 0, volumeDosEfeitos: 0.5, opacidadeDoVidro: 0.6, modoLeve: false, layout: LAYOUT_PADRAO }

function entre(valor: unknown, minimo: number, maximo: number, padrao: number): number {
  return typeof valor === 'number' && Number.isFinite(valor) ? Math.min(maximo, Math.max(minimo, valor)) : padrao
}

// Um valor estragado volta ao padrão sem perder os outros.
function ler(): Preferencias {
  let dados: Record<string, unknown> = {}
  try {
    const texto = lerGuardado(CHAVE_DAS_PREFERENCIAS)
    const lido: unknown = texto === null ? null : JSON.parse(texto)
    if (typeof lido === 'object' && lido !== null) dados = lido as Record<string, unknown>
  } catch {
    // Texto ilegível: fica o padrão.
  }
  return {
    volumeDaMusica: entre(dados.volumeDaMusica, 0, 1, PADRAO.volumeDaMusica),
    volumeDosEfeitos: entre(dados.volumeDosEfeitos, 0, 1, PADRAO.volumeDosEfeitos),
    opacidadeDoVidro: entre(dados.opacidadeDoVidro, OPACIDADE_MINIMA, 1, PADRAO.opacidadeDoVidro),
    modoLeve: typeof dados.modoLeve === 'boolean' ? dados.modoLeve : lerGuardado(CHAVE_DO_MODO_LEVE) === 'sim',
    layout: normalizarLayout(dados.layout),
  }
}

export function usePreferencias() {
  const [preferencias, setPreferencias] = useState(ler)

  // O vidro dos painéis segue a opacidade escolhida.
  useEffect(() => {
    document.documentElement.style.setProperty('--vidro', `rgb(27 33 41 / ${preferencias.opacidadeDoVidro})`)
  }, [preferencias.opacidadeDoVidro])

  const mudar = useCallback((campos: Partial<Preferencias>) => {
    setPreferencias((atuais) => {
      const novas = { ...atuais, ...campos }
      guardar(CHAVE_DAS_PREFERENCIAS, JSON.stringify(novas))
      return novas
    })
  }, [])

  return { preferencias, mudar }
}
