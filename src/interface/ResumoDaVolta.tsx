import type { Volta } from './useJogo.ts'
import { formatarDuracao } from './textos.ts'

type Props = { readonly volta: Volta; readonly aoFechar: () => void }

export function ResumoDaVolta({ volta, aoFechar }: Props) {
  const { resumo } = volta
  const limitado = volta.creditadoMs < volta.foraMs
  return (
    <section className="painel volta">
      <h2>De volta à caçada</h2>
      <p>
        Você ficou fora por {formatarDuracao(volta.foraMs)}
        {limitado ? `; foram creditadas as últimas ${formatarDuracao(volta.creditadoMs)}.` : '.'}
      </p>
      <dl>
        <dt>Abates</dt>
        <dd>{resumo.abates}</dd>
        <dt>XP</dt>
        <dd>{resumo.xp}</dd>
        <dt>Níveis ganhos</dt>
        <dd>{resumo.niveis}</dd>
        <dt>Ouro da caçada</dt>
        <dd>{resumo.ouro}</dd>
        <dt>Ouro da Forja</dt>
        <dd>{volta.ouroDaForja}</dd>
        <dt>Fragmentos da Mina</dt>
        <dd>{volta.fragmentosDaMina}</dd>
        <dt>Capturas</dt>
        <dd>{resumo.capturas}</dd>
        <dt>Matrizes</dt>
        <dd>{resumo.matrizes}</dd>
        <dt>Derrotas</dt>
        <dd>{resumo.derrotas}</dd>
        <dt>Equipamentos</dt>
        <dd>{resumo.equipamentos}</dd>
        <dt>Essências</dt>
        <dd>{resumo.essencias}</dd>
        <dt>Chaves da Ilha</dt>
        <dd>{resumo.chaves}</dd>
      </dl>
      <button onClick={aoFechar}>Continuar</button>
    </section>
  )
}
