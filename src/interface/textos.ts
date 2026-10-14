// Textos da interface a partir dos dados do motor.
import type { Evento } from '../engine/cacada.ts'
import type { Atributo, Genes, Raridade } from '../engine/genes.ts'
import { ATRIBUTOS } from '../engine/genes.ts'
import type { Espaco } from '../engine/equipamentos.ts'
import type { ItemDaLoja } from '../engine/jogo.ts'

export const NOME_DA_RARIDADE: Readonly<Record<Raridade, string>> = {
  fraca: 'fraca',
  comum: 'comum',
  incomum: 'incomum',
  rara: 'rara',
  epica: 'épica',
  lendaria: 'lendária',
  mitica: 'mítica',
}

export const NOME_DO_ITEM: Readonly<Record<ItemDaLoja, string>> = {
  capsula: 'Cápsula',
  tonicoDeCura: 'Tônico de Cura',
  tonicoDeRetorno: 'Tônico de Retorno',
}

export const NOME_DO_ESPACO: Readonly<Record<Espaco, string>> = {
  cabeca: 'Cabeça',
  peito: 'Peito',
  pernas: 'Pernas',
  armaPrincipal: 'Arma principal',
  armaSecundaria: 'Arma secundária',
  cinto: 'Cinto',
}

export const EFEITO_DO_ESPACO: Readonly<Record<Espaco, string>> = {
  cabeca: 'de XP',
  peito: 'de ouro das rotas',
  pernas: 'menos espera entre selvagens',
  armaPrincipal: 'na chance de captura',
  armaSecundaria: 'de desconto no cruzamento',
  cinto: 'na produção da Forja',
}

export function descreverEvento(evento: Evento): string {
  switch (evento.tipo) {
    case 'abate':
      return `${evento.chefe ? 'Chefe ' : ''}${evento.especie} caiu: +${evento.xp} XP, +${evento.ouro} de ouro`
    case 'derrota':
      return evento.pausou
        ? `Derrota para ${evento.especie}. Sem Tônico de Retorno, a caçada pausou.`
        : `Derrota para ${evento.especie}. Tônico de Retorno usado; Fadiga por 10 minutos.`
    case 'nivel':
      return `Subiu para o nível ${evento.nivel}`
    case 'matriz':
      return `Caiu uma matriz: ${evento.matriz.especie} ${NOME_DA_RARIDADE[evento.matriz.raridade]}`
    case 'captura':
      return evento.sucesso
        ? `Capturou ${evento.especie} ${NOME_DA_RARIDADE[evento.raridade]}`
        : `${evento.especie} ${NOME_DA_RARIDADE[evento.raridade]} escapou da Cápsula`
    case 'rota-liberada':
      return `${evento.bioma}: rota ${evento.rota} liberada`
    case 'equipamento':
      return `O chefe deixou um equipamento: ${NOME_DO_ESPACO[evento.equipamento.espaco]} ${NOME_DA_RARIDADE[evento.equipamento.raridade]}`
  }
}

export function formatarTempo(ms: number): string {
  const segundos = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
}

export function formatarDuracao(ms: number): string {
  const minutos = Math.floor(ms / 60_000)
  const horas = Math.floor(minutos / 60)
  if (horas === 0) return `${minutos} min`
  return `${horas} h ${String(minutos % 60).padStart(2, '0')} min`
}

export const SIGLA_DO_ATRIBUTO: Readonly<Record<Atributo, string>> = {
  vida: 'Vi',
  ataque: 'At',
  defesa: 'De',
  foco: 'Fo',
  velocidade: 'Ve',
}

export const NOME_DO_ATRIBUTO: Readonly<Record<Atributo, string>> = {
  vida: 'Vida',
  ataque: 'Ataque',
  defesa: 'Defesa',
  foco: 'Foco',
  velocidade: 'Velocidade',
}

export function descreverGenes(genes: Genes): string {
  const soma = ATRIBUTOS.reduce((total, a) => total + genes[a], 0)
  return `${ATRIBUTOS.map((a) => `${SIGLA_DO_ATRIBUTO[a]} ${genes[a]}`).join(' · ')} · soma ${soma}`
}
