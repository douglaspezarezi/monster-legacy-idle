// Espaços vestidos e peças guardadas do Treinador.
import { useState } from 'react'
import { CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import type { Espaco } from '../engine/equipamentos.ts'
import { EFEITO_POR_RARIDADE, ESPACOS, despir, vestir } from '../engine/equipamentos.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import type { RaridadeDaEncomenda } from '../engine/pesca.ts'
import { PRECO_DA_ENCOMENDA, RARIDADES_DA_ENCOMENDA, encomendar, impedimentoDaEncomenda, raridadeMaximaDaEncomenda } from '../engine/pesca.ts'
import { EFEITO_DO_ESPACO, NOME_DA_RARIDADE, NOME_DO_ESPACO } from './textos.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly executar: (comando: Comando) => void }

// Escolha do espaço e da raridade; a raridade fica no limite das rotas liberadas.
function Encomenda({ estado, executar }: Props) {
  const maxima = raridadeMaximaDaEncomenda(CONFIGURACAO.rotas, estado)
  const permitidas = maxima ? RARIDADES_DA_ENCOMENDA.slice(0, RARIDADES_DA_ENCOMENDA.indexOf(maxima) + 1) : []
  const [espaco, setEspaco] = useState<Espaco>('cabeca')
  const [escolhida, setEscolhida] = useState<RaridadeDaEncomenda | null>(null)
  const raridade = escolhida && permitidas.includes(escolhida) ? escolhida : (maxima ?? 'comum')
  const impedimento = impedimentoDaEncomenda(CONFIGURACAO.rotas, estado, raridade)
  return (
    <>
      <h4>Encomenda</h4>
      <p>
        {estado.inventario.perolas} {estado.inventario.perolas === 1 ? 'Pérola' : 'Pérolas'}. A Pesca, na base, produz Pérolas; a encomenda vai até a raridade da rota mais alta liberada.
      </p>
      <div className="encomenda">
        <select value={espaco} onChange={(ev) => setEspaco(ev.target.value as Espaco)}>
          {ESPACOS.map((e) => (
            <option key={e} value={e}>
              {NOME_DO_ESPACO[e]}
            </option>
          ))}
        </select>
        <select value={raridade} disabled={permitidas.length === 0} onChange={(ev) => setEscolhida(ev.target.value as RaridadeDaEncomenda)}>
          {permitidas.map((r) => (
            <option key={r} value={r}>
              {NOME_DA_RARIDADE[r]} · {EFEITO_POR_RARIDADE[r]}% · {PRECO_DA_ENCOMENDA[r]} Pérolas
            </option>
          ))}
        </select>
        <button disabled={impedimento !== null} title={impedimento ?? undefined} onClick={() => executar((e) => encomendar(CONFIGURACAO.rotas, e, espaco, raridade))}>
          Encomendar
        </button>
      </div>
    </>
  )
}

export function PainelDeEquipamentos({ estado, executar }: Props) {
  const { vestidos, guardados } = estado.equipamentos
  return (
    <section className="painel equipamentos">
      <h3>Equipamentos</h3>
      <p>Os chefes de rota às vezes deixam uma peça, e as Pérolas encomendam a do espaço escolhido. Equipamentos não mudam a força dos monstros.</p>
      <ul className="lista">
        {ESPACOS.map((espaco) => {
          const peca = vestidos[espaco]
          return (
            <li key={espaco}>
              <span>
                {NOME_DO_ESPACO[espaco]}:{' '}
                {peca ? `${NOME_DA_RARIDADE[peca.raridade]}, ${EFEITO_POR_RARIDADE[peca.raridade]}% ${EFEITO_DO_ESPACO[espaco]}` : 'vazio'}
              </span>
              {peca && <button onClick={() => executar((e) => despir(e, espaco))}>Tirar</button>}
            </li>
          )
        })}
      </ul>
      {guardados.length > 0 && (
        <>
          <h4>Guardados</h4>
          <ul className="lista">
            {guardados.map((peca, i) => (
              <li key={i}>
                <span>
                  {NOME_DO_ESPACO[peca.espaco]} {NOME_DA_RARIDADE[peca.raridade]} · {EFEITO_POR_RARIDADE[peca.raridade]}%{' '}
                  {EFEITO_DO_ESPACO[peca.espaco]}
                </span>
                <button onClick={() => executar((e) => vestir(e, i))}>Vestir</button>
              </li>
            ))}
          </ul>
        </>
      )}
      <Encomenda estado={estado} executar={executar} />
    </section>
  )
}
