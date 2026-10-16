// Espécies e catálogo de conteúdo (GDD, seção 7).
import type { Atributos } from './criatura.ts'
import type { Tecnica } from './dano.ts'

export type DadosDeEspecie<Tipo extends string> = {
  readonly nome: string
  readonly tipos: readonly Tipo[]
  // Valores no nível 1.
  readonly bases: Atributos
  // Nomes das técnicas, em ordem de prioridade.
  readonly tecnicas: readonly string[]
  // A forma seguinte da linha e o nível em que a criatura evolui para ela.
  readonly evolucao?: { readonly especie: string; readonly nivel: number }
}

export type Catalogo<Tipo extends string> = {
  readonly especies: Readonly<Record<string, DadosDeEspecie<Tipo>>>
  readonly tecnicas: Readonly<Record<string, Tecnica<Tipo>>>
  // Técnica exclusiva do Despertar para cada tipo.
  readonly tecnicasDoDespertar: Readonly<Partial<Record<Tipo, string>>>
}

export function porNome<T extends { readonly nome: string }>(itens: readonly T[]): Readonly<Record<string, T>> {
  return Object.fromEntries(itens.map((item) => [item.nome, item]))
}

export function especieDo<Tipo extends string>(catalogo: Catalogo<Tipo>, nome: string): DadosDeEspecie<Tipo> {
  const especie = catalogo.especies[nome]
  if (!especie) throw new RangeError(`espécie desconhecida: ${nome}`)
  return especie
}

export function tecnicasDa<Tipo extends string>(catalogo: Catalogo<Tipo>, especie: DadosDeEspecie<Tipo>): Tecnica<Tipo>[] {
  return especie.tecnicas.map((nome) => {
    const tecnica = catalogo.tecnicas[nome]
    if (!tecnica) throw new RangeError(`técnica desconhecida: ${nome}`)
    return tecnica
  })
}

export function somaDasBases(especie: DadosDeEspecie<string>): number {
  const { vida, ataque, defesa, foco, velocidade } = especie.bases
  return vida + ataque + defesa + foco + velocidade
}
