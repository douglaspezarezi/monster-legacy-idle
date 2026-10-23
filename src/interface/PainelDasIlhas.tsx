// Ilhas Lendárias: a ativa enfrenta os 10 andares de uma vez e o resultado aparece aqui.
import { useState } from 'react'
import { CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { ERA_DAS_ILHAS, FRAGMENTOS_POR_ANDAR, explorarIlha, impedimentoDaIlha } from '../engine/ilhas.ts'
import type { ResultadoDaIlha } from '../engine/ilhas.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'
import { NOME_DA_RARIDADE } from './textos.ts'
import type { Comando } from './useJogo.ts'

type Props = { readonly estado: EstadoDoJogo<Tipo>; readonly executar: (comando: Comando) => void }

type Ultima = Omit<ResultadoDaIlha<Tipo>, 'estado'> & { readonly ilha: string; readonly guardiao: string | undefined }

export function PainelDasIlhas({ estado, executar }: Props) {
  const [ultima, setUltima] = useState<Ultima | null>(null)
  if (estado.era < ERA_DAS_ILHAS && estado.inventario.chaves === 0) return null
  const impedimento = impedimentoDaIlha(estado)

  function entrar(indice: number) {
    executar((e, t, g) => {
      const { estado: depois, ...resultado } = explorarIlha(CONFIGURACAO, e, indice, t, g)
      const ilha = CONFIGURACAO.ilhas[indice]
      setUltima({ ...resultado, ilha: ilha.nome, guardiao: ilha.guardioes[resultado.andaresVencidos] })
      return depois
    })
  }

  return (
    <section className="painel ilhas">
      <h3>Ilhas Lendárias · {estado.inventario.chaves} Chaves</h3>
      <p>
        A Chave da Ilha cai na rota 5. O monstro ativo entra com a vida cheia e enfrenta 10 guardiões seguidos, do nível 155 ao 200, sem
        recuperar Vida entre eles, a não ser pelos Tônicos de Cura. Cada andar vencido dá {FRAGMENTOS_POR_ANDAR} Fragmentos; o andar 10 dá
        uma matriz lendária, às vezes mítica. Perder só expulsa da ilha.
      </p>
      <div className="botoes">
        {CONFIGURACAO.ilhas.map((ilha, i) => (
          <button
            key={ilha.nome}
            disabled={impedimento !== null}
            title={impedimento ?? `Guardiões: ${[...new Set(ilha.guardioes)].join(', ')}`}
            onClick={() => entrar(i)}
          >
            {ilha.nome}
          </button>
        ))}
      </div>
      {ultima && (
        <p className="aviso">
          {ultima.ilha}: {ultima.andaresVencidos} de 10 andares
          {ultima.guardiao ? `, expulso por ${ultima.guardiao}` : ''}. +{ultima.fragmentos} Fragmentos
          {ultima.tonicosDeCuraUsados > 0 ? `, ${ultima.tonicosDeCuraUsados} Tônicos de Cura usados` : ''}
          {ultima.matriz ? `. Matriz: ${ultima.matriz.especie} ${NOME_DA_RARIDADE[ultima.matriz.raridade]}!` : '.'}
        </p>
      )}
    </section>
  )
}
