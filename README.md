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

Sai de atributo estruturado: posição, país de nascimento, quantos países a
carreira atravessou, década de nascimento. **Nunca de texto gerado** — dica
inventada é a mesma classe de erro que carreira inventada, só que mais difícil
de conferir depois.

### O nível

Sai do número de links de Wikipédia do jogador, **corrigido para o torcedor
brasileiro**: quem é brasileiro pesa 2,5x e quem passou pelo futebol brasileiro
1,8x. Sem essa correção o nível fácil enchia de nome que o mundo conhece e o
Brasil não — a primeira versão abria com Darijo Srna e Granit Xhaka; agora abre
com Pelé, Neymar, Cristiano Ronaldo, Roberto Carlos e Ronaldinho.

Continua sendo aproximação, não julgamento editorial. Guardiola, por exemplo,
cai no fácil por ser famoso como **técnico**, embora a carreira de jogador dele
seja um enigma difícil. Ajuste à mão onde discordar.

`OBRIGATORIOS`, em `scripts/montar-biblioteca.mjs`, força a entrada de um
jogador independentemente de fama e o põe na frente da fila, e
`escalarParaHoje()` o coloca no sorteio de hoje — dá para testar um nome
específico sem esperar a data chegar. **A escalação é presa à data em que o
script rodou**: no dia seguinte o sorteio segue seu curso normal.

**Quando um ídolo não entra, quase sempre é um clube só que bloqueia.** Cada
jogador é descartado inteiro se qualquer passagem não resolver, e o script
imprime quais clubes mais derrubaram jogador. Romário, Rivaldo e Bebeto ainda
estão de fora por isso. O conserto é acrescentar o par `id do Transfermarkt ->
id do nosso catálogo` em `scripts/clubes-transfermarkt.json`, como já foi feito
para o Cosmos do Pelé, o América-RJ, o Santa Cruz e o Sevilla.

**A composição depende um pouco de sorte de rede.** O WAF do Transfermarkt
recusa uma fração das requisições, e sob carga essa fração cresce — numa das
execuções, 171 candidatos ficaram sem carreira por isso. Rodar de novo produz
uma lista parecida, não idêntica. Por isso os nomes que não podem faltar vão em
`OBRIGATORIOS`, que são tentados primeiro.

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
