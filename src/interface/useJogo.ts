// Liga o relógio da tela ao motor: a cada passo a caçada avança até agora.
import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import type { Gerador } from '../engine/aleatorio.ts'
import { criarGerador } from '../engine/aleatorio.ts'
import { simularCacada } from '../engine/cacada.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import { novoJogo } from '../engine/jogo.ts'
import type { Resumo } from '../engine/offline.ts'
import { creditarTempoFora, resumir } from '../engine/offline.ts'
import { desserializar, serializar } from '../engine/save.ts'
import { descreverEvento } from './textos.ts'

const PASSO_MS = 100
const REGISTROS_GUARDADOS = 40
const CHAVE_DO_SAVE = 'monsterlegacy:save'
// Um save que o jogo não consegue ler fica guardado aqui em vez de ser sobrescrito.
const CHAVE_DO_SAVE_RECUSADO = 'monsterlegacy:save-recusado'
const INTERVALO_DO_SAVE_MS = 5000
// Recarregar a página não mostra resumo.
const MINIMO_PARA_RESUMO_MS = 60 * 1000

export type Registro = { readonly id: number; readonly instante: number; readonly texto: string }

export type Sessao = {
  readonly estado: EstadoDoJogo<Tipo>
  // Instante até onde o motor já simulou.
  readonly agora: number
  readonly registros: readonly Registro[]
}

export type Volta = {
  readonly foraMs: number
  readonly creditadoMs: number
  readonly resumo: Resumo
}

// O comando recebe o estado, o instante simulado e o gerador da sessão.
export type Comando = (estado: EstadoDoJogo<Tipo>, agora: number, gerador: Gerador) => EstadoDoJogo<Tipo>

type Abertura = { readonly sessao: Sessao | null; readonly volta: Volta | null; readonly gerador: Gerador }

function gravar(chave: string, texto: string) {
  try {
    localStorage.setItem(chave, texto)
  } catch {
    // Sem acesso ao armazenamento o jogo segue, só não guarda.
  }
}

function gravarSessao(sessao: Sessao) {
  gravar(CHAVE_DO_SAVE, serializar(sessao.estado, sessao.agora))
}

function abrir(): Abertura {
  const agora = Date.now()
  const gerador = criarGerador(agora)
  let texto: string | null = null
  try {
    texto = localStorage.getItem(CHAVE_DO_SAVE)
  } catch {
    texto = null
  }
  if (texto === null) return { sessao: null, volta: null, gerador }

  try {
    const save = desserializar<Tipo>(texto)
    const fora = creditarTempoFora(CONFIGURACAO, save.estado, save.salvoEm, agora, gerador)
    const volta =
      fora.creditadoMs >= MINIMO_PARA_RESUMO_MS
        ? { foraMs: agora - save.salvoEm, creditadoMs: fora.creditadoMs, resumo: resumir(fora.eventos) }
        : null
    return { sessao: { estado: fora.estado, agora, registros: [] }, volta, gerador }
  } catch {
    gravar(CHAVE_DO_SAVE_RECUSADO, texto)
    return { sessao: null, volta: null, gerador }
  }
}

export function useJogo() {
  const [abertura] = useState(abrir)
  const [sessao, setSessao] = useState<Sessao | null>(abertura.sessao)
  const [volta, setVolta] = useState<Volta | null>(abertura.volta)
  // A sessão vive no ref; o estado do React só serve para redesenhar.
  const atual = useRef<Sessao | null>(abertura.sessao)
  const gerador = useRef<Gerador>(abertura.gerador)
  const proximoRegistro = useRef(1)

  const aplicar = useCallback((nova: Sessao) => {
    atual.current = nova
    setSessao(nova)
  }, [])

  const comecar = useCallback(
    (especieInicial: string) => {
      const agora = Date.now()
      const nova = { estado: novoJogo(CONFIGURACAO.catalogo, CONFIGURACAO.rotas.length, especieInicial, agora, gerador.current), agora, registros: [] }
      aplicar(nova)
      gravarSessao(nova)
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

  const fecharVolta = useCallback(() => setVolta(null), [])

  const iniciada = sessao !== null
  useEffect(() => {
    if (!iniciada) return
    const passo = setInterval(() => {
      const s = atual.current
      if (!s) return
      const agora = Date.now()
      const { estado, eventos } = simularCacada(CONFIGURACAO, s.estado, s.agora, agora, gerador.current)
      const novos = eventos.map((evento) => ({ id: proximoRegistro.current++, instante: evento.instante, texto: descreverEvento(evento) }))
      const registros = novos.length ? [...novos.reverse(), ...s.registros].slice(0, REGISTROS_GUARDADOS) : s.registros
      aplicar({ estado, agora, registros })
    }, PASSO_MS)

    const guardar = () => {
      if (atual.current) gravarSessao(atual.current)
    }
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'hidden') guardar()
    }
    const salvamento = setInterval(guardar, INTERVALO_DO_SAVE_MS)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    window.addEventListener('pagehide', guardar)
    return () => {
      clearInterval(passo)
      clearInterval(salvamento)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
      window.removeEventListener('pagehide', guardar)
    }
  }, [iniciada, aplicar])

  return { sessao, volta, comecar, executar, fecharVolta }
}
