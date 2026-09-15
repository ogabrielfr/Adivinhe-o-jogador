/**
 * Monta o manifesto de clubes vindos do Wikidata, com a URL do escudo de cada
 * um. Não baixa imagem: quem baixa e otimiza é construir-catalogo.mjs.
 *
 *   npm run coletar            # todos os países de paises-alvo.mjs
 *   npm run coletar -- BR CN   # só esses
 *
 * Por que esta fonte existe: os quatro repositórios de escudo cobrem bem as
 * ligas principais da Europa e a Série A/B brasileira, e quase nada além
 * disso. Faltavam os estaduais brasileiros e a Ásia inteira — justamente onde
 * uma carreira começa e termina.
 *
 * Um clube só entra se tiver escudo, porque sem escudo ele não serve ao jogo:
 *
 *   1. logo no Wikimedia Commons (P154), preferido por ser vetorial com
 *      frequência e ter licença explícita;
 *   2. imagem de topo do artigo na Wikipédia. Pega muito clube cujo escudo
 *      está no Commons sem estar ligado ao item do Wikidata — é de longe o que
 *      mais rende;
 *   3. escudo do Transfermarkt, montado a partir do id do clube (P7223).
 *
 * Cada clube sai com um campo `licenca`, porque as três camadas não são
 * equivalentes: só o que está no Commons tem licença livre declarada. O
 * `pilicense=free` da API **não** basta — ele continua devolvendo arquivo
 * local do ptwiki marcado "Conteúdo restrito" (uso justo). Escudo é marca do
 * clube de todo jeito, e o projeto já os usa para identificação, mas a
 * distinção fica explícita no manifesto em vez de escondida.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe, imagensDeArtigos } from './wikidata.mjs'
import { PAISES } from './paises-alvo.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const SAIDA = join(raiz, 'scripts', 'clubes-externos.json')

const alvos = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const paises = Object.entries(PAISES).filter(([sigla]) => !alvos.length || alvos.includes(sigla))

const ESCUDO_TM = (id) => `https://tmssl.akamaized.net/images/wappen/head/${id}.png`

/**
 * `livre`    — Wikimedia Commons, licença livre declarada.
 * `restrito` — upload local de uma Wikipédia, normalmente uso justo.
 * `marca`    — escudo do Transfermarkt, sem licença; marca do clube.
 */
function licencaDe(url) {
  if (url.includes('commons.wikimedia.org') || url.includes('/wikipedia/commons/')) return 'livre'
  if (url.includes('upload.wikimedia.org')) return 'restrito'
  return 'marca'
}

/**
 * Special:FilePath já redireciona para o arquivo; o width pede a miniatura
 * pronta e evita baixar original de 4 MB. SVG não aceita width, e nem precisa.
 */
function urlCommons(bruta) {
  const url = bruta.replace(/^http:/, 'https:')
  return /\.svg$/i.test(url) ? url : `${url}?width=512`
}

const clubes = []
let semEscudo = 0

for (const [sigla, { qid, nome }] of paises) {
  const linhas = await consultar(`
    SELECT ?c ?cLabel ?logo ?tm ?localLabel ?ufLabel ?artigo ?artigoEn WHERE {
      ?c wdt:P31/wdt:P279* wd:Q476028 ; wdt:P17 wd:${qid} .
      OPTIONAL { ?c wdt:P154 ?logo }
      OPTIONAL { ?c wdt:P7223 ?tm }
      OPTIONAL { ?c wdt:P131 ?local }
      OPTIONAL { ?c wdt:P131+ ?uf . ?uf wdt:P31 wd:Q485258 }
      # o título do artigo em português costuma vir desambiguado
      # ("Botafogo Futebol Clube (Ribeirão Preto)"), o que o rótulo nem sempre traz
      OPTIONAL { ?artigo schema:about ?c ; schema:isPartOf <https://pt.wikipedia.org/> }
      OPTIONAL { ?artigoEn schema:about ?c ; schema:isPartOf <https://en.wikipedia.org/> }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en,es". }
    }`)

  // uma linha por combinação de opcionais: junta tudo por clube
  const porClube = new Map()
  for (const l of linhas) {
    const q = qidDe(l.c)
    const c = porClube.get(q) ?? { qid: q, nome: l.cLabel, pais: sigla }
    if (l.logo && !c.logo) c.logo = l.logo
    if (l.tm && !c.tm) c.tm = l.tm
    if (l.localLabel && !c.local) c.local = l.localLabel
    if (l.ufLabel && !c.uf) c.uf = l.ufLabel
    const titulo = (u) => decodeURIComponent(u.split('/wiki/')[1] ?? '').replace(/_/g, ' ')
    if (l.artigo && !c.artigo) c.artigo = titulo(l.artigo)
    if (l.artigoEn && !c.artigoEn) c.artigoEn = titulo(l.artigoEn)
    porClube.set(q, c)
  }

  // o rótulo cai no QID quando não há nome em nenhuma das línguas pedidas
  const candidatos = [...porClube.values()].filter((c) => !/^Q\d+$/.test(c.nome))

  /**
   * Quem não tem P154 nem P7223 ainda pode ter o escudo no artigo. Só entra
   * imagem de licença livre: `pilicense=free` deixa de fora o que a Wikipédia
   * hospeda como uso justo.
   */
  const semFonte = candidatos.filter((c) => !c.logo && !c.tm && (c.artigo || c.artigoEn))
  const imagemPt = await imagensDeArtigos('pt', semFonte.filter((c) => c.artigo).map((c) => c.artigo))
  const imagemEn = await imagensDeArtigos('en', semFonte.filter((c) => !c.artigo && c.artigoEn).map((c) => c.artigoEn))

  let comEscudo = 0
  for (const c of candidatos) {
    const daWiki = imagemPt.get(c.artigo) ?? imagemEn.get(c.artigoEn)
    const escudo = c.logo ? { url: urlCommons(c.logo), origem: 'commons' }
      : daWiki ? { url: daWiki, origem: 'wikipedia' }
      : c.tm ? { url: ESCUDO_TM(c.tm), origem: 'transfermarkt' }
      : null
    if (!escudo) { semEscudo++; continue }
    escudo.licenca = licencaDe(escudo.url)
    comEscudo++
    clubes.push({
      qid: c.qid, nome: c.nome, pais: sigla,
      local: c.local ?? null, uf: c.uf ?? null, artigo: c.artigo ?? null,
      ...escudo,
    })
  }
  console.log(`${sigla} ${nome.padEnd(24)} ${String(comEscudo).padStart(4)} com escudo  (${porClube.size} no total)`)
}

clubes.sort((a, b) => a.pais.localeCompare(b.pais) || a.nome.localeCompare(b.nome))
mkdirSync(dirname(SAIDA), { recursive: true })
writeFileSync(SAIDA, JSON.stringify(clubes, null, 1) + '\n')

const porOrigem = {}
for (const c of clubes) porOrigem[c.origem] = (porOrigem[c.origem] ?? 0) + 1
console.log(`\n${clubes.length} clubes com escudo em ${paises.length} países`)
console.log('por origem:', porOrigem)
console.log(`${semEscudo} clubes descartados por não ter escudo em fonte nenhuma`)
console.log(`gravado em ${SAIDA.replace(raiz + '/', '')}`)
