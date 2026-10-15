// Se a tela quebrar, em vez de ficar em branco, mostra o erro e dá saídas que preservam o save.
import type { ErrorInfo, ReactNode } from 'react'
import { Component, useState } from 'react'
import { CHAVE_DO_SAVE, CHAVE_DO_SAVE_RECUSADO, baixar, guardar, lerGuardado, nomeDoArquivo } from './arquivo.ts'

type Props = { readonly children: ReactNode }
type Estado = { readonly erro: Error | null }

export class TelaDeErro extends Component<Props, Estado> {
  state: Estado = { erro: null }

  static getDerivedStateFromError(erro: unknown): Estado {
    return { erro: erro instanceof Error ? erro : new Error(String(erro)) }
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error('A tela quebrou:', erro, info.componentStack)
  }

  render() {
    return this.state.erro ? <AvisoDeErro erro={this.state.erro} /> : this.props.children
  }
}

function AvisoDeErro({ erro }: { readonly erro: Error }) {
  const [confirmando, setConfirmando] = useState(false)
  const save = lerGuardado(CHAVE_DO_SAVE)

  return (
    <main className="app">
      <h1>Monster Legacy Idle</h1>
      <section className="painel erro">
        <h2>Algo deu errado na tela</h2>
        <p>O seu save continua guardado neste navegador. Baixe uma cópia antes de tentar outra coisa.</p>
        <p className="dica">Erro: {erro.message}</p>
        <div className="botoes-de-erro">
          {save && <button onClick={() => baixar(save, nomeDoArquivo(new Date()))}>Baixar o save</button>}
          <button onClick={() => window.location.reload()}>Recarregar</button>
          {save &&
            (confirmando ? (
              <button
                onClick={() => {
                  guardar(CHAVE_DO_SAVE_RECUSADO, save)
                  try {
                    localStorage.removeItem(CHAVE_DO_SAVE)
                  } catch {
                    // Sem armazenamento, recarregar abre o mesmo save.
                  }
                  window.location.reload()
                }}
              >
                Confirmar: guardar à parte e começar de novo
              </button>
            ) : (
              <button onClick={() => setConfirmando(true)}>Começar de novo</button>
            ))}
        </div>
      </section>
    </main>
  )
}
