// Escolha da espécie e dos genes herdados para dois pais selecionados na reserva.
import { useState } from 'react'
import { CATALOGO } from '../conteudo/jogo.ts'
import { LINHAGENS } from '../conteudo/linhagens.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { primeiraForma } from '../engine/evolucao.ts'
import { GENES_HERDADOS, cruzar, linhagemDe, mesmaLinhagem, taxaDeCruzamento } from '../engine/cruzamento.ts'
import type { Atributo } from '../engine/genes.ts'
import { ATRIBUTOS } from '../engine/genes.ts'
import type { EstadoDoJogo, Membro } from '../engine/jogo.ts'
import { NOME_DO_ATRIBUTO } from './textos.ts'
import type { Comando } from './useJogo.ts'

type Props = {
  readonly estado: EstadoDoJogo<Tipo>
  readonly pais: readonly [Membro, Membro]
  readonly executar: (comando: Comando) => void
  readonly aoCruzar: () => void
}

// Os atributos em que os pais têm o maior gene vêm marcados.
function melhoresAtributos(a: Membro, b: Membro): Atributo[] {
  const maior = (atributo: Atributo) => Math.max(a.genes[atributo], b.genes[atributo])
  return [...ATRIBUTOS].sort((x, y) => maior(y) - maior(x)).slice(0, GENES_HERDADOS)
}

export function PainelDeCruzamento({ estado, pais, executar, aoCruzar }: Props) {
  const [a, b] = pais
  const [especieDe, setEspecieDe] = useState(a.id)
  const [herdados, setHerdados] = useState<readonly Atributo[]>(() => melhoresAtributos(a, b))

  const compativeis = mesmaLinhagem(LINHAGENS, a.especie, b.especie)
  const taxa = taxaDeCruzamento(estado)
  const semOuro = estado.inventario.ouro < taxa
  const pronto = compativeis && !semOuro && herdados.length === GENES_HERDADOS

  function alternar(atributo: Atributo) {
    setHerdados((atuais) =>
      atuais.includes(atributo) ? atuais.filter((x) => x !== atributo) : atuais.length < GENES_HERDADOS ? [...atuais, atributo] : atuais,
    )
  }

  return (
    <div className="cruzamento">
      {compativeis ? (
        <p>Linhagem {linhagemDe(LINHAGENS, a.especie)?.nome}. Os dois pais deixam a reserva para sempre.</p>
      ) : (
        <p className="aviso">
          {a.especie} e {b.especie} são de linhagens diferentes.
        </p>
      )}
      <div className="opcao">
        Espécie do filhote:
        {pais.map((pai) => (
          <label key={pai.id}>
            <input type="radio" checked={especieDe === pai.id} onChange={() => setEspecieDe(pai.id)} /> {primeiraForma(CATALOGO, pai.especie)}
          </label>
        ))}
      </div>
      <p>Escolha {GENES_HERDADOS} atributos para herdar o maior gene dos pais; os outros são sorteados de 1 a 20.</p>
      <ul className="lista">
        {ATRIBUTOS.map((atributo) => {
          const marcado = herdados.includes(atributo)
          return (
            <li key={atributo}>
              <label className="opcao">
                <input type="checkbox" checked={marcado} onChange={() => alternar(atributo)} />
                {NOME_DO_ATRIBUTO[atributo]}
              </label>
              <span>
                {a.genes[atributo]} e {b.genes[atributo]} → {marcado ? Math.max(a.genes[atributo], b.genes[atributo]) : '1 a 20'}
              </span>
            </li>
          )
        })}
      </ul>
      <button
        disabled={!pronto}
        onClick={() => {
          executar((e, _t, g) => cruzar(e, CATALOGO, LINHAGENS, { paiA: a.id, paiB: b.id, especieDe, herdados }, g))
          aoCruzar()
        }}
      >
        Cruzar por {taxa} de ouro
      </button>
    </div>
  )
}
