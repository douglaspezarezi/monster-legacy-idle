// Evolução (GDD, seção 7): linhas de 2 ou 3 formas, cada forma multiplica os atributos.
import type { Criatura } from './criatura.ts'
import type { Catalogo, DadosDeEspecie } from './especie.ts'
import { especieDo } from './especie.ts'

// Índice 0 para a primeira forma.
export const MULTIPLICADOR_DA_FORMA: readonly number[] = [1, 1.1, 1.2]

export function anteriorDe<Tipo extends string>(catalogo: Catalogo<Tipo>, nome: string): DadosDeEspecie<Tipo> | undefined {
  return Object.values(catalogo.especies).find((e) => e.evolucao?.especie === nome)
}

// 1 para a primeira forma da linha.
export function formaDa<Tipo extends string>(catalogo: Catalogo<Tipo>, nome: string): number {
  let forma = 1
  for (let anterior = anteriorDe(catalogo, nome); anterior; anterior = anteriorDe(catalogo, anterior.nome)) forma++
  return forma
}

export function primeiraForma<Tipo extends string>(catalogo: Catalogo<Tipo>, nome: string): string {
  let atual = nome
  for (let anterior = anteriorDe(catalogo, atual); anterior; anterior = anteriorDe(catalogo, atual)) atual = anterior.nome
  return atual
}

export function multiplicadorDaForma<Tipo extends string>(catalogo: Catalogo<Tipo>, nome: string): number {
  const forma = formaDa(catalogo, nome)
  const multiplicador = MULTIPLICADOR_DA_FORMA[forma - 1]
  if (multiplicador === undefined) throw new RangeError(`forma sem multiplicador: ${forma} (${nome})`)
  return multiplicador
}

// Evolui enquanto o nível alcança a evolução da forma atual; genes, nível e XP ficam.
export function evoluir<Tipo extends string, C extends Criatura>(catalogo: Catalogo<Tipo>, criatura: C): C {
  let especie = criatura.especie
  for (let evolucao = especieDo(catalogo, especie).evolucao; evolucao && criatura.nivel >= evolucao.nivel; evolucao = especieDo(catalogo, especie).evolucao) {
    especie = evolucao.especie
  }
  return especie === criatura.especie ? criatura : { ...criatura, especie }
}

// Ao voltar ao nível 1, a criatura volta à primeira forma da linha.
export function voltarAoNivel1<Tipo extends string, C extends Criatura>(catalogo: Catalogo<Tipo>, criatura: C): C {
  return { ...criatura, nivel: 1, xpNoNivel: 0, especie: primeiraForma(catalogo, criatura.especie) }
}
