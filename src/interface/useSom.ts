// Liga o som à sessão: efeitos dos acontecimentos de cada passo e música no tom do bioma.
import { useEffect } from 'react'
import { BIOMAS } from '../conteudo/biomas.ts'
import { TIPOS } from '../conteudo/tipos.ts'
import type { Preferencias } from './preferencias.ts'
import { definirTonica, definirVolumes, efeitosDosEventos, liberarSom, silenciar, tocarEfeitos } from './som.ts'
import type { Sessao } from './useJogo.ts'

export function useSom(sessao: Sessao | null, preferencias: Preferencias) {
  useEffect(() => {
    const liberar = () => liberarSom()
    const aoMudarVisibilidade = () => silenciar(document.visibilityState === 'hidden')
    window.addEventListener('pointerdown', liberar)
    window.addEventListener('keydown', liberar)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    return () => {
      window.removeEventListener('pointerdown', liberar)
      window.removeEventListener('keydown', liberar)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
    }
  }, [])

  useEffect(() => definirVolumes(preferencias.volumeDaMusica, preferencias.volumeDosEfeitos), [preferencias.volumeDaMusica, preferencias.volumeDosEfeitos])

  // Cada tipo sobe uma quinta a partir do anterior, dentro de uma oitava.
  const tipo = sessao ? BIOMAS[sessao.estado.bioma].tipo : null
  useEffect(() => {
    if (tipo !== null) definirTonica((TIPOS.indexOf(tipo) * 7) % 12)
  }, [tipo])

  const eventos = sessao?.eventos
  useEffect(() => {
    if (eventos?.length) tocarEfeitos(efeitosDosEventos(eventos))
  }, [eventos])
}
