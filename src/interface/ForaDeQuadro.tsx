// Tela no lugar do jogo quando ele é aberto dentro de iframe de outro site: só o link para o endereço do jogo.

export function ForaDeQuadro() {
  return (
    <main className="app">
      <h1>Monster Legacy Idle</h1>
      <section className="painel">
        <p>O jogo não abre dentro de outro site.</p>
        <a href={window.location.href} target="_blank" rel="noopener noreferrer">
          Abrir o jogo no endereço oficial
        </a>
      </section>
    </main>
  )
}
