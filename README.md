# Acerte o jogador pela carreira

Jogo diário: os escudos dos clubes por onde um jogador passou aparecem em ordem
de carreira, e você tem 3 chutes e duas dicas para descobrir quem é. Quem não
quiser gastar os três pode desistir e ver o nome — conta como derrota, e o
primeiro toque só arma a confirmação, porque não dá para voltar atrás.

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
| `npm run reparar` | refaz a carreira de cada jogador e mostra o que mudou (`-- --simular` não grava) |
| `npm run mapa-tm` | confere o mapa de clubes do Transfermarkt e o ano de fundação de cada clube |
| `npm run tecnicos` | lista quem é mais conhecido pelo banco do que pelo campo |
| `npm run repor` | troca quem tem procura baixa demais para estar na biblioteca |
| `npm run teste-palpites` | testa o que o jogo aceita como acerto |
| `npm run biblioteca` | regera `src/dados/jogadores.json` a partir do Transfermarkt |
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

`src/dados/jogadores.json` tem **300 jogadores, 100 por nível**. É dado, não
código: o jogo importa o arquivo por `src/dados/jogadores.ts`, que só dá tipo a
ele, e os scripts leem e gravam por `scripts/biblioteca.mjs`. Até setembro a
biblioteca era um arquivo TypeScript que quatro scripts reescreviam por
busca-e-troca com expressão regular, cada um com a sua versão da regex.

A biblioteca foi **gerada** por `npm run biblioteca` e hoje é mantida por
`npm run reparar` (carreiras) e `npm run dicas` (dicas).

A carreira de cada um vem do histórico de transferências do **Transfermarkt**,
na ordem em que aconteceu, e `fonte` aponta a página de onde saiu. Isso existe
porque a onda anterior foi escrita de memória do modelo e a conferência achou
erro em 33 de 45 carreiras: multiplicar isso por trezentos multiplicaria o
problema.

### Como um clube do Transfermarkt vira um id do catálogo

Num lugar só: `scripts/resolver-clube.mjs`, que o gerador, o reparo e a
reposição usam. Antes eram três cópias da mesma função, e cada correção
precisava ser feita três vezes — foi numa delas que o West Ham do Mascherano
virou o Western United.

**Por id, não por nome.** Cada transferência traz `/verein/<id>` no link, e
`scripts/clubes-transfermarkt.json` liga esse id ao nosso. Casar por nome seria
pedir para errar: o catálogo tem dez Guaranis, cinco Botafogos e um Esporte
Clube Milan.

**O mapa é conferido pelo dono do id.** Ele saía do código de Wikidata que o
catálogo guarda para cada clube — e o catálogo dava código por semelhança de
nome. O Burnley ficou com o do Barnsley, o Watford com o do Dartford, o Parma
com o do La Palma, e o id do Transfermarkt de cada um veio junto: o John
Stones começava a carreira no Burnley. `npm run mapa-tm` pergunta ao Wikidata
de quem é cada id do Transfermarkt (o P7223 pertence a um clube só) e tira o
par quando o dono tem outro nome. Foram dez pares desmentidos. O mesmo dono
confirma pares novos: São Paulo, Flamengo, Real Madrid e Manchester United,
cujo código no catálogo era de outra entidade, passaram a resolver pelo id.

**Quando cai para nome, três provas.** Sem id conhecido, a passagem casa pelo
nome — e é por aí que entravam os homônimos. Agora ela só vale se:

1. **o nome do Transfermarkt cabe no do clube.** Ele abrevia, mas não
   acrescenta: "Quick Boys" não é o "Sport Boys", e o Kuyt terminava a carreira
   no Peru. "Miami United" não é o "United FC" dos Emirados, onde o Adriano
   aparecia;
2. **o país confere** com a bandeira que o Transfermarkt mostra. Foi o que
   pegou o Al-Ahli saudita no lugar do de Dubai do Everton Ribeiro, e o
   Deportivo Maldonado peruano no lugar do uruguaio do Alex Sandro e do Allan;
3. **o clube existe no ano da passagem.** O Yokohama FC foi fundado em 1998, e
   o Zinho e o César Sampaio jogaram no Yokohama Flügels em 1994; o Inter Miami
   é de 2018, e o Miami FC do Zinho, de 2006. O ano vem do mesmo dono do id,
   em `scripts/fundacao-clubes.json`.

Falhando uma, a passagem **trava** e aparece no relatório do `reparar`, em vez
de escolher um clube errado em silêncio. Travar é recuperável; escudo trocado,
não. O conserto é um par em `PARES_TM` (`scripts/clubes-canonicos.mjs`) ou o
clube que falta em `SEM_ESCUDO`.

O comparador de nomes (`scripts/nomes-clube.mjs`) também apertou: com uma
palavra de cada lado, só aceita diferença de uma letra em palavra longa
("Sevilha", "Sevilla"). Antes, "Burnley" e "Barnsley", "Santos" e "Patos",
"Celta" e "Ceuta" eram o mesmo clube.

### Só jogo profissional

O cliente pediu que a carreira mostre só onde o jogador jogou como
profissional. O histórico de transferências do Transfermarkt não sabe disso:
lista a base, o time B, o clube-ponte que comprou para emprestar no mesmo dia e
o empréstimo em que o jogador não entrou em campo. Cinco filtros, em
`scripts/transfermarkt.mjs` e `scripts/resolver-clube.mjs`:

| Filtro | O que tira | Exemplo |
| --- | --- | --- |
| Categoria de base e time B | nome com marca de base ou reserva, inclusive a tradução do site em português | "OB Juventude" (a base do Odense) virava o Juventude de Caxias na carreira do Eriksen; "Real Madrid Castilla", "Man City For", "Seiryo HS" |
| Formação | as primeiras passagens de onde o jogador saiu antes dos 17 anos | Albacete do Iniesta, West Ham do John Terry |
| Compra relâmpago | clube que comprou e emprestou em até um mês | Deportivo Maldonado do Alex Sandro, Granada do Allan, Tombense do Firmino, Rio Ave do Fabinho |
| Volta de empréstimo | a volta ao clube dono só entra quando é lá que a passagem de verdade começa | o Coutinho foi vendido à Inter aos 16 e emprestado ao Vasco no mesmo dia: a Inter aparece depois do Vasco, onde ele jogou |
| Sem jogo oficial | clube com partida registrada e nenhum jogo | ver abaixo |

O último vem do registro de partidas do Transfermarkt (`jogosPorClube`), o
mesmo que o quadro de desempenho do perfil lê: cada partida oficial do clube
com a participação do jogador — jogou, no banco, fora da lista, lesionado. Só
conta como prova a partida em que o site sabe onde o jogador estava, **no banco
ou lesionado**: o Filipe Luís ficou duas vezes no banco do Ajax e nunca entrou.
"Fora da lista" em todas as partidas não prova nada, porque é assim que o site
marca a temporada da qual não tem a escalação — o Zanetti aparece com zero
jogos no Banfield de 1993, onde jogou 66 vezes. O clube atual fica sempre:
quem chegou há pouco ainda não estreou.

### A dica

`npm run dicas` refaz a dica de todos sem tocar no elenco — trocar texto não
deveria custar um elenco novo, já que cada geração depende do WAF do
Transfermarkt liberar e devolve um conjunto um pouco diferente.

São **duas dicas, e o cliente escolheu esse modelo**: a primeira situa, a
segunda entrega, e quem joga decide até onde quer ajuda.

A primeira é de propósito pobre — posição, país e ano de nascimento. Não
identifica ninguém sozinha; serve para quem olhou o mural e não faz ideia de
que década está vendo. A segunda leva os dois fatos mais raros do jogador e
nenhuma apresentação, porque quem pediu a segunda já leu a primeira.

Tudo verificável, do histórico do Transfermarkt e do Wikidata — **nunca texto
gerado**, que é a mesma classe de erro que carreira inventada, só que mais
difícil de conferir.

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
de todo mundo; 18 anos no mesmo clube não é. O uso da taxa caiu de 237 para 58
sem que ninguém precisasse editar dica à mão.

**Raro não é o mesmo que útil.** O cliente apontou que, mesmo assim, a dica do
Ademilson entregava pouco: ele não tem jogo de seleção nem torneio, e sobravam
dois números de dinheiro. Faltavam fatos, não ordenação. Entraram dois:

| Fato | Fonte | Cobertura |
| --- | --- | --- |
| Naturalidade — "é de Cubatão" | perfil do Transfermarkt | 260 dos 300 |
| Copas, Copa América, Eurocopa e Olimpíadas | P1344 do Wikidata | 229 dos 300 |

A naturalidade tem **vaga cativa** na segunda dica quando existe. Por raridade
pura ela ficava de fora — "1 jogo de seleção" é numericamente mais raro que ser
de algum lugar, e o Roger Machado saía descrito por um jogo de seleção e uma
taxa de € 700 mil. Mas de onde a pessoa é **localiza**, e localizar é o que a
segunda dica existe para fazer.

Ela também não pode entregar de graça: `naturalidadeSegura` recusa o lugar que
repete clube à mostra ("é de Santos" com o escudo do Santos na tela) ou que
carrega o nome do jogador — o Alexandre Pato nasceu em **Pato Branco**.

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

**Em revisão.** O cliente recusou as visualizações da Wikipédia como régua, e
até a nova ser decidida o nível é o que está na biblioteca: `npm run reparar`
não recalcula mais, e `scripts/niveis-fixos.mjs` guarda as decisões tomadas à
mão. O que segue é a régua que foi usada até aqui.

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

#### O ponto cego: a régua mede fama, não fama de jogador

Visualizações medem quanta gente procura o nome. Elas não sabem **por que**.
Quem ficou famoso no banco sobe de nível pelo que fez como treinador, enquanto
o jogo mostra os escudos da carreira de jogador — e aí não há como chegar à
resposta. O Roger Machado tinha 8761 visualizações por mês, acima da mediana do
fácil, com 1 jogo de seleção e uma transferência de € 1 milhão; os escudos dele
são Grêmio, Vissel Kobe, Fluminense e D.C. United.

`npm run tecnicos` ordena os suspeitos pela razão entre procura e tamanho da
carreira de jogador. **Ele não corrige nada de propósito**, porque a razão erra
onde mais importaria acertar: goleiro não tem taxa de transferência, então o
Rogério Ceni aparece em segundo lugar na lista sendo ídolo conhecidíssimo como
jogador. Nenhuma fórmula distingue os dois casos; uma pessoa distingue em dois
segundos.

Por isso `scripts/niveis-fixos.mjs` fixa o nível à mão e vence o cálculo. Hoje
tem três entradas, cada uma com o motivo escrito: Roger Machado e Joel Santana
no difícil, Guardiola no intermediário.

#### O outro piso: difícil não é desconhecido

Procura baixa demais também estraga, do outro lado. Takashi Usami tem 86
visualizações por mês — nove vezes abaixo da mediana do próprio nível. Quem cai
nele não perde uma charada difícil; perde uma que não tinha resposta possível, e
termina a partida sem saber quem é o nome revelado.

`npm run repor` mede a procura dos trezentos, lista quem está abaixo do piso
(250 por padrão, `PISO=` muda) e troca cada um por um candidato que passe no
mesmo caminho de aceitação do gerador com procura bem acima do piso
(`PISO_NOVO=`, 800 por padrão). Quem sai não é apagado: só sai da vez.

### Consertar sem gerar elenco novo

Cada geração depende do WAF do Transfermarkt liberar e devolve um conjunto de
jogadores um pouco diferente, então trocar texto ou nível não deveria custar um
elenco novo:

| Comando | O que faz |
| --- | --- |
| `npm run dicas` | refaz as dicas |
| `npm run reparar` | refaz a carreira de cada jogador pelo resolvedor único e lista, clube a clube, o que mudou |

`npm run reparar` existe porque um erro de comparação de nomes chegou ao jogo:
"West Ham United" casou com "Western United", um clube australiano, e o
Mascherano apareceu com o escudo errado. Pior, o clube australiano herdou o QID
do West Ham no catálogo, e o erro se espalhou para o mapa de ids do
Transfermarkt. Corrigida a comparação, este comando reescreve todas as
carreiras a partir do histórico em cache — foram 17 delas, e `lyon` →
`olympique-lyon` em onze jogadores era outro erro silencioso.

**E o Chicharito continuou com o escudo do Western United mesmo depois disso.**
O reparo tem uma regra de segurança: se um clube da carreira não resolve, a
carreira inteira fica como está, para não gravar uma lista com buraco. A regra
está certa; o problema era ela falhar calada. O nome "PSG" não resolvia contra
o catálogo, onde o clube é "Paris Saint-Germain", e isso bastava para congelar
dezesseis carreiras — a do Chicharito entre elas, com o West Ham dele ainda
escrito como um clube australiano.

Eram **oito nomes travando 49 das 300 carreiras**: PSG, Sevilla Fútbol Club,
Marselha, Reial Club Deportiu Espanyol de Barcelona, Verdy Kawasaki, Ny Cosmos,
America Rj e Santa Cruz. O conserto de cada um é uma linha em
`scripts/clubes-transfermarkt.json`, que casa id do Transfermarkt com id do
catálogo e não depende de o nome bater. Com os oito, as 300 voltaram a ser
reresolvíveis e as duas que ainda estavam erradas se corrigiram sozinhas.

Hoje o comando **lista as carreiras que congelou** e o nome que travou cada
uma. Uma resolução que falha calada é pior que uma que falha alto: a correção
do mapa já existia havia semanas, e ninguém tinha como saber que ela não
chegava ao Chicharito.

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
