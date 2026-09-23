import type { Jogador } from './tipos'
import dados from './jogadores.json' with { type: 'json' }

/**
 * A biblioteca de jogadores. Os dados vivem em `jogadores.json`; este arquivo
 * só dá tipo a eles.
 *
 * Até setembro a biblioteca era este arquivo, escrito como código, e quatro
 * scripts o reescreviam por busca-e-troca com expressão regular. Como dado, os
 * scripts leem e gravam por `scripts/biblioteca.mjs` e o diff de uma mudança
 * mostra só ela.
 *
 * A carreira de cada jogador vem do histórico de transferências do
 * Transfermarkt, na ordem em que aconteceu; `fonte` aponta a página de onde
 * saiu. As dicas são montadas de fato estruturado (seleção, torneios,
 * naturalidade, tempo de casa) — nada é texto gerado de memória.
 *
 * Para mexer: `npm run reparar` (clubes e nível), `npm run dicas` (dicas),
 * `scripts/carreiras-corrigidas.mjs` e `scripts/niveis-fixos.mjs` (à mão).
 */
export const JOGADORES = dados as Jogador[]
