// Acesso ao save na nuvem (Supabase). Sem as variáveis de ambiente, tudo fica desligado.
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

export const nuvem: SupabaseClient | null = url && chave ? createClient(url, chave) : null

export type SaveNaNuvem = { readonly texto: string; readonly salvoEm: number }

export async function enviarLink(cliente: SupabaseClient, email: string): Promise<void> {
  const { error } = await cliente.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  })
  if (error) throw error
}

export async function lerSave(cliente: SupabaseClient, sessao: Session): Promise<SaveNaNuvem | null> {
  const { data, error } = await cliente.from('saves').select('dados, salvo_em').eq('user_id', sessao.user.id).maybeSingle()
  if (error) throw error
  const linha: unknown = data
  if (typeof linha !== 'object' || linha === null || !('dados' in linha) || !('salvo_em' in linha)) return null
  const { dados, salvo_em } = linha
  return typeof dados === 'string' && typeof salvo_em === 'number' ? { texto: dados, salvoEm: salvo_em } : null
}

export async function gravarSave(cliente: SupabaseClient, sessao: Session, save: SaveNaNuvem & { readonly versao: number }): Promise<void> {
  const { error } = await cliente
    .from('saves')
    .upsert({ user_id: sessao.user.id, versao: save.versao, salvo_em: save.salvoEm, dados: save.texto, atualizado_em: new Date().toISOString() })
  if (error) throw error
}
