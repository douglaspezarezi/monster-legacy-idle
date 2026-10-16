// Postos de trabalho da base (GDD, seção 9).
import type { DadosDePosto } from '../engine/base.ts'
import type { Tipo } from './tipos.ts'

export const FORJA: DadosDePosto<Tipo> = { nome: 'Forja', tipos: ['Chama', 'Faísca'], vagas: 3, porHora: 100 }

export const MINA: DadosDePosto<Tipo> = { nome: 'Mina', tipos: ['Rocha', 'Cristal', 'Liga'], vagas: 3, porHora: 10 }
