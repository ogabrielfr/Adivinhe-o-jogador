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

`src/dados/jogadores.ts` tem os jogadores e `src/dados/clubes.ts` o catálogo de
clubes. Cada jogador declara nome, apelidos aceitos, nível, os clubes em ordem
cronológica e uma dica.

A dica revela um fato marcante sem citar nome, clube, posição ou ano — o
`validar-dados` recusa uma dica que mencione o nome do jogador ou de um clube
que está à mostra.

### Conferência das carreiras

> **As carreiras desta onda foram escritas de memória e a conferência mostrou
> que isso produz erro.** Das 45, 12 passam sem divergência forte e 33 divergem.
> Nenhuma correção foi aplicada ainda.

`npm run verificar` compara cada carreira com **três fontes** e imprime as
divergências, sem alterar nada. Grava também `scripts/relatorio-carreiras.json`.

| | Fonte | Força | Fraqueza |
| --- | --- | --- | --- |
| `wd` | Wikidata, propriedade P54 | estruturado, auditável por QID | preenchido à mão e atrasado |
| `wp` | Infobox do artigo na Wikipédia | melhor no futebol brasileiro | alguns artigos não têm o campo |
| `tm` | Transfermarkt | a mais completa das três | depende de o WAF deixar passar |

**São três porque uma só não distingue erro nosso de lacuna da fonte.** Com
apenas o Wikidata, o Grêmio do Elkeson parecia clube inventado — ele jogou lá em
2021, e eram o infobox e o Transfermarkt que tinham a passagem. O mesmo com o
Grêmio do Diego Tardelli e o Arouca do Keirrison.

O relatório conta quantas fontes confirmam cada clube:

| Saída | O que significa |
| --- | --- |
| `FALTA (2+ fontes)` | duas ou três têm um clube que não temos — acrescentar |
| `NENHUMA FONTE TEM` | um clube nosso que nenhuma tem — candidato a erro nosso |
| `falta (1 fonte)` | só uma tem — quase sempre lacuna das outras duas |
| `só uma fonte tem` | nosso clube confirmado por só uma — está certo |

O Ogol seria a melhor referência para futebol brasileiro, mas ele e o zerozero
estão atrás do bot management do Cloudflare e devolvem `403 cf-mitigated:
challenge` a qualquer cliente automatizado, inclusive Chromium real. É controle
de acesso do próprio site, não do ambiente.

`npm run teste-nomes` testa o comparador de nomes de clube, que é a peça de que
tudo depende: ele precisa casar "Coritiba" com "Coritiba Foot Ball Club" sem
casar "Botafogo" com "Botafogo-SP".

Quando a conferência passar, marque cada jogador com `verificado: true` e ligue
`EXIGIR_VERIFICACAO` em `src/logica/diario.ts` — o sorteio passa a ignorar
quem não foi conferido.

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
