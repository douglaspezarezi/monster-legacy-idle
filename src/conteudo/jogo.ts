// Junta o conteúdo do F2 na configuração que o motor recebe.
import type { ConfiguracaoDoJogo } from '../engine/avanco.ts'
import type { Catalogo } from '../engine/especie.ts'
import { porNome } from '../engine/especie.ts'
import { criarTabelaDeTipos } from '../engine/multiplicador-de-tipo.ts'
import { MATA_FUNDA } from './biomas.ts'
import { ESPECIES } from './especies.ts'
import { LINHAGENS } from './linhagens.ts'
import { FORJA } from './postos.ts'
import { ROTAS } from './rotas.ts'
import { TECNICAS } from './tecnicas.ts'
import type { Tipo } from './tipos.ts'
import { DADOS_DOS_TIPOS } from './tipos.ts'

export const INTERVALO_ENTRE_SELVAGENS_MS = 1000

export const CATALOGO: Catalogo<Tipo> = { especies: porNome(ESPECIES), tecnicas: porNome(TECNICAS) }

export const CONFIGURACAO: ConfiguracaoDoJogo<Tipo> = {
  tabela: criarTabelaDeTipos(DADOS_DOS_TIPOS),
  catalogo: CATALOGO,
  rotas: ROTAS,
  especiesPorRota: MATA_FUNDA.especiesPorRota,
  intervaloEntreSelvagensMs: INTERVALO_ENTRE_SELVAGENS_MS,
  forja: FORJA,
  linhagens: LINHAGENS,
}
