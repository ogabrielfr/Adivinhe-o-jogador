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
  biblioteca pede trocar os dias em que ele está agendado.
- **`npm run validar-dados` recusa** agenda que aponte jogador fora da
  biblioteca ou que não cubra os próximos 7 dias — e o deploy roda o validador.

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

## A biblioteca

`src/dados/jogadores.json` tem **318 jogadores, 106 em cada nível**. É dado, não
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

Posição vem do **perfil do Transfermarkt**, e país de nascimento e seleção,
da **API do Transfermarkt** — a mesma dos jogos por clube, que não passa pelo
WAF. Não do Wikidata: lá as propriedades aceitam vários valores e pegar o
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
  sempre verdade; e o fato só entra a partir de 150 jogos, que é o "quando muito
  relevante" que o cliente pediu.
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
`scripts/regua.mjs`). Ele marcou 66 jogadores numa página — fácil,
intermediário, difícil ou tirar — e as marcações estão em
`scripts/amostra-nivel.json`. A régua acha os pesos que melhor reproduzem essas
marcações e com eles ordena a biblioteca inteira, inclusive quem entrar depois,
sem ninguém marcar de novo.

Os dados são sete, todos do Transfermarkt e do Wikidata, e o peso de cada um sai
das marcações (negativo deixa mais fácil):

| Dado | Peso |
| --- | --- |
| nasceu no Brasil | −1,23 |
| quão recente é a carreira (último ano com jogo) | −1,02 |
| Copas do Mundo em que entrou em campo | −0,97 |
| jogos pela seleção brasileira | −0,80 |
| idiomas em que a Wikipédia tem artigo sobre ele | −0,53 |
| jogos nas cinco ligas grandes da Europa | −0,44 |
| jogos pela seleção principal de qualquer país | +0,06 |

O modelo é ordinal (fácil < intermediário < difícil < tirar), com freio contra
amostra pequena. Tirando cada jogador da amostra do ajuste e prevendo o dele,
acerta 50 das 66 marcações (76%); a régua anterior acertava 38 (58%). Os 9 que
o cliente mandou tirar já saíram da biblioteca, mas continuam no ajuste pelo id
do Transfermarkt (`foraDaBiblioteca`): são eles que ensinam onde fica o obscuro
demais.

O cliente quer **o mesmo número de jogadores por nível**. A régua ordena e corta
onde cada nível fecha com um terço. Vencem o cálculo, nesta ordem:

- a marcação do cliente;
- `scripts/niveis-fixos.mjs`, a decisão à mão com o motivo escrito;
- `EM_DUVIDA`, em `scripts/regua.mjs`: 35 jogadores que a régua mudaria com
  pouca certeza. São craques que ela joga para baixo, porque a amostra tinha
  poucos (aplicada direto, punha o Bale e o Figo no difícil), brasileiros que
  ela subiria do difícil direto para o fácil e estrangeiros de muitas Copas que
  ela punha no fácil (Shaqiri, Cahill, Xhaka). Ficam no nível de antes;
- `PROVISORIO`: Guerrero, D'Alessandro, Lugano e Seedorf, ídolos no Brasil que
  entraram na reposição. A régua não enxerga fama feita num clube brasileiro e
  mandava os quatro para o difícil; ficam no intermediário.

Os dois últimos esperam a **segunda rodada** de marcações, que está na mesma
página, com os 14 que entraram e os 2 reservas. Marcação nova vai para
`scripts/amostra-nivel.json`; depois, `npm run regua -- --gravar` e
`npm run agenda` para os dias ainda não agendados. Quem o cliente marcar sai
de `EM_DUVIDA` e `PROVISORIO` sem precisar mexer neles, porque a marcação vence.

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
a partir de quatro repositórios públicos **e do Wikidata** — **5381 clubes
de 66 países**, sendo **1155 brasileiros**. O catálogo é de propósito
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
