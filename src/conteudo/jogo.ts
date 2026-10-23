// Junta o conteúdo do F2 na configuração que o motor recebe.
import type { ConfiguracaoDoJogo } from '../engine/avanco.ts'
import type { Catalogo } from '../engine/especie.ts'
import { porNome } from '../engine/especie.ts'
import { criarTabelaDeTipos } from '../engine/multiplicador-de-tipo.ts'
import { BIOMAS } from './biomas.ts'
import { ERAS } from './eras.ts'
import { ESPECIES } from './especies.ts'
import { ILHAS } from './ilhas.ts'
import { LINHAGENS } from './linhagens.ts'
import { MERCADO } from './mercado.ts'
import { FORJA, MINA } from './postos.ts'
import { ROTAS } from './rotas.ts'
import { TECNICAS, TECNICAS_DO_DESPERTAR } from './tecnicas.ts'
import type { Tipo } from './tipos.ts'
import { DADOS_DOS_TIPOS } from './tipos.ts'

export const INTERVALO_ENTRE_SELVAGENS_MS = 1000

export const CATALOGO: Catalogo<Tipo> = { especies: porNome(ESPECIES), tecnicas: porNome(TECNICAS), tecnicasDoDespertar: TECNICAS_DO_DESPERTAR }

export const CONFIGURACAO: ConfiguracaoDoJogo<Tipo> = {
  tabela: criarTabelaDeTipos(DADOS_DOS_TIPOS),
  catalogo: CATALOGO,
  rotas: ROTAS,
  biomas: BIOMAS,
  intervaloEntreSelvagensMs: INTERVALO_ENTRE_SELVAGENS_MS,
  eras: ERAS,
  forja: FORJA,
  mina: MINA,
  linhagens: LINHAGENS,
  ilhas: ILHAS,
  mercado: MERCADO,
}
