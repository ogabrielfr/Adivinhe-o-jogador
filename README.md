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
| `npm run escudos` | rebaixa os escudos e regenera `src/dados/escudos.ts` |
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

Os níveis são julgamento editorial sobre o que o torcedor brasileiro reconhece:

- **Fácil** — reconhecimento imediato, carreira curta e icônica.
- **Intermediário** — você conhece, mas precisa pensar.
- **Difícil** — carreira errante ou jogador que o tempo apagou.

Clubes aparecem só uma vez por jogador, mesmo quando houve uma segunda
passagem, e a lista guarda apenas os clubes — nunca os anos, que é onde erros
de dados se escondem.

## Escudos

`scripts/baixar-escudos.mjs` monta `public/escudos/` a partir de quatro
repositórios públicos e gera o mapa `src/dados/escudos.ts`. O casamento entre
clube e arquivo é automático por nome, com um mapa de exceções em
`scripts/fontes-escudos.mjs`.

| Fonte | Cobertura |
| --- | --- |
| [luukhopman/football-logos](https://github.com/luukhopman/football-logos) | 25 ligas europeias, temporada atual e histórico |
| [hugomiura/escudos-times-brasil-svg](https://github.com/hugomiura/escudos-times-brasil-svg) | Séries A e B do Brasil, em SVG |
| [FCLOGO/fclogo.top](https://github.com/FCLOGO/fclogo.top) | Japão, MLS, Coreia, Arábia Saudita, México |
| [sportlogos/football.db.logos](https://github.com/sportlogos/football.db.logos) | Argentina, Uruguai, Chile, Colômbia |

Clube sem escudo em nenhuma das fontes não quebra nada: `Escudo.tsx` desenha um
brasão com as cores e as iniciais do clube. Hoje isso vale para 12 dos 99
clubes — principalmente Superliga Chinesa e divisões de acesso europeias.

Os escudos são marcas registradas dos respectivos clubes, usados aqui para
identificá-los. A camada de imagem está isolada num único componente, então
trocar a origem não encosta no resto do jogo.

## Publicação

O workflow em `.github/workflows/deploy.yml` publica no GitHub Pages a cada
push na `main`. `vite.config.ts` só aplica o caminho base do Pages quando
`GITHUB_PAGES=true`, então o desenvolvimento local segue na raiz.
