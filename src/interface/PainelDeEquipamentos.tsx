// Espaços vestidos e peças guardadas do Treinador.
import type { Tipo } from '../conteudo/tipos.ts'
import { EFEITO_POR_RARIDADE, ESPACOS, despir, vestir } from '../engine/equipamentos.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import { EFEITO_DO_ESPACO, NOME_DA_RARIDADE, NOME_DO_ESPACO } from './textos.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly executar: (comando: Comando) => void }

export function PainelDeEquipamentos({ estado, executar }: Props) {
  const { vestidos, guardados } = estado.equipamentos
  return (
    <section className="painel equipamentos">
      <h3>Equipamentos</h3>
      <p>Os chefes de rota às vezes deixam uma peça. Equipamentos não mudam a força das criaturas.</p>
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
    </section>
  )
}
