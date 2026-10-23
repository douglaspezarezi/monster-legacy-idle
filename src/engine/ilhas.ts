// Ilhas Lendárias: masmorras solo da Era 4 (GDD, seção 11).
import type { Gerador } from './aleatorio.ts'
import type { Combatente } from './combate.ts'
import { avancarLuta, iniciarLuta } from './combate.ts'
import { combatenteDe } from './criatura.ts'
import type { Catalogo } from './especie.ts'
import type { Raridade } from './genes.ts'
import type { EstadoDoJogo } from './jogo.ts'
import { semEncontro, vidaMaxima } from './jogo.ts'
import type { TabelaDeTipos } from './multiplicador-de-tipo.ts'
import type { Matriz } from './nascimento.ts'
import { criarCriatura } from './nascimento.ts'

export type DadosDeIlha = {
  readonly nome: string
  // Espécie do guardião de cada andar; índice 0 para o andar 1.
  readonly guardioes: readonly string[]
}

export type ConfiguracaoDasIlhas<Tipo extends string> = {
  readonly tabela: TabelaDeTipos<Tipo>
  readonly catalogo: Catalogo<Tipo>
  readonly ilhas: readonly DadosDeIlha[]
}

export const ERA_DAS_ILHAS = 4
export const FRAGMENTOS_POR_ANDAR = 30
export const VIDA_DO_GUARDIAO = 4
// Ataque e Foco do guardião são divididos por este valor.
export const DIVISOR_DE_DANO_DO_GUARDIAO = 2
export const CHANCE_DE_MITICA = 0.1

// Do nível 155 no andar 1 ao 200 no andar 10.
export function nivelDoGuardiao(andar: number): number {
  return 150 + 5 * andar
}

// Épico nos andares comuns, lendário no último.
export function raridadeDoGuardiao(ilha: DadosDeIlha, andar: number): Raridade {
  return andar === ilha.guardioes.length ? 'lendaria' : 'epica'
}

export function guardiao<Tipo extends string>(catalogo: Catalogo<Tipo>, ilha: DadosDeIlha, andar: number, gerador: Gerador): Combatente<Tipo> {
  const especie = ilha.guardioes[andar - 1]
  if (especie === undefined) throw new RangeError(`andar inexistente: ${andar}`)
  const base = combatenteDe(catalogo, criarCriatura(gerador, especie, raridadeDoGuardiao(ilha, andar), nivelDoGuardiao(andar)))
  const atributos = {
    ...base.atributos,
    vida: base.atributos.vida * VIDA_DO_GUARDIAO,
    ataque: base.atributos.ataque / DIVISOR_DE_DANO_DO_GUARDIAO,
    foco: base.atributos.foco / DIVISOR_DE_DANO_DO_GUARDIAO,
  }
  return { ...base, atributos, vida: atributos.vida }
}

export type ResultadoDaIlha<Tipo extends string> = {
  readonly estado: EstadoDoJogo<Tipo>
  readonly andaresVencidos: number
  readonly fragmentos: number
  readonly tonicosDeCuraUsados: number
  // Só quando vence o último andar.
  readonly matriz: Matriz | null
}

// Por que a ativa ainda não pode entrar numa ilha; null quando pode.
export function impedimentoDaIlha<Tipo extends string>(estado: EstadoDoJogo<Tipo>): string | null {
  if (estado.era < ERA_DAS_ILHAS) return `as ilhas abrem na Era ${ERA_DAS_ILHAS}`
  if (estado.inventario.chaves < 1) return 'precisa de uma Chave da Ilha'
  return null
}

// A ativa entra com a vida cheia e enfrenta os andares na hora; a Vida só volta com Tônicos de Cura.
// Perder expulsa sem perda de XP e sem Fadiga. A luta da caçada acaba e a ativa volta a ela com a vida cheia.
export function explorarIlha<Tipo extends string>(
  configuracao: ConfiguracaoDasIlhas<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  indice: number,
  agora: number,
  gerador: Gerador,
): ResultadoDaIlha<Tipo> {
  const ilha = configuracao.ilhas[indice]
  if (!ilha) throw new RangeError(`ilha inexistente: ${indice}`)
  const impedimento = impedimentoDaIlha(estado)
  if (impedimento) throw new RangeError(`não pode entrar: ${impedimento}`)

  const jogador = combatenteDe(configuracao.catalogo, estado.ativa)
  let vida = jogador.vida
  let tonicosDeCuraUsados = 0
  let andaresVencidos = 0
  for (let andar = 1; andar <= ilha.guardioes.length; andar++) {
    const luta = iniciarLuta({ ...jogador, vida }, guardiao(configuracao.catalogo, ilha, andar, gerador), 0)
    const cura = { gatilho: estado.gatilhoDeCura, tonicos: estado.inventario.tonicosDeCura - tonicosDeCuraUsados }
    const avanco = avancarLuta(configuracao.tabela, luta, Infinity, cura)
    tonicosDeCuraUsados += avanco.tonicosDeCuraUsados
    vida = avanco.luta.jogador.vida
    if (avanco.vencedor !== 'jogador') break
    andaresVencidos++
  }

  const final = ilha.guardioes[ilha.guardioes.length - 1]
  const venceu = andaresVencidos === ilha.guardioes.length
  const matriz: Matriz | null = venceu ? { especie: final, raridade: gerador() < CHANCE_DE_MITICA ? 'mitica' : 'lendaria' } : null
  const fragmentos = andaresVencidos * FRAGMENTOS_POR_ANDAR
  const inventario = {
    ...estado.inventario,
    chaves: estado.inventario.chaves - 1,
    fragmentos: estado.inventario.fragmentos + fragmentos,
    tonicosDeCura: estado.inventario.tonicosDeCura - tonicosDeCuraUsados,
    matrizes: matriz ? [...estado.inventario.matrizes, matriz] : estado.inventario.matrizes,
  }
  return {
    estado: { ...semEncontro(estado, agora), inventario, vidaDaAtiva: vidaMaxima(configuracao.catalogo, estado.ativa) },
    andaresVencidos,
    fragmentos,
    tonicosDeCuraUsados,
    matriz,
  }
}
