# Monster Legacy Idle

Idle RPG de criaturas para navegador, em TypeScript, Vite e React. Fase 1 é solo; a parte online fica para depois do lançamento.

O design está em `docs/GDD.md`. Antes de implementar uma regra de jogo, leia a seção correspondente; itens marcados **[proposta]** ainda não foram aprovados e não devem virar código. Se o código e o GDD divergirem, pare e pergunte.

**Marco atual: F4 · Cruzamento e base.** Os marcos e critérios estão na seção 16 do GDD. Atualize esta linha ao concluir um marco e não comece o seguinte sem o critério do atual atendido.

## Comandos

- `npm run dev`: servidor local
- `npm test`: testes (Vitest, execução única)
- `npm run build`: checagem de tipos e build de produção
- `npm run lint`: oxlint

Uma tarefa só está concluída quando `npm test` e `npm run build` passam.

## Estrutura

```
src/
  engine/     regras puras de jogo, sem tela
  conteudo/   dados de jogo: tipos, espécies, técnicas, biomas
  ...         as demais pastas entram quando forem necessárias
tests/        testes do motor
docs/GDD.md   documento de design
```

## Regras de arquitetura

1. Nada em `src/engine/` importa de tela, React ou bibliotecas de interface.
2. O motor não lê relógio nem sorteia por conta própria: `Date.now`, `new Date()` e `Math.random` são proibidos em `src/engine/`; tempo e gerador com semente entram como parâmetros.
3. Conteúdo (espécies, técnicas, tipos, biomas) fica em arquivos de dados, não no código.
4. Toda regra nova do motor vem com teste em `tests/`.
5. A interface só envia comandos ao motor e desenha o estado que ele devolve.

## Conteúdo original

Todo nome, criatura, tipo, técnica, mecânica, arte, som e texto é original. Nunca use nomes, personagens, termos, mecânicas características ou tabelas de franquias existentes, nem como exemplo ou valor provisório, e nem com o nome trocado. A seção 14 do GDD lista o que já foi removido do documento de origem.

Nada pago entrega item sorteado.

## Convenções

- Termos de jogo em português, iguais aos do GDD; termos técnicos em inglês.
- TypeScript estrito, sem `any`, sem `enum` nem parameter properties (`erasableSyntaxOnly`); importe tipos com `import type`.
- Não adicione dependências sem perguntar antes.
- Commits pequenos, um assunto por commit, mensagem em português.
