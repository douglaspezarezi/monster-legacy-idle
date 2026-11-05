// Conquistas por grupo, com o progresso e os Diamantes de cada uma, e a compra de espaços na reserva.
import { CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import type { Conquista } from '../engine/conquistas.ts'
import { ESPACOS_POR_COMPRA, PRECO_DOS_ESPACOS, comprarEspacos, impedimentoDosEspacos, progresso } from '../engine/conquistas.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly executar: (comando: Comando) => void }

function porGrupo(conquistas: readonly Conquista[]): [string, Conquista[]][] {
  const grupos = new Map<string, Conquista[]>()
  for (const c of conquistas) grupos.set(c.grupo, [...(grupos.get(c.grupo) ?? []), c])
  return [...grupos]
}

export function PainelDeConquistas({ estado, executar }: Props) {
  const { conquistas, catalogo } = CONFIGURACAO
  const impedimento = impedimentoDosEspacos(estado)
  const pagas = conquistas.filter((c) => estado.conquistas.includes(c.id)).length
  return (
    <section className="painel conquistas">
      <h3>
        Conquistas ({pagas}/{conquistas.length})
      </h3>
      <p>
        {estado.inventario.diamantes} Diamantes · {estado.registro.length} {estado.registro.length === 1 ? 'espécie' : 'espécies'} no registro
      </p>
      <p>
        <button disabled={impedimento !== null} title={impedimento ?? undefined} onClick={() => executar((e) => comprarEspacos(e))}>
          +{ESPACOS_POR_COMPRA} espaços na reserva por {PRECO_DOS_ESPACOS} Diamantes
        </button>
      </p>
      <ul className="lista">
        {porGrupo(conquistas).map(([grupo, lista]) => (
          <li key={grupo} className="grupo">
            <strong>{grupo}</strong>
            <ul>
              {lista.map((c) => {
                const paga = estado.conquistas.includes(c.id)
                const atual = Math.min(progresso(catalogo, estado, c.medida), c.meta)
                return (
                  <li key={c.id} className={paga ? 'paga' : undefined}>
                    <span>
                      {paga ? '✓ ' : ''}
                      {c.nome}
                      {!paga && c.meta > 1 && ` · ${atual.toLocaleString('pt-BR')} / ${c.meta.toLocaleString('pt-BR')}`}
                    </span>
                    <span className="premio">{c.diamantes} Diamantes</span>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
