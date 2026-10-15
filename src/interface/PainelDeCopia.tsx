// Cópia de segurança do save em arquivo, sem precisar de login.
import { useState } from 'react'
import { baixar, nomeDoArquivo } from './arquivo.ts'
import type { SaveExportado } from './useJogo.ts'
import { resumoDoSave } from './useJogo.ts'

type Props = {
  readonly temJogo: boolean
  readonly exportar: () => SaveExportado | null
  readonly importar: (texto: string) => void
}

type Pendente = { readonly texto: string; readonly descricao: string }

export function PainelDeCopia({ temJogo, exportar, importar }: Props) {
  const [pendente, setPendente] = useState<Pendente | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)

  async function escolherArquivo(arquivo: File) {
    setMensagem(null)
    const texto = await arquivo.text()
    const resumo = resumoDoSave(texto)
    if (!resumo) {
      setMensagem('Esse arquivo não é um save que o jogo consegue abrir.')
      return
    }
    setPendente({ texto, descricao: `Era ${resumo.era} · ${resumo.especie} nível ${resumo.nivel} · ${resumo.ouro} de ouro` })
  }

  return (
    <section className="painel copia">
      <h3>Cópia de segurança</h3>
      <div className="opcao">
        <button
          disabled={!temJogo}
          onClick={() => {
            // Serializa só no clique: a tela redesenha 10 vezes por segundo.
            const atual = exportar()
            if (atual) baixar(atual.texto, nomeDoArquivo(new Date()))
          }}
        >
          Baixar o save
        </button>
        <label className="botao-de-arquivo">
          Importar de um arquivo
          <input
            type="file"
            accept=".json,application/json"
            onChange={(ev) => {
              const arquivo = ev.target.files?.[0]
              ev.target.value = ''
              if (arquivo) void escolherArquivo(arquivo)
            }}
          />
        </label>
      </div>
      {pendente && (
        <p className="aviso opcao">
          Trocar o jogo atual por este? {pendente.descricao}
          <button
            onClick={() => {
              try {
                importar(pendente.texto)
                setMensagem('Save importado.')
              } catch {
                setMensagem('Não foi possível abrir esse save.')
              }
              setPendente(null)
            }}
          >
            Trocar
          </button>
          <button onClick={() => setPendente(null)}>Cancelar</button>
        </p>
      )}
      {mensagem && <p className="dica">{mensagem}</p>}
    </section>
  )
}
