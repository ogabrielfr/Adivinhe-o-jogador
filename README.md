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
| `npm run catalogo` | regenera o catálogo e `src/dados/clubes.ts`, baixando só o escudo que falta (`-- --baixar-de-novo` baixa todos) |
| `npm run atualizar` | a atualização de fevereiro e setembro: carreira, escudo, dica, nível e agenda de uma vez, com relatório |
| `npm run planilha` | gera `relatorios/planilha-revisao.xlsx`, a planilha de revisão por amostragem (`-- --novos-desde <commit>` marca quem entrou depois) |
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
| `npm run agenda` | estende a agenda do jogador do dia até 30 dias à frente (`-- 60` para mais) |
| `npm run trazer` | traz jogador escolhido à mão, pelo QID e com o nível (`-- Q615:facil:messi`) |
| `npm run regua` | mostra o nível que a régua daria a cada jogador (`-- --gravar` grava) |

O teste visual precisa do Chromium do Playwright (`npx playwright install chromium`)
e de um `npm run build && npx vite preview` rodando na porta 4173.

## Como o jogo escolhe o jogador do dia

**Pela agenda.** `src/dados/agenda.json` diz quem cai em cada dia, em cada
nível, um dia por linha:

```json
"2026-09-24": {"facil":"eder-militao","intermediario":"daniele-de-rossi","dificil":"arthur-maia"}
```

Antes dela o jogador do dia saía só do sorteio, e o sorteio embaralha a lista
inteira do nível: qualquer troca na biblioteca mudava o jogador de todos os
dias, inclusive o de hoje. Na semana da revisão isso aconteceu em dois dos
três níveis, e quem já tinha jogado via "Era ele:" com outro nome. Com a
agenda, dia marcado não muda mais; mexer na biblioteca só afeta os dias que
ainda não estão nela.

- **`npm run agenda` preenche os dias que faltam** até 30 à frente, com o
  mesmo sorteio que o jogo faria, e pula quem saiu nos últimos 90 dias em
  qualquer nível. A agenda guarda esses 90 dias de passado para isso; o que
  saiu antes de ela existir está em `scripts/antes-da-agenda.mjs`,
  reconstruído rodando o sorteio de cada versão publicada.
- **Toda segunda, o GitHub roda o script e publica**, e grava a agenda
  estendida na `main` (commit "Estende a agenda", do github-actions). Puxe
  antes de trabalhar.
- **Rode à mão antes de mexer na lista de um nível** — jogador novo, jogador
  que sai, troca de nível —, com a biblioteca ainda igual à publicada. É isso
  que congela o mês seguinte com o sorteio que já está no ar.
- **Trocar quem cai num dia é trocar um id** no arquivo. Tirar um jogador da
  biblioteca pede trocar os dias futuros em que ele está agendado; se ele é o
  de hoje, ele fica até o dia acabar — quem já jogou veria "Era ele:" com outro
  nome. Foi o caso do Edinho na terceira rodada de marcações: o fácil de
  15/11, ficou até a manhã de 16/11.
- **`npm run validar-dados` recusa** agenda que aponte jogador fora da
  biblioteca num dia que ainda não acabou em algum lugar do mundo, ou que não
  cubra os próximos 7 dias — e o deploy roda o validador. O dia acaba de vez
  quando vira no último fuso (UTC-12): às 9h de Brasília o dia anterior já
  acabou em toda parte, e o jogador dele pode sair.

Fora da agenda, vale o sorteio: `src/logica/diario.ts` converte a data local
em um número de dia e usa esse número para indexar a lista do nível. A lista é
reembaralhada com uma semente derivada do ciclo, então nenhum jogador se
repete antes de todos terem aparecido uma vez. Não há sorteio aleatório em
tempo de execução: todo mundo recebe o mesmo desafio no mesmo dia, sem
servidor.

A partida guarda o id do jogador no primeiro chute ou dica, e continua com ele
mesmo que a agenda mude no meio do dia.

**Na virada do dia a página recarrega.** O código aberto é o da versão do dia
em que a aba foi aberta, e aba esquecida no celular mostrava o jogador, as
dicas e os escudos de uma biblioteca velha — foi assim que o cliente viu o
Marcos Rocha com o Brasil de Pelotas depois de corrigido. A volta à aba
confere na hora; um intervalo cobre a aba que ficou à mostra.

O progresso do dia e as estatísticas ficam em `localStorage`. Se o navegador
bloquear o armazenamento, a partida continua funcionando — só não guarda
histórico.

**As estatísticas têm tela própria**, no link do rodapé da tela inicial: por
nível, partidas, aproveitamento, sequência atual e maior, e em que chute a
pessoa acertou. O jogo sempre guardou tudo isso, mas só mostrava a sequência —
e em jogo diário a estatística é boa parte do motivo para voltar amanhã. A
sequência exibida é a que ainda vale: a gravada só zera na próxima partida
terminada, e quem pulou ontem a teria na tela já quebrada.

**As respostas estão no pacote enviado ao navegador.** É a mesma escolha do
Wordle original: quem quiser abrir o código-fonte encontra a lista. Se isso
virar um problema, a saída é mover o sorteio para um endpoint.

### A revisão do conteúdo (provisória)

**"Refazer jogo com novos jogadores"**, embaixo dos três níveis na tela
inicial, abre uma rodada de revisão: um jogador sorteado em cada nível, fora
do desafio do dia (`jogadorDaRevisao`, em `src/logica/diario.ts`). Cada toque
sorteia outros três. A rodada não conta nas estatísticas, não tem botão de
compartilhar, e o jogo do dia fica guardado — "Voltar aos jogadores do dia"
traz de volta a partida como estava. É para o cliente revisar a base jogando;
sai quando a revisão acabar.

A revisão por amostragem tem também uma planilha, **`npm run planilha`**: uma
aba por nível, com o jogador, os clubes da carreira na ordem e com o nome que
aparece embaixo do escudo, as duas dicas, e duas colunas para marcar (OK,
corrigir carreira, corrigir dica, mudar de nível, tirar do jogo) e explicar.
Com `-- --novos-desde <commit>`, a coluna "Novo" marca quem entrou depois
daquela versão.

## A biblioteca

`src/dados/jogadores.json` tem **900 jogadores, 300 em cada nível**. É dado, não
código: o jogo importa o arquivo por `src/dados/jogadores.ts`, que só dá tipo a
ele, e os scripts leem e gravam por `scripts/biblioteca.mjs`. Até setembro a
biblioteca era um arquivo TypeScript que quatro scripts reescreviam por
busca-e-troca com expressão regular, cada um com a sua versão da regex.

A biblioteca foi **gerada** por `npm run biblioteca` e hoje é mantida por
`npm run reparar` (carreiras) e `npm run dicas` (dicas).

**Jogador pedido pelo nome entra por `npm run trazer`**, com o QID do Wikidata
e o nível decidido à mão: `npm run trazer -- Q615:facil:messi`. O caminho de
aceitação é o do gerador — carreira do histórico do Transfermarkt, só jogo
profissional, toda passagem ligada a um clube do catálogo — e o que trava sai
com o motivo, para o conserto ir ao mapa ou às carreiras corrigidas. Foi
assim que entraram 19 dos 21 grandes nomes que faltavam (Messi, Ronaldo
Fenômeno, Maradona, Zidane, Romário, Rivaldo...). O Totti ficou fora porque
só jogou no Roma, e o Buffon já estava. Saíram Gavi e Phil Foden, que também
só jogaram num clube.

**Nada de carreira dos anos 1940 para trás.** O registro dessa época é o que
mais erra — a carreira do Di Stéfano no jogo tinha perdido a volta ao River
Plate —, e o cliente pediu para evitar. Quem nasceu antes de 1930 começou antes
de 1950: o `trazer` não traz, e o `validar-dados` recusa. Saíram por isso
Domingos da Guia, Zizinho, Ademir de Menezes e Di Stéfano.

**A reposição de setembro.** O cliente marcou 9 jogadores como obscuros demais
(Everaldo, Nelsinho Baptista, Bill Shankly, Everton, Ljungberg, Ranieri, Zé
Mário, Srna, Afellay), que saíram junto com os 4 de antes de 1950. No lugar
entraram 14, para a biblioteca fechar em três níveis iguais: Luís Fabiano,
Diego, Edmundo, Dida, Beckham, Benzema, Guerrero, Roberto Baggio, Lugano,
Fernando Torres, Lampard, Seedorf, Eto'o e D'Alessandro. Dudu e James
Rodríguez passaram no mesmo caminho e ficaram de reserva.

**Mais 30 por nível, em 28/09.** O cliente pediu 30 jogadores a mais em cada
nível. A escolha saiu da régua: ela deu nota aos 1.376 candidatos de
`scripts/candidatos-jogadores.json` que ainda não estavam na biblioteca, e cada
um caiu na faixa de nível em que a régua o poria hoje, com o corte entre as
faixas tirado dos jogadores atuais. Ficaram de fora quem a régua dava como
obscuro demais ("tirar"), técnico mais famoso que o jogador, carreira de um
clube só e os que o cliente já tinha mandado tirar. Dentro de cada faixa, a
ordem foi a do reconhecimento para o torcedor brasileiro — Modrić, Klose,
Júlio César e Lúcio no fácil; Drogba, Van Persie, Luizão e Viola no
intermediário; Shevchenko, Ballack, Marcelinho Carioca e Jardel no difícil. Com 30 em cada faixa, a régua rodada de novo não mudou o nível de
nenhum jogador antigo.

Metade dos escolhidos travou no caminho de aceitação porque um clube da
carreira não casava com o catálogo — "QPR", "K'lautern", "Js Suning". O
conserto ficou nos dados, não em cada jogador: 18 pares novos em `PARES_TM`
para clubes que o catálogo já tinha com outro nome, e 25 clubes que ele não
tinha (Middlesbrough, Sochaux, Paraná Clube, Zrinjski Mostar...) em
`SEM_ESCUDO`, com o escudo baixado do Transfermarkt.

**900 jogadores, em 05/11.** O cliente pediu 300 por nível, e entraram 492. A
piscina ganhou os 283 jogadores da seleção brasileira que o Wikidata conhece e
que ainda não estavam nela, e foram 1.561 candidatos. A escolha:

1. **a régua** (a do nível, abaixo) dá a chance de o cliente marcar "tirar":
   ficou quem tem menos de 30%;
2. **procura em português**: pelo menos 400 visualizações por mês na
   Wikipédia em português, para não entrar o que só a régua acha conhecido —
   o Takashi Usami passava nela;
3. **na ordem da régua**, do mais reconhecível para o menos, até fechar 492.

Técnico com carreira de jogador modesta foi conferido um a um: os 23 que a
consulta apontou (Ramon Menezes, Cléber, Danilo do Corinthians, Helton…)
jogaram de verdade e ficaram. Carreira de um clube só não entra (Lamine Yamal,
Saka, Foden, Koke). Os 79 seguintes na fila, que passaram em tudo e ficaram
fora só pelo corte — Rudi Völler, Mkhitaryan, Lacazette, Donnarumma, Oblak,
Vavá, Clodoaldo, Zetti… —, ficaram de reserva para quem o cliente tirasse. Na
terceira rodada de marcações ele tirou 55, e entraram 55 da reserva (ver "O
nível"). Os 23 que sobraram deram lugar, em 24/11, aos seguintes da busca de
fáceis, em `relatorios/reserva-2026-11-24.md`, com o comando para trazer cada um.

O nível de todos saiu da régua de novo, em terços de 300. Dos 408 de antes, 58
foram do intermediário para o fácil e 30 do difícil para o intermediário, e
nenhum desceu: os novos são, na média, menos conhecidos que os antigos. A
agenda foi refeita a partir de 07/11, com hoje e amanhã como estavam.

Os clubes foram o trabalho de verdade. Na primeira tentativa, 235 carreiras
travaram, quase todas em clube que o catálogo não tinha — Chievo, Ipatinga,
Kuban, ASEC Mimosas —, e 229 deles entraram em `SEM_ESCUDO`, com nome, país e
escudo do Transfermarkt. Outros 23 eram clubes que o catálogo já tinha com outro nome, e
viraram par em `PARES_TM` só quando o país e as palavras do nome batiam e o
clube do catálogo não era par de outro id: a comparação solta por nome casava o
Grêmio Barueri com o Grêmio e o Chievo com o Hellas Verona. Três lições ficaram
no código:

- **clube novo pode deixar ambíguo um nome que resolvia.** O Lyon - La Duchère
  do Abidal fez "Lyon" casar com dois clubes, e 23 carreiras que passavam pelo
  Olympique Lyonnais travariam no próximo reparo. O Lyon passou a resolver pelo
  id. Depois de acrescentar clube, rode `npm run reparar -- --simular`: carreira
  que travou ou mudou aparece ali;
- **o país também protege.** O Stella Club do Kessié, da Costa do Marfim,
  tinha virado o Stella brasileiro; com os clubes marfinenses no catálogo, a
  bandeira passou a valer e o reparo pegou;
- **o id do clube novo não pode colidir na chave do catálogo.** Ela ignora
  sigla, e "botafogo-fc" tomou o lugar do "botafogo": o Botafogo-DF virou
  `botafogo-df`.

E 157 nomes compridos ganharam o nome curto que vai embaixo do escudo, em
`scripts/nomes-curtos.mjs` — com o estado ou o país no homônimo (América-SP,
Botafogo-PB, Liverpool (URU)).

**Sem teto de escudos.** O gerador recusava carreira com mais de 12 escudos,
porque no celular a partir de 13 o campo de palpite descia para fora da tela.
O cliente pediu todos — carreira confusa é a graça do jogo, e o Rivaldo tem
16. Em vez do teto, o escudo encolhe (`src/componentes/Carreira.tsx`): até
12, três por fileira no celular; de 13 a 16, quatro; acima disso, cinco.

O nome que o jogo mostra é o da camisa, do Transfermarkt; quando ele não
separa um jogador de outro, o nome vem de `scripts/nomes-fixos.mjs`. O
Transfermarkt chama o Ronaldo de "Ronaldo", e com o Cristiano Ronaldo na
biblioteca "Era ele: RONALDO" não diria qual; ele é Ronaldo Fenômeno, e
"ronaldo" continua acertando no dia dele.

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

**E pelo nome que o próprio Transfermarkt dá ao id.** O dono no Wikidata não
conhece todo clube, e sem dono o par antigo ficava. Foi assim que o CRB seguiu
ligado ao Brasil de Pelotas na carreira do Marcos Rocha, e o Instituto de
Córdoba ao Central Córdoba na do Dybala: o código de Wikidata do catálogo era
de outro clube, e o id do Transfermarkt veio junto. `npm run mapa-tm` lista
todo par usado por alguma passagem da biblioteca cujo nome no Transfermarkt
não bate com o nosso. Nome diferente não prova erro — clube muda de nome, e o
Transfermarkt guarda o de hoje —, então a lista é para ler: o par errado vai
para `SEM_PAR_TM`, o certo para `PARES_TM`, e os dois saem da lista.

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
| Volta de empréstimo | a volta ao clube dono entra quando o jogador jogou por ele entre a volta e a saída seguinte | o Marcos Rocha voltou do América-MG ao Atlético-MG e jogou 275 vezes até 2018; o Keirrison voltou ao Barcelona seis vezes sem jogar, e nenhuma aparece |
| Sem jogo oficial | clube com partida registrada e nenhum jogo | ver abaixo |

A volta de empréstimo ficou de fora por um tempo sempre que o clube já estava
na carreira — era o jeito de o Keirrison não voltar ao Barcelona seis vezes. O
cliente apontou o que isso escondia: os quatro anos do Marcos Rocha no
Atlético-MG depois do empréstimo ao América, o tempo da Libertadores de 2013.
Agora o registro de partidas guarda o dia de cada jogo, a passagem guarda a
data da volta e a da saída seguinte, e a volta entra quando há jogo entre as
duas. Sem registro de partidas do clube, fica como antes.

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

`npm run dicas` escreve a dica sem tocar no elenco — trocar texto não deveria
custar um elenco novo. Ele refaz as duas dicas de todos; o título, que só o
site do Transfermarkt tem, volta da frase que a dica já tinha
(`scripts/titulos-das-dicas.json`, ver "De onde vem o dado do Transfermarkt").

São **duas dicas, e o cliente escolheu esse modelo**: a primeira situa, a
segunda entrega, e quem joga decide até onde quer ajuda.

A primeira é de propósito pobre — posição, país e ano de nascimento. Não
identifica ninguém sozinha; serve para quem olhou o mural e não faz ideia de
que década está vendo. A segunda leva os dois melhores fatos do jogador, sem
apresentação — quem pediu a segunda já leu a primeira —, e **termina com a
letra com que o nome começa** ("O nome começa com R."; ver "A segunda dica que
direciona", abaixo).

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

Posição, país de nascimento e seleção vêm da **API do Transfermarkt** — a
posição em português, como no site ("Lateral Esq.", "Centroavante"). Não do
Wikidata: lá as propriedades aceitam vários valores e pegar o
primeiro saía errado — o Zico aparecia como "nascido em Portugal" na mesma
frase que citava a seleção brasileira.

**O país da primeira dica é o de nascimento**, não a nacionalidade. Com a
nacionalidade, o Mário Fernandes, de São Caetano do Sul, saía "nascido na
Rússia" — e a segunda dica dizia de onde ele é. Quando a seleção que o jogador
mais defendeu é de outro país, isso entra na primeira dica, porque situa mais
que qualquer um dos dois fatos sozinho: *"Lateral brasileiro nascido em 1990,
que defendeu a seleção russa."* A segunda dica, então, não repete a seleção.

**Os jogos pela seleção também vêm de lá**, contando só a seleção principal. O
Wikidata atrasa para quem está em atividade: o Vitor Roque aparecia com 1 jogo,
e já são 2.

#### O fato que aproxima do acerto

Raridade ainda deixava a segunda dica genérica: "vestiu a camisa da seleção 9
vezes" é raro e não leva a ninguém. O cliente pediu **informação específica — o
gol icônico, o título decisivo, o ídolo de um time**, para todos os jogadores.
São os três fatos que hoje abrem a segunda dica, nessa ordem:

| Fato | Exemplo | Fonte |
| --- | --- | --- |
| Gol em final | "Marcou 2 gols na final da Copa do Mundo de 2022." | registro de partidas do Transfermarkt |
| Título | "Campeão da Libertadores de 2013 pelo Atlético-MG e de 2020 e 2021 pelo Palmeiras." | página de títulos do Transfermarkt |
| Clube de ídolo | "Fez mais de 300 jogos pelo Palmeiras." | registro de partidas do Transfermarkt |

Naturalidade, Copa disputada e o resto ficam para quem não tem nenhum dos três.
A dica cita o clube nesses três casos, e só neles: o clube citado é sempre um
dos escudos à mostra, e dizer **qual** deles foi a casa dele é justamente o que
o mural não mostra. O `validar-dados` recusa citação de clube fora dessas
frases.

Cada um tem sua armadilha, e as três estão tratadas em código:

- **Jogos por clube são um piso, não a conta.** O registro do Transfermarkt só
  tem a partida com escalação no site — o Pelé aparece com 18 jogos pelo
  Santos. Por isso a frase diz "mais de 300", arredondado para baixo, que é
  sempre verdade. Com 150 jogos ou mais é o clube de ídolo, entre os fatos
  fortes — o "quando muito relevante" que o cliente pediu; de 50 a 149, entra
  abaixo deles (ver a seção seguinte).
- **Final de ida e volta é uma final só.** O site marca o jogo único e as duas
  partidas de outro jeito; ler só o jogo único deixava de fora toda final da
  Copa do Brasil, dos estaduais e das Libertadores até 2018. Os gols das duas
  partidas somam.
- **O ano de título de jogo único não é confiável na página de títulos.** O
  Mundial de Clubes de dezembro de 2007 do Milan está como 2007 no perfil do
  Emerson e como 2008 no do Kaká; o Messi aparecia com os Mundiais de 2010, 2012
  e 2016, que são os de 2009, 2011 e 2015. Para Mundial, Intercontinental e
  Supercopa da Uefa, o ano sai da **data da final** que ele jogou
  (`titulosConferidos`); sem a final, o título fica de fora — melhor calar que
  errar o ano. A final também dá a edição certa quando o calendário foge: a
  Libertadores de 2020 teve a final em janeiro de 2021.
- **Título de temporada vai também para quem saiu no meio dela.** O Seedorf
  aparecia campeão da Champions de 2000 pelo Real Madrid, que ele trocou pela
  Inter em dezembro de 1999. Se o registro de partidas mostra o jogador por
  outro clube no ano do título e nenhuma vez pelo campeão, a conquista não
  entra. Tirou também a Champions do Zé Roberto (1998), do Alex (2012) e do
  Cheryshev (2016), e a Copa da Itália do Bruno Uvini (2014).

Supercopa nacional, prêmio vago ("Futebolista do ano") e título de base não
entram: não levam a ninguém. A exceção é o Mundial Sub-20, que passa na TV
aberta e marca geração — a do Oscar, com três gols na final de 2011. A tabela `TITULOS` em `scripts/dicas.mjs` diz o que
cada título vale e como o torcedor brasileiro fala dele — o site escreve à moda
de Portugal ("Taça", "Supertaça") e às vezes em inglês.

#### A segunda dica que direciona (novembro de 2026)

O cliente achou que a segunda dica podia revelar mais. Das 900, 135 usavam
fato fraco ("saiu por empréstimo 3 vezes", "já soma 8 anos de estrada", "foi
jogar fora do país aos 18 anos") e 162 citavam final que pouca gente lembra —
estadual, copa nacional de outro país, Recopa, Sub-20. Ele escolheu, entre
duas propostas, a que **muda os fatos e acrescenta a letra do nome**:

- **A letra.** A segunda dica termina com "O nome começa com R.", do nome que
  o jogo mostra, sem acento (`scripts/letra-do-nome.mjs`). É o que mais
  direciona e vale para os 900: sozinha, corta para cerca de um décimo dos nomes
  (A abre 97, R 85, M 84). É a única parte do nome que pode aparecer numa dica,
  e o `validar-dados` confere que ela bate com o nome.
- **O clube em que mais jogou, a partir de 50 jogos**: "O clube em que mais
  jogou foi o Chelsea: mais de 100 jogos e mais de 10 gols." Diz qual escudo do
  mural é o dele. "O clube em que mais jogou" só quando dá para afirmar — o
  registro de partidas cobre a carreira inteira (cada escudo com jogo
  registrado, primeiro jogo junto do começo da carreira) e a folga sobre o
  segundo clube é clara (20 jogos e um quarto do total); senão, "Fez mais de 60
  jogos pelo Newcastle", que é sempre verdade. Gols a partir de 10.
- **Gols na carreira**, só com o registro completo: "Marcou mais de 100 gols na
  carreira." Do artilheiro antigo, com o registro pela metade, seria verdade
  pequena demais.
- **Gols pela seleção** junto dos jogos: "...38 vezes e marcou 12 gols."

A ordem tem quatro grupos, e nenhuma raridade cruza grupo (`nota` em
`scripts/dicas.mjs`): **fortes** (final grande, título, Copa, clube de ídolo,
naturalidade, transferência de € 40 milhões ou mais), **os que apontam um
escudo** (clube, gols, seleção e final menor, nesta ordem fixa), **forte que a
dica anterior não usava** e **fracos**. O forte que a dica já tinha fica: refazer
não troca à toa o que estava bom, e é o que o cliente aprovou — o fato novo toma
o lugar do fraco e da final menor; título, final grande e Copa continuam na
frente. Sem isso, o Fàbregas perdia "campeão do mundo em 2010" para a final do
Mundial de Clubes, só porque a raridade se mede contra a biblioteca do dia. O
clube que entra agora também não repete o clube do título ("campeão da
Libertadores de 2017 pelo Grêmio. O clube em que mais jogou foi o Grêmio"): a
vaga vai para o fato seguinte.

Resultado na aplicação: 363 dicas trocaram fato, 287 só ganharam a frase nova
do clube, as dicas com fato fraco caíram de 135 para 8, nenhum título e nenhuma
final grande saíram, e as 900 terminam com a letra.

Três erros saíram junto:

- **O Cléber Santana "já somava 26 anos de estrada".** Ele morreu no acidente
  da Chapecoense, em 2016, e o histórico não registra fim de carreira. Agora,
  quando o clube atual tem jogos no registro (ou ele está sem clube) e o último
  jogo tem mais de um ano e meio, a carreira acabou ali (`fatosDoHistorico`).
  Clube sem registro nenhum não prova nada, e aí vale o histórico.
- **Tempo de casa contava a base**: o Kevin-Prince Boateng "ficou 6 anos
  seguidos no Hertha BSC Juv.." — com dois pontos, porque o nome abreviado já
  trazia um. Time de base ("U19", "Sub-17", "Juv.", "Jgd.", "base") não conta
  mais, e a frase não fecha com ponto duplo.
- **País de nascimento sem seleção na biblioteca.** A API só dá o id do país, e
  o nome vem da seleção principal dele; quando nenhum jogador defendeu aquela
  seleção, a primeira dica caía na nacionalidade e diria "nascido na
  Inglaterra" do Sterling, de Kingston. `PAISES_SEM_SELECAO`, em
  `scripts/transfermarkt.mjs`, guarda os nove que faltavam (Jamaica, Guadalupe,
  RDA, União Soviética...), com os nomes que o perfil do Transfermarkt dava. Com
  eles, a primeira dica do Mandanda passou a dizer o certo: nascido no Zaire,
  defendeu a seleção francesa.

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

**Nome canônico sempre ganha, mesmo repetido.** Há dois Adrianos e dois Freds
na biblioteca; quem digita "Adriano" no dia de um deles não tem como ser mais
específico, então acerta. O pedido de desempate fica só para pedaço de nome que
serve a mais de um. `npm run teste-palpites` guarda os casos.

**Na revelação, o homônimo ganha uma linha embaixo do nome**: posição e o clube
em que mais jogou — "Centroavante, Inter de Milão" para o Imperador, "Lateral,
Barcelona" para o outro Adriano. Só "ADRIANO" não dizia qual dos dois era. O
`npm run dicas` escreve o `complemento` de quem divide o nome, e o
`validar-dados` recusa homônimo sem ele ou com o mesmo do outro.

### O nível

Sai da **opinião do cliente**, por amostragem (`npm run regua`,
`scripts/regua.mjs`). Ele marca jogadores numa página — fácil, intermediário,
difícil ou tirar — e as marcações estão em `scripts/amostra-nivel.json`. A
régua acha os pesos que melhor reproduzem essas marcações e com eles ordena a
biblioteca inteira, inclusive quem entrar depois, sem ninguém marcar de novo.

| Rodada | Quando | Marcações | De quem |
| --- | --- | --- | --- |
| 1 | setembro de 2026 | 66 | amostra da biblioteca de 400 |
| 2 | setembro de 2026 | 51 | os 35 em que a régua tinha pouca certeza, os 14 que entraram e 2 reservas |
| 3 | novembro de 2026 | 269 | 180 dos que entraram na ampliação para 900 (60 por nível), 58 nascidos antes de 1965, 30 da base e 1 que ele buscou |
| 4 | novembro de 2026 | 264 | os 209 que a régua mudou de nível ao aplicar a terceira e os 55 que entraram da reserva |
| 5 | 27/11/2026 | 205 | **às cegas**: 137 do intermediário, 38 do fácil e 30 do difícil, marcados pela charada, sem ver o nome |

A segunda só foi aplicada junto com a terceira. Na terceira o cliente
discordou de dois terços do que o jogo mostrava: dos 269 que ele marcou, 89
estavam no nível dele, 127 em outro e 53 ele mandou tirar. Na quarta, dos 209
que a régua tinha mudado, ele concordou com o nível novo em 92, voltou ao
antigo em 61 e mandou tirar 19; dos 55 que entraram, concordou em 24 e tirou
13.

**A quinta rodada foi às cegas.** Jogando, o cliente achou o intermediário às
vezes mais difícil que o difícil — e a régua mede fama, não a charada. A página
mostrou o mural, as duas dicas uma de cada vez e só então o nome, e guardou
quantas dicas ele abriu antes de revelar (o campo `dicas` no banco da página).
Foram 137 intermediários (os que a régua tinha posto lá e os de 10 clubes ou
mais que ele marcara), os 38 fáceis que só completavam o terço e os 30 difíceis
que a régua mais via como intermediários. Do intermediário, 95 ficaram, 33
foram para o difícil, 7 para o fácil e 2 saíram; do fácil, 26 ficaram, 10
subiram para o intermediário e 2 para o difícil; do difícil, 22 ficaram, 5
foram para o intermediário e 3 saíram. Ele abriu as duas dicas em 55 dos 57
difíceis e em 79 dos 110 intermediários; das 33 charadas que ele deu como
fáceis, 11 saíram sem dica nenhuma. Hoje 698 dos 900 estão no nível que ele
marcou; os outros 202, a régua põe (2 deles com o nível fixado à mão).

**Quem o cliente marca para tirar sai do jogo** e vai para `foraDaBiblioteca`,
com o id do Transfermarkt, para continuar no ajuste: são eles que ensinam à
régua onde fica o obscuro demais. Saíram 96. Na terceira rodada foram 55 —
muitos antigos (25 dos 58 nascidos antes de 1965 que ele marcou, inclusive
Zagallo, Gérson, Zoff e Rummenigge), brasileiros de muitos clubes (Kayke,
Wesley, Andrei Girotto) e estrangeiros de carreira europeia sem passagem pelo
Brasil (Vlahović, Brozović, Kjær, Mertens) —, e no lugar entraram os próximos
da reserva da ampliação, na ordem da régua, menos
homônimo de alguém que já está no jogo: o Zé Roberto da reserva, de Mirassol e
Schalke, ficou fora porque quem digitasse "Zé Roberto" acertaria pelo do
Bayern. Na quarta foram 32: 13 recém-chegados (Mkhitaryan, Diogo Jota, Kepa,
Bellerín, Nainggolan) e 19 dos que a régua tinha mudado, estrangeiros
(Çalhanoğlu, Kolarov, Jović, Tomiyasu) e brasileiros (Neto Baiano, Marcos
Júnior, Giovane Élber). A biblioteca ficou com 868 até a próxima busca de
candidatos. Na quinta, às cegas, foram 5 — Bruno Alves, Fabinho Soldado,
Gabriel, José Antonio Reyes e Yassine Bounou —, e entraram os seguintes da reserva de
24/11: Léo Jardim, Fabrício Bruno, Malcom, André Carrillo e Rayan Cherki. O
Bolasie, o quinto da lista, ficou para depois: três clubes do começo da
carreira (Hillingdon Borough, Floriana, Rushden & Diamonds) não estão no
catálogo.

Os dados são dez, do Transfermarkt, do Wikidata, da Wikipédia e do próprio
mural, e o peso de cada um sai das marcações (negativo deixa mais fácil; os
dados são padronizados, então os pesos se comparam):

| Dado | Peso |
| --- | --- |
| procura na Wikipédia em português (mediana mensal de doze meses) | −1,21 |
| jogos pelos clubes do Brasil | −0,82 |
| quão recente é a carreira (último ano com jogo) | −0,53 |
| idiomas em que a Wikipédia tem artigo sobre ele | −0,33 |
| jogos pela seleção principal de qualquer país | −0,20 |
| nasceu no Brasil | −0,14 |
| Copas do Mundo em que entrou em campo | −0,10 |
| jogos pela seleção brasileira | −0,08 |
| jogos nas cinco ligas grandes da Europa | +0,09 |
| **quantos escudos o mural mostra** | **+0,23** |

O número de escudos entrou com a rodada às cegas: é o único dado que mede a
charada, e não a fama — para o mesmo jogador, carreira de muitos clubes é mais
difícil de reconhecer. Escudos raros (clube de dois jogadores ou menos na
biblioteca) e clubes grandes também foram testados e não acrescentaram nada.

Os jogos pelos clubes do Brasil entraram na terceira rodada. Sem eles a régua
não enxergava fama feita aqui e mandava ídolos estrangeiros do futebol
brasileiro (D'Alessandro, Guerrero, Lugano) para o difícil. A procura em
português entrou em 24/11: sem ela a régua não enxergava a fama de hoje, e
dava 20% de chance de fácil ao Yuri Alberto, com 17 mil visualizações por mês.
O cliente recusou a procura como régua sozinha (abaixo); como um dos dados,
com o peso que as marcações dão, ela é o que mais pesa. A medição fica em
`scripts/procura-jogadores.json`, com a janela; a atualização de fevereiro e
setembro mede de novo. Artigo que mudou de título há poucos meses tem quase
nenhuma visita antes da mudança — o do Dante dava 7 por mês —, então, abaixo de
200, vale a mediana dos últimos seis meses se for maior; artigo que o Wikidata
não liga ao jogador vai em `ARTIGO_SEM_LIGACAO`, em `scripts/regua.mjs`.

O modelo é ordinal (fácil < intermediário < difícil < tirar), com freio contra
amostra pequena. **Quanto acerta**, em validação cruzada de dez partes — cada
décimo das marcações fica fora do ajuste e a régua diz o nível em que poria
cada um, sem cota: 427 das 698 marcações de quem está no jogo (61%), com 6
erros de dois níveis; nas 200 charadas às cegas que ficaram no jogo, 125
(62,5%). Em 84,6% dos pares de jogadores que o cliente pôs em níveis
diferentes, ela põe o mais fácil na frente. Sem o número de escudos: 60,2%,
10 erros de dois níveis e 83,9% dos pares.

A medida mudou na quinta rodada. Até a quarta, a régua tirava uma marcação e
via em que nível o jogador caía **com a cota de um terço**: deu 63% de 554. Com
as marcações da quinta, sobram só 28 vagas de intermediário para 202 sem
marcação, e essa conta passou a medir a cota, não a régua (34%). O nível sem
cota é o que a régua acha de cada um, e é o que se compara com o cliente.

Ela ainda erra com os antigos que o cliente tira (jogou pela seleção e nasceu
no Brasil, para ela, é fácil). Por isso a marcação vale mais que a régua.

#### Onde faltava jogador: o fácil

Depois da quarta rodada, o fácil tinha 289 jogadores, e 87 deles só estavam lá
para o nível fechar um terço: pela marcação do cliente e o nível mais provável
dos outros, a biblioteca tinha por natureza uns 200 fáceis para 340
intermediários e 325 difíceis. O fácil do cliente é quase só de craque: 127
das 554 marcações.

A **busca de 24/11** foi atrás de fácil: quem passou por clube brasileiro,
brasileiros nascidos de 1985 em diante e os conhecidos no mundo, com pelo
menos 700 visualizações por mês em português — 687 candidatos pontuados pela
régua. Só 43 ela punha no fácil; os seguintes já são intermediários. Entraram
39 (Endrick, Yuri Alberto, Bruno Guimarães, Antony, Jhon Arias, Matheus Cunha,
Kvaratskhelia, Germán Cano…), todos no fácil; para os 868 voltarem a 900 saíram
os 7 que a régua mais achava que o cliente tiraria, nenhum marcado por ele
(Owen Hargreaves, Sheringham, Höwedes, Capone, Ayala, Sirigu e o Dedê do
Dortmund). Hoje o fácil tem 127 marcados pelo cliente e 173 pela régua, dos
quais 134 são fáceis para ela e 39 completam o terço. Por natureza, a
biblioteca tem uns **261 fáceis, 335 intermediários e 302 difíceis**: o
gargalo diminuiu, e o que falta não está mais entre os candidatos que
passaram por clube brasileiro ou são conhecidos no mundo. Os seguintes da
busca estão em `relatorios/reserva-2026-11-24.md`.

#### Depois da rodada às cegas: o gargalo foi para o intermediário

O cliente mandou 33 intermediários para o difícil e 12 fáceis para cima, e o
fácil deixou de ser o problema: tem 160 marcados por ele e 140 pela régua, dos
quais só 10 estão lá para fechar o terço (eram 39). O intermediário tem 272
marcados e 27 que a régua punha no difícil e sobem para o terço fechar —
estrangeiros de carreira europeia, como van Bommel, Mario Gómez, Ramsey,
Fellaini, Makélélé, Kluivert e Materazzi. Pela régua sem cota, a biblioteca
tem 220 fáceis, 356 intermediários, 317 difíceis e 7 que ela tiraria.

O cliente quer **o mesmo número de jogadores por nível**. A régua ordena e corta
onde cada nível fecha com um terço. Vencem o cálculo, nesta ordem:

- a marcação do cliente;
- `scripts/niveis-fixos.mjs`, a decisão à mão com o motivo escrito;
- `EM_DUVIDA` e `PROVISORIO`, em `scripts/regua.mjs`, que seguram quem a régua
  põe com pouca certeza até o cliente marcar. As duas estão vazias: os 35 em
  dúvida da primeira rodada (Bale, Figo, Shaqiri, Cahill…) e os quatro
  provisórios (Guerrero, D'Alessandro, Lugano, Seedorf) foram marcados na
  segunda.

**Para aplicar uma rodada nova**: as marcações da página vão para
`scripts/amostra-nivel.json` (a página vence); quem foi marcado para tirar
sai da biblioteca e vai para `foraDaBiblioteca`, e entra o próximo da reserva
com `npm run trazer`; depois `npm run catalogo`, `npm run dicas`,
`npm run regua -- --gravar` e, com os dias ainda não jogados tirados da
agenda, `npm run agenda`.

#### A régua anterior: visualizações da Wikipédia

O cliente recusou esta régua, e ela não roda mais: `npm run reparar` não
recalcula o nível. O que ela ensinou continua valendo.

Saía quase toda da **mediana de visualizações do artigo na Wikipédia em
português**: é a única medida direta da pergunta do jogo — quanta gente procura
esse jogador em português. Mediana e não soma porque transferência e polêmica
produzem pico de um ou dois meses.

A procura é medida nos **últimos doze meses fechados**, e a janela anda com o
calendário (`scripts/visualizacoes.mjs`). Eram dois anos fixos, e a mediana de
dois anos escondia quem subiu: o Estevão ficava no difícil com 803
visualizações por mês. O arquivo de visualizações guarda a janela junto, e
número medido em outra janela é medido de novo.

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

Por isso `scripts/niveis-fixos.mjs` fixa o nível à mão e vence o cálculo — o
da régua de hoje também. Tem cinco entradas, cada uma com o motivo escrito:
Roger Machado e Joel Santana no difícil, Guardiola no intermediário, e os dois
que o cliente corrigiu no dia em que caíram, Mário Fernandes no intermediário e
Desailly no difícil.

#### O outro piso: difícil não é desconhecido

Procura baixa demais também estraga, do outro lado. Takashi Usami tem 86
visualizações por mês — nove vezes abaixo da mediana do próprio nível. Quem cai
nele não perde uma charada difícil; perde uma que não tinha resposta possível, e
termina a partida sem saber quem é o nome revelado.

`npm run repor` mede a procura dos trezentos, lista quem está abaixo do piso
(250 por padrão, `PISO=` muda) e troca cada um por um candidato que passe no
mesmo caminho de aceitação do gerador com procura bem acima do piso
(`PISO_NOVO=`, 800 por padrão). Quem sai não é apagado: só sai da vez.

### A atualização de fevereiro e setembro

A base vai inteira dentro do pacote publicado — jogadores, clubes e agenda no
JavaScript, escudos em `public/escudos/` —, e o jogo não busca nada sozinho.
Carreira nova só entra rodando, na sua máquina ou aqui:

```bash
npm run atualizar                 # baixa de novo os dados de cada jogador e refaz tudo
npm run atualizar -- --continuar  # retoma sem baixar de novo o que já veio
```

Duas vezes por ano, depois que fecham as janelas de transferência da Europa:
em **fevereiro** e em **setembro**. Leva uns quinze minutos: a régua mede de
novo a procura de cada jogador na Wikipédia em português, com a janela dos
doze meses mais recentes (`scripts/procura-jogadores.json` é apagado no
começo). Os passos são os
comandos de sempre, na ordem: `catalogo` (o clube acrescentado à mão desde a
última vez passa a existir), `reparar`, `catalogo` de novo (o escudo de quem
entrou nas carreiras), `dicas`, `regua -- --gravar`, `agenda`, e no fim
`validar-dados`, `teste-palpites` e `teste-nomes`.

O que mudou vai para **`relatorios/atualizacao-AAAA-MM-DD.md`**: carreira por
carreira, clube por clube; o que travou e ficou como estava; clube novo; nível
e dica que mudaram. Leia antes de publicar. Carreira travada pede o clube: o
par id-do-Transfermarkt → clube do catálogo em `PARES_TM` (e em
`scripts/clubes-transfermarkt.json`), ou o clube em `SEM_ESCUDO`
(`scripts/clubes-canonicos.mjs`), e depois `--continuar`.

A primeira, em 05/11, mudou 7 carreiras: o Carvajal foi para o Getafe, o Neto
voltou à Juventus, o David Silva saiu da aposentadoria para o Sha Tin, de Hong
Kong (o clube atual entra mesmo antes da estreia: é lá que ele está), e o
Transfermarkt completou ou corrigiu o começo das carreiras do Bernard, do
Dante, do Deco e do Leandro Euzébio.

**A dica de quem já está na base não muda na atualização**, a não ser com os
títulos — ver abaixo.

### De onde vem o dado do Transfermarkt

De **`tmapi.transfermarkt.technology`**, a API aberta do Transfermarkt: o
histórico de transferências (`transfer/history/player/{id}`), o perfil, as
partidas, a seleção e o nome de clube e de competição, em português. O site
fica atrás de uma verificação contra robôs (AWS WAF), que em novembro recusava
quase tudo — a atualização baixou 25 históricos em meia hora antes de parar.
Pela API, os 900 vêm em minutos.

O histórico da API foi conferido contra o do site nos 25 jogadores que ainda
estavam em cache: as 204 transferências batem em data, clube de origem e de
destino, país, taxa, valor e temporada, e as 25 carreiras saem iguais.
`scripts/transfermarkt.mjs` grava o histórico da API no formato da tabela do
site, que é o que o resto do código lê. Três coisas da API pediram cuidado:

- **time B e base pelo dado, não pelo nome.** O site traduz o nome da base
  ("Sporting Atl.", "OB Juventude"), e o filtro de base é pelo nome; a API dá o
  nome próprio da academia ("Zébra Élites", "SL16 FC"). Mas ela diz também de
  que clube o time é subordinado (`mainClubId`), e é isso que tira a base da
  carreira agora;
- **duas transferências no mesmo dia** vão na ordem da cadeia: o Coutinho foi
  comprado pela Inter e emprestado ao Vasco em 23/07/2008, e na ordem da API o
  empréstimo vinha antes da compra;
- **nome curto vazio**: o do Levallois do Drogba vem vazio, e o nome inteiro
  entra no lugar.

**Os títulos só existem no site.** A página de títulos não tem par na API, e
por isso `titulosDoTransfermarkt` lê o cache e, sem ele, devolve null. O cache
não sobrevive à troca de máquina, mas o dado sobreviveu na própria dica: a
frase de título que cada uma tinha (336 jogadores) está em
`scripts/titulos-das-dicas.json` e volta como fato — com peso, torneio e anos —
quando o site não responde (`tituloDaFrase` em `scripts/dicas.mjs`). Assim
`npm run dicas` refaz todas sem tirar o "Campeão da Libertadores de 2013 pelo
Atlético-MG". Quem entrou depois só ganha título com `TITULOS_DO_SITE=1`, numa
máquina onde o site responda; sem isso, sai com o que a API tem: final em que
marcou, jogos e gols pelo clube, Copas, seleção, naturalidade.

### Consertar sem gerar elenco novo

Gerar o elenco de novo devolve um conjunto de jogadores um pouco diferente,
então trocar texto ou nível não deveria custar um elenco novo:

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
a partir de quatro repositórios públicos **e do Wikidata** — **5650 clubes
de 87 países**, sendo **1204 brasileiros**, 1082 deles em uso. O catálogo é de
propósito muito maior que o uso atual: o escudo é a informação principal do
jogo, e uma carreira costuma começar ou terminar num clube pequeno.

**O catálogo não apaga escudo para refazer.** Cada clube que já tinha escudo
fica com ele, e só o que falta é baixado; `npm run catalogo -- --baixar-de-novo`
baixa todos. Antes, cada rodada apagava `public/escudos/` e baixava os 5 mil de
novo — e com o Wikimedia limitando os pedidos, o clube cujo download falhasse
perdia o escudo que tinha. Quando o original passa do limite, ele tenta as
miniaturas de 330, 250 e 500 pixels.

**Dois escudos que estavam errados, em novembro:**

- **o Elche não aparecia.** O SVG usava o prefixo `sodipodi` (do Inkscape) sem
  declarar, e para o navegador isso é XML malformado: a imagem inteira não
  carrega, e o jogo cai no brasão desenhado. `scripts/svg-escudo.mjs` declara o
  prefixo que falta ao gravar, e o `validar-dados` recusa SVG em uso que o
  navegador não leria;
- **o Palmeiras era o de antes de 2012**, sem a estrela vermelha em cima. As
  fontes ainda têm o antigo; o atual, o da Wikipédia (Wikimedia Commons), fica
  em `scripts/escudos-fixos/palmeiras.png`, e `ESCUDO_ARQUIVO`
  (`scripts/clubes-canonicos.mjs`) faz ele vencer qualquer fonte.

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

### O nome embaixo do escudo

O catálogo guarda o nome inteiro de cada clube, porque é ele que casa com o
Transfermarkt e o Wikidata. O que o jogador vê — embaixo de cada escudo, a
partida inteira, e na dica de tempo de casa — é o nome que o torcedor fala, de
`scripts/nomes-curtos.mjs`: "Inter de Limeira", e não "Associação Atlética
Internacional (Limeira)", que quebrava em quatro linhas embaixo de um escudo de
80 pixels. A escolha segue o nome curto do próprio Transfermarkt, em português
quando o clube tem nome consagrado aqui (Estrela Vermelha, Marselha), com o
estado quando há homônimo em uso (América-MG, América-RJ, América-RN). `npm run
catalogo` avisa se dois clubes em uso ficarem com o mesmo nome.

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
push na `main`, e toda segunda às 6h de Brasília estende a agenda antes de
publicar (dá para disparar à mão em Actions → Publicar no GitHub Pages → Run
workflow). `vite.config.ts` só aplica o caminho base do Pages quando
`GITHUB_PAGES=true`, então o desenvolvimento local segue na raiz.

**A prévia do link** — a imagem e o texto que o WhatsApp mostra quando alguém
cola o endereço — vem das tags `og:` do `index.html` e de `public/previa.png`.
Sem elas, o resultado compartilhado chegava como link cru, e compartilhar é o
principal jeito de um jogo diário chegar a gente nova. A imagem repete a
abertura do jogo (parede de escudos e título) e é gerada por `npm run previa`,
que abre um navegador; por isso o arquivo vai para o repositório em vez de
sair da publicação. O endereço da imagem é completo porque quem monta a prévia
é o servidor do aplicativo, e o WhatsApp guarda a prévia de um link por um
tempo: a troca da imagem pode demorar a aparecer em conversa que já tinha o
link.
