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
import { visualizacoesDe, lerVisualizacoes, gravarVisualizacoes } from './visualizacoes.mjs'
import { passagensDoTransfermarkt, perfilDoTransfermarkt, historicoDoTransfermarkt, jogosPorClube } from './transfermarkt.mjs'
import { montarDicas, fatosDoHistorico, naturalidadeSegura } from './dicas.mjs'
import { torneiosDe, torneiosQueContam } from './torneios.mjs'
import { lerBiblioteca, gravarBiblioteca, idTmDe } from './biblioteca.mjs'
import { criarResolvedor } from './resolver-clube.mjs'
import { latinizar } from '../src/logica/texto.ts'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO_VIEWS = join(raiz, 'scripts/visualizacoes-jogadores.json')

/** Abaixo disto, ninguém procura o nome em português. */
const PISO = Number(process.env.PISO ?? 250)
/** O substituto entra com folga, senão a troca só adia o problema. */
const PISO_DO_SUBSTITUTO = Number(process.env.PISO_NOVO ?? 800)

const jogadores = lerBiblioteca()
console.log(`jogadores na biblioteca: ${jogadores.length}`)

const tmPorQid = JSON.parse(readFileSync(join(raiz, 'scripts/tm-jogadores.json'), 'utf8'))
const qidPorTm = new Map(Object.entries(tmPorQid).map(([q, t]) => [String(t), q]))
const meta = JSON.parse(readFileSync(join(raiz, 'scripts/meta-jogadores.json'), 'utf8'))
const candidatos = JSON.parse(readFileSync(join(raiz, 'scripts/candidatos-jogadores.json'), 'utf8'))
const views = lerVisualizacoes(ARQUIVO_VIEWS)

const resolvedor = criarResolvedor()
const daBiblioteca = []
for (const j of jogadores) daBiblioteca.push(await passagensDoTransfermarkt(idTmDe(j)))
resolvedor.aquecer(daBiblioteca)

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

const daCasa = jogadores.map((j) => {
  const tm = idTmDe(j)
  return { jogador: j, id: j.id, tm, qid: qidPorTm.get(tm), nome: j.nome, nivel: j.nivel }
})

const artigoDaCasa = await artigosDe([...new Set(daCasa.map((j) => j.qid).filter(Boolean))])
const semViews = [...artigoDaCasa.values()].filter((a) => !(a in views))
if (semViews.length) {
  console.log(`buscando visualizações de ${semViews.length} artigos...`)
  for (const [a, v] of await visualizacoesDe(semViews)) views[a] = v
  gravarVisualizacoes(ARQUIVO_VIEWS, views)
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

  const dados = meta[qid]
  // sem teto de escudos: carreira longa e confusa é a graça do jogo
  const { clubes, travas } = resolvedor.montarCarreira(passagens, { nasc: dados.nasc, jogos: await jogosPorClube(tm) })
  if (travas.length || clubes.length < 2) continue

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
      paises: new Set(clubes.map((c) => resolvedor.paisDoClube(c))).size,
      naturalidade: naturalidadeSegura(
        perfil?.naturalidade,
        clubes.map((c) => resolvedor.nomeDoClube(c)).filter(Boolean),
        nome,
      ),
      torneios: torneiosQueContam((await torneiosDe([qid]))[qid] ?? []),
    }),
  })
  console.log(`  entra: ${String(procura).padStart(6)}  ${nome} (${clubes.length} clubes)`)
}
gravarVisualizacoes(ARQUIVO_VIEWS, views)

console.log(`\n${escolhidos.length} substitutos achados em ${olhados} candidatos olhados`)
if (escolhidos.length < aSair.length) {
  console.log(`  ${aSair.length - escolhidos.length} ficam como estão: não apareceu substituto à altura`)
}

// ---------------------------------------------------------------- troca
for (let i = 0; i < escolhidos.length; i++) {
  const sai = aSair[i]
  const entra = escolhidos[i]
  const lugar = jogadores.indexOf(sai.jogador)
  jogadores[lugar] = {
    id: entra.id,
    nome: entra.nome,
    apelidos: entra.apelidos,
    nivel: sai.nivel, // a régua de nível está em revisão; o substituto herda o lugar de quem sai
    clubes: entra.clubes,
    dicas: entra.dicas,
    verificado: true,
    fonte: `https://www.transfermarkt.com.br/-/transfers/spieler/${entra.tm}`,
  }
  console.log(`  ${sai.nome} (${sai.procura}) -> ${entra.nome} (${entra.procura})`)
}
gravarBiblioteca(jogadores)

console.log(`\n${escolhidos.length} trocados. Rode: npm run dicas && npm run catalogo`)
