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

## Pronto e testado

- Jogo completo: tela inicial, partida, derrota, vitória, compartilhamento estilo Wordle, streak e estatísticas em `localStorage`.
- Sorteio diário determinístico por data, sem servidor, com reembaralhamento por ciclo para ninguém repetir antes da volta completa.
- Catálogo de **1075 clubes de 52 países**, gerado por `npm run catalogo` a partir de quatro repositórios públicos, com escudos otimizados para 256 px (13 MB no total).
- `npm run validar-dados` confere integridade e recusa dica que entregue nome de jogador ou clube visível.
- `npm run teste-visual` roda a partida ponta a ponta no Chromium e salva capturas.

---

## Pontos em aberto, por prioridade

### 1. Nenhuma carreira foi conferida (bloqueante)

**As 45 carreiras foram escritas de memória do modelo e há erros comprovados.**
O cliente encontrou dois: Džeko sem o início na Bósnia e na Tchéquia e sem
Fiorentina/Schalke; Keirrison sem a volta ao Coritiba, Londrina e Arouca.
Ambos foram corrigidos com o que o cliente informou — **nada foi inventado para
completar as lacunas**, então a carreira do Džeko segue incompleta no início de
propósito.

Errar carreira é, nas palavras do cliente, "o pior erro possível para a UX desse
jogo". Nenhuma outra correção deve ser feita de memória.

**O que existe:** `npm run verificar` compara cada carreira com o Ogol e imprime
as divergências sem alterar nada. **O script nunca rodou** — a sessão anterior
estava num ambiente com egresso restrito e o Ogol devolvia 403. Os seletores do
parser em `clubesDaPagina()` foram escritos a partir da estrutura pública do
site e ainda não viram uma resposta real; espere ajustá-los na primeira execução.

**Quando a conferência passar:** marque cada jogador com `verificado: true` e
ligue `EXIGIR_VERIFICACAO` em `src/logica/diario.ts`. O sorteio passa a ignorar
quem não foi conferido. Hoje está desligado porque ligar esvaziaria os três
níveis.

### 2. Cobertura de clubes brasileiros é insuficiente

Hoje são **44 brasileiros**, e o cliente apontou com razão que é pouco. Um teste
com 36 clubes que uma carreira brasileira comum atravessa teve **6 de cobertura**.

Faltam, entre outros: Fortaleza, Cuiabá, Juventude, Guarani, Ituano, Mirassol,
RB Bragantino, Atlético-GO, Remo, CSA, Novorizontino, Brusque, Confiança,
Botafogo-SP, São Caetano, Inter de Limeira, XV de Piracicaba, Volta Redonda.

**O que o cliente quer:** todas as primeiras divisões estaduais dos 27 estados,
mais as divisões de acesso dos estados prioritários (SP, RJ, MG, RS, PR, SC, BA).
Estimativa: 500 a 600 clubes brasileiros, contra os 44 de hoje.

Isso importa porque **o escudo é a informação principal do jogo** e uma carreira
costuma começar ou terminar num clube pequeno.

**Fontes avaliadas:**

| Fonte | Brasileiros | Serve? |
| --- | --- | --- |
| `hugomiura/escudos-times-brasil-svg` | 44 | Em uso. Séries A e B de 2015, em SVG |
| `sportlogos/football.db.logos` | 24 | Em uso. GIF/JPG legado |
| `salimt/football-datasets` (`team_details.csv`) | 70 | **Não resolve** — só Série A e B, sem Inter de Limeira |
| Ogol / Transfermarkt, raspando as competições estaduais | ~600 | **Melhor caminho.** Ver abaixo |

`team_details.csv` (596 KB, sem LFS) traz 2175 clubes do mundo com `logo_url`
apontando para `tmssl.akamaized.net`. Resolve bem a cobertura mundial e vale
puxar, mas **não** resolve os estaduais brasileiros.

Para estaduais, o caminho é raspar as páginas de competição do Ogol ou do
Transfermarkt (Paulista A1/A2/A3, Carioca, Mineiro, Gaúcho e assim por diante) e
alimentar `scripts/construir-catalogo.mjs` com uma quinta fonte.

### 3. Rede

A sessão anterior rodou com egresso **Trusted**, que bloqueava tudo que
interessa: Ogol, zerozero, Transfermarkt, Wikipédia, `tmssl.akamaized.net`, o CDN
dos datasets e até `ogabrielfr.github.io` (não dava para conferir o site
publicado). O cliente ia mudar o ambiente para **Full**.

**Confirme antes de começar** que o acesso funciona:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.ogol.com.br
curl -s -o /dev/null -w "%{http_code}\n" https://tmssl.akamaized.net/images/wappen/head/614.png
```

`200` nos dois significa que os itens 1 e 2 estão desbloqueados.

### 4. Volume da biblioteca

O cliente quer uma "biblioteca gigante" para variedade longa. A onda 1 tem 45
jogadores (15 por nível), pensada para validar formato antes de escalar. O
combinado era chegar a ~300 e depois a ~900 **depois** que ele testasse.

Não escale antes de resolver o item 1: multiplicar carreiras não conferidas
multiplica o problema.

### 5. Decisões de produto pendentes

- **O nome do clube fica escondido**, revelado ao tocar no escudo e sempre no fim da partida. Foi escolha minha, ainda não validada pelo cliente.
- **As respostas estão no pacote enviado ao navegador** (mesma escolha do Wordle original). Se virar problema, a saída é mover o sorteio para um endpoint.
- **O jogo está no ar com os dados não conferidos.** Perguntei ao cliente se ele prefere ligar `EXIGIR_VERIFICACAO` e pôr uma tela de "biblioteca em conferência" até validarmos, e ele não respondeu — vale retomar.

---

## Armadilhas conhecidas

- **`npm run catalogo` demora ~2 minutos** (processa 1075 imagens com sharp). Rode em background.
- **`src/dados/clubes.ts` é gerado.** Não edite à mão. Id e nome em português de clube em uso vivem em `scripts/clubes-canonicos.mjs`.
- **Os nomes chegam bagunçados das fontes** ("vascodagama", "Besiktas JK", "FC Arouca"). A deduplicação ignora hífens e siglas societárias, mas não pega tudo — há uma lista `DESCARTAR` explícita para o resto.
- **`padding` percentual em CSS se resolve contra a largura do elemento pai**, não do próprio elemento. Isso já quebrou os escudos uma vez.
- **12 clubes em uso não têm escudo em fonte nenhuma** (Superliga Chinesa, Golfo, divisões de acesso europeias). `Escudo.tsx` desenha um brasão com as cores e as iniciais. Não é bug.
