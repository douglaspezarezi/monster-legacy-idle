// Estima o XP por hora de cada rota aberta aos poucos, uma rota por vez, para a tela não travar.
import { useEffect, useRef, useState } from 'react'
import { CONFIGURACAO } from '../conteudo/jogo.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { criarGerador } from '../engine/aleatorio.ts'
import type { Estimativa, RotaDoMapa } from '../engine/estimativa.ts'
import { estimarXpPorHora, rotasAbertas } from '../engine/estimativa.ts'
import type { EstadoDoJogo } from '../engine/jogo.ts'

// No começo do jogo o nível sobe a cada poucos abates; recalcular mais que isso só gastaria a máquina.
const RECALCULO_MINIMO_MS = 60 * 1000
const PASSO_MS = 30
// Tempo de conta por passo, para sobrar quadro para a cena.
const ORCAMENTO_MS = 8
// Semente fixa: a mesma situação dá sempre a mesma estimativa.
const SEMENTE = 1

export type Estimativas = { readonly lista: readonly Estimativa[]; readonly calculando: boolean }

// O que muda o XP por hora: o monstro ativo, a Era, os equipamentos e as rotas liberadas.
function chaveDe(estado: EstadoDoJogo<Tipo>, rotas: readonly RotaDoMapa[]): string {
  const { ativa } = estado
  return [ativa.id, ativa.especie, ativa.nivel, ativa.despertada === true, estado.era, JSON.stringify(estado.equipamentos.vestidos), rotas.map((r) => `${r.bioma}.${r.rota}`).join(',')].join('|')
}

export function useEstimativas(estado: EstadoDoJogo<Tipo>): Estimativas {
  const [resultado, setResultado] = useState<Estimativas>({ lista: [], calculando: true })
  const ultimo = useRef(estado)
  useEffect(() => {
    ultimo.current = estado
  }, [estado])

  useEffect(() => {
    let fila: RotaDoMapa[] = []
    let parcial: Estimativa[] = []
    let chaveCalculada: string | null = null
    let inicio = -Infinity
    const passo = () => {
      const atual = ultimo.current
      if (fila.length === 0) {
        const rotas = rotasAbertas(CONFIGURACAO, atual)
        const chave = chaveDe(atual, rotas)
        if (chave === chaveCalculada || performance.now() - inicio < RECALCULO_MINIMO_MS) return
        chaveCalculada = chave
        inicio = performance.now()
        fila = rotas
        parcial = []
        setResultado((r) => ({ ...r, calculando: true }))
      }
      const limite = performance.now() + ORCAMENTO_MS
      while (fila.length > 0 && performance.now() < limite) {
        const rota = fila.shift() as RotaDoMapa
        parcial.push({ ...rota, xpPorHora: estimarXpPorHora(CONFIGURACAO, atual, rota, criarGerador(SEMENTE)) })
      }
      if (fila.length === 0) setResultado({ lista: parcial, calculando: false })
    }
    const intervalo = setInterval(passo, PASSO_MS)
    return () => clearInterval(intervalo)
  }, [])

  return resultado
}
