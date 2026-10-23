// Estimativa de XP por hora do monstro ativo em cada rota, para o mapa apontar a melhor (GDD, seção 4).
import type { Gerador } from './aleatorio.ts'
import type { ConfiguracaoDaCacada } from './cacada.ts'
import { simularCacada } from './cacada.ts'
import { FILTRO_VAZIO } from './captura.ts'
import { dadosDaEra } from './era.ts'
import type { EstadoDoJogo } from './jogo.ts'
import { vidaMaxima } from './jogo.ts'

export const DURACAO_DA_ESTIMATIVA_MS = 5 * 60 * 1000
const HORA_MS = 60 * 60 * 1000

export type RotaDoMapa = { readonly bioma: number; readonly rota: number }

// Rotas liberadas dos biomas abertos na Era atual, na ordem dos biomas.
export function rotasAbertas<Tipo extends string>(configuracao: ConfiguracaoDaCacada<Tipo>, estado: EstadoDoJogo<Tipo>): RotaDoMapa[] {
  const rotas: RotaDoMapa[] = []
  const era = dadosDaEra(configuracao.eras, estado.era)
  configuracao.biomas.forEach((dados, bioma) => {
    if (dados.era > estado.era) return
    const liberadas = bioma === estado.bioma ? estado.rotasLiberadas : (estado.outrosBiomas[bioma]?.rotasLiberadas ?? 1)
    const ultima = Math.min(liberadas, era.rotas, dados.especiesPorRota.length)
    for (let rota = 1; rota <= ultima; rota++) rotas.push({ bioma, rota })
  })
  return rotas
}

// Simula alguns minutos de caçada numa cópia do estado, com o monstro entrando de vida cheia e sem Fadiga.
// Captura fica de fora para não gastar Cápsulas nem encher a reserva da cópia.
export function estimarXpPorHora<Tipo extends string>(
  configuracao: ConfiguracaoDaCacada<Tipo>,
  estado: EstadoDoJogo<Tipo>,
  { bioma, rota }: RotaDoMapa,
  gerador: Gerador,
): number {
  const copia: EstadoDoJogo<Tipo> = {
    ...estado,
    bioma,
    rota,
    rotasLiberadas: rota,
    abatesPorRota: estado.abatesPorRota.map(() => 0),
    avancoAutomatico: false,
    filtroDeCaptura: FILTRO_VAZIO,
    fadigaAte: 0,
    pausada: false,
    encontro: null,
    proximoSelvagemEm: 0,
    vidaDaAtiva: vidaMaxima(configuracao.catalogo, estado.ativa),
  }
  const { eventos } = simularCacada(configuracao, copia, 0, DURACAO_DA_ESTIMATIVA_MS, gerador)
  const xp = eventos.reduce((total, e) => total + (e.tipo === 'abate' ? e.xp : 0), 0)
  return (xp * HORA_MS) / DURACAO_DA_ESTIMATIVA_MS
}

export type Estimativa = RotaDoMapa & { readonly xpPorHora: number }

// A de mais XP por hora; no empate, a primeira.
export function melhorRota(estimativas: readonly Estimativa[]): Estimativa | null {
  return estimativas.reduce<Estimativa | null>((melhor, e) => (!melhor || e.xpPorHora > melhor.xpPorHora ? e : melhor), null)
}
