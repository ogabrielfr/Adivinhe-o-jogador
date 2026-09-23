/**
 * Ler e gravar a biblioteca de jogadores. Um lugar só.
 *
 * A biblioteca era um arquivo TypeScript que quatro scripts reescreviam por
 * busca-e-troca com expressão regular. Qualquer mudança de formatação
 * quebrava os quatro de uma vez, e cada um tinha a sua versão da regex.
 * Agora ela é dado: `src/dados/jogadores.json`, que o jogo importa direto e
 * os scripts leem e gravam como objeto.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
export const ARQUIVO_BIBLIOTECA = join(raiz, 'src/dados/jogadores.json')

/** Ordem fixa dos campos, para o diff de uma mudança mostrar só ela. */
const CAMPOS = ['id', 'nome', 'apelidos', 'nivel', 'clubes', 'dicas', 'verificado', 'fonte']

export function lerBiblioteca() {
  return JSON.parse(readFileSync(ARQUIVO_BIBLIOTECA, 'utf8'))
}

/** O id do Transfermarkt sai da `fonte`, que aponta a página do histórico. */
export const idTmDe = (jogador) => jogador.fonte?.match(/spieler\/(\d+)/)?.[1] ?? null

/**
 * Um jogador por bloco, um campo por linha, lista na mesma linha: trocar um
 * clube vira uma linha de diff, não doze. `JSON.stringify` com indentação
 * quebraria cada clube numa linha e o arquivo passaria de dez mil.
 */
export function gravarBiblioteca(jogadores) {
  const bloco = (j) => {
    const linhas = []
    for (const campo of [...CAMPOS, ...Object.keys(j).filter((k) => !CAMPOS.includes(k))]) {
      if (!(campo in j) || j[campo] === undefined) continue
      linhas.push(`    ${JSON.stringify(campo)}: ${JSON.stringify(j[campo])}`)
    }
    return `  {\n${linhas.join(',\n')}\n  }`
  }
  writeFileSync(ARQUIVO_BIBLIOTECA, `[\n${jogadores.map(bloco).join(',\n')}\n]\n`)
}
