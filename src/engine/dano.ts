// Dano e ritmo (GDD, seção 5).

export type Categoria = 'fisica' | 'especial'

export type Tecnica<Tipo extends string> = {
  readonly nome: string
  // null para o ataque básico, que não tem tipo.
  readonly tipo: Tipo | null
  readonly categoria: Categoria
  readonly poder: number
  readonly recargaMs: number
}

export const PODER_DO_ATAQUE_BASICO = 40

export const INTERVALO_BASE_MS = 2000
export const INTERVALO_MINIMO_MS = 500
export const INTERVALO_MAXIMO_MS = 4000

// A e D já escolhidos pela categoria: Ataque e Defesa, ou Foco e Foco.
export function calcularDano(ataque: number, defesa: number, poder: number, multiplicadorDeTipo: number): number {
  if (multiplicadorDeTipo === 0) return 0
  const dano = Math.floor(ataque * (poder / 100) * (ataque / (ataque + defesa)) * multiplicadorDeTipo)
  return Math.max(1, dano)
}

export function intervaloDeAcao(velocidade: number, velocidadeDoOponente: number): number {
  if (velocidade <= 0 || velocidadeDoOponente <= 0) {
    throw new RangeError(`velocidade precisa ser positiva: ${velocidade}, ${velocidadeDoOponente}`)
  }
  const intervalo = (INTERVALO_BASE_MS * 2) / (1 + velocidade / velocidadeDoOponente)
  return Math.min(INTERVALO_MAXIMO_MS, Math.max(INTERVALO_MINIMO_MS, intervalo))
}
