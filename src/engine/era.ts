// Eras: teto de nível, rotas liberadas e reset (GDD, seção 7).
import type { Catalogo } from './especie.ts'
import type { EstadoDoJogo } from './jogo.ts'
import { vidaMaxima } from './jogo.ts'

export type DadosDeEra = {
  // Nenhuma criatura passa deste nível na Era.
  readonly teto: number
  // Quantas rotas de cada bioma a Era alcança.
  readonly rotas: number
}

export function dadosDaEra(eras: readonly DadosDeEra[], era: number): DadosDeEra {
  const dados = eras[era - 1]
  if (!dados) throw new RangeError(`Era inexistente: ${era}`)
  return dados
}

// A Era fecha quando a criatura ativa chega ao teto e existe uma Era seguinte.
export function podeReiniciarEra<Tipo extends string>(eras: readonly DadosDeEra[], estado: EstadoDoJogo<Tipo>): boolean {
  return estado.era < eras.length && estado.ativa.nivel >= dadosDaEra(eras, estado.era).teto
}

// A ativa volta ao nível 1 com os mesmos genes; rotas e chefes voltam ao começo. O resto fica.
export function reiniciarEra<Tipo extends string>(
  configuracao: { readonly eras: readonly DadosDeEra[]; readonly catalogo: Catalogo<Tipo> },
  estado: EstadoDoJogo<Tipo>,
  agora: number,
): EstadoDoJogo<Tipo> {
  if (!podeReiniciarEra(configuracao.eras, estado)) throw new RangeError('a Era ainda não fechou')
  const era = estado.era + 1
  const ativa = { ...estado.ativa, nivel: 1, xpNoNivel: 0, era }
  return {
    ...estado,
    era,
    ativa,
    vidaDaAtiva: vidaMaxima(configuracao.catalogo, ativa),
    rota: 1,
    rotasLiberadas: 1,
    abatesPorRota: estado.abatesPorRota.map(() => 0),
    encontro: null,
    pausada: false,
    proximoSelvagemEm: agora,
  }
}
