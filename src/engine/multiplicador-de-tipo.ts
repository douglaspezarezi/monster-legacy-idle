// Multiplicador de tipo (GDD, seção 5). A tabela de vantagens vem do conteúdo.

export type Relacao = 'vantagem' | 'resistencia' | 'imunidade' | 'neutra'

export type TabelaDeTipos<Tipo extends string> = (tipoDaTecnica: Tipo, tipoDoDefensor: Tipo) => Relacao

const FATOR: Readonly<Record<Relacao, number>> = {
  vantagem: 2,
  resistencia: 0.5,
  imunidade: 0,
  neutra: 1,
}

// Cada tipo do defensor contribui com um fator; os fatores se multiplicam.
export function multiplicadorDeTipo<Tipo extends string>(
  tabela: TabelaDeTipos<Tipo>,
  tipoDaTecnica: Tipo,
  tiposDoDefensor: readonly Tipo[],
): number {
  if (tiposDoDefensor.length < 1 || tiposDoDefensor.length > 2) {
    throw new RangeError(`a criatura tem um ou dois tipos: ${tiposDoDefensor.length}`)
  }
  return tiposDoDefensor.reduce((total, tipo) => total * FATOR[tabela(tipoDaTecnica, tipo)], 1)
}

// Linha da tabela de vantagens, como vem do conteúdo.
export type DadosDeTipo<Tipo extends string> = {
  readonly vence: readonly Tipo[]
  readonly resiste: readonly Tipo[]
  readonly imuneA: readonly Tipo[]
}

export function criarTabelaDeTipos<Tipo extends string>(
  dados: Readonly<Record<Tipo, DadosDeTipo<Tipo>>>,
): TabelaDeTipos<Tipo> {
  return (tipoDaTecnica, tipoDoDefensor) => {
    const defensor = dados[tipoDoDefensor]
    if (defensor.imuneA.includes(tipoDaTecnica)) return 'imunidade'
    if (dados[tipoDaTecnica].vence.includes(tipoDoDefensor)) return 'vantagem'
    if (defensor.resiste.includes(tipoDaTecnica)) return 'resistencia'
    return 'neutra'
  }
}
