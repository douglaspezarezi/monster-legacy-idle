// Pergaminhos: escolha do monstro, a fila dele e as técnicas que os Pergaminhos ensinam.
import { useState } from 'react'
import { CATALOGO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { aprenderTecnica, esquecerTecnica, impedimentoDoAprendizado } from '../engine/aprendizado.ts'
import { combatenteDe } from '../engine/criatura.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly executar: (comando: Comando) => void }

export function PainelDosPergaminhos({ estado, executar }: Props) {
  const [escolhido, setEscolhido] = useState(estado.ativa.id)
  const membros = [estado.ativa, ...estado.reserva]
  // Se o escolhido saiu da reserva, volta para a ativa.
  const membro = membros.find((m) => m.id === escolhido) ?? estado.ativa
  const pergaminhos = Object.entries(estado.inventario.pergaminhos).filter(([, quantidade]) => quantidade > 0)
  if (pergaminhos.length === 0 && membros.every((m) => m.tecnicaAprendida === undefined)) return null
  const fila = combatenteDe(CATALOGO, membro).tecnicas

  return (
    <section className="painel pergaminhos">
      <h3>Pergaminhos</h3>
      <p>
        Os chefes de rota às vezes deixam um Pergaminho, de uma técnica do tipo do bioma. Ele ensina a técnica a qualquer monstro, que passa a
        usá-la primeiro; aprender outra apaga a anterior, e esquecer é livre.
      </p>
      <label className="opcao">
        Monstro
        <select value={membro.id} onChange={(ev) => setEscolhido(Number(ev.target.value))}>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.especie} · nível {m.nivel}
              {m.id === estado.ativa.id ? ' (ativo)' : ''}
            </option>
          ))}
        </select>
      </label>
      <p>
        Fila: {fila.map((t) => `${t.nome} (${t.tipo})`).join(', ')}
        {membro.tecnicaAprendida !== undefined && (
          <>
            {' '}
            <button onClick={() => executar((e, t) => esquecerTecnica(e, membro.id, t))}>Esquecer {membro.tecnicaAprendida}</button>
          </>
        )}
      </p>
      {pergaminhos.length > 0 && (
        <ul className="lista">
          {pergaminhos.map(([tecnica, quantidade]) => {
            const impedimento = impedimentoDoAprendizado(CATALOGO, estado, membro.id, tecnica)
            const dados = CATALOGO.tecnicas[tecnica]
            return (
              <li key={tecnica}>
                <span>
                  {tecnica} · {dados?.tipo}, poder {dados?.poder} · {quantidade}
                </span>
                <button
                  disabled={impedimento !== null}
                  title={impedimento ?? `Ensina ${tecnica} a ${membro.especie}`}
                  onClick={() => executar((e, t) => aprenderTecnica(CATALOGO, e, membro.id, tecnica, t))}
                >
                  Ensinar
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
