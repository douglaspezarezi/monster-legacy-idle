// Gerador com semente. O motor só sorteia por um Gerador recebido como parâmetro.

// Devolve um número em [0, 1).
export type Gerador = () => number

// mulberry32: rápido, com período de 2^32, suficiente para o jogo.
export function criarGerador(semente: number): Gerador {
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function inteiroEntre(gerador: Gerador, minimo: number, maximo: number): number {
  return minimo + Math.floor(gerador() * (maximo - minimo + 1))
}
