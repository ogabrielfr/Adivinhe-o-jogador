# Estado do projeto

Documento de passagem. O que está pronto, o que foi decidido e por quê, e o que
falta. Leia junto com o `README.md`, que cobre a arquitetura.

**Repositório:** `ogabrielfr/Adivinhe-o-jogador`, branch `main`
**No ar:** https://ogabrielfr.github.io/Adivinhe-o-jogador/ (GitHub Pages, deploy a cada push na `main`)

---

## O jogo

"Acerte o jogador pela carreira". Os escudos dos clubes por onde um jogador
passou aparecem em ordem cronológica, e o usuário tem 3 chutes e uma dica para
descobrir quem é. Três níveis independentes, um jogador novo em cada um por dia.
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
| Dica | Não gasta chute; marca no resultado compartilhado (🟢 sem dica / 🟡 com dica) |
| Desistir | Revela o nome e encerra o nível; conta como derrota, com confirmação em dois toques |
| Entrada de texto | Livre, sem autocomplete (entregaria a lista de respostas); tolera acento, caixa e um erro de digitação |
| Clube repetido | Válido — o escudo reaparece na posição certa quando o jogador voltou |

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
- Sorteio diário determinístico por data, sem servidor, com reembaralhamento por ciclo para ninguém repetir antes da volta completa.
- **300 jogadores, 100 por nível**, com carreira montada a partir do histórico do Transfermarkt. `EXIGIR_VERIFICACAO` está ligado e os 300 têm `verificado: true`.
- **Catálogo de 5352 clubes de 66 países**, sendo 1142 brasileiros. Os 385 que o jogo usa têm escudo real — nenhum brasão de reserva em uso.
- Dica montada de números verificáveis e escolhida pelo que cada jogador tem de raro na biblioteca; 300 distintas para 300 jogadores.
- `npm run validar-dados` confere integridade e recusa dica que entregue nome de jogador ou clube visível.
- `npm run teste-nomes` (26 casos) testa o comparador de nomes de clube; `npm run teste-palpites` (25 casos) testa a aceitação de palpite.
- `npm run teste-visual` roda a partida ponta a ponta no Chromium e salva capturas.

---

## Pontos em aberto, por prioridade

### 1. Três nomes grandes continuam fora

**Romário, Rivaldo e Bebeto** não entraram na biblioteca. Cada um esbarra em
mais de um clube que a resolução não fecha, e a regra é não gravar carreira com
buraco.

O conserto é o mesmo dos outros oito nomes já resolvidos: achar o id do clube
no Transfermarkt e acrescentar o par `id do TM -> id do catálogo` em
`scripts/clubes-transfermarkt.json`, depois `npm run reparar`. Desde a última
sessão o comando **lista quais carreiras congelou e que nome travou cada uma**,
então o trabalho começa rodando ele e lendo a lista.

### 2. Nível de quem é famoso por outra coisa

O nível sai de visualizações medianas da Wikipédia em português, que é a melhor
medida de reconhecimento brasileiro que achamos — e erra quando a fama não vem
de jogar. **Guardiola está no fácil** porque é procuradíssimo como treinador;
como jogador, a carreira dele é um enigma difícil.

`scripts/niveis-fixos.mjs` existe para isso: um id e um nível, e o cálculo é
ignorado para aquele jogador. Está **vazio de propósito** — toda vez que
tentei corrigir o nível por regra eu piorei o conjunto (ver README, seção
"O nível"). Use para o caso isolado, não para uma nova teoria de ranking.

### 3. Texto que vem das fontes e lê mal

- **Posição vem do Transfermarkt** e às vezes soa estranha em português de jogo: o Neymar aparece como "Meia".
- **Nome de clube pode ser verboso** — "Associação Atlética Internacional (Limeira)" em vez de "Inter de Limeira". Os nomes curados ficam em `scripts/clubes-canonicos.mjs`.

### 4. Tamanho do repositório

`public/escudos/` está em **77 MB** com os 5352 clubes. Dentro dos limites do
GitHub Pages com folga, e o pacote enviado ao navegador **não** cresce com
isso: `clubes.ts` leva só os 385 clubes em uso.

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

- **`npm run catalogo` demora bastante** (baixa milhares de imagens e processa com sharp). Rode em background. O `.cache/` guarda os originais, então a segunda vez é rápida.
- **`npm run coletar` demora ~25 min** e refaz `scripts/clubes-externos.json` do zero. Só precisa rodar quando quiser ampliar países ou atualizar a fonte.
- **`src/dados/clubes.ts` é gerado e só tem os clubes em uso.** O catálogo completo, para consultar ao escrever carreira nova, está em `scripts/catalogo-completo.json`. Ao acrescentar jogador, rode `npm run catalogo` de novo para os clubes novos entrarem no pacote.
- **Carreira que não resolve fica congelada, e isso já escondeu erro por semanas.** `npm run reparar` não reescreve uma carreira quando algum clube dela não tem id — a regra existe para não gravar lista com buraco, mas congela junto os clubes que o mapa já sabia corrigir. Foi assim que o Chicharito seguiu com o escudo do Western United depois de o West Ham já estar certo no mapa. O comando agora **lista o que congelou e o nome que travou**; leia essa lista toda vez.
- **Clube homônimo é a armadilha do Brasil.** Há dez Guaranis e cinco Botafogos no catálogo, de cidades diferentes. O id sai desambiguado pela cidade quando o nome colide. Confira o id antes de usar.
- **Imagem de topo de artigo da Wikipédia nem sempre é o escudo** — em clube pequeno costuma ser foto da sede. `pareceEscudo()` em `scripts/wikidata.mjs` barra isso pelo formato e pelo nome do arquivo.
- **`pilicense=free` da API do MediaWiki não filtra o que promete**: continua devolvendo arquivo local marcado "Conteúdo restrito". A classificação confiável é pelo host da URL.
- **Os nomes chegam bagunçados das fontes.** `scripts/nomes-clube.mjs` concentra a comparação, com teste em `npm run teste-nomes`. Se for mexer, rode o teste: ele guarda casos que já quebraram ("Bayern" × "Bayer 04 Leverkusen", "Botafogo" × "Botafogo-SP").
- **`padding` percentual em CSS se resolve contra a largura do elemento pai**, não do próprio elemento. Isso já quebrou os escudos uma vez.
- **Clube sem escudo em fonte nenhuma não é bug**: `Escudo.tsx` desenha um brasão com as cores e as iniciais.
