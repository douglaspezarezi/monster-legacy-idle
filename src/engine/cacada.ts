// Caçada contínua numa rota: selvagem atrás de selvagem (GDD, seções 4 e 5).
import type { Gerador } from './aleatorio.ts'
import type { Combatente } from './combate.ts'
import { lutar } from './combate.ts'
import type { EstadoDaCacada } from './derrota.ts'
import type { Raridade } from './genes.ts'
import { aplicarDerrota, multiplicadorDeFadiga } from './derrota.ts'
import type { TabelaDeTipos } from './multiplicador-de-tipo.ts'

export type DadosDeRota = {
  readonly faixaDeNivel: readonly [minimo: number, maximo: number]
  readonly xpBase: number
  // Multiplica a Vida máxima dos selvagens e do chefe.
  readonly multiplicadorDeVida: number
  readonly quedaDeMatriz: { readonly chance: number; readonly raridade: Raridade }
}

// Gera uma criatura nova da espécie e raridade indicadas.
export type Matriz = {
  readonly especie: string
  readonly raridade: Raridade
}

export type ConfiguracaoDaCacada<Tipo extends string> = {
  readonly tabela: TabelaDeTipos<Tipo>
  readonly gerarSelvagem: (rota: number, gerador: Gerador) => Combatente<Tipo>
  // Índice 0 para a rota 1.
  readonly rotas: readonly DadosDeRota[]
  readonly intervaloEntreSelvagensMs: number
}

export type Cacador<Tipo extends string> = {
  readonly cacada: EstadoDaCacada
  readonly criatura: Combatente<Tipo>
  readonly matrizes: readonly Matriz[]
}

export type ResultadoDaCacada<Tipo extends string> = {
  readonly cacador: Cacador<Tipo>
  readonly abates: number
  readonly derrotas: number
}

// Uma luta que não termina até o fim do período é descartada; a vida do jogador fica como estava nela.
export function simularCacada<Tipo extends string>(
  configuracao: ConfiguracaoDaCacada<Tipo>,
  inicial: Cacador<Tipo>,
  inicio: number,
  fim: number,
  gerador: Gerador,
): ResultadoDaCacada<Tipo> {
  let { cacada, criatura, matrizes } = inicial
  let abates = 0
  let derrotas = 0
  let agora = inicio

  while (agora < fim && !cacada.pausada) {
    const selvagem = configuracao.gerarSelvagem(cacada.rota, gerador)
    const luta = lutar(configuracao.tabela, criatura, selvagem, agora, fim)
    agora = luta.fim
    criatura = { ...criatura, vida: luta.vidaDoJogador }

    if (luta.vencedor === 'jogador') {
      abates++
      const rota = configuracao.rotas[cacada.rota - 1]
      const xp = Math.floor(rota.xpBase * multiplicadorDeFadiga(cacada, agora))
      cacada = { ...cacada, xpNoNivel: cacada.xpNoNivel + xp }
      // A matriz é da espécie do selvagem abatido; a Fadiga não muda a queda.
      if (gerador() < rota.quedaDeMatriz.chance) {
        matrizes = [...matrizes, { especie: selvagem.especie, raridade: rota.quedaDeMatriz.raridade }]
      }
    } else if (luta.vencedor === 'selvagem') {
      derrotas++
      cacada = aplicarDerrota(cacada, agora)
      // O Tônico de Retorno traz a criatura de volta com a vida cheia.
      if (!cacada.pausada) criatura = { ...criatura, vida: criatura.atributos.vida }
    }
    agora += configuracao.intervaloEntreSelvagensMs
  }

  return { cacador: { cacada, criatura, matrizes }, abates, derrotas }
}
