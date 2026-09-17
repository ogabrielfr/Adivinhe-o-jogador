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

- Jogo completo: tela inicial, partida, derrota, vitória, compartilhamento estilo Wordle, streak e estatísticas em `localStorage`.
- Sorteio diário determinístico por data, sem servidor, com reembaralhamento por ciclo para ninguém repetir antes da volta completa.
- **Conferência das 45 carreiras contra o Wikidata**, rodada e relatada (ver abaixo).
- **Catálogo de 4521 clubes de 66 países**, sendo 1141 brasileiros, contra 44 antes.
- `npm run validar-dados` confere integridade e recusa dica que entregue nome de jogador ou clube visível.
- `npm run teste-nomes` testa o comparador de nomes de clube.
- `npm run teste-visual` roda a partida ponta a ponta no Chromium e salva capturas.

---

## Pontos em aberto, por prioridade

### 1. Corrigir as carreiras (a conferência já apontou o quê)

`npm run verificar` compara cada carreira com **três fontes**, porque nenhuma
sozinha basta:

| | Fonte | Força | Fraqueza |
| --- | --- | --- | --- |
| `wd` | Wikidata, propriedade P54 | estruturado, auditável por QID | preenchido à mão e atrasado |
| `wp` | Infobox do artigo na Wikipédia | melhor no futebol brasileiro | alguns artigos não têm o campo |
| `tm` | Transfermarkt | a mais completa das três | depende de o WAF deixar passar |

**Por que três e não uma.** A primeira rodada usou só o Wikidata e eu apontei o
Grêmio do Elkeson como "clube inventado". Estava errado: o Elkeson jogou no
Grêmio em 2021, o infobox da Wikipédia e o Transfermarkt têm a passagem, e era
o P54 do Wikidata que estava incompleto. O mesmo valia para o Grêmio do Diego
Tardelli. Uma fonte só não distingue erro nosso de lacuna dela.

Resultado com as três: **12 de 45 sem divergência forte, 33 divergem, 0 erros
de busca.** Nenhuma correção foi aplicada.

O relatório separa por quantas fontes confirmam cada clube, que é o que permite
agir sem chutar:

| Saída | O que significa | Ação |
| --- | --- | --- |
| `FALTA (2+ fontes)` | duas ou três têm um clube que não temos | acrescentar |
| `NENHUMA FONTE TEM` | um clube nosso que nenhuma das três tem | candidato a erro nosso |
| `falta (1 fonte)` | só uma fonte tem | quase sempre lacuna das outras duas |
| `só uma fonte tem` | nosso clube confirmado por só uma | está certo; as outras é que falham |

**Os três clubes que nenhuma fonte confirma**, cada um com as três fontes de acordo:

- **`adriano` → Atlético Mineiro.** As três listam Athletico Paranaense (2014) e
  nenhuma lista o Mineiro. Nosso dado tem os dois; o Mineiro parece ser confusão
  com o Paranaense.
- **`diego-tardelli` → Bahia.** Nenhuma das três tem. As três têm Santos, que
  falta no nosso.
- **`drenthe` → Kayserispor.** As três apontam **Kayseri Erciyesspor**, outro
  clube da mesma cidade.

O padrão geral continua sendo **começo e fim de carreira faltando**, que é o que
a memória do modelo corta.

Quando a conferência passar: marque `verificado: true` e ligue
`EXIGIR_VERIFICACAO` em `src/logica/diario.ts`.

### 2. Onze clubes em uso ainda mostram brasão de reserva

`al-gharafa`, `colo-colo`, `shanghai-sipg`, `shandong-luneng`,
`birmingham-city`, `brescia`, `guangzhou-evergrande`, `al-jazira`, `hercules`,
`reading`, `sheffield-wednesday`.

Eram 12 antes, e não é bug — `Escudo.tsx` desenha um brasão com as cores e as
iniciais. Mas escudo é a informação principal do jogo, e agora ficou barato
resolver: são quase todos de divisão de acesso europeia, e bastou eu não ter
posto Espanha, Inglaterra, Itália, Portugal e Holanda em
`scripts/paises-alvo.mjs` (elas já vinham do repositório europeu, que só cobre
a temporada atual e o histórico recente).

Para resolver: acrescente esses países a `paises-alvo.mjs`, rode
`npm run coletar` e `npm run catalogo`. Falta um detalhe — o clube novo entraria
com id derivado do nome (`hercules-cf`), não com o id curado (`hercules`) que os
jogadores usam, então os de `SEM_ESCUDO` precisam procurar o escudo novo pelo
nome. Pesa também no tamanho do repositório (ver abaixo).

### 3. Tamanho do repositório

`public/escudos/` foi de 13 MB para **64 MB** com os 4521 clubes. Está dentro
dos limites do GitHub Pages com folga, e o pacote enviado ao navegador **não**
cresceu — encolheu, porque `clubes.ts` passou a levar só os 101 clubes em uso
(81,7 kB gzipados no total, contra ~99 kB antes).

O custo é de repositório, não de carregamento: clone mais lento e 64 MB
publicados a cada push. Se incomodar, o corte natural é gravar em
`public/escudos/` só os clubes em uso e deixar o resto como metadado em
`scripts/catalogo-completo.json`, que já tem a URL de origem de cada um.
Deixei vendorizado porque o combinado era catálogo maior que o uso e porque o
acesso a essas fontes se mostrou frágil.

### 4. Volume da biblioteca

Continuam 45 jogadores (15 por nível). O combinado era chegar a ~300 e depois a
~900 **depois** que o cliente testasse. Com o catálogo grande, o que travava do
lado dos escudos deixou de travar: falta escrever carreira, e agora há como
conferir cada uma antes de publicar.

### 5. Decisões de produto pendentes

- **O nome do clube fica escondido**, revelado ao tocar no escudo e sempre no fim da partida. Escolha minha, ainda não validada pelo cliente.
- **As respostas estão no pacote enviado ao navegador** (mesma escolha do Wordle original). Se virar problema, a saída é mover o sorteio para um endpoint.
- **O jogo está no ar com os dados não conferidos.** Perguntei ao cliente se ele prefere ligar `EXIGIR_VERIFICACAO` e pôr uma tela de "biblioteca em conferência" até validarmos, e ele não respondeu — vale retomar.
- **Licença dos escudos.** O catálogo mistura três origens: 1473 com licença livre declarada no Commons, 1239 de upload local da Wikipédia marcado "Conteúdo restrito" (uso justo) e 1801 do Transfermarkt, sem licença. Escudo é marca do clube em qualquer caso, e o projeto já os usava para identificação, mas agora a distinção está explícita no campo `licenca` de `scripts/clubes-externos.json`, caso o cliente queira restringir.

---

## Armadilhas conhecidas

- **`npm run catalogo` demora bastante** (baixa milhares de imagens e processa com sharp). Rode em background. O `.cache/` guarda os originais, então a segunda vez é rápida.
- **`npm run coletar` demora ~25 min** e refaz `scripts/clubes-externos.json` do zero. Só precisa rodar quando quiser ampliar países ou atualizar a fonte.
- **`src/dados/clubes.ts` é gerado e só tem os clubes em uso.** O catálogo completo, para consultar ao escrever carreira nova, está em `scripts/catalogo-completo.json`. Ao acrescentar jogador, rode `npm run catalogo` de novo para os clubes novos entrarem no pacote.
- **Clube homônimo é a armadilha do Brasil.** Há dez Guaranis e cinco Botafogos no catálogo, de cidades diferentes. O id sai desambiguado pela cidade quando o nome colide. Confira o id antes de usar.
- **Imagem de topo de artigo da Wikipédia nem sempre é o escudo** — em clube pequeno costuma ser foto da sede. `pareceEscudo()` em `scripts/wikidata.mjs` barra isso pelo formato e pelo nome do arquivo.
- **`pilicense=free` da API do MediaWiki não filtra o que promete**: continua devolvendo arquivo local marcado "Conteúdo restrito". A classificação confiável é pelo host da URL.
- **Os nomes chegam bagunçados das fontes.** `scripts/nomes-clube.mjs` concentra a comparação, com teste em `npm run teste-nomes`. Se for mexer, rode o teste: ele guarda casos que já quebraram ("Bayern" × "Bayer 04 Leverkusen", "Botafogo" × "Botafogo-SP").
- **`padding` percentual em CSS se resolve contra a largura do elemento pai**, não do próprio elemento. Isso já quebrou os escudos uma vez.
- **Clube sem escudo em fonte nenhuma não é bug**: `Escudo.tsx` desenha um brasão com as cores e as iniciais.
