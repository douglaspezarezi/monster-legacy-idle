// Save em arquivo: baixar e ler, para cópia de segurança e para a tela de erro.

export const CHAVE_DO_SAVE = 'monsterlegacy:save'
// Um save que o jogo não consegue ler fica guardado aqui em vez de ser sobrescrito.
export const CHAVE_DO_SAVE_RECUSADO = 'monsterlegacy:save-recusado'

export function lerGuardado(chave: string): string | null {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

export function guardar(chave: string, texto: string) {
  try {
    localStorage.setItem(chave, texto)
  } catch {
    // Sem acesso ao armazenamento o jogo segue, só não guarda.
  }
}

export function nomeDoArquivo(agora: Date): string {
  const data = agora.toISOString().slice(0, 16).replace('T', '-').replace(':', 'h')
  return `monster-legacy-save-${data}.json`
}

export function baixar(texto: string, nome: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  link.click()
  URL.revokeObjectURL(url)
}
