// Caçada contínua numa rota: selvagem atrás de selvagem (GDD, seções 4, 5 e 7).
import type { Gerador } from './aleatorio.ts'
import { CHANCE_DE_CAPTURA, ESPACOS_NA_RESERVA, passaNoFiltro } from './captura.ts'
import { avancarLuta, iniciarLuta } from './combate.ts'
import { combatenteDe } from './criatura.ts'
import { aplicarDerrota, multiplicadorDeFadiga } from './derrota.ts'
import type { Catalogo } from './especie.ts'
import type { Raridade } from './genes.ts'
import { raridadeDosGenes } from './genes.ts'
import type { Encontro, EstadoDoJogo } from './jogo.ts'
import { vidaMaxima } from './jogo.ts'
import type { Matriz } from './nascimento.ts'
import { faixaDoSelvagem, gerarChefe, gerarSelvagem } from './nascimento.ts'
import type { TabelaDeTipos } from './multiplicador-de-tipo.ts'
import { ganharXp } from './nivel.ts'

export type DadosDeRota = {
  readonly faixaDeNivel: readonly [minimo: number, maximo: number]
  readonly xpBase: number
  // Multiplica a Vida máxima dos selvagens e do chefe.
  readonly multiplicadorDeVida: number
  readonly quedaDeMatriz: { readonly chance: number; readonly raridade: Raridade }
}

export const ABATES_PARA_O_CHEFE = 100

export type ConfiguracaoDaCacada<Tipo extends string> = {
  readonly tabela: TabelaDeTipos<Tipo>
  readonly catalogo: Catalogo<Tipo>
  // Índice 0 para a rota 1, nas duas listas.
  readonly rotas: readonly DadosDeRota[]
  readonly especiesPorRota: readonly (readonly string[])[]
  readonly intervaloEntreSelvagensMs: number
}

export type Evento =
  | { readonly tipo: 'abate'; readonly instante: number; readonly especie: string; readonly chefe: boolean; readonly xp: number; readonly ouro: number }
  | { readonly tipo: 'derrota'; readonly instante: number; readonly especie: string; readonly chefe: boolean; readonly pausou: boolean }
  | { readonly tipo: 'nivel'; readonly instante: number; readonly nivel: number }
  | { readonly tipo: 'matriz'; readonly instante: number; readonly matriz: Matriz }
  | { readonly tipo: 'captura'; readonly instante: number; readonly especie: string; readonly raridade: Raridade; readonly sucesso: boolean }
  | { readonly tipo: 'rota-liberada'; readonly instante: number; readonly rota: number }

export type ResultadoDaCacada<Tipo extends string> = {
  readonly estado: EstadoDoJogo<Tipo>
  readonly eventos: readonly Evento[]
}

function encontrar<Tipo extends string>(
  configuracao: ConfiguracaoDaCacada<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  inicio: number,
  gerador: Gerador,
): Encontro<Tipo> {
  const rota = configuracao.rotas[estado.rota - 1]
  const especies = configuracao.especiesPorRota[estado.rota - 1]
  const chefe = estado.abatesPorRota[estado.rota - 1] >= ABATES_PARA_O_CHEFE
  const selvagem = chefe
    ? gerarChefe(configuracao.catalogo, gerador, especies, rota.faixaDeNivel)
    : gerarSelvagem(gerador, especies, faixaDoSelvagem(rota.faixaDeNivel, estado.ativa.nivel))
  const jogador = { ...combatenteDe(configuracao.catalogo, estado.ativa), vida: estado.vidaDaAtiva }
  const luta = iniciarLuta(jogador, combatenteDe(configuracao.catalogo, selvagem, rota.multiplicadorDeVida), inicio)
  return { selvagem, chefe, luta }
}

function comAbates(abatesPorRota: readonly number[], rota: number, valor: number): number[] {
  return abatesPorRota.map((abates, i) => (i === rota - 1 ? valor : abates))
}

function vencer<Tipo extends string>(
  configuracao: ConfiguracaoDaCacada<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  encontro: Encontro<Tipo>,
  agora: number,
  gerador: Gerador,
  eventos: Evento[],
): EstadoDoJogo<Tipo> {
  const rota = configuracao.rotas[estado.rota - 1]
  const fadiga = multiplicadorDeFadiga(estado, agora)
  const xp = Math.floor(rota.xpBase * fadiga)
  const ouro = Math.floor(Math.floor(rota.xpBase / 2) * fadiga)
  eventos.push({ tipo: 'abate', instante: agora, especie: encontro.selvagem.especie, chefe: encontro.chefe, xp, ouro })

  // Ao subir de nível, a vida atual ganha o mesmo tanto que a Vida máxima.
  const ativa = { ...estado.ativa, ...ganharXp(estado.ativa, xp) }
  let vidaDaAtiva = encontro.luta.jogador.vida
  if (ativa.nivel !== estado.ativa.nivel) {
    vidaDaAtiva += vidaMaxima(configuracao.catalogo, ativa) - vidaMaxima(configuracao.catalogo, estado.ativa)
    eventos.push({ tipo: 'nivel', instante: agora, nivel: ativa.nivel })
  }

  let { inventario, reserva, proximoId } = estado
  inventario = { ...inventario, ouro: inventario.ouro + ouro }

  // A matriz é da espécie do selvagem abatido; a Fadiga não muda a queda.
  if (gerador() < rota.quedaDeMatriz.chance) {
    const matriz = { especie: encontro.selvagem.especie, raridade: rota.quedaDeMatriz.raridade }
    inventario = { ...inventario, matrizes: [...inventario.matrizes, matriz] }
    eventos.push({ tipo: 'matriz', instante: agora, matriz })
  }

  // O chefe não pode ser capturado; com a reserva cheia ou sem Cápsula, nada é tentado.
  if (
    !encontro.chefe &&
    inventario.capsulas > 0 &&
    reserva.length < ESPACOS_NA_RESERVA &&
    passaNoFiltro(estado.filtroDeCaptura, encontro.selvagem)
  ) {
    const raridade = raridadeDosGenes(encontro.selvagem.genes)
    const sucesso = gerador() < CHANCE_DE_CAPTURA[raridade]
    inventario = { ...inventario, capsulas: inventario.capsulas - 1 }
    if (sucesso) {
      reserva = [...reserva, { ...encontro.selvagem, id: proximoId }]
      proximoId++
    }
    eventos.push({ tipo: 'captura', instante: agora, especie: encontro.selvagem.especie, raridade, sucesso })
  }

  let { rota: numeroDaRota, rotasLiberadas } = estado
  let abatesPorRota: readonly number[]
  if (encontro.chefe) {
    abatesPorRota = comAbates(estado.abatesPorRota, numeroDaRota, 0)
    if (numeroDaRota === rotasLiberadas && rotasLiberadas < configuracao.rotas.length) {
      rotasLiberadas++
      eventos.push({ tipo: 'rota-liberada', instante: agora, rota: rotasLiberadas })
    }
    if (estado.avancoAutomatico && numeroDaRota < rotasLiberadas) numeroDaRota++
  } else {
    abatesPorRota = comAbates(estado.abatesPorRota, numeroDaRota, estado.abatesPorRota[numeroDaRota - 1] + 1)
  }

  return { ...estado, ativa, vidaDaAtiva, inventario, reserva, proximoId, rota: numeroDaRota, rotasLiberadas, abatesPorRota }
}

function perder<Tipo extends string>(
  configuracao: ConfiguracaoDaCacada<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  encontro: Encontro<Tipo>,
  agora: number,
  eventos: Evento[],
): EstadoDoJogo<Tipo> {
  const depois = aplicarDerrota(
    {
      rota: estado.rota,
      xpNoNivel: estado.ativa.xpNoNivel,
      tonicosDeRetorno: estado.inventario.tonicosDeRetorno,
      fadigaAte: estado.fadigaAte,
      pausada: estado.pausada,
    },
    agora,
  )
  eventos.push({ tipo: 'derrota', instante: agora, especie: encontro.selvagem.especie, chefe: encontro.chefe, pausou: depois.pausada })
  // Perder para o chefe também zera o contador da rota.
  const abatesPorRota = encontro.chefe ? comAbates(estado.abatesPorRota, estado.rota, 0) : estado.abatesPorRota
  return {
    ...estado,
    ativa: { ...estado.ativa, xpNoNivel: depois.xpNoNivel },
    // O Tônico de Retorno traz a criatura de volta com a vida cheia.
    vidaDaAtiva: depois.pausada ? 0 : vidaMaxima(configuracao.catalogo, estado.ativa),
    inventario: { ...estado.inventario, tonicosDeRetorno: depois.tonicosDeRetorno },
    rota: depois.rota,
    fadigaAte: depois.fadigaAte,
    pausada: depois.pausada,
    abatesPorRota,
  }
}

// A luta que não termina até o fim do período fica guardada no estado e continua no período seguinte.
export function simularCacada<Tipo extends string>(
  configuracao: ConfiguracaoDaCacada<Tipo>,
  inicial: EstadoDoJogo<Tipo>,
  inicio: number,
  fim: number,
  gerador: Gerador,
): ResultadoDaCacada<Tipo> {
  let estado = inicial
  const eventos: Evento[] = []
  let agora = inicio

  while (agora < fim && !estado.pausada) {
    let encontro = estado.encontro
    if (!encontro) {
      if (estado.proximoSelvagemEm > fim) break
      encontro = encontrar(configuracao, estado, Math.max(agora, estado.proximoSelvagemEm), gerador)
    }

    const cura = { gatilho: estado.gatilhoDeCura, tonicos: estado.inventario.tonicosDeCura }
    const avanco = avancarLuta(configuracao.tabela, encontro.luta, fim, cura)
    const inventario = { ...estado.inventario, tonicosDeCura: estado.inventario.tonicosDeCura - avanco.tonicosDeCuraUsados }
    encontro = { ...encontro, luta: avanco.luta }
    estado = { ...estado, inventario, encontro }
    agora = avanco.instante
    if (avanco.vencedor === null) break

    estado = { ...estado, encontro: null, proximoSelvagemEm: agora + configuracao.intervaloEntreSelvagensMs }
    estado =
      avanco.vencedor === 'jogador'
        ? vencer(configuracao, estado, encontro, agora, gerador, eventos)
        : perder(configuracao, estado, encontro, agora, eventos)
  }

  return { estado, eventos }
}
