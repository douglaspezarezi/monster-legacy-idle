// Derrota durante a caçada (GDD, seção 5).

export const ROTA_MINIMA = 1
export const PERDA_DE_XP_NA_DERROTA = 0.05
export const DURACAO_DA_FADIGA_MS = 10 * 60 * 1000
export const MULTIPLICADOR_DA_FADIGA = 0.5

export type EstadoDaCacada = {
  readonly rota: number
  readonly xpNoNivel: number
  readonly tonicosDeRetorno: number
  // Instante em que a Fadiga acaba; sem Fadiga quando já passou.
  readonly fadigaAte: number
  readonly pausada: boolean
}

// Sem Tônico de Retorno a criatura não volta: a caçada pausa e nada mais muda.
export function aplicarDerrota(estado: EstadoDaCacada, agora: number): EstadoDaCacada {
  if (estado.tonicosDeRetorno <= 0) {
    return { ...estado, pausada: true }
  }
  return {
    ...estado,
    tonicosDeRetorno: estado.tonicosDeRetorno - 1,
    rota: Math.max(ROTA_MINIMA, estado.rota - 1),
    xpNoNivel: estado.xpNoNivel - Math.floor(estado.xpNoNivel * PERDA_DE_XP_NA_DERROTA),
    fadigaAte: agora + DURACAO_DA_FADIGA_MS,
  }
}

// Vale para XP e ouro.
export function multiplicadorDeFadiga(estado: EstadoDaCacada, agora: number): number {
  return agora < estado.fadigaAte ? MULTIPLICADOR_DA_FADIGA : 1
}
