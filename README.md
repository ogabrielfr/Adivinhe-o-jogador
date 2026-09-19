# Acerte o jogador pela carreira

Jogo diário: os escudos dos clubes por onde um jogador passou aparecem em ordem
de carreira, e você tem 3 chutes e uma dica para descobrir quem é.

Três níveis independentes, um jogador novo em cada um por dia, à meia-noite no
fuso de quem está jogando. Site estático, sem back-end e sem chave de API.

## Rodando

```bash
npm install
npm run dev
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | sobe o servidor de desenvolvimento |
| `npm run build` | verifica os tipos e gera `dist/` |
| `npm run validar-dados` | confere a integridade da biblioteca de jogadores |
| `npm run catalogo` | rebaixa os escudos e regenera `src/dados/clubes.ts` |
| `npm run verificar` | confere as carreiras contra o Wikidata e relata as divergências |
| `npm run teste-nomes` | testa o comparador de nomes de clube |
| `npm run coletar` | remonta `scripts/clubes-externos.json` a partir do Wikidata |
| `npm run dicas` | refaz as dicas sem mexer no elenco |
| `npm run reparar` | corrige clubes mal resolvidos e recalcula os níveis |
| `npm run teste-palpites` | testa o que o jogo aceita como acerto |
| `npm run biblioteca` | regera `src/dados/jogadores.ts` a partir do Transfermarkt |
| `npm run teste-visual` | roda a partida ponta a ponta no Chromium e salva capturas |

O teste visual precisa do Chromium do Playwright (`npx playwright install chromium`)
e de um `npm run build && npx vite preview` rodando na porta 4173.

## Como o jogo escolhe o jogador do dia

`src/logica/diario.ts` converte a data local em um número de dia e usa esse
número para indexar a lista do nível. A lista é reembaralhada com uma semente
derivada do ciclo, então nenhum jogador se repete antes de todos terem
aparecido uma vez. Não há sorteio aleatório em tempo de execução: todo mundo
recebe o mesmo desafio no mesmo dia, sem servidor.

O progresso do dia e as estatísticas ficam em `localStorage`. Se o navegador
bloquear o armazenamento, a partida continua funcionando — só não guarda
histórico.

**As respostas estão no pacote enviado ao navegador.** É a mesma escolha do
Wordle original: quem quiser abrir o código-fonte encontra a lista. Se isso
virar um problema, a saída é mover o sorteio para um endpoint.

## A biblioteca

`src/dados/jogadores.ts` tem **300 jogadores, 100 por nível**, e é **gerado**
por `npm run biblioteca`. Não edite à mão sem motivo.

A carreira de cada um vem do histórico de transferências do **Transfermarkt**,
na ordem em que aconteceu, e `fonte` aponta a página de onde saiu. Isso existe
porque a onda anterior foi escrita de memória do modelo e a conferência achou
erro em 33 de 45 carreiras: multiplicar isso por trezentos multiplicaria o
problema.

### Como um clube do Transfermarkt vira um id do catálogo

**Por id, não por nome.** Cada transferência traz `/verein/<id>` no link, e
`scripts/clubes-transfermarkt.json` liga esse id ao nosso, via a propriedade
P7223 do Wikidata. Casar por nome seria pedir para errar: o catálogo tem dez
Guaranis, cinco Botafogos e um Esporte Clube Milan. Só quando o id é
desconhecido é que cai para nome, e aí exige resposta única no mesmo país —
com desempate pelo clube curado em `CANONICOS`, que é o famoso por construção.

**Jogador com qualquer clube não resolvido fica de fora.** O escudo é a
informação principal do jogo; carreira com buraco não serve. Na última
execução isso recusou 983 candidatos, e o script imprime quais clubes mais
derrubaram jogador — é por onde vale ampliar o catálogo.

### A dica

`npm run dicas` refaz a dica de todos sem tocar no elenco — trocar texto não
deveria custar um elenco novo, já que cada geração depende do WAF do
Transfermarkt liberar e devolve um conjunto um pouco diferente.

A dica é feita de **números que mudam de jogador para jogador**: quantas vezes
vestiu a camisa da seleção, quanto custou a transferência mais cara, quanto
chegou a valer, de quando a quando jogou. Tudo verificável, do histórico do
Transfermarkt e do Wikidata — **nunca texto gerado**, que é a mesma classe de
erro que carreira inventada, só que mais difícil de conferir.

A primeira versão descrevia posição, país e número de países, atributos que
centenas de jogadores compartilham: **177 dos 300 repetiam a dica de outro**, e
duas partidas seguidas mostravam a frase idêntica. Uma dica que serve para
qualquer um não é dica. Hoje são 300 distintas para 300 jogadores, e o script
avisa se alguma voltar a repetir.

Distintas, porém, não é o bastante — e a segunda versão errou por aí. Trocar o
texto por números resolveu a frase repetida e deixou a **forma** repetida:
237 dos 300 abriam com "custou € X na transferência mais cara" e 38 eram só
dois valores em euro seguidos, do tipo *"custou € 3 milhões e chegou a valer
€ 2 milhões"* — três linhas que não levam a jogador nenhum. O problema não era
o número, era a ordem fixa: o fato mais comum da lista ia para todo mundo.

Duas correções, as duas em `scripts/dicas.mjs`:

**O que entra na dica é o que o mural de escudos não mostra.** Quantos clubes o
jogador teve, quais e em que ordem já estão na tela. Tempo de casa, empréstimo
e idade da ida para o exterior, não — são forma de carreira invisível no
escudo, e saem do mesmo histórico do Transfermarkt que desenha o mural.

**Cada jogador é descrito pelo que tem de raro.** `escalaDosFatos` junta os
valores dos 300 por tipo de fato e a dica escolhe aqueles em que o número do
jogador está longe da mediana da biblioteca. Uma taxa de € 3 milhões é a taxa
de todo mundo; 18 anos no mesmo clube não é. O Pelé passou a ser lembrado pelos
18 anos de Santos, o Fagner pelos quatro empréstimos, e o uso da taxa caiu de
237 para 58 sem que ninguém precisasse editar dica à mão.

Posição e nacionalidade vêm do **perfil do Transfermarkt**, não do Wikidata:
lá as duas propriedades aceitam vários valores e pegar o primeiro saía errado —
o Zico aparecia como "nascido em Portugal" na mesma frase que citava a seleção
brasileira.

### O nome do jogador

O nome canônico é o **nome da camisa**, do cabeçalho do Transfermarkt, e não o
rótulo do Wikidata, que costuma trazer o nome de registro: ninguém digita
"Paulo Henrique Sampaio Filho". O nome de registro continua valendo como
palpite.

`src/logica/texto.ts` decide o que conta como acerto. Vale qualquer sequência
contígua de palavras do nome e qualquer palavra que identifique sozinha — é o
que faz "ter Stegen" acertar "Marc-André ter Stegen", "van Dijk" acertar
"Virgil van Dijk" e "de Bruyne" acertar "Kevin De Bruyne". Partícula sozinha
("ter", "van", "de") não vale.

**Nome canônico sempre ganha, mesmo repetido.** Há dois Paulinhos e dois
Henriques na biblioteca; quem digita "Paulinho" no dia de um deles não tem como
ser mais específico, então acerta. O pedido de desempate fica só para pedaço de
nome que serve a mais de um. `npm run teste-palpites` guarda os casos.

### O nível

Sai quase todo da **mediana de visualizações do artigo na Wikipédia em
português**: é a única medida direta da pergunta do jogo — quanta gente procura
esse jogador em português. Mediana e não soma porque transferência e polêmica
produzem pico de um ou dois meses.

Jogos de seleção e número de links de Wikipédia entram como desempate de peso
pequeno. Só decidem entre jogadores de procura parecida; **nunca invertem a
ordem**, e essa contenção é o ponto.

Três versões anteriores erraram do mesmo jeito: somando algo que parecia mérito
e que acabava punindo quem o torcedor conhece hoje.

| Critério | O que deu errado |
| --- | --- |
| Links de Wikipédia | mede alcance global; o fácil abria com Darijo Srna e Granit Xhaka |
| Valor de mercado | subiu jovem em evidência junto com jovem consolidado |
| Jogos de seleção e anos de carreira, com peso alto | empurrou veterano para cima e derrubou Vitor Roque e Rodrygo, que são o 23º e o 33º em procura entre os trezentos |

O padrão é sempre o mesmo: **"carreira longa" e "muita seleção" medem mérito, e
o jogo não pergunta mérito, pergunta reconhecimento.** Um garoto de vinte anos
que aparece toda semana na televisão é fácil; um lateral de quinze anos de
estrada que ninguém lembra é difícil.

`scripts/niveis-fixos.mjs` fixa o nível à mão e vence o cálculo. Está vazio
hoje — o cálculo está acertando os casos apontados —, e é onde escrever quando
ele errar de novo.

### Consertar sem gerar elenco novo

Cada geração depende do WAF do Transfermarkt liberar e devolve um conjunto de
jogadores um pouco diferente, então trocar texto ou nível não deveria custar um
elenco novo:

| Comando | O que faz |
| --- | --- |
| `npm run dicas` | refaz as dicas |
| `npm run reparar` | re-resolve os clubes de cada carreira e recalcula os níveis |

`npm run reparar` existe porque um erro de comparação de nomes chegou ao jogo:
"West Ham United" casou com "Western United", um clube australiano, e o
Mascherano apareceu com o escudo errado. Pior, o clube australiano herdou o QID
do West Ham no catálogo, e o erro se espalhou para o mapa de ids do
Transfermarkt. Corrigida a comparação, este comando reescreve todas as
carreiras a partir do histórico em cache — foram 17 delas, e `lyon` →
`olympique-lyon` em onze jogadores era outro erro silencioso.

### Conferência

`EXIGIR_VERIFICACAO` em `src/logica/diario.ts` está **ligado**: só entra no
sorteio quem tem `verificado: true`. Isso quer dizer "a lista de clubes e a
ordem saíram de uma fonte externa, e `fonte` aponta qual" — não "alguém
conferiu à mão".

Os níveis são julgamento editorial sobre o que o torcedor brasileiro reconhece:

- **Fácil** — reconhecimento imediato, carreira curta e icônica.
- **Intermediário** — você conhece, mas precisa pensar.
- **Difícil** — carreira errante ou jogador que o tempo apagou.

Um clube repetido na lista significa que o jogador voltou a ele, e o escudo
aparece de novo na posição certa da carreira. A lista guarda apenas os clubes,
nunca os anos, que é onde erros de dados se escondem.

## Escudos

`scripts/construir-catalogo.mjs` monta `public/escudos/` e o catálogo de clubes
a partir de quatro repositórios públicos **e do Wikidata** — **4521 clubes
de 66 países**, sendo **1141 brasileiros**. O catálogo é de propósito
muito maior que o uso atual: o escudo é a informação principal do jogo, e uma
carreira costuma começar ou terminar num clube pequeno.

O catálogo se divide em dois arquivos, porque o jogo mostra uns dez escudos por
dia e mandar milhares para o navegador seria peso morto:

- `src/dados/clubes.ts` — só os clubes que algum jogador usa. É o que vai no pacote.
- `scripts/catalogo-completo.json` — todos. É o índice para consultar ao escrever uma carreira nova.

Ao acrescentar um jogador, rode `npm run catalogo` de novo para que os clubes
novos dele entrem no pacote.

Um clube que aparece em mais de uma fonte fica com a de melhor qualidade
(SVG vetorial > PNG transparente > GIF/JPG legado > Wikidata). Os escudos são
reduzidos para 256 px e os SVGs minificados.

| Fonte | Cobertura |
| --- | --- |
| [luukhopman/football-logos](https://github.com/luukhopman/football-logos) | 25 ligas europeias, temporada atual e histórico |
| [hugomiura/escudos-times-brasil-svg](https://github.com/hugomiura/escudos-times-brasil-svg) | Séries A e B do Brasil, em SVG |
| [FCLOGO/fclogo.top](https://github.com/FCLOGO/fclogo.top) | Japão, MLS, Coreia, Arábia Saudita, México |
| [sportlogos/football.db.logos](https://github.com/sportlogos/football.db.logos) | Argentina, Uruguai, Chile, Colômbia |
| Wikidata + Commons + Wikipédia | estaduais brasileiros, Ásia, Golfo, resto do mundo |

### A fonte do Wikidata

`npm run coletar` monta `scripts/clubes-externos.json`, com a URL do escudo de
cada clube. Ele tenta três origens, nesta ordem:

1. `P154` (logo) no Wikimedia Commons — licença livre declarada;
2. a imagem de topo do artigo na Wikipédia — pega muito clube cujo escudo está
   no Commons sem estar ligado ao item, e é de longe o que mais rende;
3. `P7223` (id do Transfermarkt), montando a URL do escudo no CDN deles.

Dois cuidados que valem conhecer antes de mexer:

- **A imagem de topo do artigo nem sempre é o escudo.** Em clube pequeno
  costuma ser foto da sede ou do campo, e escudo errado é pior que escudo
  ausente. `pareceEscudo()` barra pelo formato (brasão é SVG/PNG, foto é JPG) e
  pelo nome do arquivo.
- **Clube homônimo é a regra, não a exceção.** Há dez Guaranis e cinco
  Botafogos, de cidades diferentes. Eles entram no catálogo chaveados pelo QID,
  fora da deduplicação por nome — que junta "vasco" e "vascodagama" e
  destruiria estes. O id sai desambiguado pela cidade quando colide.

Clube sem escudo em nenhuma das fontes não quebra nada: `Escudo.tsx` desenha um
brasão com as cores e as iniciais do clube.

Os escudos são marcas registradas dos respectivos clubes, usados aqui para
identificá-los. As origens não têm o mesmo estatuto — 1473 vêm do Commons
com licença livre, 1239 de upload local da Wikipédia marcado "Conteúdo
restrito" e 1801 do Transfermarkt, sem licença. O campo `licenca` de
`scripts/clubes-externos.json` registra qual é qual. A camada de imagem está
isolada num único componente, então trocar a origem não encosta no resto do jogo.

## Publicação

O workflow em `.github/workflows/deploy.yml` publica no GitHub Pages a cada
push na `main`. `vite.config.ts` só aplica o caminho base do Pages quando
`GITHUB_PAGES=true`, então o desenvolvimento local segue na raiz.
