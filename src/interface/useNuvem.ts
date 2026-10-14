// Save na nuvem: login por link no e-mail, decisão ao entrar e gravação periódica (GDD, seção 5).
import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { enviarLink, gravarSave, lerSave, nuvem } from '../nuvem/cliente.ts'
import { decidir } from '../nuvem/sincronizacao.ts'
import type { ResumoDoSave, SaveExportado } from './useJogo.ts'
import { resumoDoSave } from './useJogo.ts'

const INTERVALO_DA_NUVEM_MS = 60 * 1000

export type Conflito = {
  readonly local: ResumoDoSave
  readonly remoto: ResumoDoSave
  readonly textoRemoto: string
}

export type SituacaoDaNuvem =
  | { readonly tipo: 'desligada' }
  | { readonly tipo: 'fora' }
  | { readonly tipo: 'link-enviado'; readonly email: string }
  | { readonly tipo: 'sincronizando' }
  | { readonly tipo: 'conflito'; readonly conflito: Conflito }
  | { readonly tipo: 'sincronizada'; readonly email: string; readonly ultimaGravacao: number | null }
  | { readonly tipo: 'erro'; readonly mensagem: string }

function chaveDoUltimo(sessao: Session): string {
  return `monsterlegacy:nuvem:${sessao.user.id}`
}

function lerUltimo(sessao: Session): number | null {
  try {
    const valor = Number(localStorage.getItem(chaveDoUltimo(sessao)))
    return Number.isFinite(valor) && valor > 0 ? valor : null
  } catch {
    return null
  }
}

function guardarUltimo(sessao: Session, salvoEm: number) {
  try {
    localStorage.setItem(chaveDoUltimo(sessao), String(salvoEm))
  } catch {
    // Sem armazenamento, a próxima entrada pergunta de novo.
  }
}

function mensagemDe(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro)
}

export function useNuvem(exportar: () => SaveExportado | null, importar: (texto: string) => void) {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [situacao, setSituacao] = useState<SituacaoDaNuvem>(nuvem ? { tipo: 'fora' } : { tipo: 'desligada' })
  const sincronizada = useRef(false)
  const usuarioAtual = useRef<string | null>(null)

  // Grava o save atual na nuvem e lembra dele como o último trocado.
  const enviar = useCallback(
    async (s: Session) => {
      const save = exportar()
      if (!nuvem || !save) return
      await gravarSave(nuvem, s, save)
      guardarUltimo(s, save.salvoEm)
      setSituacao({ tipo: 'sincronizada', email: s.user.email ?? '', ultimaGravacao: Date.now() })
    },
    [exportar],
  )

  // Ao entrar com uma conta, decide entre o save do navegador e o da nuvem.
  const sincronizar = useCallback(
    async (s: Session) => {
      if (!nuvem) return
      setSituacao({ tipo: 'sincronizando' })
      try {
        const remoto = await lerSave(nuvem, s)
        const local = exportar()
        const decisao = decidir(local, remoto, lerUltimo(s))
        if (decisao === 'perguntar' && local && remoto) {
          const resumoLocal = resumoDoSave(local.texto)
          const resumoRemoto = resumoDoSave(remoto.texto)
          if (resumoLocal && resumoRemoto) {
            setSituacao({ tipo: 'conflito', conflito: { local: resumoLocal, remoto: resumoRemoto, textoRemoto: remoto.texto } })
            return
          }
          // Um lado que não abre não entra na escolha: fica o outro.
          if (!resumoRemoto) await enviar(s)
          else importar(remoto.texto)
        } else if (decisao === 'enviar') {
          await enviar(s)
        } else if (decisao === 'baixar' && remoto) {
          importar(remoto.texto)
          guardarUltimo(s, remoto.salvoEm)
        } else if (remoto) {
          guardarUltimo(s, remoto.salvoEm)
        }
        sincronizada.current = true
        setSituacao({ tipo: 'sincronizada', email: s.user.email ?? '', ultimaGravacao: null })
      } catch (erro) {
        setSituacao({ tipo: 'erro', mensagem: mensagemDe(erro) })
      }
    },
    [exportar, importar, enviar],
  )

  useEffect(() => {
    if (!nuvem) return
    let ativo = true
    // A decisão roda uma vez por conta, não a cada renovação do token.
    const aoMudarSessao = (nova: Session | null) => {
      if (!ativo) return
      setSessao(nova)
      const id = nova?.user.id ?? null
      if (id === usuarioAtual.current) return
      usuarioAtual.current = id
      sincronizada.current = false
      // Fora do aviso do Supabase: chamar a API dentro dele pode travar o login.
      if (nova) setTimeout(() => void sincronizar(nova), 0)
      else setSituacao((atual) => (atual.tipo === 'link-enviado' ? atual : { tipo: 'fora' }))
    }
    void nuvem.auth.getSession().then(({ data }) => aoMudarSessao(data.session))
    const { data } = nuvem.auth.onAuthStateChange((_evento, nova) => aoMudarSessao(nova))
    return () => {
      ativo = false
      data.subscription.unsubscribe()
    }
  }, [sincronizar])

  // Depois de sincronizar, grava a cada minuto e quando a aba é escondida.
  useEffect(() => {
    if (!sessao || situacao.tipo !== 'sincronizada') return
    const gravarAgora = () => {
      if (sincronizada.current) enviar(sessao).catch((erro: unknown) => setSituacao({ tipo: 'erro', mensagem: mensagemDe(erro) }))
    }
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'hidden') gravarAgora()
    }
    const intervalo = setInterval(gravarAgora, INTERVALO_DA_NUVEM_MS)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
    }
  }, [sessao, situacao.tipo, enviar])

  const entrar = useCallback(async (email: string) => {
    if (!nuvem) return
    try {
      await enviarLink(nuvem, email)
      setSituacao({ tipo: 'link-enviado', email })
    } catch (erro) {
      setSituacao({ tipo: 'erro', mensagem: mensagemDe(erro) })
    }
  }, [])

  const sair = useCallback(async () => {
    if (!nuvem) return
    await nuvem.auth.signOut()
    setSituacao({ tipo: 'fora' })
  }, [])

  const escolher = useCallback(
    async (lado: 'local' | 'nuvem', conflito: Conflito) => {
      if (!sessao) return
      try {
        if (lado === 'nuvem') {
          importar(conflito.textoRemoto)
          guardarUltimo(sessao, conflito.remoto.salvoEm)
        }
        sincronizada.current = true
        await enviar(sessao)
      } catch (erro) {
        setSituacao({ tipo: 'erro', mensagem: mensagemDe(erro) })
      }
    },
    [sessao, importar, enviar],
  )

  return { situacao, entrar, sair, escolher }
}
