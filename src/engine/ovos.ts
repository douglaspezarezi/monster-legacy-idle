// Ovos do cruzamento, Chocadeira e Santuário prismático (GDD, seção 10).
import type { Gerador } from './aleatorio.ts'
import type { Criatura } from './criatura.ts'
import { aumentar } from './equipamentos.ts'
import type { Raridade } from './genes.ts'
import { podeSerPrismatica, raridadeDosGenes } from './genes.ts'
import type { EstadoDoJogo } from './jogo.ts'
import { CHANCE_PRISMATICA } from './nascimento.ts'

// O filhote já tem espécie, genes e técnica herdada; a variação prismática sai ao chocar.
export type Ovo = { readonly filhote: Criatura; readonly prontoEm: number }

export type Santuario = { readonly construido: boolean; readonly ovo: Ovo | null }

export const SANTUARIO_VAZIO: Santuario = { construido: false, ovo: null }

export const VAGAS_DA_CHOCADEIRA = 3
export const PRECO_DO_SANTUARIO = 300
export const MULTIPLICADOR_DO_SANTUARIO = 3

const MINUTO_MS = 60 * 1000

// Dobra a cada faixa de raridade.
export const TEMPO_DE_CHOCAR_MS: Readonly<Record<Raridade, number>> = {
  fraca: 10 * MINUTO_MS,
  comum: 10 * MINUTO_MS,
  incomum: 20 * MINUTO_MS,
  rara: 40 * MINUTO_MS,
  epica: 80 * MINUTO_MS,
  lendaria: 160 * MINUTO_MS,
  mitica: 320 * MINUTO_MS,
}

export function tempoDeChocar(filhote: Criatura): number {
  return TEMPO_DE_CHOCAR_MS[raridadeDosGenes(filhote.genes)]
}

// Por que o ovo não tem onde ficar; null quando tem.
export function impedimentoDoOvo<Tipo extends string>(estado: EstadoDoJogo<Tipo>, noSantuario: boolean): string | null {
  if (!noSantuario) return estado.chocadeira.length < VAGAS_DA_CHOCADEIRA ? null : 'a Chocadeira está cheia'
  if (!estado.santuario.construido) return 'o Santuário ainda não foi construído'
  return estado.santuario.ovo ? 'o Santuário já tem um ovo' : null
}

export function botarOvo<Tipo extends string>(estado: EstadoDoJogo<Tipo>, filhote: Criatura, agora: number, noSantuario: boolean): EstadoDoJogo<Tipo> {
  const impedimento = impedimentoDoOvo(estado, noSantuario)
  if (impedimento) throw new RangeError(`sem lugar para o ovo: ${impedimento}`)
  const ovo = { filhote, prontoEm: agora + tempoDeChocar(filhote) }
  return noSantuario ? { ...estado, santuario: { ...estado.santuario, ovo } } : { ...estado, chocadeira: [...estado.chocadeira, ovo] }
}

export type Chocado = { readonly instante: number; readonly filhote: Criatura }

// Os ovos prontos chocam na ordem em que ficaram prontos; com a reserva cheia, esperam.
export function chocarOvos<Tipo extends string>(
  estado: EstadoDoJogo<Tipo>,
  agora: number,
  gerador: Gerador,
): { readonly estado: EstadoDoJogo<Tipo>; readonly chocados: readonly Chocado[] } {
  const prontos = [
    ...estado.chocadeira.filter((o) => o.prontoEm <= agora).map((ovo) => ({ ovo, noSantuario: false })),
    ...(estado.santuario.ovo && estado.santuario.ovo.prontoEm <= agora ? [{ ovo: estado.santuario.ovo, noSantuario: true }] : []),
  ].sort((a, b) => a.ovo.prontoEm - b.ovo.prontoEm)
  if (prontos.length === 0) return { estado, chocados: [] }

  let { reserva, proximoId, chocadeira, santuario } = estado
  const chocados: Chocado[] = []
  const chance = aumentar(CHANCE_PRISMATICA, estado, 'brasao')
  for (const { ovo, noSantuario } of prontos) {
    if (reserva.length >= estado.espacosNaReserva) break
    const prismatica =
      podeSerPrismatica(raridadeDosGenes(ovo.filhote.genes)) && gerador() < chance * (noSantuario ? MULTIPLICADOR_DO_SANTUARIO : 1)
    const filhote = { ...ovo.filhote, prismatica }
    reserva = [...reserva, { ...filhote, id: proximoId, era: estado.era }]
    proximoId++
    if (noSantuario) santuario = { ...santuario, ovo: null }
    else chocadeira = chocadeira.filter((o) => o !== ovo)
    chocados.push({ instante: ovo.prontoEm, filhote })
  }
  return { estado: { ...estado, reserva, proximoId, chocadeira, santuario }, chocados }
}

// Por que o Santuário não pode ser construído; null quando pode.
export function impedimentoDoSantuario<Tipo extends string>(estado: EstadoDoJogo<Tipo>): string | null {
  if (estado.santuario.construido) return 'o Santuário já foi construído'
  if (estado.inventario.diamantes < PRECO_DO_SANTUARIO) return `precisa de ${PRECO_DO_SANTUARIO} Diamantes`
  return null
}

export function construirSantuario<Tipo extends string>(estado: EstadoDoJogo<Tipo>): EstadoDoJogo<Tipo> {
  const impedimento = impedimentoDoSantuario(estado)
  if (impedimento) throw new RangeError(`não pode construir: ${impedimento}`)
  return {
    ...estado,
    santuario: { ...estado.santuario, construido: true },
    inventario: { ...estado.inventario, diamantes: estado.inventario.diamantes - PRECO_DO_SANTUARIO },
  }
}
