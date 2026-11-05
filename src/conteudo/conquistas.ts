// As 33 conquistas do F20 e os Diamantes que cada uma paga (GDD, seção 13).
import type { Conquista } from '../engine/conquistas.ts'

export const CONQUISTAS: readonly Conquista[] = [
  { id: 'abates-1', grupo: 'Caçador', nome: 'Mil abates', medida: 'abates', meta: 1_000, diamantes: 10 },
  { id: 'abates-2', grupo: 'Caçador', nome: 'Dez mil abates', medida: 'abates', meta: 10_000, diamantes: 20 },
  { id: 'abates-3', grupo: 'Caçador', nome: 'Cem mil abates', medida: 'abates', meta: 100_000, diamantes: 40 },
  { id: 'abates-4', grupo: 'Caçador', nome: 'Meio milhão de abates', medida: 'abates', meta: 500_000, diamantes: 80 },

  { id: 'chefes-1', grupo: 'Chefes de rota', nome: 'Dez chefes vencidos', medida: 'chefes', meta: 10, diamantes: 10 },
  { id: 'chefes-2', grupo: 'Chefes de rota', nome: 'Cem chefes vencidos', medida: 'chefes', meta: 100, diamantes: 20 },
  { id: 'chefes-3', grupo: 'Chefes de rota', nome: 'Mil chefes vencidos', medida: 'chefes', meta: 1_000, diamantes: 40 },

  { id: 'capturas-1', grupo: 'Capturas', nome: 'Primeira captura', medida: 'capturas', meta: 1, diamantes: 5 },
  { id: 'capturas-2', grupo: 'Capturas', nome: 'Vinte e cinco capturas', medida: 'capturas', meta: 25, diamantes: 15 },
  { id: 'capturas-3', grupo: 'Capturas', nome: 'Cem capturas', medida: 'capturas', meta: 100, diamantes: 30 },

  { id: 'cruzamentos-1', grupo: 'Cruzamentos', nome: 'Primeiro cruzamento', medida: 'cruzamentos', meta: 1, diamantes: 10 },
  { id: 'cruzamentos-2', grupo: 'Cruzamentos', nome: 'Dez cruzamentos', medida: 'cruzamentos', meta: 10, diamantes: 20 },
  { id: 'cruzamentos-3', grupo: 'Cruzamentos', nome: 'Cinquenta cruzamentos', medida: 'cruzamentos', meta: 50, diamantes: 40 },

  { id: 'registro-1', grupo: 'Registro', nome: 'Dez espécies no registro', medida: 'registro', meta: 10, diamantes: 10 },
  { id: 'registro-2', grupo: 'Registro', nome: 'Trinta espécies no registro', medida: 'registro', meta: 30, diamantes: 20 },
  { id: 'registro-3', grupo: 'Registro', nome: 'Sessenta espécies no registro', medida: 'registro', meta: 60, diamantes: 40 },
  { id: 'registro-4', grupo: 'Registro', nome: 'Cem espécies no registro', medida: 'registro', meta: 100, diamantes: 80 },

  { id: 'era-2', grupo: 'Eras', nome: 'Chegar à Era 2', medida: 'era', meta: 2, diamantes: 30 },
  { id: 'era-3', grupo: 'Eras', nome: 'Chegar à Era 3', medida: 'era', meta: 3, diamantes: 40 },
  { id: 'era-4', grupo: 'Eras', nome: 'Chegar à Era 4', medida: 'era', meta: 4, diamantes: 50 },
  { id: 'nivel-200', grupo: 'Eras', nome: 'Um monstro no nível 200', medida: 'nivel', meta: 200, diamantes: 100 },

  { id: 'forma-2', grupo: 'Evolução', nome: 'Um monstro na segunda forma', medida: 'forma', meta: 2, diamantes: 15 },
  { id: 'forma-3', grupo: 'Evolução', nome: 'Um monstro na terceira forma', medida: 'forma', meta: 3, diamantes: 30 },

  { id: 'epica', grupo: 'Raridade', nome: 'Um monstro épico', medida: 'epicas', meta: 1, diamantes: 10 },
  { id: 'lendaria', grupo: 'Raridade', nome: 'Um monstro lendário', medida: 'lendarias', meta: 1, diamantes: 20 },
  { id: 'mitica', grupo: 'Raridade', nome: 'Um monstro mítico', medida: 'miticas', meta: 1, diamantes: 40 },
  { id: 'prismatica', grupo: 'Raridade', nome: 'Um monstro prismático', medida: 'prismaticas', meta: 1, diamantes: 40 },

  { id: 'despertar-1', grupo: 'Despertar', nome: 'Primeiro Despertar', medida: 'despertas', meta: 1, diamantes: 30 },
  { id: 'despertar-4', grupo: 'Despertar', nome: 'Quatro monstros despertos', medida: 'despertas', meta: 4, diamantes: 60 },

  { id: 'ilhas-1', grupo: 'Ilhas Lendárias', nome: 'Vencer o andar 10 de uma ilha', medida: 'ilhas', meta: 1, diamantes: 40 },
  { id: 'ilhas-4', grupo: 'Ilhas Lendárias', nome: 'Vencer o andar 10 das quatro ilhas', medida: 'ilhas', meta: 4, diamantes: 80 },

  { id: 'mercado-1', grupo: 'Mercado da Cidade', nome: 'Primeira compra no Mercado', medida: 'mercado', meta: 1, diamantes: 20 },

  { id: 'pergaminho-1', grupo: 'Pergaminhos', nome: 'Primeira técnica de Pergaminho', medida: 'pergaminhos', meta: 1, diamantes: 15 },
]
