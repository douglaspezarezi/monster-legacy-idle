// Decide o que fazer ao entrar na nuvem, comparando o save do navegador com o da nuvem (GDD, seção 5).

export type Decisao = 'nada' | 'enviar' | 'baixar' | 'perguntar'

// O instante salvo identifica um save. O navegador lembra o último save que trocou com a nuvem:
// se a nuvem ainda tem esse, o save local só continuou dali e pode ser enviado sem perguntar.
export function decidir(
  local: { readonly salvoEm: number } | null,
  remoto: { readonly salvoEm: number } | null,
  ultimoTrocado: number | null,
): Decisao {
  if (!local && !remoto) return 'nada'
  if (!remoto) return 'enviar'
  if (!local) return 'baixar'
  if (local.salvoEm === remoto.salvoEm) return 'nada'
  return remoto.salvoEm === ultimoTrocado ? 'enviar' : 'perguntar'
}
