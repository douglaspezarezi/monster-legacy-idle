// Apoio aos testes do motor: técnicas fictícias e atalhos para montar estados.
import type { Tipo } from '../src/conteudo/tipos.ts'
import type { Combatente } from '../src/engine/combate.ts'
import type { Tecnica } from '../src/engine/dano.ts'
import { CATALOGO } from '../src/conteudo/jogo.ts'
import { ROTAS } from '../src/conteudo/rotas.ts'
import { criarGerador } from '../src/engine/aleatorio.ts'
import type { EstadoDoJogo, Membro } from '../src/engine/jogo.ts'
import { novoJogo, vidaMaxima } from '../src/engine/jogo.ts'

export const LABAREDA: Tecnica<Tipo> = { nome: 'labareda', tipo: 'Chama', categoria: 'especial', poder: 90, recargaMs: 6000 }
export const BRASA: Tecnica<Tipo> = { nome: 'brasa', tipo: 'Chama', categoria: 'fisica', poder: 60, recargaMs: 3000 }
export const ESPINHO: Tecnica<Tipo> = { nome: 'espinho', tipo: 'Brota', categoria: 'fisica', poder: 60, recargaMs: 3000 }

export function combatente(
  tipos: readonly Tipo[],
  valor: number,
  tecnicas: readonly Tecnica<Tipo>[] = [],
  especie = 'teste',
): Combatente<Tipo> {
  const atributos = { vida: valor * 5, ataque: valor, defesa: valor, foco: valor, velocidade: valor }
  return { especie, tipos, atributos, tecnicas, vida: atributos.vida }
}

// Membro do time com todos os genes iguais.
export function membro(especie: string, nivel: number, gene: number, id = 1): Membro {
  const genes = { vida: gene, ataque: gene, defesa: gene, foco: gene, velocidade: gene }
  return { id, especie, genes, prismatica: false, nivel, xpNoNivel: 0 }
}

// Jogo novo com a criatura indicada ativa e vida cheia, mais os campos trocados.
export function jogoCom(ativa: Membro, campos: Partial<EstadoDoJogo<Tipo>> = {}): EstadoDoJogo<Tipo> {
  const base = novoJogo(CATALOGO, ROTAS.length, ativa.especie, 0, criarGerador(0))
  return { ...base, ativa, vidaDaAtiva: vidaMaxima(CATALOGO, ativa), ...campos }
}
