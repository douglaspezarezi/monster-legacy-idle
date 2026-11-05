// Ordem e escala dos painéis da caçada, escolhidas no modo de edição (GDD, seção 3).

// Na ordem padrão.
export const PAINEIS = [
  'luta',
  'mapa',
  'rotas',
  'inventario',
  'captura',
  'reserva',
  'mapaDaBase',
  'base',
  'ovos',
  'pergaminhos',
  'ilhas',
  'mercado',
  'equipamentos',
  'conquistas',
  'registro',
  'calendario',
] as const

export type IdDoPainel = (typeof PAINEIS)[number]

export type Layout = {
  readonly ordem: readonly IdDoPainel[]
  // Só os painéis fora de 100%.
  readonly escalas: Readonly<Partial<Record<IdDoPainel, number>>>
}

export const LAYOUT_PADRAO: Layout = { ordem: PAINEIS, escalas: {} }

export const ESCALA_MINIMA = 0.5
export const ESCALA_MAXIMA = 1.5
export const PASSO_DA_ESCALA = 0.1

function ehPainel(valor: unknown): valor is IdDoPainel {
  return PAINEIS.some((p) => p === valor)
}

// Descarta o que não é painel e põe no fim os painéis que faltam, como os de um marco novo.
export function normalizarLayout(dados: unknown): Layout {
  if (typeof dados !== 'object' || dados === null) return LAYOUT_PADRAO
  const { ordem, escalas } = dados as Record<string, unknown>
  const guardada = Array.isArray(ordem) ? [...new Set(ordem.filter(ehPainel))] : []
  const completa = [...guardada, ...PAINEIS.filter((p) => !guardada.includes(p))]
  const validas: Partial<Record<IdDoPainel, number>> = {}
  if (typeof escalas === 'object' && escalas !== null) {
    for (const [id, escala] of Object.entries(escalas)) {
      if (ehPainel(id) && typeof escala === 'number' && escala >= ESCALA_MINIMA && escala <= ESCALA_MAXIMA && escala !== 1) validas[id] = escala
    }
  }
  return { ordem: completa, escalas: validas }
}

export function escalaDe(layout: Layout, id: IdDoPainel): number {
  return layout.escalas[id] ?? 1
}

// O painel arrastado passa para o lugar do alvo, e os do meio andam uma casa.
export function moverPara(layout: Layout, id: IdDoPainel, alvo: IdDoPainel): Layout {
  if (id === alvo) return layout
  const semEle = layout.ordem.filter((p) => p !== id)
  const destino = layout.ordem.indexOf(alvo)
  return { ...layout, ordem: [...semEle.slice(0, destino), id, ...semEle.slice(destino)] }
}

export function trocar(layout: Layout, a: IdDoPainel, b: IdDoPainel): Layout {
  return { ...layout, ordem: layout.ordem.map((p) => (p === a ? b : p === b ? a : p)) }
}

// Arredonda a um décimo para os passos não acumularem erro.
export function escalar(layout: Layout, id: IdDoPainel, passos: number): Layout {
  const nova = Math.round(Math.min(ESCALA_MAXIMA, Math.max(ESCALA_MINIMA, escalaDe(layout, id) + passos * PASSO_DA_ESCALA)) * 10) / 10
  const { [id]: _, ...outras } = layout.escalas
  return { ...layout, escalas: nova === 1 ? outras : { ...outras, [id]: nova } }
}
