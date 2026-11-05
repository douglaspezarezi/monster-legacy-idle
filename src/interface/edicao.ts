// Layout dos painéis e modo de edição, compartilhados com cada Janela.
import { createContext } from 'react'
import type { Layout } from './layout.ts'
import { LAYOUT_PADRAO } from './layout.ts'

export type Edicao = {
  readonly layout: Layout
  readonly editando: boolean
  readonly mudarLayout: (layout: Layout) => void
}

export const EdicaoDoLayout = createContext<Edicao>({ layout: LAYOUT_PADRAO, editando: false, mudarLayout: () => {} })
