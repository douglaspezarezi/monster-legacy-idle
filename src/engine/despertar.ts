// Despertar: fim de jogo a partir do nível 150 (GDD, seção 11).
import { trabalhando } from './base.ts'
import type { Tecnica } from './dano.ts'
import type { Catalogo, DadosDeEspecie } from './especie.ts'
import { especieDo } from './especie.ts'
import type { EstadoDoJogo } from './jogo.ts'
import { semEncontro, vidaMaxima } from './jogo.ts'
import { TECNICAS_POR_CRIATURA } from './tecnicas.ts'

export const NIVEL_DO_DESPERTAR = 150
export const FRAGMENTOS_DO_DESPERTAR = 300
export const ESSENCIAS_DO_DESPERTAR = 10
export const MULTIPLICADOR_DO_DESPERTAR = 1.15

// A Essência vem do primeiro tipo da espécie na forma atual.
export function tipoDaEssencia<Tipo extends string>(catalogo: Catalogo<Tipo>, especie: string): Tipo {
  return especieDo(catalogo, especie).tipos[0]
}

// A técnica exclusiva entra em primeiro lugar na fila e tira a última se a fila já tiver 4.
export function tecnicasDespertas<Tipo extends string>(
  catalogo: Catalogo<Tipo>,
  especie: DadosDeEspecie<Tipo>,
  tecnicas: readonly Tecnica<Tipo>[],
): Tecnica<Tipo>[] {
  const nome = catalogo.tecnicasDoDespertar[especie.tipos[0]]
  const exclusiva = nome === undefined ? undefined : catalogo.tecnicas[nome]
  if (!exclusiva) throw new RangeError(`sem técnica de Despertar para ${especie.tipos[0]}`)
  return [exclusiva, ...tecnicas].slice(0, TECNICAS_POR_CRIATURA)
}

// Por que a criatura ainda não pode despertar; null quando pode.
export function impedimentoDoDespertar<Tipo extends string>(catalogo: Catalogo<Tipo>, estado: EstadoDoJogo<Tipo>, id: number): string | null {
  const criatura = estado.ativa.id === id ? estado.ativa : estado.reserva.find((m) => m.id === id)
  if (!criatura) return 'criatura inexistente'
  if (criatura.despertada) return 'já despertou'
  if (criatura.nivel < NIVEL_DO_DESPERTAR) return `precisa do nível ${NIVEL_DO_DESPERTAR}`
  if (trabalhando(estado, id)) return 'está num posto de trabalho'
  if (estado.inventario.fragmentos < FRAGMENTOS_DO_DESPERTAR) return `precisa de ${FRAGMENTOS_DO_DESPERTAR} Fragmentos`
  const tipo = tipoDaEssencia(catalogo, criatura.especie)
  if ((estado.inventario.essencias[tipo] ?? 0) < ESSENCIAS_DO_DESPERTAR) return `precisa de ${ESSENCIAS_DO_DESPERTAR} Essências de ${tipo}`
  return null
}

// Despertar a ativa encerra a luta em andamento, como trocar de criatura, e ela volta com a vida cheia.
export function despertar<Tipo extends string>(catalogo: Catalogo<Tipo>, estado: EstadoDoJogo<Tipo>, id: number, agora: number): EstadoDoJogo<Tipo> {
  const impedimento = impedimentoDoDespertar(catalogo, estado, id)
  if (impedimento) throw new RangeError(`não pode despertar: ${impedimento}`)
  const ehAtiva = estado.ativa.id === id
  const criatura = ehAtiva ? estado.ativa : estado.reserva.find((m) => m.id === id)
  if (!criatura) throw new RangeError(`criatura inexistente: ${id}`)
  const tipo = tipoDaEssencia(catalogo, criatura.especie)
  const desperta = { ...criatura, despertada: true }
  const inventario = {
    ...estado.inventario,
    fragmentos: estado.inventario.fragmentos - FRAGMENTOS_DO_DESPERTAR,
    essencias: { ...estado.inventario.essencias, [tipo]: (estado.inventario.essencias[tipo] ?? 0) - ESSENCIAS_DO_DESPERTAR },
  }
  if (!ehAtiva) return { ...estado, inventario, reserva: estado.reserva.map((m) => (m.id === id ? desperta : m)) }
  return { ...semEncontro(estado, agora), inventario, ativa: desperta, vidaDaAtiva: vidaMaxima(catalogo, desperta) }
}
