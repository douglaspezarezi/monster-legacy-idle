# Monster Legacy Idle · Documento de design

Versão de trabalho, reescrita a partir de "GDD_Monster_Legacy_Idle", em versão original. As propostas criadas nesta reescrita para preencher ou substituir o que precisou sair foram aprovadas em 14/10/2026, assim como o conteúdo e as regras do F2. Itens marcados com **[proposta]** são novos e esperam aprovação; itens marcados com **[a definir]** são escolhas em aberto. A seção 14 lista o que foi removido e por quê.

## 1. Visão geral

Idle RPG de criaturas para navegador. O jogador forma criaturas, deixa-as caçando em rotas enquanto está fora, cria linhagens melhores por cruzamento e monta uma base de trabalho com as criaturas da reserva.

- **Plataforma:** navegador, com interface pensada também para o celular.
- **Fase 1 (lançamento):** jogo solo, com save local e, depois, save na nuvem.
- **Fase 2 (online):** sistemas sociais e PvP da seção 12, só depois do lançamento solo e com servidor próprio.
- **Título provisório:** Monster Legacy Idle. As criaturas se chamam "criaturas" no texto do jogo até haver um nome próprio.

## 2. Pilares

1. **Genética importa:** duas criaturas da mesma espécie e nível são diferentes por causa dos genes e da raridade.
2. **Tempo fora rende:** a caçada continua com o jogo fechado, com regras claras de risco e de ganho.
3. **Decisão de tipo:** o maior ganho de velocidade vem de escolher a rota certa para o tipo da criatura.
4. **Sem sorte paga:** nada que se compra com dinheiro real entrega item sorteado.
5. **Tudo original:** nomes, criaturas, tipos, mecânicas e arte são próprios, sem derivar de franquias existentes.

## 3. Arte e interface

- **Batalha e mapas:** pixel art 2D leve, para manter a aba do navegador rápida.
- **Interface:** ilustrações digitais em alta definição, vetores nítidos e painéis semitransparentes com efeito de vidro.
- **Desempenho:** modo leve sem transições pesadas, opção de desligar animações de técnicas e modo de segundo plano que para de desenhar e só calcula.
- **Interface editável:** no modo de edição, cada janela ganha borda tracejada e pode ser arrastada e escalada de 50% a 150%; o layout fica salvo.
- **Áudio:** música e efeitos com volumes independentes; a opacidade do vidro vai de 35% a 100%.

## 4. Mundo e rotas

O mundo tem 18 biomas, um por tipo **[a definir: o documento original fala em 18 mapas elementares; a lista de tipos da seção 6 tem 16, então 2 biomas ficam mistos ou a lista de tipos muda]**. Cada bioma tem 5 rotas.

Rotas de mesmo número rendem igual em qualquer bioma: o que muda é a vantagem de tipo e os materiais que caem ali.

| Rota | Faixa de nível | Abate médio | XP base | XP por hora | Queda de matriz |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 a 10 | 2 s | 10 | 18.000 | 1,00% (comum) |
| 2 | 11 a 25 | 4 s | 35 | 31.500 | 0,50% (incomum) |
| 3 | 26 a 50 | 6 s | 100 | 60.000 | 0,25% (rara) |
| 4 | 51 a 75 | 8 s | 250 | 112.500 | 0,10% (épica) |
| 5 | 76 a 100 | 12 s | 650 | 195.000 | 0,02% (lendária) |

- **Matriz:** item que gera uma criatura nova da espécie e raridade indicadas.
- **Mapa-múndi de caçadas:** mostra os biomas, trancados por Era (seção 7). Um indicador acende a rota com maior XP por hora para a criatura ativa, lendo nível, tipos e técnicas.
- **Avanço de rota:** chave na interface entre avanço automático (vence o chefe e passa à rota seguinte) e farm travado na rota.

### Primeiro bioma: Mata Funda (Brota)

| Rota | Espécies (chance igual) |
| --- | --- |
| 1 | Brotelho, Formigaço |
| 2 | Brotelho, Formigaço, Sapolho |
| 3 | Formigaço, Sapolho, Ferroa |
| 4 | Sapolho, Ferroa, Raizudo |
| 5 | Ferroa, Raizudo, Penugem |

### Biomas da Era 1

Quatro biomas, todos abertos desde o começo. Cada um favorece um inicial, para que a escolha de tipo e as capturas de um bioma ajudem no outro.

| Bioma | Tipo | Favorece |
| --- | --- | --- |
| Mata Funda | Brota | Gelusco (Geada vence Brota) |
| Serra Partida | Rocha | Rebitim (Liga vence Rocha), e Raizudo e Sapolho da Mata Funda |
| Campo Bravio | Fera | Zumbilo (Eco vence Fera), e Formigaço e Ferroa da Mata Funda |
| Baía Turva | Maré | Gelusco (Geada vence Maré), e as espécies Brota da Mata Funda |

- Cada bioma guarda as próprias rotas liberadas e os próprios contadores de chefe. Trocar de bioma encerra a luta, como trocar de rota.
- O reset de Era volta todos os biomas à rota 1.

| Rota | Serra Partida | Campo Bravio | Baía Turva |
| --- | --- | --- | --- |
| 1 | Seixote, Cravelho | Trotelo, Saltico | Bolhim, Siriço |
| 2 | Seixote, Cravelho, Grutilo | Trotelo, Saltico, Zoadeiro | Bolhim, Siriço, Medusela |
| 3 | Cravelho, Grutilo, Fagulhito | Saltico, Zoadeiro, Chifrudo | Siriço, Medusela, Geleiro |
| 4 | Grutilo, Fagulhito, Drusito | Zoadeiro, Chifrudo, Lobruma | Medusela, Geleiro, Enguiço |
| 5 | Fagulhito, Drusito, Muralhão | Chifrudo, Lobruma, Tourado | Geleiro, Enguiço, Abissão |

Simulação de 36 horas em cada bioma, com o jogador repondo até 5 Tônicos de Retorno e 10 de Cura a cada 10 minutos (média de 4 sementes):

| Bioma | Gelusco aos 24 h | Rebitim aos 24 h | Zumbilo aos 24 h |
| --- | --- | --- | --- |
| Mata Funda | nível 35 | 33 | 29 |
| Serra Partida | 27 | 33 | 34 |
| Campo Bravio | 35 | 29 | 39 |
| Baía Turva | 39 | 33 | 26 |

### Selvagens

- O selvagem nasce num nível sorteado com chance igual entre o piso da faixa da rota e 2 níveis abaixo da criatura ativa, sem passar do teto da faixa. Se esse limite ficar abaixo do piso, o selvagem nasce no piso. O chefe não segue essa regra.
- Raridade ao nascer: fraca 25%, comum 55%, incomum 15%, rara 4%, épica 0,9%, lendária 0,09%, mítica 0,01%.
- Selvagens de raridade épica ou maior têm 2% de chance de serem prismáticos.
- **Vida por rota:** a Vida máxima do selvagem é multiplicada por 1× na rota 1, 1,5× na rota 2, 2× na rota 3, 3× na rota 4 e 4× na rota 5, para que os abates fiquem perto da coluna "Abate médio". Sem isso, Vida e Ataque crescem no mesmo ritmo e os abates durariam de 2,5 a 4,5 s em todas as rotas.
- O Ataque e o Foco do selvagem e do chefe são divididos pelo mesmo multiplicador da Vida. A luta continua longa, mas o dano total que a criatura recebe fica igual ao da rota 1. Sem isso, a rota 5 causa 4× mais dano total, e na simulação de 48 horas a criatura não passa da rota 2; com a divisão, chega às rotas 3 a 5.
- O próximo selvagem aparece 1 s depois do anterior cair.

### Chefe de rota

- A cada 100 abates numa rota aparece o chefe dela. Cada rota guarda o próprio contador, que não se perde ao sair dela. O chefe é a espécie da rota com maior soma de valores base, no nível máximo da faixa, com raridade rara. A Vida por rota vale também para ele.
- Vencer o chefe pela primeira vez libera a rota seguinte. Com o avanço automático ligado, a caçada passa para ela.
- Perder para o chefe segue as regras de derrota da seção 5.
- O chefe não pode ser capturado.

## 5. Combate

### Fila de técnicas

O combate é 1 contra 1, contínuo, em cena lateral. Cada criatura tem 4 técnicas em lista de prioridade, de cima para baixo. A cada instante, a criatura usa a primeira técnica fora de recarga; se todas estão recarregando, usa um ataque básico sem recarga.

### Multiplicadores de tipo

Cada criatura tem um ou dois tipos, e cada técnica tem um tipo. O multiplicador cruza o tipo da técnica com os tipos do defensor:

| Situação | Multiplicador |
| --- | --- |
| Vantagem contra um tipo | 2× |
| Vantagem contra os dois tipos | 4× |
| Resistência de um tipo | 0,5× |
| Resistência dos dois tipos | 0,25× |
| Imunidade | 0× |

Quando um tipo do defensor dá vantagem e o outro resiste, os fatores se multiplicam (2 × 0,5 = 1×).

A tabela de vantagens é própria do jogo (seção 6).

### Dano e ritmo

Cada técnica tem tipo, categoria (física ou especial), poder e recarga em segundos, cadastrados no conteúdo. O ataque básico é físico, sem tipo (multiplicador 1×), com poder 40 e sem recarga.

```
A, D  = Ataque e Defesa (técnica física) ou Foco e Foco (técnica especial)
dano  = ⌊ A × (poder ÷ 100) × A ÷ (A + D) × multiplicador de tipo ⌋, no mínimo 1
```

- Com atributos iguais, uma técnica de poder 100 tira metade do Ataque do atacante.
- Imunidade dá 0 de dano, sem o mínimo de 1.
- Sem variação sorteada, sem golpe crítico e sem bônus por a criatura ser do mesmo tipo da técnica: o dano é previsível e a escolha de tipo vem só da tabela.
- **Ritmo:** cada criatura age a cada `2 s × 2 ÷ (1 + V ÷ Vo)`, onde V é a própria Velocidade e Vo a do oponente, limitado entre 0,5 s e 4 s. Velocidades iguais dão 2 s; o dobro dá cerca de 1,33 s. O teto de 4 s é o próprio limite da fórmula quando o oponente é muito mais rápido; o piso de 0,5 s vale a partir de 7 vezes a Velocidade do oponente.

### Detalhes da caçada no motor

- Quando as duas criaturas agem no mesmo instante, a do jogador age primeiro.
- O Tônico de Retorno traz a criatura de volta com a vida cheia.
- Depois de vencer um selvagem ou um chefe, a vida da criatura volta cheia antes do próximo. Os Tônicos de Cura servem dentro da luta.
- **Tônico de Cura:** recupera 50% da Vida máxima. O jogador define o gatilho, que começa em 30%. O tônico é usado logo depois do golpe que deixa a vida abaixo do gatilho e não gasta a vez da criatura.
- O XP com Fadiga é arredondado para baixo (35 vira 17).
- Uma luta que não termina até o fim do período simulado fica guardada no estado da caçada e continua no período seguinte. A tela avança a simulação em passos curtos, de cerca de 250 ms.
- O tempo entre um selvagem e o próximo é 1 s (seção 4).

### Técnicas

| Técnica | Tipo | Categoria | Poder | Recarga |
| --- | --- | --- | --- | --- |
| Golpe de Galho | Brota | física | 55 | 3 s |
| Esporos | Brota | especial | 80 | 6 s |
| Mordida | Fera | física | 60 | 3 s |
| Investida | Fera | física | 90 | 8 s |
| Ferrão | Peçonha | física | 55 | 3 s |
| Névoa Tóxica | Peçonha | especial | 85 | 7 s |
| Rajada | Brisa | especial | 55 | 3 s |
| Pio Sombrio | Penumbra | especial | 70 | 5 s |
| Jato de Lodo | Maré | especial | 60 | 4 s |
| Pedrisco | Rocha | física | 60 | 4 s |
| Lasca Gélida | Geada | física | 55 | 3 s |
| Sopro Frio | Geada | especial | 85 | 7 s |
| Martelada | Liga | física | 60 | 3 s |
| Limalha | Liga | especial | 80 | 6 s |
| Estalo | Eco | especial | 55 | 3 s |
| Ressonância | Eco | especial | 90 | 8 s |

Técnicas novas dos biomas da Era 1:

| Técnica | Tipo | Categoria | Poder | Recarga |
| --- | --- | --- | --- | --- |
| Centelha | Faísca | especial | 55 | 3 s |
| Estilhaço | Cristal | física | 60 | 3 s |
| Cerração | Bruma | especial | 80 | 6 s |
| Onda Funda | Maré | especial | 85 | 7 s |
| Desmoronar | Rocha | física | 85 | 7 s |

### Derrota durante a caçada

Criaturas selvagens das rotas altas podem derrotar a criatura do jogador, inclusive offline. Quando isso acontece:

1. O jogo consome um **Tônico de Retorno** do inventário e a criatura volta.
2. A caçada recua para a rota anterior.
3. A criatura perde 5% da experiência acumulada no nível atual.
4. A criatura fica com **Fadiga**: 50% menos XP e ouro por 10 minutos reais.

A perda de XP é arredondada para baixo.

O jogador compra tônicos de cura com ouro e configura gatilhos, como "usar tônico de cura quando a vida cair abaixo de 30%". Sem Tônico de Retorno no inventário, a caçada pausa até o jogador voltar, sem perda de XP, recuo de rota ou Fadiga.

### Tempo fora do jogo

- Ao reabrir, o jogo simula o tempo fora com as mesmas regras da caçada aberta, inclusive derrotas, Fadiga e uso de tônicos.
- O tempo fora é creditado até 24 horas. Acima disso, contam só as últimas 24 horas; a Fadiga corre em tempo real e já terá acabado.
- Ao voltar, um resumo mostra o tempo creditado, abates, XP, níveis ganhos, ouro, capturas, matrizes e derrotas.
- O save fica no navegador, com o número da versão do formato, e é gravado a cada poucos segundos e quando a aba é fechada ou escondida.

### Save na nuvem

- O login é opcional e é feito por e-mail, com um link enviado à caixa de entrada, sem senha. Sem login, o save fica só no navegador, como antes.
- A nuvem guarda o mesmo texto do save local, um por jogador. Cada jogador só lê e grava o próprio save.
- Ao entrar, se a nuvem e o navegador têm saves diferentes, o jogo mostra os dois (Era, nível da criatura ativa, ouro e data em que foi salvo) e o jogador escolhe qual fica. Se só um lado tem save, ele vale para os dois.
- Cada navegador lembra o último save que trocou com a nuvem. Se a nuvem ainda tem esse save, o navegador só continuou dali e grava sem perguntar; a pergunta fica para quando outro dispositivo gravou no meio.
- Depois disso, o jogo grava na nuvem a cada minuto e quando a aba é escondida. Antes de cada gravação, confere se outro dispositivo gravou depois da última troca; se sim, pergunta qual save fica em vez de sobrescrever.
- O tempo fora é creditado a partir do instante salvo no save escolhido, com as regras de sempre.

## 6. Tipos

São 16 tipos com nomes e tabela próprios; a tabela de vantagens deve ser desenhada do zero, sem reproduzir a de nenhuma franquia.

Lista inicial: Chama, Maré, Brota, Rocha, Brisa, Geada, Faísca, Liga, Peçonha, Penumbra, Aurora, Eco, Cristal, Fera, Bruma e Astro.

Regras para desenhar a tabela:

- Cada tipo tem de 2 a 3 vantagens e de 2 a 3 resistências.
- No máximo 4 imunidades no jogo inteiro, todas explicadas pela ficção do tipo.
- Nenhum tipo pode ser estritamente melhor que outro em ataque e defesa ao mesmo tempo.

### Tabela de vantagens

Lida por linha: técnicas do tipo da esquerda causam 2× nos tipos de "Vence", e criaturas do tipo da esquerda recebem 0,5× de "Resiste" e 0× de "Imune a". A coluna "Fraco contra" é consequência das outras duas.

| Tipo | Vence | Resiste | Imune a | Fraco contra |
| --- | --- | --- | --- | --- |
| Chama | Brota, Geada, Bruma | Geada, Fera, Peçonha | | Maré, Rocha |
| Maré | Chama, Rocha | Chama, Rocha, Eco | | Brota, Geada, Peçonha |
| Brota | Maré, Rocha, Eco | Maré, Rocha, Faísca | | Chama, Brisa, Geada, Peçonha |
| Rocha | Brisa, Faísca, Chama | Chama, Brisa, Peçonha | | Maré, Brota, Liga, Astro |
| Brisa | Bruma, Peçonha, Brota | Fera, Maré, Brota | | Rocha, Geada, Cristal |
| Geada | Maré, Brota, Brisa | Maré, Geada, Brisa | | Chama, Liga, Astro |
| Faísca | Liga, Fera | Liga, Brisa, Faísca | | Rocha, Bruma |
| Liga | Cristal, Geada, Rocha | Brota, Brisa | Peçonha | Faísca, Eco |
| Peçonha | Fera, Brota, Maré | Peçonha, Brota, Fera | | Brisa, Aurora, Cristal |
| Penumbra | Eco, Aurora, Cristal | Brisa, Liga, Peçonha | | Aurora, Cristal, Fera |
| Aurora | Penumbra, Bruma, Peçonha | Geada, Astro, Brota | | Penumbra, Bruma |
| Eco | Cristal, Fera, Liga | Rocha, Fera, Chama | | Brota, Penumbra, Astro |
| Cristal | Penumbra, Brisa, Peçonha | Aurora, Peçonha, Geada | | Liga, Penumbra, Eco |
| Fera | Penumbra, Bruma, Astro | Bruma, Rocha | | Faísca, Peçonha, Eco |
| Bruma | Faísca, Aurora, Astro | Maré, Peçonha | Rocha | Chama, Brisa, Aurora, Fera |
| Astro | Rocha, Geada, Eco | Brisa, Geada | Eco | Fera, Bruma |

Imunidades (3 no total):

- **Liga é imune a Peçonha:** metal não adoece nem absorve veneno.
- **Bruma é imune a Rocha:** pedra atravessa a névoa sem acertar nada.
- **Astro é imune a Eco:** no vazio entre as estrelas o som não se propaga.

A tabela foi conferida por script contra as três regras acima: todo tipo vence 2 ou 3 e resiste a 2 ou 3 (imunidade conta como resistência), nenhum tipo vence e resiste ao mesmo atacante, e nenhum par tem um tipo estritamente melhor que o outro.

## 7. Criaturas, genes e crescimento

### Atributos

Cinco atributos: Vida, Ataque, Defesa, Foco (dano e defesa de técnicas especiais) e Velocidade. O conjunto substitui os seis atributos do documento original, que tinham nomes iguais aos de uma franquia.

### Genes

Cada criatura nasce com um gene por atributo, de 1 a 20. O gene não soma ao final: ele define quanto o atributo cresce por nível, multiplicado pela raridade.

```
ganho por nível = gene × multiplicador da raridade
atributo        = (base no nível 1 + ganho por nível × (nível − 1)) × bônus prismático
```

### Raridade

A soma dos genes define a faixa de raridade ao nascer ou cair como matriz. Com cinco genes de 1 a 20, a soma vai de 5 a 100, com as faixas abaixo.

| Raridade | Multiplicador | Soma dos genes | Variação prismática |
| --- | --- | --- | --- |
| Fraca | 0,90 a 0,99 | 5 a 20 | Não |
| Comum | 1,00 a 1,09 | 21 a 45 | Não |
| Incomum | 1,10 a 1,24 | 46 a 65 | Não |
| Rara | 1,25 a 1,39 | 66 a 80 | Não |
| Épica | 1,40 a 1,54 | 81 a 90 | Sim |
| Lendária | 1,55 a 1,69 | 91 a 96 | Sim |
| Mítica | 1,70 a 1,80 | 97 a 100 | Sim |

**Variação prismática:** cor alternativa e +10% em todos os atributos, possível a partir da raridade épica.

### Sorteio de genes e raridade

- **Raridade primeiro:** selvagens e matrizes decidem a raridade antes (pela rota ou pela matriz) e sorteiam os genes de 1 a 20, um a um com chance igual, repetindo o sorteio até a soma cair na faixa daquela raridade.
- **Multiplicador dentro da faixa:** cresce em linha reta com a soma dos genes, do mínimo da faixa na menor soma ao máximo na maior, arredondado para duas casas. Exemplo: Comum com soma 29 fica em 1,03.

### Espécies

Valores base no nível 1, na ordem Vida, Ataque, Defesa, Foco e Velocidade. Técnicas em ordem de prioridade.

| Espécie | Tipos | Base | Técnicas |
| --- | --- | --- | --- |
| Gelusco (inicial) | Geada | 50, 13, 11, 13, 12 | Sopro Frio, Lasca Gélida, Mordida, Rajada |
| Rebitim (inicial) | Liga | 55, 13, 15, 9, 9 | Limalha, Martelada, Investida, Pedrisco |
| Zumbilo (inicial) | Eco | 45, 9, 10, 15, 14 | Ressonância, Estalo, Pio Sombrio, Rajada |
| Brotelho | Brota | 45, 10, 12, 10, 10 | Esporos, Golpe de Galho, Mordida |
| Formigaço | Fera, Peçonha | 40, 13, 10, 8, 12 | Investida, Mordida, Ferrão |
| Sapolho | Maré, Brota | 55, 9, 11, 13, 8 | Esporos, Jato de Lodo, Golpe de Galho |
| Ferroa | Peçonha, Brisa | 40, 12, 9, 12, 15 | Névoa Tóxica, Ferrão, Rajada |
| Raizudo | Brota, Rocha | 60, 13, 15, 8, 6 | Esporos, Pedrisco, Golpe de Galho |
| Penugem | Penumbra, Brisa | 45, 10, 10, 14, 13 | Pio Sombrio, Rajada, Mordida |

Os três iniciais têm tipos com relações diferentes com a Mata Funda: Geada vence Brota, Liga é neutro e Eco perde para Brota. Assim a escolha de tipo pesa desde o começo.

Espécies dos biomas novos da Era 1. As somas das bases seguem a Mata Funda: perto de 87 nas espécies da rota 1 e perto de 102 no chefe da rota 5.

| Espécie | Tipos | Base | Técnicas |
| --- | --- | --- | --- |
| Seixote | Rocha | 45, 11, 14, 8, 9 | Pedrisco, Investida |
| Cravelho | Liga | 45, 12, 13, 9, 9 | Limalha, Martelada, Mordida |
| Grutilo | Rocha, Penumbra | 45, 10, 11, 13, 12 | Pio Sombrio, Pedrisco, Mordida |
| Fagulhito | Faísca, Rocha | 40, 12, 9, 13, 15 | Centelha, Pedrisco, Investida |
| Drusito | Cristal, Rocha | 50, 11, 14, 13, 8 | Estilhaço, Pedrisco, Investida |
| Muralhão | Rocha, Liga | 60, 13, 16, 8, 5 | Desmoronar, Martelada, Pedrisco |
| Trotelo | Fera | 45, 12, 10, 8, 12 | Investida, Mordida |
| Saltico | Fera, Brisa | 40, 11, 9, 11, 15 | Rajada, Mordida, Investida |
| Zoadeiro | Eco, Brisa | 45, 9, 10, 15, 13 | Ressonância, Estalo, Rajada |
| Chifrudo | Fera, Rocha | 55, 14, 14, 7, 8 | Investida, Pedrisco, Mordida |
| Lobruma | Fera, Bruma | 45, 13, 10, 12, 14 | Cerração, Mordida, Investida |
| Tourado | Fera | 60, 15, 13, 7, 7 | Investida, Mordida, Pedrisco |
| Bolhim | Maré | 45, 9, 11, 12, 10 | Jato de Lodo, Mordida |
| Siriço | Maré, Rocha | 45, 12, 15, 8, 8 | Pedrisco, Jato de Lodo, Investida |
| Medusela | Maré, Peçonha | 45, 8, 10, 14, 13 | Névoa Tóxica, Jato de Lodo, Ferrão |
| Geleiro | Geada, Maré | 50, 10, 12, 13, 10 | Sopro Frio, Lasca Gélida, Jato de Lodo |
| Enguiço | Maré, Faísca | 40, 11, 9, 14, 16 | Centelha, Jato de Lodo, Mordida |
| Abissão | Maré, Penumbra | 60, 12, 13, 12, 5 | Onda Funda, Pio Sombrio, Jato de Lodo |

### Início do jogo

- O jogador escolhe um dos três iniciais. Ele começa no nível 1, com raridade comum e genes sorteados nessa faixa.
- Inventário inicial: 200 de ouro, 5 Tônicos de Retorno, 5 Tônicos de Cura e 10 Cápsulas.
- Só a rota 1 começa liberada.

### XP e nível

- Para subir do nível n para o n + 1 são precisos 6 × n² de XP. Ao subir, o XP do nível volta a 0 e o que sobrou passa para o nível seguinte.
- Com cerca de 4 s por abate na rota 1 (luta mais 1 s de espera), isso dá o nível 10 em cerca de 11 minutos. Com a Vida por rota da seção 4, o nível 100 fica em torno de 20 horas de caçada, estimativa a conferir no F2.

### Captura e matrizes

- O jogador define um filtro de captura com as espécies desejadas e a raridade mínima.
- Quando um selvagem que passa no filtro cai, o jogo gasta 1 Cápsula e tenta capturar. A chance depende da raridade: fraca 60%, comum 50%, incomum 30%, rara 15%, épica 6%, lendária 2%, mítica 1%.
- A criatura capturada vai para a reserva com os genes, a raridade, o nível e as técnicas que tinha.
- Sem Cápsula, nada é tentado. Com a reserva cheia, também não: nenhuma Cápsula é gasta e nenhuma matriz pode ser aberta.
- **Matriz e Cápsula se completam:** a matriz garante a raridade, mas sorteia os genes; a Cápsula guarda exatamente o selvagem que caiu.
- **Abrir uma matriz:** gera a criatura no nível 1, com genes sorteados na faixa da raridade da matriz. Se a raridade permitir variação prismática, a chance é de 2%.

### Time e reserva

- No F2, uma criatura caça por vez. As demais ficam na reserva, com no máximo 50 espaços.
- Trocar a criatura ativa encerra a luta em andamento, sem XP e sem derrota.

### Limite suave

O nível máximo é 200. Depois do nível 150, o ganho por nível cai para 25% do normal. **[a definir: o texto original dizia que o nível 200 fica cerca de 12% acima do 150, mas pela fórmula a diferença é de no máximo 8,4% (12,5 níveis de ganho sobre 149), menos ainda com base alta. Ou o texto vira "cerca de 8%", ou o ganho depois do 150 sobe para cerca de 36%.]** A diferença no topo vem de genes, raridade e escolha de tipos.

### Evolução

- Linhas de 2 formas evoluem no nível 75.
- Linhas de 3 formas dividem os intervalos de forma simétrica, evoluindo nos níveis 75 e 150.

**Evolução no F9:**

- **Efeito:** cada forma multiplica todos os atributos: ×1,10 na segunda forma e ×1,20 na terceira, junto com o bônus prismático. Sem isso a evolução seria quase só visual, porque a base de uma espécie só entra como o valor do nível 1: no nível 75, um Gelusco com gene 8 tem 642 de Vida, e uma forma com base 8 maior teria 650 (+1,2%). Com ×1,10, fica em cerca de 715.
- **Quando:** ao chegar ao nível da evolução, a criatura ativa evolui na hora, com aviso no registro. Ficam os genes, a raridade, a variação prismática, o nível e o XP; mudam a espécie, os tipos e as técnicas.
- **Reset de Era e reserva de Era anterior:** a criatura que volta ao nível 1 volta também à primeira forma da linha.
- **Cruzamento:** o filhote nasce na primeira forma da linha do pai escolhido (seção 10).
- **Matriz:** gera a espécie indicada nela, mesmo que seja uma forma evoluída.
- Na Era 1 o teto é 50, então a primeira evolução aparece na Era 2; a do nível 150 espera a Era 3.

**Linhas de 3 formas: os iniciais.** Bases cerca de 14% maiores a cada forma.

| Linha | Forma 1 | Forma 2 (nível 75) | Forma 3 (nível 150) |
| --- | --- | --- | --- |
| Gelo | Gelusco · Geada · 50, 13, 11, 13, 12 | Gelundo · Geada · 58, 15, 13, 15, 13 | Glaciarca · Geada, Brisa · 66, 17, 15, 17, 14 |
| Metal | Rebitim · Liga · 55, 13, 15, 9, 9 | Rebitaço · Liga · 63, 15, 17, 10, 10 | Couraçor · Liga, Rocha · 72, 17, 20, 11, 10 |
| Asa | Zumbilo · Eco · 45, 9, 10, 15, 14 | Zumbrado · Eco, Brisa · 52, 10, 11, 17, 16 | Estrondor · Eco, Penumbra · 59, 11, 12, 20, 18 |

- Técnicas: Gelundo e Rebitaço e Zumbrado mantêm as da primeira forma. Glaciarca: Avalanche, Sopro Frio, Lasca Gélida, Rajada. Couraçor: Prensa, Martelada, Limalha, Desmoronar. Estrondor: Ressonância, Pio Sombrio, Estalo, Rajada.
- Técnicas novas: **Avalanche** (Geada, física, 90, 8 s) e **Prensa** (Liga, física, 90, 8 s).

**Linhas de 2 formas com espécies que já existem.** Cada par já foi desenhado como a espécie da rota 1 e o chefe da rota 5 do mesmo bioma, com somas 87 e 102:

| Forma 1 | Forma 2 (nível 75) |
| --- | --- |
| Brotelho | Raizudo |
| Seixote | Muralhão |
| Trotelo | Tourado |
| Bolhim | Abissão |

- As demais espécies ficam com uma forma só por enquanto.
- Linhagens: Abissão sai de Gruta e entra em Concha, junto de Bolhim; Gruta fica só com Grutilo. As formas novas dos iniciais entram nas linhagens deles (Gelo, Metal, Asa).

### Eras (prestígio)

- **Tetos:** a Era 1 vai até o nível 50 e usa as rotas 1 a 3 de cada bioma. A Era 2 vai até o 100 e libera as rotas 4 e 5. As Eras 3 (150) e 4 (200) entram quando houver biomas para elas. Assim o teto de cada Era coincide com o topo de uma rota.
- **Sem nível próprio do Treinador:** a Era fecha quando a criatura ativa chega ao teto. Nenhuma criatura passa do teto da Era atual.
- **Reset:** a criatura ativa volta ao nível 1 com os mesmos genes; as rotas liberadas voltam à rota 1 e os contadores de chefe zeram. Ficam ouro, itens, matrizes, equipamentos e a Forja. O Treinador ganha a marca da Era.
- **Reserva:** mantém o nível. Uma criatura que ainda não passou pelo reset da Era atual, ao ser ativada, volta ao nível 1. As que nascem ou são capturadas na Era atual já contam como passadas.
- Na simulação com reposição de tônicos, o nível 50 chega em cerca de 24 horas.
- Eras seguintes também liberam os biomas e espécies delas, quando existirem.
- **Iniciais:** as criaturas iniciais de qualquer Era podem ser usadas por qualquer jogador, sem exigência de Era.

## 8. Equipamentos do Treinador

Nenhum equipamento aumenta força, vida ou ataque das criaturas. Eles só aceleram a economia e o idle.

| Espaço | Efeito |
| --- | --- |
| Cabeça | +% de XP |
| Peito | +% de ouro nas rotas |
| Pernas | Menos tempo entre um selvagem e o próximo |
| Mochila | Mais espaços no inventário |
| Luvas | Chance maior de selvagens nascerem em raridade mais alta |
| Joias (pescoço, brincos, braceletes) | Mais queda de itens comuns e raros, inclusive chaves de Ilhas |
| Cinto ou anel | Extração mais rápida nos postos de trabalho |
| Arma principal | Mais sucesso das Cápsulas na captura ociosa |
| Arma secundária | Desconto nas taxas de cruzamento |
| Insígnia | Mais chance de aparecer chefe de rota |
| Brasão | Mais chance de criatura prismática ao encontrar ou chocar |
| Companheiro de ombro | Coleta os itens com o jogo em segundo plano |


### Equipamentos no F5

- Entram 6 espaços, os que têm sistema pronto: Cabeça (+% de XP), Peito (+% de ouro das rotas), Pernas (−% de tempo entre selvagens), Arma principal (+% na chance de captura, multiplicando a chance da raridade), Arma secundária (−% na taxa de cruzamento) e Cinto (+% na produção da Forja). Os demais ficam para quando os sistemas deles existirem.
- **Fonte:** cada vitória sobre um chefe de rota tem 10% de chance de dar uma peça, de espaço sorteado com chance igual e raridade pela rota: comum na rota 1, incomum na 2, rara na 3, épica na 4 e lendária na 5.
- **Efeito por raridade:** 5%, 10%, 15%, 20% e 25%.
- Uma peça por espaço; as outras ficam no inventário. Trocar é livre. Os equipamentos atravessam o reset de Era.

## 9. Base e postos de trabalho

As criaturas da reserva trabalham em postos da base. A afinidade de tipo muda a produção: +25% no posto certo e até −50% no posto oposto.

| Posto | Produz | Tipos com afinidade |
| --- | --- | --- |
| Forja | Ouro | Chama, Faísca |
| Pesca | Materiais aquáticos | Maré |
| Mina | Materiais minerais e fragmentos | Rocha, Cristal, Liga |

- **Base comum:** opera com ouro; coleta materiais e faz cruzamentos básicos.
- **Base especial:** opera com Diamantes; é o único lugar com fragmentos de fim de jogo.
- **Santuário prismático:** custo alto; único lugar que aumenta a chance de chocar ovos prismáticos.

### Base no F4

- Só a Forja entra no F4. Pesca e Mina entram quando os materiais tiverem uso (equipamentos e Despertar).
- A Forja tem 3 vagas. Cada criatura produz 100 de ouro por hora × o multiplicador da raridade dela × a afinidade, também com o jogo fechado, dentro do limite de 24 horas.
- **Afinidade:** +25% se a criatura tem um tipo do posto; −50% se tem um tipo que vence um tipo do posto pela tabela da seção 6 (na Forja: Maré, Rocha e Bruma); 1× nos demais casos. Se as duas valerem, fica o +25%.
- A criatura no posto continua na reserva, mas não pode ser a ativa nem cruzar enquanto trabalha. Sair do posto é livre.
- O ouro produzido entra direto no inventário.

## 10. Cruzamento

1. Os dois pais pagam uma taxa de ouro ou Diamantes e deixam a conta para sempre (sacrifício).
2. Os pais precisam pertencer à mesma **linhagem compatível**, cadastrada no conteúdo.
3. O filhote nasce no nível 1, na primeira forma da linha de um dos pais; o jogador escolhe qual pai define a espécie.
4. O ovo herda 3 genes dos pais e sorteia os outros 2. A **Pedra do Destino** faz herdar 4.
5. **Técnicas herdadas:** algumas técnicas só passam por cruzamento, quando um dos pais as tem equipadas.
6. **Pergaminhos Técnicos:** consumíveis de uso único que ensinam uma técnica, com lista de espécies compatíveis no conteúdo.

### Cruzamento no F4

- **Linhagens:** Raiz (Brotelho, Sapolho, Raizudo), Enxame (Formigaço, Ferroa) e Asa (Penugem, Zumbilo). Gelusco e Rebitim formam cada um a sua linhagem e só cruzam com a mesma espécie até chegarem espécies afins de outros biomas.
- **Linhagens com os biomas novos:** Raiz (Brotelho, Sapolho, Raizudo); Enxame (Formigaço, Ferroa, Medusela); Asa (Penugem, Zumbilo, Zumbrado, Estrondor, Zoadeiro, Saltico); Gelo (Gelusco, Gelundo, Glaciarca, Geleiro); Metal (Rebitim, Rebitaço, Couraçor, Cravelho); Pedra (Seixote, Drusito, Muralhão); Gruta (Grutilo); Faísca (Fagulhito, Enguiço); Manada (Trotelo, Chifrudo, Lobruma, Tourado); Concha (Bolhim, Siriço, Abissão). Assim os três iniciais passam a ter com quem cruzar.
- **Pais:** duas criaturas da reserva, fora de posto de trabalho. A ativa não cruza. A taxa é de 300 de ouro.
- **Herança:** o jogador escolhe 3 atributos; cada um recebe o maior gene entre os dois pais. Os outros 2 são sorteados de 1 a 20, com chance igual.
- A raridade do filhote sai da soma dos genes (seção 7). Se a raridade permitir, a chance de ser prismático é de 2%.
- O filhote nasce na hora, no nível 1, com as técnicas da espécie. Ovos com tempo de chocar, Pedra do Destino, técnicas herdadas e Pergaminhos ficam para depois do F4.
- Na simulação de 10 cruzamentos seguidos com os melhores pais, a melhor soma de genes sobe de cerca de 64 para 80 (de incomum para rara ou épica). Com os 3 atributos sorteados, cai para cerca de 57.

## 11. Fim de jogo

O documento original listava seis sistemas de transformação que reproduziam os de uma franquia; todos saíram (seção 14). No lugar entra um sistema próprio, a partir do nível 150:

- **Despertar:** com fragmentos da Mina e materiais do bioma, a criatura desperta uma vez. Ganha um visual novo, uma técnica exclusiva e +15% nos atributos. Um Despertar por criatura.
- **Ilhas Lendárias:** masmorras solo que pedem chaves raras da rota 5. Perder expulsa da ilha; chegar ao último andar dá matrizes de raridade lendária e mítica.

## 12. Fase online (depois do lançamento solo)

Ficam para a fase 2, com servidor e regras próprias:

- Arena assíncrona com defesas controladas pela IA e ranking diário.
- Torneios semanais por divisão de Era, calculados no servidor.
- Liga de duelo manual em tempo real.
- Chefe global do servidor duas vezes ao dia, com prêmios por faixa de dano.
- Guildas, com chefe de guilda e guerra de defesas.
- Chat e correio.

## 13. Economia e monetização

### Recursos

| Recurso | Fonte | Uso |
| --- | --- | --- |
| Ouro | Caçadas, Forja | Tônicos, taxas de cruzamento, base comum, Mercado da Cidade |
| Diamantes | Conquistas, calendário, compra **[a definir]** | Base especial, Santuário, conveniências |
| Matrizes | Quedas nas rotas, Ilhas | Gerar criaturas |
| Fragmentos e materiais | Postos, rotas | Despertar, equipamentos |

### Ouro nas rotas e Loja da Cidade

- Cada abate rende metade do XP base da rota em ouro, arredondado para baixo (5, 17, 50, 125 e 325). A Fadiga corta pela metade.
- **Loja da Cidade:** Cápsula por 50 de ouro, Tônico de Cura por 25 e Tônico de Retorno por 150, sem limite de estoque.
- **Reposição automática:** o jogador define um estoque mínimo de cada item da Loja. Quando o estoque cai abaixo dele e há ouro, a Loja compra na hora, também com o jogo fechado. Começa desligada (mínimo 0).
- **Por que a reposição:** na simulação de 40 horas na Era 1, o jogador que repõe só a cada 10 minutos fica sem Tônicos de Cura entre as visitas e não chega ao nível 50. Com reposição a cada minuto, chega em cerca de 34 horas. Quem também captura raros e troca a criatura ativa chega em cerca de 11 horas, com cerca de 4 derrotas por hora. Mudar as regras de derrota (não recuar de rota, Fadiga só por chefe) ou fazer os raros nascerem mais abaixo não mudou o resultado além do ruído da simulação.

### Consumo de ouro no fim de jogo

Substitui a roleta e a máquina de invocação (seção 14). O **Mercado da Cidade** vende matrizes específicas por preço fixo e alto, com estoque que gira a cada dia. O jogador vê exatamente o que compra, sem sorteio.

### Monetização

- Venda direta apenas de itens visuais: auras de sprite, molduras de perfil e rastros de partículas.
- Nada pago entrega item sorteado, e nada pago aumenta força.
- **Calendário de presença** (28 dias, com recuperação de dia perdido) e **Jornada do Treinador** (trilha de 30 dias com 50 níveis, travada por semanas): entram depois, com revisão jurídica se tiverem parte paga.

## 14. Removido do documento original

| Item | Motivo |
| --- | --- |
| Mega Evolução, Movimentos Z, Dynamax/Gigantamax, Terastal, Reversão Primal, formas regionais (Hisui, Alola) | Reproduzem mecânicas e nomes de uma franquia; trocar o nome não as torna originais |
| Professor Carvalho, Revive Potion, TMs, Egg Moves, Grupos de Ovos | Nomes e termos da franquia; substituídos por versões próprias nas seções 5 e 10 |
| Os 18 tipos com "Lutador" e "Fada" renomeados | Cópia da tabela de tipos da franquia; substituída pela seção 6 |
| Seis atributos (HP, DEF, DEF SP, ATK, ATK SP, VEL) e IVs de 1 a 31 | Mesmo conjunto e escala da franquia; substituídos pela seção 7 |
| Evolix e a máquina de invocação dele | Criatura derivada de uma criatura da franquia; sorteio de criatura |
| Roleta da Fortuna com garantia em 200 giros | Caixa de recompensa; a lei brasileira veda esse tipo de item em jogos acessíveis a menores |
| Doação com comissão de 10% em Diamantes para quem indicou | Envolve pagamento e repasse; só volta com orientação jurídica |
| Bônus de cargo Booster do Discord | Depende de serviço externo pago; reavaliar na fase online |
| "Anti-Nintendo" e "GenMon" | A proteção vem de não copiar, não de trocar nomes |

## 15. Arquitetura técnica

- TypeScript, Vite e React. O motor de regras fica em `src/engine/`, puro e testado, sem tela, relógio ou sorteio próprios.
- Bibliotecas de números grandes, de cena 2D e de estado entram quando a primeira regra pedir, com aprovação.

## 16. Plano de marcos

| Marco | Entrega | Critério |
| --- | --- | --- |
| F0 · Fundação | Projeto vazio, testes e CLAUDE.md | A tela abre e os testes rodam |
| F1 · Combate | Criatura com genes, fila de 4 técnicas, tipos e derrota com Tônico, sem tela | Testes simulam 1 hora de caçada em menos de 1 segundo |
| F2 · Caçada jogável | Um bioma com 5 rotas, captura com Cápsulas e matrizes | Decidir se o loop prende por 10 minutos |
| F3 · Save e offline | Save versionado e ganho offline com derrotas e Fadiga | Fechar e reabrir mantém o progresso e credita o tempo fora |
| F4 · Cruzamento e base | Cruzamento com herança de genes, postos de trabalho | Uma linhagem melhora por cruzamento numa sessão de teste |
| F5 · Eras e equipamentos | Reset de Era e espaços de equipamento | Uma Era completa jogável |
| F6 · Lançamento solo | Biomas da Era 1, arte provisória e balanceamento | Versão de navegador publicada |
| F7 · Pós-lançamento | Save na nuvem e arte final | Progresso mantido entre dispositivos |
| F8 · Robustez | Uma aba por vez, tela de erro com o save, exportar e importar o save em arquivo, workflow atualizado | Duas abas abertas não corrompem o save e um save quebrado não deixa a tela em branco |

## 17. Pendências

1. 18 biomas para 16 tipos (seção 4): biomas mistos ou mudança na lista de tipos.
2. Biomas e espécies da Era 2 em diante (a Era 1 tem os 4 biomas da seção 4).
3. Nome das criaturas no jogo.
4. Valores base das espécies dos demais biomas.
5. Biomas das Eras 3 e 4 (tetos 150 e 200) e se há mais Eras depois delas.
6. Diferença entre os níveis 150 e 200 no limite suave (seção 7).
