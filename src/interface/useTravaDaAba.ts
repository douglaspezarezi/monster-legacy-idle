// Uma aba por vez é dona do jogo: só ela simula e grava. As outras esperam na fila
// e assumem sozinhas quando a dona fecha, ou tomam a vez se o jogador pedir.
import { useCallback, useEffect, useRef, useState } from 'react'

const NOME_DA_TRAVA = 'monsterlegacy:jogo'
// Sem resposta nesse tempo, outra aba está com o jogo.
const ESPERA_MS = 400

export type SituacaoDaAba = 'esperando' | 'dona' | 'outra-aba'

type Controle = { fila: AbortController | null; soltar: () => void }

function temTravas(): boolean {
  return typeof navigator !== 'undefined' && 'locks' in navigator
}

function pedirTrava(tomar: boolean, controle: Controle, aoMudar: (situacao: SituacaoDaAba) => void) {
  controle.fila?.abort()
  const pedido = new AbortController()
  controle.fila = pedido
  const opcoes: LockOptions = tomar ? { steal: true } : { signal: pedido.signal }
  navigator.locks
    .request(NOME_DA_TRAVA, opcoes, () => {
      if (pedido.signal.aborted) return
      aoMudar('dona')
      // A trava fica com a aba enquanto esta promessa não termina.
      return new Promise<void>((resolve) => {
        controle.soltar = resolve
      })
    })
    .catch(() => {
      // Outra aba tomou a vez: esta para e volta para a fila.
      if (pedido.signal.aborted) return
      aoMudar('outra-aba')
      pedirTrava(false, controle, aoMudar)
    })
}

export function useTravaDaAba() {
  // Sem a API de travas, a aba segue como antes, sem proteção.
  const [situacao, setSituacao] = useState<SituacaoDaAba>(() => (temTravas() ? 'esperando' : 'dona'))
  const controle = useRef<Controle>({ fila: null, soltar: () => {} })

  useEffect(() => {
    if (!temTravas()) return
    const atual = controle.current
    pedirTrava(false, atual, setSituacao)
    const espera = setTimeout(() => setSituacao((s) => (s === 'esperando' ? 'outra-aba' : s)), ESPERA_MS)
    return () => {
      clearTimeout(espera)
      atual.fila?.abort()
      atual.soltar()
    }
  }, [])

  const jogarAqui = useCallback(() => pedirTrava(true, controle.current, setSituacao), [])

  return { situacao, jogarAqui }
}
