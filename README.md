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

> **As carreiras desta onda foram escritas de memória e a conferência já
> mostrou que isso produz erro.** Das 45, 10 batem com a fonte e 35 divergem —
> 33 delas por clube faltando. Nenhuma correção foi aplicada ainda.

`npm run verificar` compara cada carreira com o **Wikidata** e imprime as
divergências, sem alterar nada.

A fonte não é o Ogol, apesar de ele ser a melhor referência para futebol
brasileiro. O Ogol e o zerozero estão atrás do bot management do Cloudflare e
devolvem `403 cf-mitigated: challenge` para qualquer cliente automatizado,
inclusive Chromium real — a interstitial "Um momento…" não resolve. É controle
de acesso do próprio site, não do ambiente. O Wikidata expõe carreira como dado
estruturado (`P54` com os qualificadores de período), tem API pública e deixa
cada conferência auditável por QID.

O relatório separa três coisas, que pedem reações diferentes:

| Saída | O que significa |
| --- | --- |
| `falta no nosso dado` | a fonte tem um clube que não temos — é o caso grave |
| `fora de ordem` | a cronologia não bate; empate de ano é ignorado |
| `não confirmado pela fonte` | temos um clube que a fonte não lista |

**`não confirmado` não quer dizer errado.** O Wikidata é incompleto em fim de
carreira e em clube pequeno — o Arouca do Keirrison, que o cliente confirmou,
não está lá. Só remova um clube com uma segunda fonte na mão.

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

`scripts/construir-catalogo.mjs` monta `public/escudos/` e gera
`src/dados/clubes.ts` a partir de quatro repositórios públicos — **1080 clubes
de 52 países**, sendo 49 brasileiros. O catálogo é de propósito muito maior que
o uso atual: o escudo é a informação principal do jogo, e uma carreira costuma
começar ou terminar num clube pequeno.

Um clube que aparece em mais de uma fonte fica com a de melhor qualidade
(SVG vetorial > PNG transparente > GIF/JPG legado). Os nomes chegam bagunçados
("vascodagama", "FC Arouca", "Besiktas JK"), então `scripts/clubes-canonicos.mjs`
fixa o id e o nome em português de todo clube que algum jogador usa. Os escudos
são reduzidos para 256 px e os SVGs minificados — sem isso o catálogo passaria
de 40 MB.

| Fonte | Cobertura |
| --- | --- |
| [luukhopman/football-logos](https://github.com/luukhopman/football-logos) | 25 ligas europeias, temporada atual e histórico |
| [hugomiura/escudos-times-brasil-svg](https://github.com/hugomiura/escudos-times-brasil-svg) | Séries A e B do Brasil, em SVG |
| [FCLOGO/fclogo.top](https://github.com/FCLOGO/fclogo.top) | Japão, MLS, Coreia, Arábia Saudita, México |
| [sportlogos/football.db.logos](https://github.com/sportlogos/football.db.logos) | Argentina, Uruguai, Chile, Colômbia |

Clube sem escudo em nenhuma das fontes não quebra nada: `Escudo.tsx` desenha um
brasão com as cores e as iniciais do clube. Hoje isso vale para 12 clubes em
uso — Superliga Chinesa, Golfo e divisões de acesso europeias.

Os escudos são marcas registradas dos respectivos clubes, usados aqui para
identificá-los. A camada de imagem está isolada num único componente, então
trocar a origem não encosta no resto do jogo.

## Publicação

O workflow em `.github/workflows/deploy.yml` publica no GitHub Pages a cada
push na `main`. `vite.config.ts` só aplica o caminho base do Pages quando
`GITHUB_PAGES=true`, então o desenvolvimento local segue na raiz.
