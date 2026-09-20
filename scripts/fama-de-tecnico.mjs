/**
 * Quem é mais conhecido pelo banco do que pelo campo.
 *
 *   npm run tecnicos
 *
 * O nível sai de visualizações da Wikipédia em português, que medem fama — e
 * fama não distingue de onde ela vem. O Roger Machado tem 8761 visualizações
 * por mês, mais que a mediana do fácil, com 1 jogo de seleção e uma passagem
 * de € 1 milhão como jogador: quem procura por ele procura o treinador. Os
 * escudos dele são Grêmio, Vissel Kobe, Fluminense e D.C. United, e ninguém
 * chega ao nome por aí.
 *
 * Este script NÃO corrige nada sozinho, de propósito. Ele ordena os
 * candidatos e a decisão vai à mão para `niveis-fixos.mjs`, porque a razão
 * erra em casos que importam: goleiro não tem taxa de transferência, então o
 * Rogério Ceni aparece aqui em cima sendo um ídolo conhecidíssimo como
 * jogador. Fórmula nenhuma sabe a diferença; uma pessoa sabe.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe } from './wikidata.mjs'
import { historicoDoTransfermarkt } from './transfermarkt.mjs'
import { fatosDoHistorico } from './dicas.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO = join(raiz, 'src/dados/jogadores.ts')
const ARQUIVO_TECNICOS = join(raiz, 'scripts/tecnicos-jogadores.json')
const ARQUIVO_VIEWS = join(raiz, 'scripts/visualizacoes-jogadores.json')

const fonte = readFileSync(ARQUIVO, 'utf8')
const blocos = [...fonte.matchAll(/\{\s*\n\s*id: '([^']+)',[\s\S]*?\n {2}\},/g)]

const tmPorQid = JSON.parse(readFileSync(join(raiz, 'scripts/tm-jogadores.json'), 'utf8'))
const qidPorTm = new Map(Object.entries(tmPorQid).map(([qid, tm]) => [String(tm), qid]))
const selecoes = JSON.parse(readFileSync(join(raiz, 'scripts/selecoes-jogadores.json'), 'utf8'))
const views = JSON.parse(readFileSync(ARQUIVO_VIEWS, 'utf8'))

const jogadores = blocos.map((b) => {
  const tm = b[0].match(/spieler\/(\d+)/)?.[1] ?? null
  return {
    id: b[1],
    tm,
    qid: qidPorTm.get(tm),
    nome: b[0].match(/nome: "((?:[^"\\]|\\.)*)"/)?.[1] ?? b[1],
    nivel: b[0].match(/nivel: '([^']+)'/)?.[1] ?? '?',
  }
})
const qids = [...new Set(jogadores.map((j) => j.qid).filter(Boolean))]

// ------------------------------------------------- título do artigo, para as views
const artigoPorQid = new Map()
for (let i = 0; i < qids.length; i += 60) {
  const lote = qids.slice(i, i + 60).map((q) => `wd:${q}`).join(' ')
  const linhas = await comInsistencia(`
    SELECT ?j ?artigo WHERE { VALUES ?j { ${lote} }
      ?artigo schema:about ?j ; schema:isPartOf <https://pt.wikipedia.org/> . }`)
  for (const l of linhas ?? []) {
    artigoPorQid.set(qidDe(l.j), decodeURIComponent(l.artigo.split('/wiki/')[1] ?? '').replace(/_/g, ' '))
  }
}

// ----------------------------------------------------- P6087: clubes que dirigiu
const bancos = existsSync(ARQUIVO_TECNICOS)
  ? JSON.parse(readFileSync(ARQUIVO_TECNICOS, 'utf8'))
  : {}

const faltando = qids.filter((q) => !(q in bancos))
if (faltando.length) {
  console.log(`buscando carreira de treinador de ${faltando.length}...`)
  for (let i = 0; i < faltando.length; i += 60) {
    const fatia = faltando.slice(i, i + 60)
    const lote = fatia.map((q) => `wd:${q}`).join(' ')
    const linhas = await comInsistencia(`
      SELECT ?j ?clube WHERE { VALUES ?j { ${lote} } ?j wdt:P6087 ?clube . }`)
    if (!linhas) {
      console.log(`  lote ${i} falhou depois de 4 tentativas; segue sem ele`)
      continue
    }
    const porJ = new Map()
    for (const l of linhas) {
      const q = qidDe(l.j)
      if (!porJ.has(q)) porJ.set(q, new Set())
      porJ.get(q).add(l.clube)
    }
    // só marca como visto o lote que voltou, senão um erro de rede vira "nunca treinou"
    for (const q of fatia) bancos[q] = porJ.get(q)?.size ?? 0
  }
  writeFileSync(ARQUIVO_TECNICOS, JSON.stringify(bancos) + '\n')
}

/**
 * Uma consulta que falha calada vira dado errado: um lote perdido faria 60
 * jogadores parecerem que nunca treinaram. Aqui ela insiste e, se desistir,
 * devolve null para quem chamou distinguir "não treinou" de "não perguntei".
 */
async function comInsistencia(consulta) {
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    try {
      return await consultar(consulta)
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * (tentativa + 1)))
    }
  }
  return null
}

// --------------------------------------------------------------- a razão
const linhas = []
for (const j of jogadores) {
  const h = j.tm ? await historicoDoTransfermarkt(j.tm) : null
  const f = fatosDoHistorico(h?.transfers ?? [])
  const procura = Number(views[artigoPorQid.get(j.qid)] ?? 0)
  const jogos = Number(selecoes[j.qid]?.jogos ?? 0)
  const taxa = Math.round((f.maiorTaxa ?? 0) / 1e6)

  /**
   * O que o jogador fez em campo, nas unidades que a biblioteca já tem.
   * Não é mérito — é só o tamanho da carreira de jogador, para comparar com
   * o tamanho da fama. Quando a fama é muito maior, ela vem de outro lugar.
   */
  const emCampo = jogos * 100 + taxa * 200
  linhas.push({ ...j, procura, jogos, taxa, bancos: bancos[j.qid] ?? 0, emCampo })
}

const candidatos = linhas
  .filter((x) => x.bancos >= 1 && x.procura >= 3000)
  .map((x) => ({ ...x, razao: x.emCampo ? x.procura / x.emCampo : Infinity }))
  .sort((a, b) => b.razao - a.razao)

console.log(`\n${linhas.filter((x) => x.bancos >= 1).length} dos ${linhas.length} já dirigiram algum clube.`)
console.log(`${candidatos.length} deles têm procura alta — são estes que valem olhar:\n`)
console.log('  razão  nível           procura  seleção  taxa€M  bancos  jogador')
for (const x of candidatos.slice(0, 20)) {
  console.log(
    '  ' + (x.razao === Infinity ? '  ∞' : x.razao.toFixed(1)).padStart(5) +
    '  ' + x.nivel.padEnd(14) +
    String(x.procura).padStart(8) +
    String(x.jogos).padStart(9) +
    String(x.taxa).padStart(8) +
    String(x.bancos).padStart(8) +
    '  ' + x.nome,
  )
}
console.log('\nRazão alta = fama grande para uma carreira de jogador pequena.')
console.log('Confira um a um e escreva a decisão em scripts/niveis-fixos.mjs.')
