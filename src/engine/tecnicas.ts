// Fila de técnicas (GDD, seção 5).

export const TECNICAS_POR_CRIATURA = 4

// Índice da primeira técnica fora de recarga, na ordem de prioridade,
// ou null quando todas recarregam e a criatura usa o ataque básico.
// prontaEm guarda, por técnica, o instante em que a recarga termina.
export function escolherTecnica(prontaEm: readonly number[], agora: number): number | null {
  if (prontaEm.length > TECNICAS_POR_CRIATURA) {
    throw new RangeError(`no máximo ${TECNICAS_POR_CRIATURA} técnicas: ${prontaEm.length}`)
  }
  const indice = prontaEm.findIndex((instante) => instante <= agora)
  return indice === -1 ? null : indice
}
