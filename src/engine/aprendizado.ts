// Técnica aprendida por Pergaminho ou herdada no cruzamento (GDD, seção 10).
import type { Criatura } from './criatura.ts'
import type { Tecnica } from './dano.ts'
import type { Catalogo } from './especie.ts'
import { especieDo, tecnicasDa } from './especie.ts'
import type { EstadoDoJogo } from './jogo.ts'
import { semEncontro } from './jogo.ts'
import { tecnicasDespertas } from './despertar.ts'
import { TECNICAS_POR_CRIATURA } from './tecnicas.ts'

export const CHANCE_DE_PERGAMINHO = 0.05

function tecnicaDo<Tipo extends string>(catalogo: Catalogo<Tipo>, nome: string): Tecnica<Tipo> {
  const tecnica = catalogo.tecnicas[nome]
  if (!tecnica) throw new RangeError(`técnica desconhecida: ${nome}`)
  return tecnica
}

export function ehDoDespertar<Tipo extends string>(catalogo: Catalogo<Tipo>, nome: string): boolean {
  return Object.values(catalogo.tecnicasDoDespertar).includes(nome)
}

// A aprendida entra em primeiro lugar, ou em segundo depois da técnica do Despertar, e tira a última se a fila passar de 4.
// Se a forma atual já tem a aprendida, como depois de uma evolução, ela não aparece duas vezes.
export function filaDeTecnicas<Tipo extends string>(catalogo: Catalogo<Tipo>, criatura: Criatura): Tecnica<Tipo>[] {
  const especie = especieDo(catalogo, criatura.especie)
  const aprendida = criatura.tecnicaAprendida
  const daEspecie = tecnicasDa(catalogo, especie).filter((t) => t.nome !== aprendida)
  const fila = (aprendida === undefined ? daEspecie : [tecnicaDo(catalogo, aprendida), ...daEspecie]).slice(0, TECNICAS_POR_CRIATURA)
  return criatura.despertada ? tecnicasDespertas(catalogo, especie, fila) : fila
}

// Técnicas do tipo que um Pergaminho pode ensinar, na ordem do catálogo; a do Despertar fica de fora.
export function tecnicasDoPergaminho<Tipo extends string>(catalogo: Catalogo<Tipo>, tipo: Tipo): string[] {
  return Object.values(catalogo.tecnicas)
    .filter((t) => t.tipo === tipo && !ehDoDespertar(catalogo, t.nome))
    .map((t) => t.nome)
}

// O que o filhote pode herdar de um pai: a fila dele, menos a técnica do Despertar.
export function tecnicasHerdaveis<Tipo extends string>(catalogo: Catalogo<Tipo>, criatura: Criatura): string[] {
  return filaDeTecnicas(catalogo, criatura)
    .map((t) => t.nome)
    .filter((nome) => !ehDoDespertar(catalogo, nome))
}

// Por que a técnica não pode ser aprendida por uma criatura da espécie; null quando pode.
export function impedimentoDaTecnica<Tipo extends string>(catalogo: Catalogo<Tipo>, especie: string, tecnica: string): string | null {
  if (!catalogo.tecnicas[tecnica]) return 'técnica desconhecida'
  if (ehDoDespertar(catalogo, tecnica)) return 'a técnica do Despertar não se aprende'
  if (especieDo(catalogo, especie).tecnicas.includes(tecnica)) return 'a espécie já sabe'
  return null
}

function membro<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number): Criatura | undefined {
  return estado.ativa.id === id ? estado.ativa : estado.reserva.find((m) => m.id === id)
}

// Por que a criatura não pode aprender a técnica do Pergaminho agora; null quando pode.
export function impedimentoDoAprendizado<Tipo extends string>(catalogo: Catalogo<Tipo>, estado: EstadoDoJogo<Tipo>, id: number, tecnica: string): string | null {
  const criatura = membro(estado, id)
  if (!criatura) return 'criatura inexistente'
  if ((estado.inventario.pergaminhos[tecnica] ?? 0) < 1) return `sem Pergaminho de ${tecnica}`
  if (criatura.tecnicaAprendida === tecnica) return 'já aprendeu'
  return impedimentoDaTecnica(catalogo, criatura.especie, tecnica)
}

// Troca a técnica da criatura; na ativa, a luta em andamento acaba, como ao trocar de criatura.
function comTecnica<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number, tecnica: string | undefined, agora: number): EstadoDoJogo<Tipo> {
  // Sem técnica, o campo fica undefined e some no save.
  const trocar = <C extends Criatura>(criatura: C): C => ({ ...criatura, tecnicaAprendida: tecnica })
  if (estado.ativa.id === id) return { ...semEncontro(estado, agora), ativa: trocar(estado.ativa) }
  return { ...estado, reserva: estado.reserva.map((m) => (m.id === id ? trocar(m) : m)) }
}

// Gasta o Pergaminho; a técnica aprendida antes se perde.
export function aprenderTecnica<Tipo extends string>(catalogo: Catalogo<Tipo>, estado: EstadoDoJogo<Tipo>, id: number, tecnica: string, agora: number): EstadoDoJogo<Tipo> {
  const impedimento = impedimentoDoAprendizado(catalogo, estado, id, tecnica)
  if (impedimento) throw new RangeError(`não pode aprender: ${impedimento}`)
  const depois = comTecnica(estado, id, tecnica, agora)
  const pergaminhos = { ...estado.inventario.pergaminhos, [tecnica]: estado.inventario.pergaminhos[tecnica] - 1 }
  const contadores = { ...depois.contadores, pergaminhosUsados: depois.contadores.pergaminhosUsados + 1 }
  return { ...depois, inventario: { ...depois.inventario, pergaminhos }, contadores }
}

export function esquecerTecnica<Tipo extends string>(estado: EstadoDoJogo<Tipo>, id: number, agora: number): EstadoDoJogo<Tipo> {
  const criatura = membro(estado, id)
  if (!criatura) throw new RangeError(`criatura inexistente: ${id}`)
  if (criatura.tecnicaAprendida === undefined) return estado
  return comTecnica(estado, id, undefined, agora)
}
