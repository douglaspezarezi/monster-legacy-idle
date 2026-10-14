// Luta 1 contra 1 em tempo contínuo (GDD, seção 5).
import type { Atributos } from './criatura.ts'
import type { Tecnica } from './dano.ts'
import { PODER_DO_ATAQUE_BASICO, calcularDano, intervaloDeAcao } from './dano.ts'
import type { TabelaDeTipos } from './multiplicador-de-tipo.ts'
import { multiplicadorDeTipo } from './multiplicador-de-tipo.ts'
import { escolherTecnica } from './tecnicas.ts'

export type Combatente<Tipo extends string> = {
  readonly especie: string
  readonly tipos: readonly Tipo[]
  readonly atributos: Atributos
  // Em ordem de prioridade, no máximo 4.
  readonly tecnicas: readonly Tecnica<Tipo>[]
  readonly vida: number
}

// Instante da próxima ação e, por técnica, o instante em que a recarga termina.
export type Ritmo = {
  readonly proximaAcao: number
  readonly prontaEm: readonly number[]
}

// Luta em andamento; fica guardada no estado da caçada entre um período e outro.
export type Luta<Tipo extends string> = {
  readonly jogador: Combatente<Tipo>
  readonly selvagem: Combatente<Tipo>
  readonly ritmoDoJogador: Ritmo
  readonly ritmoDoSelvagem: Ritmo
}

// Gatilho como fração da Vida máxima.
export type Cura = {
  readonly gatilho: number
  readonly tonicos: number
}

export const CURA_DO_TONICO = 0.5
const SEM_CURA: Cura = { gatilho: 0, tonicos: 0 }

export type AvancoDaLuta<Tipo extends string> = {
  readonly luta: Luta<Tipo>
  // null quando o limite chega antes de alguém cair; a luta continua depois.
  readonly vencedor: 'jogador' | 'selvagem' | null
  readonly instante: number
  readonly tonicosDeCuraUsados: number
}

export type ResultadoDaLuta = {
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

function ritmoInicial<Tipo extends string>(combatente: Combatente<Tipo>, oponente: Combatente<Tipo>, inicio: number): Ritmo {
  const intervalo = intervaloDeAcao(combatente.atributos.velocidade, oponente.atributos.velocidade)
  return { proximaAcao: inicio + intervalo, prontaEm: combatente.tecnicas.map(() => inicio) }
}

export function iniciarLuta<Tipo extends string>(jogador: Combatente<Tipo>, selvagem: Combatente<Tipo>, inicio: number): Luta<Tipo> {
  return {
    jogador,
    selvagem,
    ritmoDoJogador: ritmoInicial(jogador, selvagem, inicio),
    ritmoDoSelvagem: ritmoInicial(selvagem, jogador, inicio),
  }
}

function lado<Tipo extends string>(combatente: Combatente<Tipo>, oponente: Combatente<Tipo>, ritmo: Ritmo): Lado<Tipo> {
  return {
    combatente,
    intervalo: intervaloDeAcao(combatente.atributos.velocidade, oponente.atributos.velocidade),
    prontaEm: [...ritmo.prontaEm],
    proximaAcao: ritmo.proximaAcao,
    vida: combatente.vida,
  }
}

// Cada lado age a cada intervalo; quando os dois agem no mesmo instante, o jogador vem primeiro.
// O Tônico de Cura entra logo depois do golpe que deixa o jogador abaixo do gatilho, sem gastar a vez dele.
export function avancarLuta<Tipo extends string>(
  tabela: TabelaDeTipos<Tipo>,
  luta: Luta<Tipo>,
  limite: number,
  cura: Cura = SEM_CURA,
): AvancoDaLuta<Tipo> {
  const j = lado(luta.jogador, luta.selvagem, luta.ritmoDoJogador)
  const s = lado(luta.selvagem, luta.jogador, luta.ritmoDoSelvagem)
  const vidaMaxima = luta.jogador.atributos.vida
  let tonicosDeCuraUsados = 0
  const avanco = (vencedor: AvancoDaLuta<Tipo>['vencedor'], instante: number): AvancoDaLuta<Tipo> => ({
    luta: {
      jogador: { ...luta.jogador, vida: j.vida },
      selvagem: { ...luta.selvagem, vida: s.vida },
      ritmoDoJogador: { proximaAcao: j.proximaAcao, prontaEm: j.prontaEm },
      ritmoDoSelvagem: { proximaAcao: s.proximaAcao, prontaEm: s.prontaEm },
    },
    vencedor,
    instante,
    tonicosDeCuraUsados,
  })

  for (;;) {
    const vezDoJogador = j.proximaAcao <= s.proximaAcao
    const [atacante, defensor] = vezDoJogador ? [j, s] : [s, j]
    const agora = atacante.proximaAcao
    if (agora > limite) return avanco(null, limite)

    agir(tabela, atacante, defensor, agora)
    atacante.proximaAcao += atacante.intervalo
    if (defensor.vida === 0) return avanco(vezDoJogador ? 'jogador' : 'selvagem', agora)
    if (!vezDoJogador && j.vida < vidaMaxima * cura.gatilho && tonicosDeCuraUsados < cura.tonicos) {
      j.vida = Math.min(vidaMaxima, j.vida + vidaMaxima * CURA_DO_TONICO)
      tonicosDeCuraUsados++
    }
  }
}

// Luta inteira de uma vez, sem cura.
export function lutar<Tipo extends string>(
  tabela: TabelaDeTipos<Tipo>,
  jogador: Combatente<Tipo>,
  selvagem: Combatente<Tipo>,
  inicio: number,
  limite: number,
): ResultadoDaLuta {
  const { luta, vencedor, instante } = avancarLuta(tabela, iniciarLuta(jogador, selvagem, inicio), limite)
  return { vencedor, fim: instante, vidaDoJogador: luta.jogador.vida, vidaDoSelvagem: luta.selvagem.vida }
}
