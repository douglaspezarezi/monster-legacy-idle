// O jogo não abre dentro de iframe de outro site (GDD, seção 12).
// Feito em JavaScript porque o GitHub Pages não envia o cabeçalho X-Frame-Options.

// Se o acesso à janela de cima for barrado, ela é de outro site: conta como quadro.
export function estaEmQuadro(): boolean {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}
