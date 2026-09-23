/**
 * Confere a carreira de cada jogador contra o Wikidata e aponta as
 * divergências. NÃO altera os dados — quem decide é você, olhando o relatório.
 *
 *   npm run verificar                 # todos
 *   npm run verificar -- dzeko pato   # só esses
 *   npm run verificar -- --json       # saída para processar
 *
 * São TRÊS fontes, porque nenhuma sozinha basta — e isso não é teoria, é o que
 * a primeira rodada mostrou:
 *
 *   wd  Wikidata, propriedade P54. Estruturado e auditável por QID, mas
 *       preenchido à mão e atrasado: não tinha o Grêmio do Elkeson nem o do
 *       Diego Tardelli, que o nosso dado tinha certo.
 *   wp  Infobox do artigo na Wikipédia. Mais completo que o P54 no futebol
 *       brasileiro — tem o Arouca do Keirrison —, mas alguns artigos não têm
 *       o campo e a carreira fica só na prosa (o do Džeko, por exemplo).
 *   tm  Transfermarkt. A mais completa das três, inclusive em passagem curta
 *       e fim de carreira. Depende de o WAF deixar passar.
 *
 * O relatório conta quantas fontes confirmam cada clube. Um clube nosso que
 * nenhuma das três tem é forte candidato a erro; um que duas têm e a terceira
 * não é lacuna da terceira, não erro nosso. É a diferença que faltava na
 * primeira rodada, quando eu chamei o Grêmio do Elkeson de clube inventado
 * baseado só no Wikidata — e estava errado.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JOGADORES } from '../src/dados/jogadores.ts'
import { CLUBE_POR_ID } from '../src/dados/clubes.ts'
import { consultar, buscar, qidDe } from './wikidata.mjs'
import { mesmoClube } from './nomes-clube.mjs'
import { carreiraDaWikipedia } from './wikipedia-carreira.mjs'
import { idsDoTransfermarkt, carreiraDoTransfermarkt } from './transfermarkt.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO_CACHE = join(raiz, 'scripts', 'jogadores-wikidata.json')
const ARQUIVO_RELATORIO = join(raiz, 'scripts', 'relatorio-carreiras.json')

const argumentos = process.argv.slice(2)
const comoJson = argumentos.includes('--json')
const alvos = argumentos.filter((a) => !a.startsWith('-'))
const lista = alvos.length ? JOGADORES.filter((j) => alvos.includes(j.id)) : JOGADORES

const log = (...a) => { if (!comoJson) console.log(...a) }

// ------------------------------------------------------- resolução de QID
const cache = existsSync(ARQUIVO_CACHE) ? JSON.parse(readFileSync(ARQUIVO_CACHE, 'utf8')) : {}

/**
 * O QID sai do id do Transfermarkt que a `fonte` de cada jogador já traz, e
 * não de busca por nome. Pelo nome, "Jorginho" virava o Jorginho do Chelsea,
 * "Adriano" o Imperador e "Alisson" outro Alisson: um terço das divergências
 * que esta conferência apontava era comparação com a pessoa errada.
 */
const tmPorQid = JSON.parse(readFileSync(join(raiz, 'scripts/tm-jogadores.json'), 'utf8'))
const qidPorTm = new Map(Object.entries(tmPorQid).map(([qid, tm]) => [String(tm), qid]))

async function qidDoJogador(jogador) {
  const peloTm = qidPorTm.get(jogador.fonte?.match(/spieler\/(\d+)/)?.[1])
  if (peloTm) {
    cache[jogador.id] = { ...cache[jogador.id], qid: peloTm, termo: 'id do Transfermarkt' }
    return peloTm
  }
  // sem id do Transfermarkt na fonte: a busca por nome é o último recurso, e pode errar de pessoa
  log(`         aviso: ${jogador.id} sem id do Transfermarkt; buscando pelo nome`)
  if (cache[jogador.id]?.qid) return cache[jogador.id].qid
  for (const termo of [jogador.nome, ...jogador.apelidos]) {
    for (const idioma of ['pt', 'en']) {
      const candidatos = await buscar(termo, { idioma })
      for (const c of candidatos) {
        const consulta = await consultar(
          `SELECT ?p WHERE { wd:${c.qid} wdt:P31 wd:Q5 ; p:P54 ?p } LIMIT 1`,
        ).catch(() => [])
        if (!consulta.length) continue
        cache[jogador.id] = { qid: c.qid, rotulo: c.rotulo, descricao: c.descricao, termo }
        log(`         resolvido: ${c.qid} "${c.rotulo}" (${c.descricao}) via "${termo}"`)
        return c.qid
      }
    }
  }
  return null
}

// --------------------------------------------------------- carreira na fonte
/**
 * P54 traz também seleções e categorias de base. O filtro tira as seleções
 * pela classe e a base pelo qualificador; o que sobra é clube profissional.
 */
/** Título do artigo em português, para a camada da Wikipédia. */
async function artigoDe(qid) {
  const linhas = await consultar(`
    SELECT ?artigo WHERE {
      ?artigo schema:about wd:${qid} ; schema:isPartOf <https://pt.wikipedia.org/> .
    } LIMIT 1`).catch(() => [])
  if (!linhas.length) return null
  return decodeURIComponent(linhas[0].artigo.split('/wiki/')[1] ?? '').replace(/_/g, ' ')
}

async function carreiraDe(qid) {
  const linhas = await consultar(`
    SELECT ?clube ?clubeLabel ?inicio ?fim WHERE {
      wd:${qid} p:P54 ?s .
      ?s ps:P54 ?clube .
      OPTIONAL { ?s pq:P580 ?inicio }
      OPTIONAL { ?s pq:P582 ?fim }
      FILTER NOT EXISTS { ?clube wdt:P31/wdt:P279* wd:Q6979593 }
      FILTER NOT EXISTS { ?clube wdt:P31/wdt:P279* wd:Q21945604 }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en,es,it,fr,de". }
    } ORDER BY ?inicio ?fim`)

  // categorias de base e equipes reserva: "Barcelona B", "Bayern II", "Castilla"
  const RESERVA = /\b(sub|under|u\d\d?|youth|juvenil|academy|reserves?|castilla)\b|\s(b|c|ii|iii)$/i

  const passagens = linhas
    .filter((l) => !RESERVA.test(l.clubeLabel))
    .map((l) => ({
      qid: qidDe(l.clube),
      nome: l.clubeLabel,
      inicio: l.inicio?.slice(0, 4) ?? '',
      fim: l.fim?.slice(0, 4) ?? '',
    }))

  // empréstimo e renovação viram statements separados: colapsa repetição seguida
  const sequencia = []
  for (const p of passagens) {
    const anterior = sequencia[sequencia.length - 1]
    if (anterior && anterior.qid === p.qid) {
      anterior.fim = p.fim || anterior.fim
      continue
    }
    sequencia.push({ ...p })
  }
  return sequencia
}

// ------------------------------------------------------------------ relatório
const periodo = (p) => (p.inicio || p.fim ? ` (${p.inicio || '?'}–${p.fim || '?'})` : '')

const SIGLAS = { wikidata: 'wd', wikipedia: 'wp', transfermarkt: 'tm' }

/** O id do Transfermarkt vem da própria `fonte`; o Wikidata só cobre quem não tem. */
const idTmDaFonte = (j) => j.fonte?.match(/spieler\/(\d+)/)?.[1] ?? null

const relatorio = []
let conferem = 0

for (const j of lista) {
  const local = j.clubes.map((id) => ({ id, nome: CLUBE_POR_ID.get(id)?.nome ?? id }))
  try {
    const qid = await qidDoJogador(j)
    if (!qid) throw new Error('não achei o jogador no Wikidata')

    if (!cache[j.id].artigo) cache[j.id].artigo = await artigoDe(qid)
    const artigo = cache[j.id].artigo
    const tm = idTmDaFonte(j) ?? (await idsDoTransfermarkt([qid]).catch(() => new Map())).get(qid)

    // as três fontes; null distingue "não consultei / não veio" de "veio vazia"
    const wikidata = await carreiraDe(qid)
    const wikipedia = artigo ? await carreiraDaWikipedia(artigo) : null
    const transfermarkt = tm ? await carreiraDoTransfermarkt(tm) : null

    const fontes = {
      wikidata: wikidata.map((f) => f.nome + periodo(f)),
      wikipedia,
      transfermarkt,
    }
    const nomesDe = { wikidata: wikidata.map((f) => f.nome), wikipedia, transfermarkt }
    const disponiveis = Object.keys(nomesDe).filter((k) => nomesDe[k]?.length)

    if (!disponiveis.length) throw new Error('nenhuma das três fontes respondeu')

    /** Quais fontes confirmam este clube nosso. */
    const confirmamNosso = (nome) =>
      disponiveis.filter((k) => nomesDe[k].some((f) => mesmoClube(nome, f)))

    /** Quais fontes trazem este clube que não temos. */
    const quemTem = (nome) =>
      disponiveis.filter((k) => nomesDe[k].some((f) => mesmoClube(nome, f)))

    const nossos = local.map((l) => ({ nome: l.nome, por: confirmamNosso(l.nome) }))
    const semNenhuma = nossos.filter((n) => !n.por.length)
    const soUma = nossos.filter((n) => n.por.length === 1 && disponiveis.length > 1)

    // clubes que alguma fonte tem e nós não; agrupa nomes equivalentes
    const faltantes = []
    for (const k of disponiveis) {
      for (const f of nomesDe[k]) {
        if (local.some((l) => mesmoClube(l.nome, f))) continue
        const igual = faltantes.find((x) => mesmoClube(x.nome, f))
        if (igual) { if (!igual.por.includes(k)) igual.por.push(k) }
        else faltantes.push({ nome: f, por: [k] })
      }
    }
    faltantes.sort((a, b) => b.por.length - a.por.length)
    const fortes = faltantes.filter((f) => f.por.length >= 2)
    const fracos = faltantes.filter((f) => f.por.length === 1)

    const item = {
      id: j.id, nome: j.nome, qid, tm: tm ?? null, artigo,
      disponiveis, local: local.map((l) => l.nome), fontes,
      nossos, semNenhuma: semNenhuma.map((n) => n.nome), soUma: soUma.map((n) => n.nome),
      fortes, fracos,
    }
    relatorio.push(item)

    const marca = (f) => `${f.nome} [${f.por.map((k) => SIGLAS[k]).join('+')}]`
    if (!fortes.length && !semNenhuma.length) {
      conferem++
      log(`ok       ${j.id}  (${disponiveis.map((k) => SIGLAS[k]).join(' ')})`)
      if (fracos.length) log(`         só uma fonte tem: ${fracos.map(marca).join(', ')}`)
    } else {
      log(`DIVERGE  ${j.id}  wikidata.org/wiki/${qid}${tm ? `  tm/${tm}` : ''}`)
      log(`         nosso dado: ${item.local.join(' > ')}`)
      for (const k of disponiveis) log(`         ${SIGLAS[k]}: ${fontes[k].join(' > ')}`)
      if (fortes.length) log(`         >> FALTA (2+ fontes):  ${fortes.map(marca).join(', ')}`)
      if (fracos.length) log(`         >> falta (1 fonte):    ${fracos.map(marca).join(', ')}`)
      if (semNenhuma.length) log(`         >> NENHUMA FONTE TEM:  ${semNenhuma.map((n) => n.nome).join(', ')}`)
      if (soUma.length) log(`         >> só uma fonte tem:   ${soUma.map((n) => n.nome).join(', ')}`)
    }
  } catch (erro) {
    relatorio.push({ id: j.id, nome: j.nome, erro: erro.message, local: local.map((l) => l.nome) })
    log(`ERRO     ${j.id}: ${erro.message}`)
  }
}

writeFileSync(ARQUIVO_CACHE, JSON.stringify(cache, null, 2) + '\n')
// o relatório sai sempre em JSON também: é o que alimenta a página de revisão
writeFileSync(ARQUIVO_RELATORIO, JSON.stringify(relatorio, null, 1) + '\n')

if (comoJson) {
  console.log(JSON.stringify(relatorio, null, 2))
} else {
  const comErro = relatorio.filter((r) => r.erro).length
  console.log(`\n${conferem}/${lista.length} sem divergência forte  |  ${lista.length - conferem - comErro} divergem  |  ${comErro} com erro`)
  console.log('\nLeitura: [wd] Wikidata, [wp] infobox da Wikipédia, [tm] Transfermarkt.')
  console.log('Clube que NENHUMA fonte tem é candidato a erro nosso.')
  console.log('Clube que só uma fonte tem costuma ser lacuna das outras duas, não erro.')
  console.log('Nada foi alterado. As correções são decisão sua, clube a clube.')
}
