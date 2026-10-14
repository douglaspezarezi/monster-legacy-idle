// Equipamentos do Treinador (GDD, seção 8). Só aceleram a economia; nenhum aumenta a força das criaturas.
import type { Raridade } from './genes.ts'
import type { EstadoDoJogo } from './jogo.ts'

export const ESPACOS = ['cabeca', 'peito', 'pernas', 'armaPrincipal', 'armaSecundaria', 'cinto'] as const
export type Espaco = (typeof ESPACOS)[number]

export type Equipamento = {
  readonly espaco: Espaco
  readonly raridade: Raridade
}

export type Equipamentos = {
  readonly vestidos: Partial<Readonly<Record<Espaco, Equipamento>>>
  readonly guardados: readonly Equipamento[]
}

export const SEM_EQUIPAMENTOS: Equipamentos = { vestidos: {}, guardados: [] }

export const CHANCE_DE_EQUIPAMENTO_DO_CHEFE = 0.1

// Em pontos percentuais inteiros, para XP e ouro saírem exatos ao arredondar.
export const EFEITO_POR_RARIDADE: Readonly<Record<Raridade, number>> = {
  fraca: 0,
  comum: 5,
  incomum: 10,
  rara: 15,
  epica: 20,
  lendaria: 25,
  mitica: 25,
}

// Efeito da peça vestida no espaço, em pontos percentuais; 0 sem peça.
export function bonus<Tipo extends string>(estado: EstadoDoJogo<Tipo>, espaco: Espaco): number {
  const peca = estado.equipamentos.vestidos[espaco]
  return peca ? EFEITO_POR_RARIDADE[peca.raridade] : 0
}

export function aumentar<Tipo extends string>(valor: number, estado: EstadoDoJogo<Tipo>, espaco: Espaco): number {
  return (valor * (100 + bonus(estado, espaco))) / 100
}

export function reduzir<Tipo extends string>(valor: number, estado: EstadoDoJogo<Tipo>, espaco: Espaco): number {
  return (valor * (100 - bonus(estado, espaco))) / 100
}

// A peça guardada vai para o espaço dela; a que estava lá volta para os guardados.
export function vestir<Tipo extends string>(estado: EstadoDoJogo<Tipo>, indice: number): EstadoDoJogo<Tipo> {
  const peca = estado.equipamentos.guardados[indice]
  if (!peca) throw new RangeError(`equipamento inexistente: ${indice}`)
  const anterior = estado.equipamentos.vestidos[peca.espaco]
  const guardados = estado.equipamentos.guardados.filter((_, i) => i !== indice)
  return {
    ...estado,
    equipamentos: {
      vestidos: { ...estado.equipamentos.vestidos, [peca.espaco]: peca },
      guardados: anterior ? [...guardados, anterior] : guardados,
    },
  }
}

export function despir<Tipo extends string>(estado: EstadoDoJogo<Tipo>, espaco: Espaco): EstadoDoJogo<Tipo> {
  const peca = estado.equipamentos.vestidos[espaco]
  if (!peca) return estado
  const vestidos = { ...estado.equipamentos.vestidos }
  delete vestidos[espaco]
  return { ...estado, equipamentos: { vestidos, guardados: [...estado.equipamentos.guardados, peca] } }
}
