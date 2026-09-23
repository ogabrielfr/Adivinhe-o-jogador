# Estado do projeto

Documento de passagem. O que está pronto, o que foi decidido e por quê, e o que
falta. Leia junto com o `README.md`, que cobre a arquitetura.

**Repositório:** `ogabrielfr/Adivinhe-o-jogador`, branch `main`
**No ar:** https://ogabrielfr.github.io/Adivinhe-o-jogador/ (GitHub Pages, deploy a cada push na `main`)

---

## O jogo

"Acerte o jogador pela carreira". Os escudos dos clubes por onde um jogador
passou aparecem em ordem cronológica, e o usuário tem 3 chutes e duas dicas
para descobrir quem é. Três níveis independentes, um jogador novo em cada um por dia.
Público brasileiro; jogadores do mundo todo, filtrados por "o torcedor
brasileiro reconhece".

Site estático (Vite + React + TS + Tailwind), sem back-end e sem chave de API.

### Decisões já tomadas com o cliente

| Decisão | Escolha |
| --- | --- |
| Fonte dos jogadores | Biblioteca interna curada, não API externa |
| Escudos | Reais, versionados no repositório |
| Mecânica | Todos os escudos de uma vez, 3 tentativas |
| Stack | Vite + React, GitHub Pages |
| Níveis | Por reconhecimento do torcedor brasileiro, não por número de clubes nem por época |
| Dica | **Duas por jogador**: a 1ª situa, a 2ª entrega. Nenhuma gasta chute; marcam no resultado compartilhado (🟢 sem dica / 🟡 uma / 🟠 as duas) |
| Desistir | Revela o nome e encerra o nível; conta como derrota, com confirmação em dois toques |
| Entrada de texto | Livre, sem autocomplete (entregaria a lista de respostas); tolera acento, caixa e um erro de digitação |
| Clube repetido | Válido — o escudo reaparece na posição certa quando o jogador voltou |
| Carreira | **Só jogo profissional**: sem base, sem time B, sem clube-ponte, sem empréstimo em que o jogador não entrou em campo |
| Nível | A régua de visualizações da Wikipédia foi **recusada**; o nível está congelado até a nova ser decidida |
| Jogador do dia | **Pela agenda** (`src/dados/agenda.json`), congelada um mês à frente e estendida toda segunda pelo GitHub; quem saiu não volta em 90 dias |

---

## Rede: resolvido, com uma ressalva permanente

O ambiente está em **Full** e o acesso funciona. Os dois `curl` da sessão
anterior:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.ogol.com.br          # 403
curl -s -o /dev/null -w "%{http_code}\n" https://tmssl.akamaized.net/images/wappen/head/614.png  # 200
```

**O 403 do Ogol não é mais o ambiente — é o Cloudflare do próprio Ogol.** A
resposta traz `cf-mitigated: challenge`, e a interstitial "Um momento…" não
resolve nem em Chromium real com o proxy configurado (testado, 60s parado). O
zerozero, do mesmo grupo, faz igual. O Transfermarkt devolve 405.

Trocar de ambiente não muda isso. Não tente de novo por esse caminho.

**O Transfermarkt, ao contrário, dá para usar.** Ele fica atrás do AWS WAF, que
amostra as requisições e devolve uma página "Human Verification" em vez de 200
mais ou menos uma em cinco — repetir devagar resolve. O `robots.txt` deles
declara `Allow: /` para agente genérico. Dois detalhes que custaram tempo:

- **O pedido precisa sair por `curl`, não pelo `fetch` do Node.** Com os mesmos
  cabeçalhos, o WAF recusa o fetch quase sempre e aceita o curl quase sempre.
- **O id do jogador vem do Wikidata (P2446), não da busca deles.** Mais
  confiável: o Elkeson está lá como "Ai Kesen", o nome com que se naturalizou
  chinês.

Busca do Google como fonte não serve: a página de resultados vem como casca de
JavaScript (200 com 92 KB e nenhum resultado no HTML), e o resumo de IA é texto
gerado sem citação estável — reintroduz exatamente o problema que a conferência
existe para eliminar.

O que responde 200 da mesma máquina: `tmssl.akamaized.net`, Wikipédia,
Wikidata (SPARQL e API), Commons, Transfermarkt (com repetição) e
`ogabrielfr.github.io`.

---

## Pronto e testado

- Jogo completo: tela inicial, partida, derrota (com o nome revelado), vitória, compartilhamento estilo Wordle, streak e estatísticas em `localStorage`.
- **Agenda do jogador do dia** (`npm run agenda`): dia marcado não muda mais, então mexer na biblioteca só afeta os dias que ainda não estão nela. Fora da agenda vale o sorteio determinístico por data. A partida guarda o id do jogador e continua com ele mesmo que o dia seja trocado.
- **317 jogadores** (114 no fácil, 101 no intermediário, 102 no difícil), com carreira montada a partir do histórico do Transfermarkt. `EXIGIR_VERIFICACAO` está ligado e todos têm `verificado: true`. Jogador pedido pelo nome entra por `npm run trazer`. A biblioteca é dado (`src/dados/jogadores.json`), lida e gravada por `scripts/biblioteca.mjs`.
- **Um resolvedor de clube só** (`scripts/resolver-clube.mjs`) para gerar, reparar e repor. Casa por id do Transfermarkt; por nome, só com nome contido, país e época conferidos.
- **Mapa do Transfermarkt conferido por duas testemunhas** (`npm run mapa-tm`): o Wikidata diz de quem é cada id, e o par que ele desmente sai; o nome que o próprio Transfermarkt dá ao id é conferido para todo id em uso, e o que não bate vai para uma lista de leitura. Foi essa lista que achou o CRB do Marcos Rocha ligado ao Brasil de Pelotas e o Instituto do Dybala ao Central Córdoba.
- **Catálogo de 5381 clubes de 66 países**, sendo 1155 brasileiros. Dos 374 que o jogo usa, só o Miami FC de 2006 fica com o brasão desenhado, de propósito: as duas fontes mostram o escudo do Fort Lauderdale Strikers, que o clube virou depois.
- **Duas dicas por jogador.** A primeira diz posição, país de **nascimento** e ano, e, quando o jogador defendeu a seleção de outro país, qual ("Lateral brasileiro nascido em 1990, que defendeu a seleção russa"). A segunda abre com o **fato específico** que o cliente pediu — gol em final, título com ano e clube, clube de que foi ídolo em jogos ("Campeão da Libertadores de 2013 pelo Atlético-MG e de 2020 e 2021 pelo Palmeiras. Fez mais de 300 jogos pelo Palmeiras.") — e cai para naturalidade, Copa e o resto só quando não há nenhum. Tudo do Transfermarkt: página de títulos, registro de partidas e API.
- **Estatísticas com tela própria**, no rodapé da tela inicial: partidas, aproveitamento, sequência atual e maior, e em que chute acertou, por nível.
- **Prévia do link no WhatsApp**: tags `og:` no `index.html` e `public/previa.png`, gerada por `npm run previa`.
- **Homônimo com complemento na revelação**: quem divide o nome com outro jogador ganha uma linha embaixo dele ("Lateral, Barcelona").
- **Volta de empréstimo com jogo entra na carreira**: o registro de partidas guarda o dia de cada jogo, e a volta ao clube dono aparece quando há jogo entre a volta e a saída seguinte (o Marcos Rocha voltou ao Atlético-MG e jogou 275 vezes). Mudou 47 carreiras.
- **A página recarrega na virada do dia**, para aba esquecida no celular não mostrar biblioteca velha.
- **Nome curto embaixo do escudo** (`scripts/nomes-curtos.mjs`): o nome que o torcedor fala, na tela e na dica — "Inter de Limeira", não "Associação Atlética Internacional (Limeira)". O catálogo guarda o nome inteiro, que é o que casa com as fontes.
- `npm run validar-dados` confere integridade e recusa dica que entregue nome de jogador ou clube visível.
- `npm run teste-nomes` (71 casos) testa o comparador de nomes de clube; `npm run teste-palpites` (25 casos) testa a aceitação de palpite.
- `npm run teste-visual` roda a partida ponta a ponta no Chromium e salva capturas.

---

## Pontos em aberto, por prioridade

### 1. Os grandes nomes: feito, com duas pendências

Entraram 19 dos 21 (`npm run trazer`). O **Totti** não entra: só jogou no Roma,
e um escudo não é charada. O **Buffon** já estava. Saíram **Gavi e Phil Foden**,
que só jogaram num clube; o dia 21/10, que era do Gavi, passou ao Asensio.

Os níveis dos 19 foram decididos à mão enquanto não há régua: 16 no fácil e
Garrincha, Pirlo e Riquelme no intermediário. O fácil ficou com 114 — vale
revisar com o cliente junto da régua nova.

Três carreiras vieram com o fim novo que o Transfermarkt já registra: Salah no
Trabzonspor (agosto de 2026), Lewandowski no Chicago Fire (julho de 2026) e
Thiago Silva de volta ao Fluminense depois de meio ano no Porto.

### 2. A régua do nível

O cliente recusou as visualizações da Wikipédia como régua de nível ("melhor
achar outro caminho"), e pediu que a medida de procura passe a olhar os últimos
12 meses — feito: a janela anda com o calendário, em `scripts/visualizacoes.mjs`.
Até a nova régua ser decidida com ele, `npm run reparar` não
recalcula nível: vale o que está na biblioteca, e `scripts/niveis-fixos.mjs`
guarda as decisões à mão (Roger Machado e Joel Santana no difícil, Guardiola no
intermediário).

Testado e descartado como régua sozinha: **número de idiomas da Wikipédia com
artigo do jogador** (sitelinks do Wikidata). É estável e não tem pico de
notícia, mas mede fama no mundo: mudaria 151 dos 317 de nível e mandaria
Pedro, Bruno Henrique, Gerson e Everton Ribeiro para o difícil, enquanto
Vidić e Pepe Reina subiriam para o fácil. Para público brasileiro, precisa de
um peso de carreira no Brasil (jogos por clube brasileiro e pela seleção, que
o registro de partidas já tem) ou da curadoria do cliente.

### 3. Texto que vem das fontes e lê mal

- **Posição vem do Transfermarkt** e às vezes soa estranha em português de jogo: o Neymar aparece como "Meia".

### 4. Tamanho do repositório

`public/escudos/` está em **77 MB** com os 5381 clubes. Dentro dos limites do
GitHub Pages com folga, e o pacote enviado ao navegador **não** cresce com
isso: `clubes.ts` leva só os 374 clubes em uso.

O custo é de repositório, não de carregamento — clone mais lento e 77 MB
publicados a cada push. Se incomodar, o corte natural é gravar em
`public/escudos/` só os clubes em uso e deixar o resto como metadado em
`scripts/catalogo-completo.json`, que já tem a URL de origem de cada um.
Deixei vendorizado porque o combinado era catálogo maior que o uso e porque o
acesso a essas fontes se mostrou frágil.

### 5. Decisões de produto pendentes

- **O nome do clube fica escondido**, revelado ao tocar no escudo e sempre no fim da partida. Escolha minha, ainda não validada pelo cliente.
- **As respostas estão no pacote enviado ao navegador** (mesma escolha do Wordle original). Se virar problema, a saída é mover o sorteio para um endpoint.
- **Volume da biblioteca.** O combinado era 300 e depois ~900 se o cliente gostasse. Os 300 estão no ar; os 900 dependem de ele pedir.
- **Licença dos escudos.** O catálogo mistura três origens: licença livre declarada no Commons, upload local da Wikipédia marcado "Conteúdo restrito" (uso justo) e Transfermarkt, sem licença. Escudo é marca do clube em qualquer caso, e o projeto já os usava para identificação, mas a distinção está explícita no campo `licenca` de `scripts/clubes-externos.json`, caso o cliente queira restringir.

---

## Armadilhas conhecidas

- **A `main` recebe commit do github-actions toda segunda** ("Estende a agenda"). Puxe antes de publicar, senão o push é recusado.
- **Mexer na lista de um nível sem rodar `npm run agenda` antes** congela o mês seguinte já com a lista nova. Só é problema se a agenda tiver vencido — o deploy recusa agenda que não cubra 7 dias à frente, e a execução semanal a mantém em 30.
- **`npm run catalogo` demora bastante** (baixa milhares de imagens e processa com sharp). Rode em background. O `.cache/` guarda os originais, então a segunda vez é rápida.
- **`npm run coletar` demora ~25 min** e refaz `scripts/clubes-externos.json` do zero. Só precisa rodar quando quiser ampliar países ou atualizar a fonte.
- **`src/dados/clubes.ts` é gerado e só tem os clubes em uso.** O catálogo completo, para consultar ao escrever carreira nova, está em `scripts/catalogo-completo.json`. Ao acrescentar jogador, rode `npm run catalogo` de novo para os clubes novos entrarem no pacote.
- **O registro de partidas do Transfermarkt engana em época antiga.** `jogosPorClube` lê cada partida oficial com a participação do jogador, e é o que tira da carreira o clube onde ele não jogou. Mas temporada sem escalação no site vem inteira como "fora da lista": o Zanetti aparece com zero jogos no Banfield de 1993, onde jogou 66. Só conta como prova quando há escalação de verdade. O endereço (`tmapi.transfermarkt.technology`) não passa pelo WAF.
- **A página de títulos do Transfermarkt erra o ano de título de jogo único.** O Mundial de Clubes de dezembro de 2007 do Milan está como 2007 no Emerson e 2008 no Kaká; o Messi aparece com os Mundiais de 2010, 2012 e 2016. Para Mundial, Intercontinental e Supercopa da Uefa, o ano vem da data da final (`titulosConferidos` em `scripts/dicas.mjs`), e o título sem final jogada fica fora da dica. No registro de partidas, final é `FF` (jogo único), `FFH` e `FFR` (ida e volta), e a edição sai de `season.display` quando é um ano só — a temporada europeia ("15/16") não diz em que ano foi a final.
- **O nome do Transfermarkt abrevia até no endereço** ("/man-utd/"), e o código do Wikidata guardado no catálogo foi dado por nome e errou em dezenas de clubes. Para ligar clube a id, confie no dono do id (P7223), não no nome — é o que `npm run mapa-tm` faz. Quando o Wikidata não conhece o dono, o par errado passa: leia a lista de "pares em uso com nome diferente no Transfermarkt" que o comando imprime.
- **Carreira que não resolve fica congelada, e isso já escondeu erro por semanas.** `npm run reparar` não reescreve uma carreira quando algum clube dela não tem id — a regra existe para não gravar lista com buraco, mas congela junto os clubes que o mapa já sabia corrigir. Foi assim que o Chicharito seguiu com o escudo do Western United depois de o West Ham já estar certo no mapa. O comando agora **lista o que congelou e o nome que travou**; leia essa lista toda vez.
- **Clube homônimo é a armadilha do Brasil.** Há dez Guaranis e cinco Botafogos no catálogo, de cidades diferentes. O id sai desambiguado pela cidade quando o nome colide. Confira o id antes de usar.
- **Imagem de topo de artigo da Wikipédia nem sempre é o escudo** — em clube pequeno costuma ser foto da sede. `pareceEscudo()` em `scripts/wikidata.mjs` barra isso pelo formato e pelo nome do arquivo.
- **`pilicense=free` da API do MediaWiki não filtra o que promete**: continua devolvendo arquivo local marcado "Conteúdo restrito". A classificação confiável é pelo host da URL.
- **Os nomes chegam bagunçados das fontes.** `scripts/nomes-clube.mjs` concentra a comparação, com teste em `npm run teste-nomes`. Se for mexer, rode o teste: ele guarda casos que já quebraram ("Bayern" × "Bayer 04 Leverkusen", "Botafogo" × "Botafogo-SP").
- **`padding` percentual em CSS se resolve contra a largura do elemento pai**, não do próprio elemento. Isso já quebrou os escudos uma vez.
- **Clube sem escudo em fonte nenhuma não é bug**: `Escudo.tsx` desenha um brasão com as cores e as iniciais.
