// Espécies e técnicas fictícias, só para os testes do motor.
import type { Tipo } from '../src/conteudo/tipos.ts'
import type { Combatente } from '../src/engine/combate.ts'
import type { Tecnica } from '../src/engine/dano.ts'

export const LABAREDA: Tecnica<Tipo> = { nome: 'labareda', tipo: 'Chama', categoria: 'especial', poder: 90, recargaMs: 6000 }
export const BRASA: Tecnica<Tipo> = { nome: 'brasa', tipo: 'Chama', categoria: 'fisica', poder: 60, recargaMs: 3000 }
export const ESPINHO: Tecnica<Tipo> = { nome: 'espinho', tipo: 'Brota', categoria: 'fisica', poder: 60, recargaMs: 3000 }

export function combatente(
  tipos: readonly Tipo[],
  valor: number,
  tecnicas: readonly Tecnica<Tipo>[] = [],
): Combatente<Tipo> {
  const atributos = { vida: valor * 5, ataque: valor, defesa: valor, foco: valor, velocidade: valor }
  return { tipos, atributos, tecnicas, vida: atributos.vida }
}
