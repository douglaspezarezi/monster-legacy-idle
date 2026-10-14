// Textos da interface a partir dos dados do motor.
import type { Evento } from '../engine/cacada.ts'
import type { Raridade } from '../engine/genes.ts'
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
      return `Rota ${evento.rota} liberada`
  }
}

export function formatarTempo(ms: number): string {
  const segundos = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
}
