// Conta da nuvem: entrar por link no e-mail, situação da sincronização e escolha entre dois saves.
import { useState } from 'react'
import type { ResumoDoSave } from './useJogo.ts'
import type { Conflito, SituacaoDaNuvem } from './useNuvem.ts'

type Props = {
  readonly situacao: SituacaoDaNuvem
  readonly entrar: (email: string) => Promise<void>
  readonly sair: () => Promise<void>
  readonly escolher: (lado: 'local' | 'nuvem', conflito: Conflito) => Promise<void>
}

function descrever(resumo: ResumoDoSave): string {
  const data = new Date(resumo.salvoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  return `Era ${resumo.era} · ${resumo.especie} nível ${resumo.nivel} · ${resumo.ouro} de ouro · salvo em ${data}`
}

export function PainelDaNuvem({ situacao, entrar, sair, escolher }: Props) {
  const [email, setEmail] = useState('')

  if (situacao.tipo === 'desligada') return null

  if (situacao.tipo === 'conflito') {
    const { conflito } = situacao
    return (
      <section className="painel nuvem conflito">
        <h2>Qual save fica?</h2>
        <p>Este navegador e a nuvem têm saves diferentes. O que não for escolhido será substituído.</p>
        <div className="opcoes">
          <div>
            <strong>Neste navegador</strong>
            <p>{descrever(conflito.local)}</p>
            <button onClick={() => void escolher('local', conflito)}>Ficar com este</button>
          </div>
          <div>
            <strong>Na nuvem</strong>
            <p>{descrever(conflito.remoto)}</p>
            <button onClick={() => void escolher('nuvem', conflito)}>Ficar com este</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="painel nuvem">
      {situacao.tipo === 'fora' && (
        <form
          className="opcao"
          onSubmit={(ev) => {
            ev.preventDefault()
            if (email.trim()) void entrar(email.trim())
          }}
        >
          <span>Save na nuvem: entre com seu e-mail para jogar em outros dispositivos.</span>
          <input type="email" required placeholder="seu@email" value={email} onChange={(ev) => setEmail(ev.target.value)} />
          <button type="submit">Receber link</button>
        </form>
      )}
      {situacao.tipo === 'link-enviado' && <p>Enviamos um link para {situacao.email}. Abra-o neste navegador para entrar.</p>}
      {situacao.tipo === 'sincronizando' && <p>Conferindo o save na nuvem…</p>}
      {situacao.tipo === 'sincronizada' && (
        <p className="opcao">
          Save na nuvem ligado ({situacao.email})
          {situacao.ultimaGravacao && ` · gravado às ${new Date(situacao.ultimaGravacao).toLocaleTimeString('pt-BR', { timeStyle: 'short' })}`}
          <button onClick={() => void sair()}>Sair</button>
        </p>
      )}
      {situacao.tipo === 'erro' && (
        <p className="aviso opcao">
          A nuvem falhou: {situacao.mensagem}. O save no navegador continua valendo.
          <button onClick={() => void sair()}>Sair</button>
        </p>
      )}
    </section>
  )
}
