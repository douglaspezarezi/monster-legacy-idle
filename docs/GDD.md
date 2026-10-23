# Monster Legacy Idle · Documento de design

Versão de trabalho, reescrita a partir de "GDD_Monster_Legacy_Idle", em versão original. As propostas criadas nesta reescrita para preencher ou substituir o que precisou sair foram aprovadas em 14/10/2026, assim como o conteúdo e as regras do F2. Itens marcados com **[proposta]** são novos e esperam aprovação; itens marcados com **[a definir]** são escolhas em aberto. A seção 14 lista o que foi removido e por quê.

## 1. Visão geral

Idle RPG de criaturas para navegador. O jogador forma criaturas, deixa-as caçando em rotas enquanto está fora, cria linhagens melhores por cruzamento e monta uma base de trabalho com as criaturas da reserva.

- **Plataforma:** navegador, com interface pensada também para o celular.
- **Fase 1 (lançamento):** jogo solo, com save local e, depois, save na nuvem.
- **Fase 2 (online):** sistemas sociais e PvP da seção 12, só depois do lançamento solo e com servidor próprio.
- **Título provisório:** Monster Legacy Idle. No texto do jogo, as criaturas se chamam **Monstros**. Neste documento e no código, o termo de trabalho continua "criatura".

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

### Cena da caçada no F17

- **O que aparece:** acima do painel da luta, uma cena em pixel art mostra o monstro ativo andando pelo bioma da caçada. Quando o selvagem aparece, ele entra pela direita e os dois lutam. O painel atual, com nomes, barras e botões, continua abaixo da cena.
- **Só desenho:** a cena lê o estado que o motor já devolve, como o encontro, a vida dos dois lados e se a caçada está pausada. Nenhuma regra muda, e o motor não ganha código de tela.
- **Tecnologia:** Canvas 2D do próprio navegador, sem dependência nova. A cena é desenhada em 160 × 90 pixels e ampliada por número inteiro, para os pixels ficarem nítidos.
- **Bioma:** o fundo provisório é gerado por código a partir do tipo do bioma, com céu, horizonte, chão e um elemento próprio de cada tipo, como chamas, ondas ou cristais. Duas camadas rolam em velocidades diferentes enquanto o monstro anda, para dar profundidade.
- **Monstros:** o sprite provisório é o mesmo desenho 8 × 8 do retrato, ampliado 2 vezes, para cada espécie continuar reconhecível. Ao andar, o sprite balança 1 pixel em dois quadros. O chefe aparece 1,5 vez maior. A prismática ganha brilho e a desperta ganha contorno dourado, como no retrato.
- **Momentos da luta:**
  - **Procurando:** o monstro anda e o fundo rola.
  - **Encontro:** o fundo para e o selvagem entra em 0,5 s.
  - **Golpe:** quando a vida de um lado cai, o outro avança 4 pixels e volta, e o atingido pisca.
  - **Vitória:** o selvagem pisca e some.
  - **Derrota:** o monstro cai.
  - **Pausa:** o monstro fica parado, deitado.
- **Desempenho:** a cena só é desenhada com a aba visível. Ela usa o quadro do navegador, limitado a 30 por segundo. O GDD já pede um modo leve; com ele ligado, a cena some e fica só o painel. A preferência fica guardada no navegador, fora do save.
- **Fica para depois:** o mapa-múndi da seção 4, a arte final, os sons e animações próprias de cada técnica.
- **A arte provisória é original**, gerada por regra a partir dos nomes e tipos do jogo, como o retrato atual. Quando a arte final chegar, ela entra no lugar dos sprites e dos fundos sem mudar a cena.

## 4. Mundo e rotas

O mundo tem 16 biomas, um por tipo, 4 por Era. Os biomas das Eras 1 e 2 têm 5 rotas; os da Era 3 têm também a rota 6, e os da Era 4, as rotas 6 e 7.

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

### Mapa-múndi no F18

- **O que muda na tela:** o mapa entra no lugar dos botões de bioma. Ele tem 4 faixas, uma por Era, com os 4 biomas de cada Era. Cada bioma aparece num cartão com a miniatura do cenário dele, igual ao da cena da caçada, mais o nome, o tipo e as rotas liberadas.
- **Biomas trancados:** os de Eras futuras aparecem acinzentados, com "Abre na Era N". O bioma da caçada fica destacado, com o monstro ativo desenhado no cartão.
- **Uso:** tocar num cartão troca de bioma, como os botões de hoje. As rotas continuam nos botões abaixo do mapa, agora com o XP por hora estimado em cada uma.
- **Indicador de melhor rota:** para cada rota liberada dos biomas abertos, o motor simula 5 minutos de caçada do monstro ativo, com nível, tipos, técnicas, equipamentos e Tônicos atuais e um gerador de semente fixa. Daí sai o XP por hora estimado. A rota com mais XP por hora ganha uma marca no mapa e uma linha de texto, por exemplo "Melhor rota para Couraçor: Planície Gelada, rota 7, cerca de 3,4 milhões de XP por hora".
- **A simulação não muda o jogo:** ela roda numa cópia do estado, sem gastar itens nem mexer no gerador da caçada.
- **Quando recalcula:** quando o monstro ativo muda, sobe de nível, evolui ou desperta, quando a Era muda ou quando um equipamento é trocado. No máximo uma vez por minuto, porque no começo do jogo o nível sobe a cada poucos abates.
- **Desempenho:** simular todas as rotas de uma vez custa até cerca de 0,35 s no fim de jogo (92 rotas). Medido no Mac de desenvolvimento:

| Caso | Rotas abertas | 5 min por rota | 10 min por rota |
| --- | --- | --- | --- |
| Gelusco no nível 20, Era 1 | 12 | 22 ms | 49 ms |
| Rebitaço no nível 90, Era 2 | 40 | 102 ms | 211 ms |
| Couraçor no nível 200, Era 4 | 92 | 353 ms | 648 ms |

  Por isso a conta é feita uma rota por vez, entre os quadros da tela. O mapa mostra "calculando…" até terminar, e a tela não trava.
- **Por que vale:** no mesmo caso, o Couraçor rende 3,36 milhões de XP por hora na rota 7 da Planície Gelada, 2,06 milhões na Cratera Estelar e 1,97 milhão nas Ruínas de Ferro. Escolher pelo tipo dá até 60% a mais, e é isso que o pilar 3 pede.
- **Fica para depois:** o mapa desenhado como um continente com caminhos entre os biomas, que pede arte final.

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

### Biomas da Era 2

- Os biomas da Era 2 aparecem a partir da Era 2, com as 5 rotas. Os da Era 1 continuam abertos.
- Tipos: Chama, Faísca, Peçonha e Penumbra.

| Rota | Encosta Rubra (Chama) | Chapada Trovão (Faísca) | Pântano Amargo (Peçonha) | Bosque Sem Lua (Penumbra) |
| --- | --- | --- | --- | --- |
| 1 | Cinzelo, Brasino | Choquim, Zapeta | Lodilho, Mosquel | Sombrito, Noctino |
| 2 | Cinzelo, Brasino, Fumarel | Choquim, Zapeta, Magnetil | Lodilho, Mosquel, Mofento | Sombrito, Noctino, Vigília |
| 3 | Brasino, Fumarel, Lavrudo | Zapeta, Magnetil, Trovisco | Mosquel, Mofento, Rastejo | Noctino, Vigília, Lobreu |
| 4 | Fumarel, Lavrudo, Pirilume | Magnetil, Trovisco, Nimbeiro | Mofento, Rastejo, Brumoso | Vigília, Lobreu, Breuzal |
| 5 | Lavrudo, Pirilume, Fornalho | Trovisco, Nimbeiro, Trovejão | Rastejo, Brumoso, Atoleiro | Lobreu, Breuzal, Noitarão |

Simulação de 72 horas na Era 2, a partir do nível 1, com reposição automática (horas até o nível 100, mediana de 3 sementes; 99 = não chegou):

| Bioma | Gelusco comum | Rebitim comum | Zumbilo comum | Gelusco raro | Rebitim raro | Zumbilo raro |
| --- | --- | --- | --- | --- | --- | --- |
| Encosta Rubra | 99 | 36 | 25 | 17 | 8 | 7 |
| Chapada Trovão | 49 | 99 | 26 | 9 | 13 | 6 |
| Pântano Amargo | 32 | 34 | 34 | 7 | 9 | 7 |
| Bosque Sem Lua | 34 | 61 | 52 | 7 | 10 | 8 |

- Com genes comuns, a desvantagem de tipo trava o inicial: Gelusco na Encosta Rubra e Rebitim na Chapada Trovão não chegam ao 100. Com genes raros, a Era 2 leva de 6 a 17 horas, mais rápida que a Era 1, porque os genes acumulados aceleram cada Era.
- Espécies da Era 1 com o tipo que vence o bioma, mas bases e técnicas fracas (Seixote na Chapada, Saltico no Pântano), não foram mais rápidas que os iniciais.

### Biomas da Era 3

- Os biomas da Era 3 aparecem a partir da Era 3 e são os únicos com a **rota 6**. Os das Eras 1 e 2 continuam com 5 rotas; para passar do nível 100 é preciso caçar num bioma da Era 3.
- Tipos: Brisa, Cristal, Bruma e Aurora. Ficam para a Era 4 Geada, Liga, Eco e Astro.
- Cada inicial tem um bioma favorável: Geada vence Brisa (Gelusco no Cume dos Ventos); Liga e Eco vencem Cristal (Rebitim e Zumbilo no Veio Cristalino); Brisa, segundo tipo do Zumbrado, vence Bruma. Aurora resiste a Geada, e o Gelusco sofre no Planalto da Alvorada.

| Rota | Faixa de nível | Abate médio | XP base | XP por hora | Queda de matriz | Vida e dano |
| --- | --- | --- | --- | --- | --- | --- |
| 6 | 101 a 150 | 16 s | 1.600 | 360.000 | 0,01% (mítica) | Vida ×6, Ataque e Foco ÷6 |

- O chefe da rota 6 deixa cair equipamento mítico, na mesma chance dos outros chefes. Os números seguem o padrão das rotas 1 a 5.

| Rota | Cume dos Ventos (Brisa) | Veio Cristalino (Cristal) | Lagoa Velada (Bruma) | Planalto da Alvorada (Aurora) |
| --- | --- | --- | --- | --- |
| 1 | Ventilho, Pluminho | Lasquim, Brilhote | Neblim, Garoel | Raiolim, Orvelim |
| 2 | Ventilho, Pluminho, Saraivo | Lasquim, Brilhote, Geodim | Neblim, Garoel, Vultinho | Raiolim, Orvelim, Soalheiro |
| 3 | Pluminho, Saraivo, Escarpim | Brilhote, Geodim, Facetor | Garoel, Vultinho, Orvalim | Orvelim, Soalheiro, Halim |
| 4 | Saraivo, Escarpim, Ventaval | Geodim, Facetor, Lascardo | Vultinho, Orvalim, Neblinor | Soalheiro, Halim, Raiante |
| 5 | Escarpim, Ventaval, Gaviel | Facetor, Lascardo, Espelhim | Orvalim, Neblinor, Miragel | Halim, Raiante, Alvorel |
| 6 | Ventaval, Gaviel, Furacor | Lascardo, Espelhim, Lapidão | Neblinor, Miragel, Brumarca | Raiante, Alvorel, Zenital |

Simulação de 120 horas na Era 3, a partir do nível 1, com reposição automática (horas até o nível 100 / até o 150, mediana de 3 sementes):

| Bioma | Gelusco raro | Rebitim raro | Zumbilo raro | Gelusco épico | Rebitim épico | Zumbilo épico |
| --- | --- | --- | --- | --- | --- | --- |
| Cume dos Ventos | 5 / 9 | 7 / 13 | 6 / 11 | 3 / 6 | 5 / 9 | 4 / 7 |
| Veio Cristalino | 12 / 20 | 5 / 8 | 4 / 7 | 7 / 12 | 3 / 5 | 2 / 4 |
| Lagoa Velada | 7 / 12 | 7 / 12 | 7 / 11 | 4 / 8 | 4 / 7 | 4 / 7 |
| Planalto da Alvorada | 13 / 20 | 8 / 13 | 5 / 9 | 7 / 12 | 4 / 8 | 3 / 6 |

- Com genes raros, a Era 3 leva de 7 a 20 horas, perto da Era 2 (6 a 17), mesmo com 50 níveis a mais: os genes acumulados aceleram cada Era.
- A rota 6 pesa pouco no tempo. Com Vida ×8 ou XP base 1.200, o nível 150 atrasa só de 1 a 4 horas, porque genes raros vencem o selvagem antes de a Vida extra contar. Por isso a proposta mantém o padrão das rotas anteriores.

### Biomas da Era 4

- Os biomas da Era 4 aparecem a partir da Era 4 e são os únicos com a **rota 7**, além da rota 6. Para passar do nível 150 é preciso caçar num bioma da Era 4.
- Tipos: Geada, Liga, Eco e Astro, os últimos 4 dos 16. A Era 4 é a última: o nível 200 é o máximo do jogo, e o que vem depois é o fim de jogo da seção 11.
- Bioma favorável a cada inicial: Liga vence Geada (Rebitim na Planície Gelada); Eco vence Liga (Zumbilo nas Ruínas de Ferro); Penumbra, segundo tipo do Estrondor, vence Eco. O Gelusco não tem bioma favorável na Era 4: Liga e Astro vencem Geada. Ele conta com as capturas e com os biomas das Eras anteriores até o 150.

| Rota | Faixa de nível | Abate médio | XP base | XP por hora | Queda de matriz | Vida e dano |
| --- | --- | --- | --- | --- | --- | --- |
| 7 | 151 a 200 | 20 s | 4.000 | 720.000 | 0,005% (mítica) | Vida ×8, Ataque e Foco ÷8 |

- O chefe da rota 7 deixa cair equipamento mítico, como o da rota 6.

| Rota | Planície Gelada (Geada) | Ruínas de Ferro (Liga) | Desfiladeiro do Eco (Eco) | Cratera Estelar (Astro) |
| --- | --- | --- | --- | --- |
| 1 | Friozim, Nevisco | Parafim, Engrenil | Ecoim, Grilão | Estelim, Cometo |
| 2 | Friozim, Nevisco, Cristagelo | Parafim, Engrenil, Ferrugo | Ecoim, Grilão, Sinim | Estelim, Cometo, Meteorim |
| 3 | Nevisco, Cristagelo, Morsudo | Engrenil, Ferrugo, Lâmino | Grilão, Sinim, Morcegal | Cometo, Meteorim, Luarel |
| 4 | Cristagelo, Morsudo, Friagem | Ferrugo, Lâmino, Parafusão | Sinim, Morcegal, Ecoante | Meteorim, Luarel, Estelado |
| 5 | Morsudo, Friagem, Geadouro | Lâmino, Parafusão, Sentinela | Morcegal, Ecoante, Trovoz | Luarel, Estelado, Nebulim |
| 6 | Friagem, Geadouro, Invernal | Parafusão, Sentinela, Blindarca | Ecoante, Trovoz, Retumbo | Estelado, Nebulim, Constelar |
| 7 | Geadouro, Invernal, Permafrio | Sentinela, Blindarca, Colosferro | Trovoz, Retumbo, Sonarca | Nebulim, Constelar, Eclipsor |

Simulação de 200 horas na Era 4, a partir do nível 1, com reposição automática (horas até o nível 150 / até o 200, mediana de 3 sementes):

| Bioma | Gelusco épico | Rebitim épico | Zumbilo épico | Gelusco lendário | Rebitim lendário | Zumbilo lendário |
| --- | --- | --- | --- | --- | --- | --- |
| Planície Gelada | 10 / 16 | 4 / 7 | 7 / 10 | 7 / 11 | 3 / 5 | 5 / 7 |
| Ruínas de Ferro | 8 / 13 | 7 / 11 | 7 / 11 | 5 / 9 | 5 / 8 | 5 / 8 |
| Desfiladeiro do Eco | 7 / 10 | 9 / 13 | 5 / 8 | 5 / 7 | 6 / 9 | 4 / 6 |
| Cratera Estelar | 9 / 15 | 6 / 9 | 15 / 20 | 6 / 10 | 4 / 7 | 10 / 14 |

- Com genes épicos, a Era 4 leva de 7 a 20 horas, perto das Eras 2 e 3. Do 150 ao 200 são de 3 a 6 horas: com o limite suave, o selvagem da rota 7 também cresce pouco por nível, e a luta não fica mais difícil.
- O Zumbilo sofre na Cratera Estelar, porque Astro é imune a Eco.


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

Técnicas novas da Era 2:

| Técnica | Tipo | Categoria | Poder | Recarga |
| --- | --- | --- | --- | --- |
| Tição | Chama | física | 55 | 3 s |
| Fornalha | Chama | especial | 85 | 7 s |
| Clarão | Aurora | especial | 70 | 5 s |
| Descarga | Faísca | física | 85 | 7 s |
| Sombra Cortante | Penumbra | física | 60 | 3 s |

Técnicas novas da Era 3:

| Técnica | Tipo | Categoria | Poder | Recarga |
| --- | --- | --- | --- | --- |
| Lufada | Brisa | física | 60 | 3 s |
| Ciclone | Brisa | especial | 85 | 7 s |
| Refração | Cristal | especial | 85 | 7 s |
| Mortalha | Bruma | física | 85 | 7 s |
| Lança de Luz | Aurora | física | 60 | 3 s |
| Fulgor | Aurora | especial | 90 | 8 s |

Técnicas novas da Era 4. Astro ainda não tinha técnica:

| Técnica | Tipo | Categoria | Poder | Recarga |
| --- | --- | --- | --- | --- |
| Nevasca | Geada | especial | 90 | 8 s |
| Brado | Eco | física | 60 | 3 s |
| Poeira Estelar | Astro | especial | 55 | 3 s |
| Meteoro | Astro | física | 85 | 7 s |
| Gravidade | Astro | especial | 90 | 8 s |

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

Espécies da Era 2. Em cada bioma, a espécie da rota 1 evolui no nível 75 para o chefe da rota 5: Cinzelo → Fornalho, Choquim → Trovejão, Lodilho → Atoleiro, Sombrito → Noitarão.

| Espécie | Tipos | Base | Técnicas |
| --- | --- | --- | --- |
| Cinzelo | Chama | 45, 12, 10, 11, 9 | Tição, Mordida |
| Brasino | Chama, Fera | 42, 13, 9, 8, 14 | Tição, Investida, Mordida |
| Fumarel | Chama, Bruma | 45, 9, 10, 14, 13 | Fornalha, Cerração, Tição |
| Lavrudo | Chama, Rocha | 55, 13, 15, 8, 7 | Tição, Pedrisco, Desmoronar |
| Pirilume | Chama, Aurora | 42, 9, 10, 16, 15 | Fornalha, Clarão, Tição |
| Fornalho | Chama | 60, 15, 13, 8, 6 | Fornalha, Tição, Investida |
| Choquim | Faísca | 45, 10, 10, 12, 10 | Centelha, Mordida |
| Zapeta | Faísca, Brisa | 40, 10, 9, 12, 15 | Centelha, Rajada |
| Magnetil | Faísca, Liga | 50, 12, 14, 10, 7 | Descarga, Martelada, Limalha |
| Trovisco | Faísca, Fera | 48, 14, 10, 10, 13 | Descarga, Investida, Mordida |
| Nimbeiro | Faísca, Bruma | 45, 9, 10, 15, 13 | Centelha, Cerração, Rajada |
| Trovejão | Faísca | 60, 14, 12, 10, 6 | Descarga, Centelha, Investida |
| Lodilho | Peçonha | 45, 10, 11, 11, 10 | Ferrão, Mordida |
| Mosquel | Peçonha, Brisa | 38, 11, 8, 12, 16 | Ferrão, Rajada |
| Mofento | Peçonha, Brota | 50, 9, 12, 13, 8 | Névoa Tóxica, Esporos |
| Rastejo | Peçonha, Fera | 48, 14, 10, 9, 13 | Ferrão, Investida, Mordida |
| Brumoso | Peçonha, Bruma | 45, 9, 11, 15, 12 | Névoa Tóxica, Cerração |
| Atoleiro | Peçonha, Maré | 62, 13, 14, 8, 5 | Névoa Tóxica, Jato de Lodo, Ferrão |
| Sombrito | Penumbra | 45, 10, 10, 12, 10 | Pio Sombrio, Mordida |
| Noctino | Penumbra, Brisa | 40, 10, 9, 12, 15 | Pio Sombrio, Rajada |
| Vigília | Penumbra, Eco | 45, 9, 10, 15, 13 | Ressonância, Pio Sombrio, Estalo |
| Lobreu | Penumbra, Fera | 50, 14, 11, 8, 12 | Sombra Cortante, Mordida, Investida |
| Breuzal | Penumbra, Bruma | 48, 9, 11, 14, 11 | Cerração, Pio Sombrio |
| Noitarão | Penumbra | 60, 14, 13, 10, 5 | Sombra Cortante, Pio Sombrio, Investida |

- **Linhagens da Era 2:** Brasa (Cinzelo, Fornalho, Brasino); Fumaça (Lavrudo, Pirilume); Faísca recebe Choquim, Trovejão, Zapeta; Metal recebe Magnetil; Manada recebe Trovisco, Rastejo, Lobreu; Enxame recebe Lodilho, Atoleiro, Mosquel; Raiz recebe Mofento; Gruta recebe Sombrito, Noitarão; Asa recebe Noctino, Vigília; Névoa nova (Fumarel, Nimbeiro, Brumoso, Breuzal).

**Espécies da Era 3.** Em cada bioma, a espécie da rota 1 forma uma linha de 3 formas: evolui no nível 75 para a espécie que é chefe da rota 5 e no 150 para o chefe da rota 6. As somas das bases seguem os iniciais: perto de 87, 102 e 114.

| Espécie | Tipos | Base | Técnicas |
| --- | --- | --- | --- |
| Ventilho | Brisa | 45, 10, 10, 11, 11 | Rajada, Mordida |
| Pluminho | Brisa, Fera | 40, 12, 9, 9, 16 | Lufada, Investida, Mordida |
| Saraivo | Brisa, Geada | 45, 10, 11, 14, 12 | Sopro Frio, Rajada, Lasca Gélida |
| Escarpim | Brisa, Rocha | 52, 13, 14, 8, 9 | Pedrisco, Lufada, Desmoronar |
| Ventaval | Brisa | 52, 12, 12, 13, 13 | Ciclone, Lufada, Rajada |
| Gaviel | Brisa, Penumbra | 45, 11, 10, 15, 15 | Ciclone, Pio Sombrio, Rajada |
| Furacor | Brisa | 58, 14, 13, 14, 14 | Ciclone, Lufada, Investida |
| Lasquim | Cristal | 45, 11, 12, 10, 9 | Estilhaço, Mordida |
| Brilhote | Cristal, Aurora | 40, 9, 10, 14, 14 | Clarão, Estilhaço |
| Geodim | Cristal, Rocha | 55, 11, 15, 9, 7 | Estilhaço, Pedrisco, Desmoronar |
| Facetor | Cristal, Liga | 50, 13, 15, 9, 8 | Estilhaço, Martelada, Limalha |
| Lascardo | Cristal | 52, 13, 14, 12, 11 | Refração, Estilhaço, Mordida |
| Espelhim | Cristal, Penumbra | 45, 9, 10, 16, 15 | Refração, Pio Sombrio |
| Lapidão | Cristal, Rocha | 60, 15, 17, 12, 9 | Refração, Estilhaço, Desmoronar |
| Neblim | Bruma | 45, 10, 10, 12, 10 | Cerração, Mordida |
| Garoel | Bruma, Maré | 50, 9, 11, 12, 9 | Jato de Lodo, Cerração |
| Vultinho | Bruma, Penumbra | 42, 10, 9, 15, 14 | Pio Sombrio, Cerração |
| Orvalim | Bruma, Brota | 52, 9, 12, 13, 9 | Esporos, Cerração |
| Neblinor | Bruma | 52, 12, 12, 14, 12 | Cerração, Mortalha, Mordida |
| Miragel | Bruma, Aurora | 44, 9, 10, 16, 16 | Clarão, Cerração |
| Brumarca | Bruma | 58, 15, 14, 14, 12 | Mortalha, Cerração, Investida |
| Raiolim | Aurora | 45, 10, 10, 12, 10 | Clarão, Mordida |
| Orvelim | Aurora, Brota | 48, 9, 11, 13, 8 | Clarão, Esporos |
| Soalheiro | Aurora, Chama | 44, 12, 9, 13, 13 | Fornalha, Clarão, Tição |
| Halim | Aurora, Cristal | 50, 10, 13, 14, 8 | Clarão, Estilhaço |
| Raiante | Aurora | 52, 12, 12, 14, 12 | Fulgor, Lança de Luz, Mordida |
| Alvorel | Aurora, Fera | 50, 15, 10, 8, 13 | Lança de Luz, Investida, Mordida |
| Zenital | Aurora, Brisa | 58, 14, 13, 16, 12 | Fulgor, Lança de Luz, Rajada |

- **Linhas:** Ventilho → Ventaval → Furacor; Lasquim → Lascardo → Lapidão; Neblim → Neblinor → Brumarca; Raiolim → Raiante → Zenital.
- **Linhagens da Era 3:** Vento nova (Ventilho, Ventaval, Furacor, Pluminho); Lasca nova (Lasquim, Lascardo, Lapidão, Geodim, Facetor); Véu nova (Neblim, Neblinor, Brumarca, Garoel); Luz nova (Raiolim, Raiante, Zenital, Orvelim, Halim, Brilhote); Gelo recebe Saraivo; Pedra recebe Escarpim; Asa recebe Gaviel; Gruta recebe Espelhim; Névoa recebe Vultinho e Miragel; Raiz recebe Orvalim; Brasa recebe Soalheiro; Manada recebe Alvorel.

**Espécies da Era 4.** Cada bioma tem uma linha de 3 formas, como na Era 3: a espécie da rota 1 evolui no nível 75 para o chefe da rota 5 e no 150 para o chefe da rota 6. O chefe da rota 7 tem uma forma só e soma 120.

| Espécie | Tipos | Base | Técnicas |
| --- | --- | --- | --- |
| Friozim | Geada | 45, 10, 11, 11, 10 | Lasca Gélida, Mordida |
| Nevisco | Geada, Fera | 42, 13, 9, 8, 15 | Lasca Gélida, Investida, Mordida |
| Cristagelo | Geada, Cristal | 48, 10, 13, 13, 8 | Sopro Frio, Estilhaço |
| Morsudo | Geada, Maré | 58, 12, 13, 9, 6 | Lasca Gélida, Jato de Lodo, Investida |
| Friagem | Geada | 52, 12, 13, 13, 12 | Sopro Frio, Lasca Gélida, Mordida |
| Geadouro | Geada, Penumbra | 50, 12, 11, 16, 14 | Sopro Frio, Pio Sombrio |
| Invernal | Geada | 60, 15, 14, 14, 11 | Nevasca, Avalanche, Lasca Gélida |
| Permafrio | Geada, Rocha | 66, 16, 18, 12, 8 | Avalanche, Desmoronar, Nevasca |
| Parafim | Liga | 45, 11, 13, 9, 9 | Martelada, Mordida |
| Engrenil | Liga, Faísca | 42, 10, 10, 13, 13 | Centelha, Martelada |
| Ferrugo | Liga, Rocha | 52, 11, 14, 8, 7 | Martelada, Pedrisco |
| Lâmino | Liga, Brisa | 45, 14, 11, 9, 14 | Martelada, Lufada, Investida |
| Parafusão | Liga | 55, 13, 16, 10, 8 | Limalha, Martelada, Investida |
| Sentinela | Liga, Penumbra | 52, 13, 14, 13, 10 | Limalha, Sombra Cortante |
| Blindarca | Liga | 62, 15, 18, 11, 8 | Prensa, Limalha, Martelada |
| Colosferro | Liga, Astro | 66, 17, 17, 12, 8 | Prensa, Gravidade, Martelada |
| Ecoim | Eco | 45, 9, 10, 13, 10 | Estalo, Mordida |
| Grilão | Eco, Fera | 42, 12, 9, 9, 15 | Brado, Investida, Mordida |
| Sinim | Eco, Liga | 48, 10, 13, 12, 9 | Estalo, Limalha |
| Morcegal | Eco, Penumbra | 44, 9, 10, 15, 15 | Pio Sombrio, Estalo |
| Ecoante | Eco | 52, 11, 12, 14, 13 | Ressonância, Brado, Estalo |
| Trovoz | Eco, Faísca | 48, 10, 11, 17, 16 | Ressonância, Centelha |
| Retumbo | Eco | 58, 13, 13, 17, 13 | Ressonância, Brado, Investida |
| Sonarca | Eco, Brisa | 60, 13, 14, 18, 15 | Ressonância, Ciclone, Brado |
| Estelim | Astro | 45, 10, 10, 12, 10 | Poeira Estelar, Mordida |
| Cometo | Astro, Chama | 40, 12, 9, 11, 15 | Poeira Estelar, Tição, Investida |
| Meteorim | Astro, Rocha | 55, 12, 14, 7, 4 | Pedrisco, Poeira Estelar |
| Luarel | Astro, Penumbra | 45, 9, 11, 15, 13 | Poeira Estelar, Pio Sombrio |
| Estelado | Astro | 52, 12, 12, 14, 12 | Gravidade, Poeira Estelar, Mordida |
| Nebulim | Astro, Bruma | 48, 10, 11, 17, 16 | Poeira Estelar, Cerração |
| Constelar | Astro | 58, 14, 13, 16, 13 | Gravidade, Meteoro, Poeira Estelar |
| Eclipsor | Astro, Aurora | 62, 15, 14, 17, 12 | Gravidade, Fulgor, Meteoro |

- **Linhas:** Friozim → Friagem → Invernal; Parafim → Parafusão → Blindarca; Ecoim → Ecoante → Retumbo; Estelim → Estelado → Constelar.
- **Linhagens da Era 4:** Coro nova (Ecoim, Ecoante, Retumbo, Sinim, Sonarca); Estrela nova (Estelim, Estelado, Constelar, Luarel, Eclipsor); Gelo recebe Friozim, Friagem, Invernal e Nevisco; Metal recebe Parafim, Parafusão, Blindarca, Ferrugo, Sentinela e Colosferro; Lasca recebe Cristagelo; Concha recebe Morsudo; Gruta recebe Geadouro; Pedra recebe Permafrio e Meteorim; Faísca recebe Engrenil e Trovoz; Vento recebe Lâmino; Manada recebe Grilão; Asa recebe Morcegal; Brasa recebe Cometo; Névoa recebe Nebulim.

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

O nível máximo é 200. Depois do nível 150, o ganho por nível cai para 25% do normal, e o nível 200 fica cerca de 8% acima do 150 (no máximo 8,4%: 12,5 níveis de ganho sobre 149, menos com base alta). A diferença no topo vem de genes, raridade e escolha de tipos.

**Por que 25%:** na simulação da Era 4, o 150 ao 200 leva de 3 a 6 horas com genes épicos; subir o ganho para 36% não muda esse tempo, porque o selvagem da rota 7 cresce na mesma proporção. O ganho só muda o tamanho da diferença no topo.

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

- **Tetos:** a Era 1 vai até o nível 50 e usa as rotas 1 a 3 de cada bioma. A Era 2 vai até o 100 e libera as rotas 4 e 5. A Era 3 vai até o 150 e libera a rota 6. A Era 4 vai até o 200, o máximo do jogo, e libera a rota 7. Assim o teto de cada Era coincide com o topo de uma rota.
- **Era 3:** vai até o nível 150 e libera a rota 6, que só os biomas da Era 3 têm (seção 4). Como o teto é 150, o limite suave não pesa na Era 3; a pendência do nível 150 ao 200 fica para a Era 4.
- **Era 4:** vai até o nível 200 e libera a rota 7, que só os biomas da Era 4 têm. É a última Era: no nível 200 não há reset.
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

### Equipamentos no F16

- **Entram 4 espaços** cujos sistemas já existem, com o mesmo efeito por raridade (5% a 25%):
  - **Luvas:** as chances de selvagem raro, épico, lendário e mítico sobem nessa proporção; a diferença sai da chance de fraco. Com 25%, o raro vai de 4% para 5% e o épico de 0,9% para 1,125%; o fraco cai de 25% para cerca de 23,8%.
  - **Joias:** as chances de matriz, Essência e Chave da Ilha sobem nessa proporção. Com 25%, a Chave vai de 0,05% para 0,0625% dos abates na rota 5: de uma Chave a cada 2 a 3 horas para uma a cada 1,6 a 2,4 horas.
  - **Insígnia:** o chefe aparece com menos abates: 100 × (1 − efeito), arredondado para cima. Com 25%, a cada 75 abates. O chefe dá a peça de equipamento, então a Insígnia também acelera a coleta das outras peças.
  - **Brasão:** a chance de prismática sobe nessa proporção, no selvagem, na matriz aberta e no filhote de cruzamento. Com 25%, vai de 2% para 2,5%.
- **Cinto:** passa a valer também na Mina, como diz a tabela acima ("extração mais rápida nos postos de trabalho"). Hoje só vale na Forja.
- **Ficam de fora:** Mochila, porque o inventário não tem limite, e Companheiro de ombro, porque a coleta com o jogo fechado já é automática.
- **Fonte:** a mesma do F5. O chefe tem 10% de chance de deixar uma peça, agora com espaço sorteado entre 10 em vez de 6. Na rota 7, com cerca de 1.000 abates por hora, saem 10 chefes e 1 peça por hora, e cada espaço recebe uma peça a cada 10 horas, em vez de 6. Com a Insígnia de 25%, a cada 7,5 horas.
- **Força:** nenhum dos novos espaços muda a força das criaturas.

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

### Mina no F13

- A Mina entra com o Despertar, que é o primeiro uso dos Fragmentos. A Pesca continua esperando um uso para os materiais aquáticos.
- 3 vagas. Cada criatura produz 10 Fragmentos por hora × o multiplicador da raridade × a afinidade, também com o jogo fechado, dentro do limite de 24 horas, como a Forja.
- **Afinidade:** +25% com Rocha, Cristal ou Liga; −50% com um tipo que vence um deles (Maré, Brota, Astro, Penumbra, Faísca e Eco), pela mesma regra da Forja.
- Uma criatura trabalha num posto por vez. Com 3 criaturas raras de afinidade certa, a Mina rende cerca de 49 Fragmentos por hora, e os 300 de um Despertar saem em cerca de 6 horas; com 3 incomuns sem afinidade, em cerca de 9 horas.

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

### Despertar no F13

- **Quem desperta:** a criatura ativa ou da reserva com nível 150 ou mais, fora de posto de trabalho. Uma vez por criatura. Na prática, no teto da Era 3 ou na Era 4.
- **Custo:** 300 Fragmentos da Mina e 10 Essências do primeiro tipo da espécie. Um Glaciarca (Geada, Brisa) usa Essência de Geada.
- **Essências:** cada bioma deixa cair a Essência do tipo dele. Cada abate nas rotas 5, 6 e 7 tem 0,2% de chance de render 1 Essência; o chefe não tem chance extra. Na simulação, uma criatura de genes épicos a lendários faz de 460 a 1.500 abates por hora nessas rotas, o que dá de 1 a 3 Essências por hora e de 4 a 10 horas para juntar 10.
- **Efeito:** ×1,15 em todos os atributos, somado aos multiplicadores de forma e prismático; uma técnica exclusiva do primeiro tipo da espécie, que entra em primeiro lugar na fila e tira a última se a fila tiver 4; e uma moldura dourada no retrato provisório.
- **Permanência:** o Despertar fica com a criatura no reset de Era e na evolução; a técnica exclusiva segue o primeiro tipo da forma atual. O filhote de cruzamento não herda o Despertar.

Técnicas exclusivas do Despertar, uma por tipo, todas com poder 100 e recarga de 9 s:

| Tipo | Técnica | Categoria |
| --- | --- | --- |
| Chama | Coração de Brasa | especial |
| Maré | Ressaca Funda | especial |
| Brota | Floresta Viva | especial |
| Rocha | Falha Sísmica | física |
| Brisa | Olho do Furacão | especial |
| Geada | Coração de Gelo | especial |
| Faísca | Corrente Viva | especial |
| Liga | Bigorna | física |
| Peçonha | Praga | especial |
| Penumbra | Breu Total | especial |
| Aurora | Amanhecer | especial |
| Eco | Eco Ancestral | especial |
| Cristal | Lâmina de Quartzo | física |
| Fera | Estouro da Manada | física |
| Bruma | Véu Cinzento | especial |
| Astro | Chuva Cósmica | física |

### Ilhas Lendárias no F14

- **Chave da Ilha:** cada abate na rota 5 de qualquer bioma tem 0,05% de chance de render 1 Chave. Com 600 a 1.000 abates por hora, sai uma Chave a cada 2 a 3 horas de caçada na rota 5.
- **Quando abrem:** na Era 4. Entrar gasta 1 Chave, mesmo se a criatura perder no primeiro andar.
- **Quatro ilhas**, uma por tipo da Era 4, com 10 andares de um guardião cada:

| Ilha | Andares 1 a 3 | 4 a 6 | 7 a 9 | Andar 10 |
| --- | --- | --- | --- | --- |
| Ilha da Geada | Friagem | Geadouro | Invernal | Permafrio |
| Ilha do Ferro | Parafusão | Sentinela | Blindarca | Colosferro |
| Ilha do Eco | Ecoante | Trovoz | Retumbo | Sonarca |
| Ilha da Estrela | Estelado | Nebulim | Constelar | Eclipsor |

- **Guardião:** o do andar n tem nível 150 + 5n (155 a 200), raridade épica, e lendária no andar 10. Vida ×4, Ataque e Foco ÷2.
- **Como se joga:** a criatura ativa entra com a vida cheia e enfrenta os andares em sequência, na hora, sem passar tempo de jogo. A Vida não volta entre andares; os Tônicos de Cura do inventário são usados pelo gatilho de sempre. Perder expulsa da ilha, sem perda de XP e sem Fadiga. Os guardiões não dão XP nem podem ser capturados. A luta em andamento na caçada acaba, e a criatura volta para ela com a vida cheia.
- **Prêmios:** 30 Fragmentos por andar vencido, ficando com o que já ganhou se perder. Vencer o andar 10 dá uma matriz da espécie do guardião final, lendária, com 10% de chance de ser mítica.

Simulação de 200 entradas por caso, criatura no nível 200, com até 5 Tônicos de Cura (chance de vencer os 10 andares / andares vencidos em média; "D" = desperta):

| Ilha | Glaciarca épica | Couraçor épico | Estrondor épico | Glaciarca épica D | Couraçor épico D | Estrondor épico D | Glaciarca lendária D | Couraçor lendário D | Estrondor lendário D |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Geada | 0% / 3,5 | 21% / 8,7 | 0% / 6,1 | 0% / 6,7 | 100% / 10 | 58% / 9,5 | 100% / 10 | 100% / 10 | 100% / 10 |
| Ferro | 0% / 3,5 | 0% / 3,3 | 0% / 9,0 | 0% / 6,8 | 0% / 5,7 | 94% / 9,9 | 99% / 10 | 96% / 10 | 100% / 10 |
| Eco | 0% / 6,4 | 0% / 2,7 | 1% / 7,9 | 96% / 9,9 | 0% / 4,9 | 99% / 10 | 100% / 10 | 96% / 9,9 | 100% / 10 |
| Estrela | 0% / 1,6 | 0% / 3,7 | 0% / 1,2 | 0% / 4,2 | 0% / 6,6 | 0% / 1,9 | 0% / 8,3 | 100% / 10 | 0% / 5,9 |

- Sem Despertar, a criatura épica quase nunca chega ao fim, mas costuma vencer de 3 a 9 andares e leva Fragmentos. Desperta e com o tipo certo, termina; lendária e desperta, termina quase todas.
- A Ilha da Estrela é a mais difícil para os iniciais: Astro vence Geada, Rocha e Eco e é imune a Eco. Ela pede um monstro de Fera ou Bruma, que vencem Astro.
- Testado também: Vida ×3 sem dividir o dano deixa quase todas as ilhas impossíveis; dividir o dano por 4, como nas rotas, deixa quase todas fáceis demais.

## 12. Fase online (depois do lançamento solo)

Ficam para a fase 2, com servidor e regras próprias:

- Arena assíncrona com defesas controladas pela IA e ranking diário.
- Torneios semanais por divisão de Era, calculados no servidor.
- Liga de duelo manual em tempo real.
- Chefe global do servidor duas vezes ao dia, com prêmios por faixa de dano.
- Guildas, com chefe de guilda e guerra de defesas.
- Chat e correio.

### Segurança da fase online

Vem do documento "Gamer Shield" do usuário, aprovado em 23/10/2026 como requisito da fase online. Nada disto vale para o jogo solo, que roda no navegador: lá a trapaça não prejudica outro jogador. O que já vale no solo está no fim desta seção.

- **Servidor dono do estado:** na fase online, o navegador só desenha o estado e envia comandos. Tempo, sorteios, recompensas e economia são calculados no servidor, e o que o jogador muda na memória do navegador é descartado. O motor já não lê relógio nem sorteia por conta própria, então pode rodar no servidor quase sem mudança. Este é o primeiro marco da fase online, com proposta e custos aqui antes de qualquer código.
- **Rede:** site e API atrás do proxy do Cloudflare, com domínio próprio, limite de requisições nas rotas críticas e Turnstile invisível na entrada.
- **Login:** só por Google, Discord, Microsoft e Apple, sem formulário de e-mail e senha. Antes de gravar ou comparar o e-mail, o servidor o normaliza: tudo em minúsculas, sem o que vem depois de "+" e, no Gmail, sem pontos.
- **Contas por aparelho:** o servidor guarda um identificador estável do aparelho (ANDROID_ID, IDFV ou impressão digital do navegador) e compara o histórico de aparelhos, não o IP, para não punir quem divide a rede. Com até 2 contas no mesmo aparelho, o acesso é livre; com 3, a conta fica em observação; com 4 ou mais, ela é marcada para contenção silenciosa. A impressão digital é dado pessoal pela LGPD: entra só com política de privacidade e aviso ao jogador.
- **Contenção silenciosa:** a conta marcada continua jogando na própria tela, mas o servidor descarta as trocas com outros jogadores e as transações que afetam a economia comum.
- **Cliques automáticos:** intervalos abaixo de 100 ms contam como cliques inválidos. Uma variação abaixo de 5 ms nos últimos 10 intervalos indica macro e leva à contenção silenciosa.
- **Pedágio de progresso:** chat, mercado entre jogadores e troca só abrem depois de 48 horas de conta e de um nível mínimo **[a definir]**.
- **Aplicação web:** sessão em cookie HttpOnly, Secure e SameSite=Strict; texto de jogadores, como chat e ranking, sempre escapado; o jogo não abre dentro de iframe de terceiros, pelo cabeçalho X-Frame-Options: DENY.
- **Tempo fora:** o documento pede teto de 12 horas no servidor. No solo o teto continua em 24 horas (seção 5); o teto da fase online fica **[a definir]**.
- **Ofuscação do código:** fica de fora enquanto o repositório for público, porque não esconderia nada.

**Já vale no jogo solo:** o jogo se recusa a abrir dentro de um iframe de outro site e mostra um link para o endereço oficial. Isso é feito em JavaScript, porque o GitHub Pages não envia o cabeçalho X-Frame-Options.

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

### Mercado da Cidade no F15

- **Por que agora:** da Era 2 em diante o ouro perde o uso. Os gastos são Tônicos (25) e cruzamento (300), e a caçada rende muito mais. Simulação de 2 horas, 10 criaturas por caso, com reposição de Tônicos:

| Caso | Ouro por hora (mín. / mediana / máx.) |
| --- | --- |
| Era 2, rota 5, Rebitaço raro no nível 100 | 187 mil / 280 mil / 331 mil |
| Era 2, rota 5, Rebitaço épico no nível 100 | 329 mil / 405 mil / 439 mil |
| Era 3, rota 6, Couraçor épico no nível 150 | 960 mil / 1,13 milhão / 1,20 milhão |
| Era 4, rota 7, Couraçor épico no nível 200 | 1,69 milhão / 2,06 milhões / 2,25 milhões |
| Era 4, rota 7, Couraçor lendário desperto | 2,35 milhões / 2,78 milhões / 2,95 milhões |
| Era 4, rota 7, Glaciarca épica na Cratera Estelar (tipo errado) | 598 mil / 762 mil / 895 mil |

- **Quando abre:** na Era 4, como o resto do fim de jogo. O ouro das Eras anteriores fica guardado, porque o reset não mexe nele.
- **Estoque do dia:** 6 matrizes, 3 épicas, 2 lendárias e 1 mítica. Cada espécie é sorteada com chance igual entre todas as que aparecem nas rotas dos 16 biomas. As 6 são diferentes entre si.
- **Preço fixo por raridade:** épica 1 milhão, lendária 5 milhões e mítica 20 milhões de ouro. Cada oferta pode ser comprada uma vez, e a matriz vai para o inventário.
- **Troca do estoque:** à meia-noite de Brasília. O estoque do dia é sorteado na primeira vez que o jogo passa por esse dia e fica no save, então quem volta depois de uma semana fora vê só o estoque de hoje.
- **Conta para o jogador:** com 2 milhões por hora na rota 7, a épica sai em meia hora de caçada, a lendária em 2,5 horas e a mítica em 10. Comprar o estoque inteiro (33 milhões) leva cerca de 16 horas, então o Mercado nunca fica sem uso. Para comparar, pelas chances de queda e pelos cerca de 1.000 abates por hora da simulação, a rota 7 deixa cair uma matriz mítica de espécie sorteada a cada 20 horas, e a rota 5 uma lendária a cada 5 a 8 horas. O Mercado custa um pouco mais, mas deixa escolher a espécie.
- **Alternativas descartadas:** com preços de 2, 10 e 50 milhões, a mítica custaria 25 horas de caçada, mais do que esperar a queda da rota 7. Abrir na Era 2 deixaria comprar uma épica com cerca de 3 horas de ouro da rota 5, o que tira o peso da captura nessa Era.

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
| F9 · Evolução | Linhas de 2 e 3 formas, multiplicador por forma e formas dos iniciais | Uma criatura evolui ao chegar ao nível 75 na Era 2 |
| F10 · Era 2 | Biomas Encosta Rubra, Chapada Trovão, Pântano Amargo e Bosque Sem Lua, 24 espécies e o nome Monstros | Um monstro chega ao nível 100 na Era 2 caçando nos biomas novos |
| F11 · Era 3 | Rota 6, biomas Cume dos Ventos, Veio Cristalino, Lagoa Velada e Planalto da Alvorada, 28 espécies e 6 técnicas | Um monstro chega ao nível 150 na Era 3 caçando nos biomas novos |
| F12 · Era 4 | Rota 7, biomas Planície Gelada, Ruínas de Ferro, Desfiladeiro do Eco e Cratera Estelar, 32 espécies e 5 técnicas | Um monstro chega ao nível 200 na Era 4 caçando nos biomas novos |
| F13 · Despertar | Mina com Fragmentos, Essências nas rotas 5 a 7 e Despertar com técnica exclusiva por tipo | Uma criatura desperta e caça com a técnica exclusiva |
| F14 · Ilhas Lendárias | Chaves na rota 5, quatro ilhas de 10 andares, Fragmentos por andar e matriz lendária ou mítica no fim | Uma criatura vence o andar 10 de uma ilha |
| F15 · Mercado da Cidade | Estoque diário de 6 matrizes por preço fixo em ouro, aberto na Era 4 | Uma matriz comprada no Mercado vira criatura na reserva |
| F16 · Equipamentos | Luvas, Joias, Insígnia e Brasão; Cinto também na Mina | Uma peça de cada espaço novo vestida muda o que a caçada rende |
| F17 · Cena da caçada | Cena em Canvas com o bioma, o monstro andando e a luta com o selvagem, em pixel art provisória, e modo leve | Na caçada, o monstro anda pelo bioma, o selvagem aparece e os golpes aparecem na cena |
| F18 · Mapa-múndi | Mapa dos 16 biomas por Era, com miniaturas, trancas e estimativa de XP por hora com a melhor rota marcada | O mapa aponta a melhor rota do monstro ativo e troca de bioma ao tocar |

## 17. Pendências

1. Se há conteúdo de nível depois da Era 4. Não: o nível 200 continua o máximo, e o fim de jogo fica em Despertar, Ilhas Lendárias e Mercado da Cidade.
