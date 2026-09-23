/**
 * Confere e completa o mapa id-do-clube-no-Transfermarkt -> clube do catálogo.
 *
 *   npm run mapa-tm
 *
 * O mapa é o caminho seguro do resolvedor de clube: por ele, uma passagem vira
 * clube pelo id, sem casar nome. Mas ele só é seguro se cada par estiver certo,
 * e não estava. O mapa saía do P7223 (id do Transfermarkt) do QID que o
 * catálogo guarda para cada clube — e o catálogo dava QID por semelhança de
 * nome. O Burnley ficou com o QID do Barnsley, o Watford com o do Dartford, o
 * Parma com o do La Palma; o id do Transfermarkt de cada um veio junto. O John
 * Stones começou a carreira no Barnsley e o jogo mostrava o escudo do Burnley.
 *
 * A conferência usa a direção que não tem como errar de clube: o id do
 * Transfermarkt pertence a um clube só, e o Wikidata diz qual (quem tem aquele
 * P7223). Um par sai do mapa quando esse clube tem nome que não bate com o
 * nosso — o 349 é do Barnsley, não do Burnley. Par sem clube no Wikidata fica,
 * porque não há como provar que está errado.
 *
 * O mesmo dono completa o mapa com os clubes que aparecem nos históricos em
 * cache: quando o nome do Transfermarkt casa com um clube nosso e o dono do id
 * tem esse nome e é do mesmo país, o par entra. É assim que o São Paulo, o
 * Flamengo e o Real Madrid, cujo QID no catálogo é de outra entidade, passam
 * a resolver pelo id.
 *
 * Grava três coisas:
 * - `clubes-transfermarkt.json`, o mapa: pares à mão (`PARES_TM`), os que já
 *   estavam e passaram na conferência, os dos históricos, e os novos que o QID
 *   conferido de cada clube e a URL dos escudos do Transfermarkt trazem;
 * - `fundacao-clubes.json`, o ano de fundação de cada clube, que o resolvedor
 *   usa para recusar homônimo de outra época (o Inter Miami, de 2018, numa
 *   passagem de 2006). Sai do clube que tem o id do Transfermarkt — o mesmo
 *   raciocínio: é dele e de mais ninguém;
 * - `qid-dos-clubes.json`, o QID que o catálogo deve usar para cada clube com
 *   id do Transfermarkt conhecido, pelo mesmo caminho. `npm run catalogo` lê
 *   este arquivo.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe } from './wikidata.mjs'
import { mesmoClube, cabeNoNome, mesmasPalavras, tokensDoNome } from './nomes-clube.mjs'
import { PARES_TM, SEM_PAR_TM, CANONICOS } from './clubes-canonicos.mjs'
import { PAISES } from './paises-alvo.mjs'
import { passagensDoTransfermarkt, clubesDoTransfermarkt } from './transfermarkt.mjs'
import { lerBiblioteca, idTmDe } from './biblioteca.mjs'
import { nomeCurto } from './nomes-curtos.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ler = (arquivo) => JSON.parse(readFileSync(join(raiz, 'scripts', arquivo), 'utf8'))
const catalogo = ler('catalogo-completo.json')
const externos = ler('clubes-externos.json')
const antes = ler('clubes-transfermarkt.json')
const porId = new Map(catalogo.map((c) => [c.id, c]))

/** Com mais de uma data de fundação (refundação), vale a mais antiga. */
const maisAntigo = (atual, data) => {
  const ano = Number(String(data ?? '').slice(0, 4))
  return ano > 1800 && (!atual || ano < atual) ? ano : atual
}

/** Consulta em lotes, insistindo; lote que não volta fica de fora, e é contado. */
let perdidos = 0
async function emLotes(itens, tamanho, montar, cadaLinha) {
  for (let i = 0; i < itens.length; i += tamanho) {
    const fatia = itens.slice(i, i + tamanho)
    let linhas = null
    for (let t = 0; t < 4 && !linhas; t++) {
      linhas = await consultar(montar(fatia))
        .catch(async () => { await new Promise((r) => setTimeout(r, 3000 * (t + 1))); return null })
    }
    if (!linhas) { perdidos += fatia.length; continue }
    for (const l of linhas) cadaLinha(l)
  }
}

const FEMININO = /women|femin|femen|femmin|w\.f\.c|ladies|frauen|damen|\(w\)/i
const TIPO_FEMININO = new Set(['Q28140340', 'Q51481377'])
const novoRegistro = () => ({ qid: null, rotulos: new Set(), tms: new Set(), tipos: new Set(), ano: null })
const guardar = (x, l) => {
  if (l.rotulo) x.rotulos.add(l.rotulo)
  if (l.tm) x.tms.add(l.tm)
  if (l.tipo) x.tipos.add(qidDe(l.tipo))
  x.ano = maisAntigo(x.ano, l.f)
}

// ------------------------------------ clubes que aparecem nos históricos em cache
const CACHE_TM = join(raiz, '.cache', 'transfermarkt')
/**
 * Cada id com os nomes que o Transfermarkt usa para ele: o rótulo da tabela,
 * abreviado ("Man Utd"), e o do endereço, que costuma vir por extenso
 * ("/manchester-united/"). O abreviado sozinho não casa com nome nenhum.
 */
const vistos = new Map()
for (const arquivo of readdirSync(CACHE_TM)) {
  if (!/^\d+\.json$/.test(arquivo)) continue
  let dados
  try { dados = JSON.parse(readFileSync(join(CACHE_TM, arquivo), 'utf8')) } catch { continue }
  for (const t of dados.transfers ?? []) {
    for (const c of [t.from, t.to]) {
      const tm = c?.href?.match(/\/verein\/(\d+)/)?.[1]
      if (!tm) continue
      if (!vistos.has(tm)) vistos.set(tm, new Set())
      if (c.clubName) vistos.get(tm).add(c.clubName)
      const slug = c.href.match(/^\/([^/]+)\//)?.[1]
      if (slug && !/^\d+$/.test(slug)) vistos.get(tm).add(slug.replace(/-/g, ' '))
    }
  }
}

// o Transfermarkt abrevia até no endereço ("/man-utd/"): o nome do escudo baixado de lá ajuda
for (const e of externos) {
  const tm = e.url?.match(/\/wappen\/head\/(\d+)\.png/)?.[1]
  if (tm && vistos.has(tm)) vistos.get(tm).add(e.nome)
}

// ------------------------------------ o clube do Wikidata que tem cada id do TM
const tmsConhecidos = [...new Set([
  ...Object.keys(antes), ...Object.keys(PARES_TM).map(String), ...vistos.keys(),
  ...externos.map((e) => e.url?.match(/\/wappen\/head\/(\d+)\.png/)?.[1]).filter(Boolean),
])]
const donoDoTm = new Map()
await emLotes(tmsConhecidos, 300, (fatia) => `
  SELECT ?tm ?c ?rotulo ?tipo ?f ?pais WHERE { VALUES ?tm { ${fatia.map((t) => `"${t}"`).join(' ')} }
    ?c wdt:P7223 ?tm .
    OPTIONAL { ?c rdfs:label ?rotulo FILTER(lang(?rotulo) IN ('pt', 'en', 'es')) }
    OPTIONAL { ?c wdt:P31 ?tipo } OPTIONAL { ?c wdt:P571 ?f } OPTIONAL { ?c wdt:P17 ?pais } }`, (l) => {
  if (!donoDoTm.has(l.tm)) donoDoTm.set(l.tm, { ...novoRegistro(), qid: qidDe(l.c), paises: new Set() })
  const x = donoDoTm.get(l.tm)
  // o mesmo id em dois itens do Wikidata: fica o primeiro, o outro é duplicata deles
  if (x.qid !== qidDe(l.c)) return
  guardar(x, l)
  if (l.pais) x.paises.add(qidDe(l.pais))
})

// ------------------------------------------ o que o Wikidata diz de cada QID nosso
const doQid = new Map()
await emLotes([...new Set(catalogo.map((c) => c.qid).filter(Boolean))], 250, (fatia) => `
  SELECT ?c ?rotulo ?tm ?tipo ?f WHERE { VALUES ?c { ${fatia.map((q) => `wd:${q}`).join(' ')} }
    OPTIONAL { ?c rdfs:label ?rotulo FILTER(lang(?rotulo) IN ('pt', 'en', 'es')) }
    OPTIONAL { ?c wdt:P7223 ?tm } OPTIONAL { ?c wdt:P31 ?tipo } OPTIONAL { ?c wdt:P571 ?f } }`, (l) => {
  const q = qidDe(l.c)
  if (!doQid.has(q)) doQid.set(q, { ...novoRegistro(), qid: q })
  guardar(doQid.get(q), l)
})

/** O registro do Wikidata descreve este clube nosso? */
function descreve(registro, clube) {
  const rotulos = [...registro.rotulos]
  const feminino = [...registro.tipos].some((t) => TIPO_FEMININO.has(t)) || rotulos.some((r) => FEMININO.test(r))
  if (feminino !== FEMININO.test(clube.nome)) return false
  if (!tokensDoNome(clube.nome).length) return false
  return rotulos.some((r) => mesmoClube(clube.nome, r))
}

// --------------------------------------------------------------------- montagem
const mapa = new Map()
const origem = new Map()
const por = (bruto, id, de) => {
  if (!bruto || !id || !porId.has(id)) return
  const tm = String(bruto)
  if (mapa.has(tm) || SEM_PAR_TM.has(tm)) return
  mapa.set(tm, id)
  origem.set(tm, de)
}

// 1. à mão, sem conferência: é o que a conferência não alcança
for (const [tm, id] of Object.entries(PARES_TM)) por(tm, id, 'à mão')

// 2. o que já estava, menos o que o dono do id desmente
const desmentidos = []
for (const [tm, id] of Object.entries(antes)) {
  const dono = donoDoTm.get(tm)
  const clube = porId.get(id)
  // o par à mão já foi conferido; o dono não reconhece sigla ("CRB")
  if (!clube || tm in PARES_TM) continue
  if (dono && !descreve(dono, clube) && !doQid.get(clube.qid)?.tms.has(tm)) {
    desmentidos.push({ tm, id, dono: [...dono.rotulos][0] ?? dono.qid })
    continue
  }
  por(tm, id, 'já estava')
}

// 3. o que aparece nos históricos: o nome casa com um clube nosso e o dono do id confirma
/**
 * País do Wikidata -> sigla do catálogo. `PAISES` só lista o que o coletor de
 * escudos busca; os países que os repositórios cobrem vêm daqui.
 */
const siglaDoPais = new Map([
  ...Object.entries(PAISES).map(([sigla, p]) => [p.qid, sigla]),
  ['Q183', 'DE'], ['Q142', 'FR'], ['Q45', 'PT'], ['Q55', 'NL'], ['Q31', 'BE'], ['Q34', 'SE'],
  ['Q35', 'DK'], ['Q20', 'NO'], ['Q213', 'CZ'], ['Q36', 'PL'], ['Q40', 'AT'], ['Q39', 'CH'],
  ['Q1033', 'NG'], ['Q800', 'CR'], ['Q8646', 'HK'], ['Q664', 'NZ'], ['Q27', 'IE'], ['Q33', 'FI'],
  ['Q28', 'HU'], ['Q214', 'SK'], ['Q215', 'SI'], ['Q191', 'EE'], ['Q211', 'LV'], ['Q37', 'LT'],
])
/** Reino Unido é um país só no Wikidata e quatro no futebol. */
const REINO_UNIDO = new Set(['EN', 'SC', 'WA', 'NI', 'GB', 'SCO', 'WAL', 'NIR', 'ENG'])
const mesmoPais = (dono, clube) => {
  const siglas = [...(dono.paises ?? [])].map((q) => siglaDoPais.get(q)).filter(Boolean)
  if (!siglas.length) return false
  return siglas.some((s) => s === clube.pais || (s === 'EN' && REINO_UNIDO.has(clube.pais)))
}
const porPalavra = new Map()
for (const c of catalogo) {
  for (const t of tokensDoNome(c.nome)) {
    if (t.length < 3) continue
    if (!porPalavra.has(t)) porPalavra.set(t, [])
    porPalavra.get(t).push(c)
  }
}
let dosHistoricos = 0
for (const [tm, nomes] of vistos) {
  const dono = donoDoTm.get(tm)
  if (mapa.has(tm) || !dono) continue
  const candidatos = new Map()
  for (const nome of nomes) {
    for (const t of tokensDoNome(nome)) {
      for (const c of porPalavra.get(t) ?? []) {
        if (candidatos.has(c.id)) continue
        if (mesmoClube(c.nome, nome) && cabeNoNome(nome, c.nome) && descreve(dono, c) && mesmoPais(dono, c)) {
          candidatos.set(c.id, c)
        }
      }
    }
  }
  /**
   * Só entra o clube que diz exatamente o nome do Transfermarkt. Contido não
   * basta: "Paris FC" cabe em "Paris Saint-Germain", o dono do 10004 também se
   * chama Paris FC, e o curado desempatava para o PSG.
   */
  const exatos = [...candidatos.values()].filter((c) => [...nomes].some((n) => mesmasPalavras(n, c.nome)))
  let escolhido = exatos.length === 1 ? exatos[0].id : null
  if (!escolhido && exatos.length > 1) {
    const curados = exatos.filter((c) => c.id in CANONICOS)
    if (curados.length === 1) escolhido = curados[0].id
  }
  if (escolhido) { por(tm, escolhido, 'históricos'); dosHistoricos++ }
}

// 4. novos: o P7223 do QID de cada clube, quando o QID descreve o clube, e a URL do escudo
const qidConfere = (c) => c.qid && doQid.has(c.qid) && descreve(doQid.get(c.qid), c)
for (const c of catalogo) {
  if (!qidConfere(c)) continue
  for (const tm of doQid.get(c.qid).tms) {
    const dono = donoDoTm.get(tm)
    if (!dono || descreve(dono, c)) por(tm, c.id, 'wikidata')
  }
}
const idPorQid = new Map(catalogo.filter(qidConfere).map((c) => [c.qid, c.id]))
for (const e of externos) por(e.url?.match(/\/wappen\/head\/(\d+)\.png/)?.[1], idPorQid.get(e.qid), 'escudo')

// um par por linha: a mudança de um clube vira uma linha de diff
const gravar = (arquivo, pares) => writeFileSync(join(raiz, 'scripts', arquivo),
  `{\n${pares.map(([k, v]) => `  ${JSON.stringify(String(k))}: ${JSON.stringify(v)}`).join(',\n')}\n}\n`)
gravar('clubes-transfermarkt.json', [...mapa].sort((a, b) => Number(a[0]) - Number(b[0])))

// ------------------------------------------------ fundação e QID de cada clube
const fundacao = {}
const qidDosClubes = {}
for (const [tm, id] of mapa) {
  const dono = donoDoTm.get(tm)
  if (!dono || !descreve(dono, porId.get(id))) continue
  if (dono.ano && (!fundacao[id] || dono.ano < fundacao[id])) fundacao[id] = dono.ano
  qidDosClubes[id] ??= dono.qid
}
for (const c of catalogo) {
  if (fundacao[c.id] || !qidConfere(c)) continue
  const ano = doQid.get(c.qid).ano
  if (ano) fundacao[c.id] = ano
}
writeFileSync(join(raiz, 'scripts/fundacao-clubes.json'),
  JSON.stringify(Object.fromEntries(Object.entries(fundacao).sort())) + '\n')
gravar('qid-dos-clubes.json', Object.entries(qidDosClubes).sort())

// -------------------------------------------------------------------- relatório
const conta = (o) => [...origem.values()].filter((x) => x === o).length
console.log(`${mapa.size} pares (antes ${Object.keys(antes).length}): ${conta('à mão')} à mão, ` +
  `${conta('já estava')} mantidos, ${conta('históricos')} dos históricos, ` +
  `${conta('wikidata')} novos pelo Wikidata, ${conta('escudo')} novos pela URL do escudo`)
if (perdidos) console.log(`  atenção: ${perdidos} consultas não voltaram — rode de novo`)
console.log(`\n${desmentidos.length} pares desmentidos pelo dono do id no Wikidata:`)
for (const d of desmentidos) console.log(`  ${d.tm} -> ${d.id} (${porId.get(d.id)?.nome}), mas o ${d.tm} é do ${d.dono}`)
const qidErrado = Object.entries(qidDosClubes).filter(([id, q]) => porId.get(id)?.qid && porId.get(id).qid !== q)
console.log(`\n${qidErrado.length} clubes com QID do catálogo diferente do dono do id do TM (o catálogo passa a usar o do dono)`)
console.log(`ano de fundação de ${Object.keys(fundacao).length} clubes`)

// ------------------------------- o nome que o Transfermarkt dá a cada id em uso
/**
 * O dono do id no Wikidata não conhece todo clube, e sem dono o par antigo
 * fica. Foi assim que o CRB (11449) seguiu ligado ao Brasil de Pelotas na
 * carreira do Marcos Rocha: o QID do catálogo era o do CRB, e o id veio junto
 * pela URL do escudo. O nome que o próprio Transfermarkt dá ao id é a segunda
 * testemunha, conferida para todo id que aparece nas passagens da biblioteca.
 *
 * Nome diferente não prova erro — clube muda de nome (o Lekhwiya virou
 * Al-Duhail) e o nosso vem em português. A lista é para ler: o par errado vai
 * para SEM_PAR_TM, e o certo para PARES_TM, que sai da lista.
 */
const tmsDaBiblioteca = new Set()
for (const j of lerBiblioteca()) {
  for (const p of (await passagensDoTransfermarkt(idTmDe(j))) ?? []) if (p.idTm) tmsDaBiblioteca.add(String(p.idTm))
}
const emUso = [...mapa].filter(([tm]) => tmsDaBiblioteca.has(tm) && origem.get(tm) !== 'à mão')
const peloTm = await clubesDoTransfermarkt(emUso.map(([tm]) => tm))
const bateComTm = (tm, clube) => {
  const t = peloTm[tm]
  const nossos = [clube.nome, nomeCurto(clube.id, clube.nome)]
  return !t || [t.nome, t.curto].some((n) => n && nossos.some((o) => mesmoClube(n, o) || cabeNoNome(n, o) || cabeNoNome(o, n)))
}
const estranhos = emUso.filter(([tm, id]) => !bateComTm(tm, porId.get(id)))
console.log(`\n${estranhos.length} pares em uso com nome diferente no Transfermarkt (leia: renomeado ou errado?):`)
for (const [tm, id] of estranhos) console.log(`  ${tm} "${peloTm[tm].nome}" -> ${id} (${porId.get(id).nome})`)
