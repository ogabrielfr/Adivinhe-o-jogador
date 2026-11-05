/**
 * A atualização da base, de uma vez: a carreira de cada jogador como está hoje
 * no Transfermarkt, com escudo, dica, nível e agenda acompanhando.
 *
 *   npm run atualizar                 # baixa de novo os dados de cada jogador e refaz tudo
 *   npm run atualizar -- --continuar  # retoma sem baixar de novo o que já veio
 *
 * O jogo não busca nada sozinho: a base vai dentro do pacote publicado, então
 * carreira nova só entra por aqui. Rode duas vezes por ano, depois que fecham
 * as janelas de transferência da Europa — em fevereiro e em setembro. Leva
 * poucos minutos: tudo vem da API aberta do Transfermarkt.
 *
 * Os passos, cada um também um comando que roda sozinho:
 *
 *   0. catalogo  o clube que entrou à mão em `SEM_ESCUDO` ou `PARES_TM`
 *                desde a última vez passa a existir para o reparo
 *   1. reparar   a carreira de cada jogador, do histórico do Transfermarkt;
 *                a que trava num clube fica como estava e vai para o relatório
 *   2. catalogo  o escudo dos clubes que entraram nas carreiras
 *   3. dicas     a dica de quem ainda não tem; as outras ficam, porque os
 *                títulos só vêm do site (ver atualizar-dicas.mjs)
 *   4. regua     o nível acompanha a carreira, que pesa pelo quão recente é
 *   5. agenda    os dias ainda não agendados, já com a base nova; os
 *                agendados não mudam
 *   6. validar-dados, teste-palpites e teste-nomes
 *
 * No fim, o que mudou vai para `relatorios/atualizacao-AAAA-MM-DD.md`. Leia
 * antes de publicar. Carreira travada pede o par do clube em `PARES_TM` ou o
 * clube em `SEM_ESCUDO` (`scripts/clubes-canonicos.mjs`), e depois
 * `npm run atualizar -- --continuar`.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTINUAR = process.argv.includes('--continuar')
const lerJson = (arquivo) => JSON.parse(readFileSync(join(raiz, arquivo), 'utf8'))
const idsDosClubesEmUso = () =>
  new Set([...readFileSync(join(raiz, 'src/dados/clubes.ts'), 'utf8').matchAll(/\{ id: '([^']+)'/g)].map((m) => m[1]))

/** Roda um passo mostrando a saída, e guarda o texto para o relatório. */
function passo(titulo, args) {
  console.log(`\n=== ${titulo} (npm run ${args.join(' ')})`)
  const r = spawnSync('npm', ['run', '--silent', ...args], { cwd: raiz, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  process.stdout.write(r.stdout ?? '')
  process.stderr.write(r.stderr ?? '')
  return { ok: r.status === 0, saida: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/**
 * O que muda com a carreira vem de novo: histórico, perfil, partidas e
 * seleção de cada jogador, todos da API. O resto do cache fica — nome de
 * clube, de competição e de país mudam pouco, e o título que veio do site não
 * teria como voltar (a primeira versão deste comando apagava tudo, e a dica de
 * título de quem já estava na base só não se perdeu porque fica gravada nela).
 */
const DO_JOGADOR = /^(\d+|perfil-\d+|desempenho-\d+|jogos-\d+|selecao-\d+)\.json$/
if (!CONTINUAR) {
  const cache = join(raiz, '.cache/transfermarkt')
  const velhos = existsSync(cache) ? readdirSync(cache).filter((f) => DO_JOGADOR.test(f)) : []
  for (const f of velhos) rmSync(join(cache, f))
  console.log(`${velhos.length} arquivos de jogador apagados do cache: os dados vêm de novo da API`)
}

const antes = lerJson('src/dados/jogadores.json')
const clubesAntes = idsDosClubesEmUso()

const resultados = {}
for (const [chave, titulo, args] of [
  // o clube que entrou em SEM_ESCUDO ou PARES_TM desde a última vez precisa estar no catálogo antes do reparo
  ['catalogo0', '0/6 catálogo', ['catalogo']],
  ['reparar', '1/6 carreiras', ['reparar']],
  ['catalogo', '2/6 escudos', ['catalogo']],
  ['dicas', '3/6 dicas', ['dicas']],
  ['regua', '4/6 nível', ['regua', '--', '--gravar']],
  ['agenda', '5/6 agenda', ['agenda']],
]) {
  resultados[chave] = passo(titulo, args)
  if (!resultados[chave].ok) {
    console.error(`\nO passo "${titulo}" falhou. Conserte e rode \`npm run atualizar -- --continuar\`.`)
    process.exit(1)
  }
}
const testes = ['validar-dados', 'teste-palpites', 'teste-nomes'].map((t) => [t, passo(`6/6 ${t}`, [t])])

// ------------------------------------------------------------ relatório
const depois = lerJson('src/dados/jogadores.json')
const clubesDepois = idsDosClubesEmUso()
const catalogo = new Map(lerJson('scripts/catalogo-completo.json').map((c) => [c.id, c.nome]))
const { nomeCurto } = await import('./nomes-curtos.mjs')
const nomeDoClube = (id) => nomeCurto(id, catalogo.get(id) ?? id)
const porId = new Map(antes.map((j) => [j.id, j]))

const carreiras = []
const niveis = []
const dicas = []
for (const j of depois) {
  const a = porId.get(j.id)
  if (!a) continue
  if (a.clubes.join() !== j.clubes.join()) {
    carreiras.push(`- **${j.nome}**: ${a.clubes.map(nomeDoClube).join(' · ')} → ${j.clubes.map(nomeDoClube).join(' · ')}`)
  }
  if (a.nivel !== j.nivel) niveis.push(`- ${j.nome}: ${a.nivel} → ${j.nivel}`)
  if (a.dicas.join() !== j.dicas.join()) dicas.push(`- ${j.nome}: "${j.dicas[1]}"`)
}
const clubesNovos = [...clubesDepois].filter((id) => !clubesAntes.has(id)).map(nomeDoClube)
// o bloco em que o reparar lista a carreira que travou, clube por clube, e a de um clube só
const linhasDoReparo = resultados.reparar.saida.split('\n')
const inicio = linhasDoReparo.findIndex((l) => /ficam como estavam: alguma passagem/.test(l))
const fim = linhasDoReparo.findIndex((l, i) => i > inicio && /^\s*conserto:/.test(l))
const travas = [
  ...(inicio >= 0 ? linhasDoReparo.slice(inicio, fim > inicio ? fim : undefined) : []),
  ...linhasDoReparo.filter((l) => /ficariam com um clube só|sem resposta do Transfermarkt/.test(l)),
].filter((l) => l.trim())

const data = new Date().toISOString().slice(0, 10)
const secao = (titulo, linhas, vazio) => `## ${titulo}\n\n${linhas.length ? linhas.join('\n') : vazio}\n`
const relatorio = [
  `# Atualização da base — ${data}\n`,
  `${depois.length} jogadores. Testes: ${testes.map(([t, r]) => `${t} ${r.ok ? 'ok' : 'FALHOU'}`).join(', ')}.\n`,
  secao(`Carreiras que mudaram (${carreiras.length})`, carreiras, 'Nenhuma.'),
  secao('O que travou e ficou como estava', travas.map((l) => `    ${l.trim()}`), 'Nada travou.'),
  secao(`Clubes novos no jogo (${clubesNovos.length})`, clubesNovos.map((n) => `- ${n}`), 'Nenhum.'),
  secao(`Níveis que mudaram (${niveis.length})`, niveis, 'Nenhum.'),
  secao(`Dicas que mudaram (${dicas.length})`, dicas, 'Nenhuma.'),
].join('\n')
mkdirSync(join(raiz, 'relatorios'), { recursive: true })
const arquivo = join(raiz, 'relatorios', `atualizacao-${data}.md`)
writeFileSync(arquivo, relatorio)
console.log(`\nrelatório: ${arquivo}`)
console.log(`${carreiras.length} carreiras, ${niveis.length} níveis e ${dicas.length} dicas mudaram; ${clubesNovos.length} clubes novos.`)
if (testes.some(([, r]) => !r.ok)) {
  console.error('Algum teste falhou: não publique antes de consertar.')
  process.exit(1)
}
if (!existsSync(arquivo)) process.exit(1)
