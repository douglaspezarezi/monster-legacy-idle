// Volumes, opacidade do vidro e modo leve, guardados neste navegador.
import { LAYOUT_PADRAO } from './layout.ts'
import type { Preferencias } from './preferencias.ts'
import { OPACIDADE_MINIMA } from './preferencias.ts'

type Props = {
  readonly preferencias: Preferencias
  readonly mudar: (campos: Partial<Preferencias>) => void
  readonly editando: boolean
  readonly aoEditar: (ligado: boolean) => void
}

function Controle({ rotulo, valor, minimo, aoMudar }: { readonly rotulo: string; readonly valor: number; readonly minimo: number; readonly aoMudar: (valor: number) => void }) {
  return (
    <label className="controle">
      <span>{rotulo}</span>
      <input type="range" min={minimo * 100} max={100} step={5} value={Math.round(valor * 100)} onChange={(ev) => aoMudar(Number(ev.target.value) / 100)} />
      <output>{Math.round(valor * 100)}%</output>
    </label>
  )
}

export function PainelDePreferencias({ preferencias, mudar, editando, aoEditar }: Props) {
  return (
    <section className="painel preferencias">
      <h3>Preferências</h3>
      <Controle rotulo="Música" valor={preferencias.volumeDaMusica} minimo={0} aoMudar={(v) => mudar({ volumeDaMusica: v })} />
      <Controle rotulo="Efeitos" valor={preferencias.volumeDosEfeitos} minimo={0} aoMudar={(v) => mudar({ volumeDosEfeitos: v })} />
      <Controle rotulo="Vidro" valor={preferencias.opacidadeDoVidro} minimo={OPACIDADE_MINIMA} aoMudar={(v) => mudar({ opacidadeDoVidro: v })} />
      <label className="opcao">
        <input type="checkbox" checked={preferencias.modoLeve} onChange={(ev) => mudar({ modoLeve: ev.target.checked })} />
        Modo leve: sem a cena da caçada
      </label>
      <div className="opcao">
        <label>
          <input type="checkbox" checked={editando} onChange={(ev) => aoEditar(ev.target.checked)} /> Editar layout: arrastar e escalar os painéis
        </label>
        <button onClick={() => mudar({ layout: LAYOUT_PADRAO })}>Restaurar layout</button>
      </div>
      <p className="dica">O som começa no primeiro clique na página. Com a aba escondida, a caçada continua e o som para.</p>
    </section>
  )
}
