// Luta 1 contra 1 em tempo contínuo (GDD, seção 5).
import type { Atributos } from './criatura.ts'
import type { Tecnica } from './dano.ts'
import { PODER_DO_ATAQUE_BASICO, calcularDano, intervaloDeAcao } from './dano.ts'
import type { TabelaDeTipos } from './multiplicador-de-tipo.ts'
import { multiplicadorDeTipo } from './multiplicador-de-tipo.ts'
import { escolherTecnica } from './tecnicas.ts'

export type Combatente<Tipo extends string> = {
  readonly tipos: readonly Tipo[]
  readonly atributos: Atributos
  // Em ordem de prioridade, no máximo 4.
  readonly tecnicas: readonly Tecnica<Tipo>[]
  readonly vida: number
}

export type ResultadoDaLuta = {
  // null quando o tempo limite chega antes de alguém cair.
  readonly vencedor: 'jogador' | 'selvagem' | null
  readonly fim: number
  readonly vidaDoJogador: number
  readonly vidaDoSelvagem: number
}

const ATAQUE_BASICO = {
  nome: 'ataque básico',
  tipo: null,
  categoria: 'fisica',
  poder: PODER_DO_ATAQUE_BASICO,
  recargaMs: 0,
} as const

type Lado<Tipo extends string> = {
  readonly combatente: Combatente<Tipo>
  readonly intervalo: number
  readonly prontaEm: number[]
  proximaAcao: number
  vida: number
}

function agir<Tipo extends string>(tabela: TabelaDeTipos<Tipo>, atacante: Lado<Tipo>, defensor: Lado<Tipo>, agora: number): void {
  const indice = escolherTecnica(atacante.prontaEm, agora)
  const tecnica = indice === null ? ATAQUE_BASICO : atacante.combatente.tecnicas[indice]
  if (indice !== null) atacante.prontaEm[indice] = agora + tecnica.recargaMs

  const a = atacante.combatente.atributos
  const d = defensor.combatente.atributos
  const [ataque, defesa] = tecnica.categoria === 'fisica' ? [a.ataque, d.defesa] : [a.foco, d.foco]
  const tipo = tecnica.tipo === null ? 1 : multiplicadorDeTipo(tabela, tecnica.tipo, defensor.combatente.tipos)
  defensor.vida = Math.max(0, defensor.vida - calcularDano(ataque, defesa, tecnica.poder, tipo))
}

function criarLado<Tipo extends string>(combatente: Combatente<Tipo>, oponente: Combatente<Tipo>, inicio: number): Lado<Tipo> {
  const intervalo = intervaloDeAcao(combatente.atributos.velocidade, oponente.atributos.velocidade)
  return {
    combatente,
    intervalo,
    prontaEm: combatente.tecnicas.map(() => inicio),
    proximaAcao: inicio + intervalo,
    vida: combatente.vida,
  }
}

// Cada lado age a cada intervalo; quando os dois agem no mesmo instante, o jogador vem primeiro.
export function lutar<Tipo extends string>(
  tabela: TabelaDeTipos<Tipo>,
  jogador: Combatente<Tipo>,
  selvagem: Combatente<Tipo>,
  inicio: number,
  limite: number,
): ResultadoDaLuta {
  const j = criarLado(jogador, selvagem, inicio)
  const s = criarLado(selvagem, jogador, inicio)
  const resultado = (vencedor: ResultadoDaLuta['vencedor'], fim: number): ResultadoDaLuta => ({
    vencedor,
    fim,
    vidaDoJogador: j.vida,
    vidaDoSelvagem: s.vida,
  })

  for (;;) {
    const vezDoJogador = j.proximaAcao <= s.proximaAcao
    const [atacante, defensor] = vezDoJogador ? [j, s] : [s, j]
    const agora = atacante.proximaAcao
    if (agora > limite) return resultado(null, limite)

    agir(tabela, atacante, defensor, agora)
    if (defensor.vida === 0) return resultado(vezDoJogador ? 'jogador' : 'selvagem', agora)
    atacante.proximaAcao += atacante.intervalo
  }
}
