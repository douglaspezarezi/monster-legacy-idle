// Escolha da espécie e dos genes herdados para dois pais selecionados na reserva.
import { useState } from 'react'
import { CATALOGO } from '../conteudo/jogo.ts'
import { LINHAGENS } from '../conteudo/linhagens.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { primeiraForma } from '../engine/evolucao.ts'
import { GENES_HERDADOS, GENES_HERDADOS_COM_PEDRA, cruzar, linhagemDe, mesmaLinhagem, taxaDeCruzamento, tecnicasDoCruzamento } from '../engine/cruzamento.ts'
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
function melhoresAtributos(a: Membro, b: Membro, quantos: number): Atributo[] {
  const maior = (atributo: Atributo) => Math.max(a.genes[atributo], b.genes[atributo])
  return [...ATRIBUTOS].sort((x, y) => maior(y) - maior(x)).slice(0, quantos)
}

export function PainelDeCruzamento({ estado, pais, executar, aoCruzar }: Props) {
  const [a, b] = pais
  const [especieDe, setEspecieDe] = useState(a.id)
  const [herdados, setHerdados] = useState<readonly Atributo[]>(() => melhoresAtributos(a, b, GENES_HERDADOS))
  const [escolhida, setEscolhida] = useState('')
  const [comPedra, setComPedra] = useState(false)

  const compativeis = mesmaLinhagem(LINHAGENS, a.especie, b.especie)
  const taxa = taxaDeCruzamento(estado)
  const semOuro = estado.inventario.ouro < taxa
  // Sem Pedra no inventário, a marcação não vale.
  const pedra = comPedra && estado.inventario.pedrasDoDestino > 0
  const quantos = pedra ? GENES_HERDADOS_COM_PEDRA : GENES_HERDADOS
  const especie = primeiraForma(CATALOGO, especieDe === a.id ? a.especie : b.especie)
  const herdaveis = compativeis ? tecnicasDoCruzamento(CATALOGO, a, b, especie) : []
  // Trocar a espécie pode tirar a técnica escolhida da lista.
  const tecnicaHerdada = herdaveis.includes(escolhida) ? escolhida : undefined
  const pronto = compativeis && !semOuro && herdados.length === quantos

  function alternar(atributo: Atributo) {
    setHerdados((atuais) =>
      atuais.includes(atributo) ? atuais.filter((x) => x !== atributo) : atuais.length < quantos ? [...atuais, atributo] : atuais,
    )
  }

  function alternarPedra(ligada: boolean) {
    setComPedra(ligada)
    setHerdados(melhoresAtributos(a, b, ligada ? GENES_HERDADOS_COM_PEDRA : GENES_HERDADOS))
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
      {estado.inventario.pedrasDoDestino > 0 && (
        <label className="opcao">
          <input type="checkbox" checked={pedra} onChange={(ev) => alternarPedra(ev.target.checked)} />
          Gastar uma Pedra do Destino para herdar {GENES_HERDADOS_COM_PEDRA} atributos ({estado.inventario.pedrasDoDestino} no inventário)
        </label>
      )}
      <p>Escolha {quantos} atributos para herdar o maior gene dos pais; os outros são sorteados de 1 a 20.</p>
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
      <label className="opcao">
        Técnica herdada
        <select value={tecnicaHerdada ?? ''} onChange={(ev) => setEscolhida(ev.target.value)} disabled={herdaveis.length === 0}>
          <option value="">Nenhuma</option>
          {herdaveis.map((nome) => (
            <option key={nome} value={nome}>
              {nome} ({CATALOGO.tecnicas[nome]?.tipo})
            </option>
          ))}
        </select>
      </label>
      <p className="dica">O filhote nasce sabendo uma técnica da fila de um dos pais, que ele usa primeiro. A do Despertar não passa.</p>
      <button
        disabled={!pronto}
        onClick={() => {
          executar((e, t, g) => cruzar(e, CATALOGO, LINHAGENS, { paiA: a.id, paiB: b.id, especieDe, herdados, tecnicaHerdada, pedraDoDestino: pedra }, t, g))
          aoCruzar()
        }}
      >
        Cruzar por {taxa} de ouro
      </button>
    </div>
  )
}
