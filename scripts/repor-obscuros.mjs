/**
 * Troca quem o torcedor brasileiro nunca ouviu falar.
 *
 *   npm run repor
 *
 * Difícil tem que ser difícil, não desconhecido. Takashi Usami tem 86
 * visualizações por mês na Wikipédia em português — nove vezes abaixo da
 * mediana do próprio nível. Quem cai nele não perde uma charada difícil:
 * perde uma charada que não tinha resposta possível, e ainda termina sem
 * saber quem é o nome revelado. Não é o mesmo jogo.
 *
 * O piso é de procura, não de mérito. Um jogador pode ter carreira modesta e
 * ser conhecidíssimo; o que não serve é ninguém procurar por ele.
 *
 * Quem sai é trocado, não apagado: o substituto passa pelo mesmo caminho de
 * aceitação do gerador (carreira do Transfermarkt, clubes resolvidos, tamanho
 * do mural) e precisa ter procura confortavelmente acima do piso, senão a
 * troca só empurra o problema.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe } from './wikidata.mjs'
import { visualizacoesDe } from './visualizacoes.mjs'
import { passagensDoTransfermarkt, perfilDoTransfermarkt, historicoDoTransfermarkt } from './transfermarkt.mjs'
import { montarDicas, fatosDoHistorico, naturalidadeSegura } from './dicas.mjs'
import { torneiosDe, torneiosQueContam } from './torneios.mjs'
import { mesmoClube, tokensDoNome } from './nomes-clube.mjs'
import { CANONICOS } from './clubes-canonicos.mjs'
import { latinizar } from '../src/logica/texto.ts'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO = join(raiz, 'src/dados/jogadores.ts')
const ARQUIVO_VIEWS = join(raiz, 'scripts/visualizacoes-jogadores.json')

/** Abaixo disto, ninguém procura o nome em português. */
const PISO = Number(process.env.PISO ?? 250)
/** O substituto entra com folga, senão a troca só adia o problema. */
const PISO_DO_SUBSTITUTO = Number(process.env.PISO_NOVO ?? 800)

const fonte = readFileSync(ARQUIVO, 'utf8')
const blocos = [...fonte.matchAll(/\{\s*\n\s*id: '([^']+)',[\s\S]*?\n {2}\},/g)]
console.log(`jogadores no arquivo: ${blocos.length}`)

const tmPorQid = JSON.parse(readFileSync(join(raiz, 'scripts/tm-jogadores.json'), 'utf8'))
const qidPorTm = new Map(Object.entries(tmPorQid).map(([q, t]) => [String(t), q]))
const meta = JSON.parse(readFileSync(join(raiz, 'scripts/meta-jogadores.json'), 'utf8'))
const candidatos = JSON.parse(readFileSync(join(raiz, 'scripts/candidatos-jogadores.json'), 'utf8'))
const catalogo = JSON.parse(readFileSync(join(raiz, 'scripts/catalogo-completo.json'), 'utf8'))
const externos = JSON.parse(readFileSync(join(raiz, 'scripts/clubes-externos.json'), 'utf8'))
const views = JSON.parse(readFileSync(ARQUIVO_VIEWS, 'utf8'))

// --------------------------------------------------- resolução de clube
const idPorQid = new Map(catalogo.filter((c) => c.qid).map((c) => [c.qid, c.id]))
const idPorTm = new Map(Object.entries(JSON.parse(readFileSync(join(raiz, 'scripts/clubes-transfermarkt.json'), 'utf8'))))
for (const c of externos) {
  const tm = c.url?.match(/\/wappen\/head\/(\d+)\.png/)?.[1]
  const nosso = idPorQid.get(c.qid)
  if (tm && nosso && !idPorTm.has(tm)) idPorTm.set(tm, nosso)
}
const paisDoClube = new Map(catalogo.map((c) => [c.id, c.pais]))
const nomeDoClube = new Map(catalogo.map((c) => [c.id, c.nome]))
const porToken = new Map()
for (const c of catalogo) {
  for (const t of tokensDoNome(c.nome)) {
    if (t.length < 3) continue
    if (!porToken.has(t)) porToken.set(t, [])
    porToken.get(t).push(c)
  }
}
function resolverClube(passagem) {
  if (passagem.idTm && idPorTm.has(passagem.idTm)) return idPorTm.get(passagem.idTm)
  const ids = new Set()
  const vistos = new Set()
  for (const t of tokensDoNome(passagem.nome)) {
    for (const c of porToken.get(t) ?? []) {
      if (vistos.has(c.id)) continue
      vistos.add(c.id)
      if (mesmoClube(c.nome, passagem.nome)) ids.add(c.id)
    }
  }
  if (ids.size === 1) return [...ids][0]
  const curados = [...ids].filter((id) => id in CANONICOS)
  return curados.length === 1 ? curados[0] : null
}

// ------------------------------------------- título do artigo em português
async function artigosDe(qids) {
  const mapa = new Map()
  for (let i = 0; i < qids.length; i += 60) {
    const lote = qids.slice(i, i + 60).map((q) => `wd:${q}`).join(' ')
    let linhas = null
    for (let t = 0; t < 4 && !linhas; t++) {
      linhas = await consultar(`
        SELECT ?j ?artigo WHERE { VALUES ?j { ${lote} }
          ?artigo schema:about ?j ; schema:isPartOf <https://pt.wikipedia.org/> . }`)
        .catch(async () => { await new Promise((r) => setTimeout(r, 1500 * (t + 1))); return null })
    }
    for (const l of linhas ?? []) {
      mapa.set(qidDe(l.j), decodeURIComponent(l.artigo.split('/wiki/')[1] ?? '').replace(/_/g, ' '))
    }
  }
  return mapa
}

const daCasa = blocos.map((b) => {
  const tm = b[0].match(/spieler\/(\d+)/)?.[1] ?? null
  return {
    bloco: b, id: b[1], tm, qid: qidPorTm.get(tm),
    nome: b[0].match(/nome: "((?:[^"\\]|\\.)*)"/)?.[1] ?? b[1],
    nivel: b[0].match(/nivel: '([^']+)'/)?.[1] ?? '?',
  }
})

const artigoDaCasa = await artigosDe([...new Set(daCasa.map((j) => j.qid).filter(Boolean))])
const semViews = [...artigoDaCasa.values()].filter((a) => !(a in views))
if (semViews.length) {
  console.log(`buscando visualizações de ${semViews.length} artigos...`)
  for (const [a, v] of await visualizacoesDe(semViews)) views[a] = v
  writeFileSync(ARQUIVO_VIEWS, JSON.stringify(views) + '\n')
}

for (const j of daCasa) j.procura = Number(views[artigoDaCasa.get(j.qid)] ?? 0)

const aSair = daCasa.filter((j) => j.procura < PISO).sort((a, b) => a.procura - b.procura)
console.log(`\nabaixo do piso de ${PISO} visualizações/mês: ${aSair.length}`)
for (const j of aSair) console.log(`  ${String(j.procura).padStart(5)}  ${j.nivel.padEnd(14)} ${j.nome}`)
if (!aSair.length) {
  console.log('\nnada a repor.')
  process.exit(0)
}

// ------------------------------------------------------ escolher substitutos
const jaUsados = new Set(daCasa.map((j) => j.qid))
const idsUsados = new Set(daCasa.map((j) => j.id))
const fila = Object.entries(candidatos)
  .filter(([q]) => !jaUsados.has(q) && tmPorQid[q] && meta[q]?.nome && !/^Q\d+$/.test(meta[q].nome))
  .sort((a, b) => Number(b[1]) - Number(a[1]))
  .map(([q]) => q)

console.log(`\n${fila.length} candidatos livres; procurando ${aSair.length} com procura >= ${PISO_DO_SUBSTITUTO}`)

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const escolhidos = []
let olhados = 0
for (const qid of fila) {
  if (escolhidos.length >= aSair.length) break
  olhados++

  const artigo = (await artigosDe([qid])).get(qid)
  if (!artigo) continue
  const procura = artigo in views ? views[artigo] : (await visualizacoesDe([artigo])).get(artigo) ?? 0
  views[artigo] = procura
  if (procura < PISO_DO_SUBSTITUTO) continue

  const tm = tmPorQid[qid]
  const passagens = await passagensDoTransfermarkt(tm)
  if (!passagens) continue

  const clubes = []
  let falhou = false
  for (const p of passagens) {
    const id = resolverClube(p)
    if (!id) { falhou = true; break }
    if (clubes[clubes.length - 1] !== id) clubes.push(id)
  }
  if (falhou || clubes.length < 2 || clubes.length > 12) continue

  const dados = meta[qid]
  const perfil = await perfilDoTransfermarkt(tm)
  // o Transfermarkt já mandou "Arda Güler" com alfa grego no lugar do A
  const nome = latinizar(
    perfil?.nome && perfil.nome.split(' ').length < dados.nome.split(' ').length
      ? perfil.nome
      : dados.nome,
  )
  const id = slug(nome)
  if (idsUsados.has(id)) continue
  idsUsados.add(id)

  const historico = await historicoDoTransfermarkt(tm)
  escolhidos.push({
    id, nome, qid, tm, clubes, procura,
    apelidos: [...new Set([nome, dados.nome].map((n) => n.toLowerCase()))],
    dicas: montarDicas({
      ...dados,
      posicao: perfil?.posicao ?? dados.posicao,
      pais: perfil?.nacionalidade ?? dados.pais,
      fatos: fatosDoHistorico(historico?.transfers ?? []),
      paises: new Set(clubes.map((c) => paisDoClube.get(c))).size,
      naturalidade: naturalidadeSegura(
        perfil?.naturalidade,
        clubes.map((c) => nomeDoClube.get(c)).filter(Boolean),
        nome,
      ),
      torneios: torneiosQueContam((await torneiosDe([qid]))[qid] ?? []),
    }),
  })
  console.log(`  entra: ${String(procura).padStart(6)}  ${nome} (${clubes.length} clubes)`)
}
writeFileSync(ARQUIVO_VIEWS, JSON.stringify(views) + '\n')

console.log(`\n${escolhidos.length} substitutos achados em ${olhados} candidatos olhados`)
if (escolhidos.length < aSair.length) {
  console.log(`  ${aSair.length - escolhidos.length} ficam como estão: não apareceu substituto à altura`)
}

// ---------------------------------------------------------------- troca
const aspas = (s) => JSON.stringify(s)
let novoTexto = fonte
for (let i = 0; i < escolhidos.length; i++) {
  const sai = aSair[i]
  const entra = escolhidos[i]
  const nivel = sai.nivel // `npm run reparar` recalcula depois
  const bloco = `  {
    id: '${entra.id}',
    nome: ${aspas(entra.nome)},
    apelidos: [${entra.apelidos.map(aspas).join(', ')}],
    nivel: '${nivel}',
    clubes: [${entra.clubes.map((c) => `'${c}'`).join(', ')}],
    dicas: [${entra.dicas.map(aspas).join(', ')}],
    verificado: true,
    fonte: 'https://www.transfermarkt.com.br/-/transfers/spieler/${entra.tm}',
  },`
  novoTexto = novoTexto.replace(sai.bloco[0], bloco)
  console.log(`  ${sai.nome} (${sai.procura}) -> ${entra.nome} (${entra.procura})`)
}
writeFileSync(ARQUIVO, novoTexto)

console.log(`\n${escolhidos.length} trocados. Rode: npm run reparar && npm run dicas && npm run catalogo`)
