// Liga o relógio da tela ao motor: a cada passo a caçada avança até agora.
import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import type { Gerador } from '../engine/aleatorio.ts'
import { criarGerador } from '../engine/aleatorio.ts'
import { simularCacada } from '../engine/cacada.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import { novoJogo } from '../engine/jogo.ts'
import { descreverEvento } from './textos.ts'

const PASSO_MS = 100
const REGISTROS_GUARDADOS = 40

export type Registro = { readonly id: number; readonly instante: number; readonly texto: string }

export type Sessao = {
  readonly estado: EstadoDoJogo<Tipo>
  // Instante até onde o motor já simulou.
  readonly agora: number
  readonly registros: readonly Registro[]
}

// O comando recebe o estado, o instante simulado e o gerador da sessão.
export type Comando = (estado: EstadoDoJogo<Tipo>, agora: number, gerador: Gerador) => EstadoDoJogo<Tipo>

export function useJogo() {
  const [sessao, setSessao] = useState<Sessao | null>(null)
  // A sessão vive no ref; o estado do React só serve para redesenhar.
  const atual = useRef<Sessao | null>(null)
  const gerador = useRef<Gerador>(criarGerador(0))
  const proximoRegistro = useRef(1)

  const aplicar = useCallback((nova: Sessao) => {
    atual.current = nova
    setSessao(nova)
  }, [])

  const comecar = useCallback(
    (especieInicial: string) => {
      const agora = Date.now()
      gerador.current = criarGerador(agora)
      aplicar({ estado: novoJogo(CONFIGURACAO.catalogo, CONFIGURACAO.rotas.length, especieInicial, agora, gerador.current), agora, registros: [] })
    },
    [aplicar],
  )

  const executar = useCallback(
    (comando: Comando) => {
      const s = atual.current
      if (!s) return
      aplicar({ ...s, estado: comando(s.estado, s.agora, gerador.current) })
    },
    [aplicar],
  )

  const iniciada = sessao !== null
  useEffect(() => {
    if (!iniciada) return
    const id = setInterval(() => {
      const s = atual.current
      if (!s) return
      const agora = Date.now()
      const { estado, eventos } = simularCacada(CONFIGURACAO, s.estado, s.agora, agora, gerador.current)
      const novos = eventos.map((evento) => ({ id: proximoRegistro.current++, instante: evento.instante, texto: descreverEvento(evento) }))
      const registros = novos.length ? [...novos.reverse(), ...s.registros].slice(0, REGISTROS_GUARDADOS) : s.registros
      aplicar({ estado, agora, registros })
    }, PASSO_MS)
    return () => clearInterval(id)
  }, [iniciada, aplicar])

  return { sessao, comecar, executar }
}
