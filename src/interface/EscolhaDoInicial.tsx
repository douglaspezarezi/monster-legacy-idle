import { CATALOGO } from '../conteudo/jogo.ts'
import { INICIAIS } from '../conteudo/especies.ts'
import { especieDo } from '../engine/especie.ts'
import { Retrato } from './Retrato.tsx'

type Props = { readonly aoEscolher: (especie: string) => void }

export function EscolhaDoInicial({ aoEscolher }: Props) {
  return (
    <section className="painel escolha">
      <h2>Escolha seu primeiro monstro</h2>
      <p>A caçada começa na Mata Funda, terra do tipo Brota.</p>
      <div className="iniciais">
        {INICIAIS.map((nome) => {
          const especie = especieDo(CATALOGO, nome)
          return (
            <button key={nome} className="inicial" onClick={() => aoEscolher(nome)}>
              <Retrato especie={nome} tipos={especie.tipos} tamanho={80} />
              <strong>{nome}</strong>
              <span>{especie.tipos.join(' / ')}</span>
              <small>{especie.tecnicas.join(', ')}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}
