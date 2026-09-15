/**
 * Confere a carreira de cada jogador contra o Wikidata e aponta as
 * divergências. NÃO altera os dados — quem decide é você, olhando o relatório.
 *
 *   npm run verificar                 # todos
 *   npm run verificar -- dzeko pato   # só esses
 *   npm run verificar -- --json       # saída para processar
 *
 * A fonte é o Wikidata (ver scripts/wikidata.mjs para o porquê de não ser o
 * Ogol). A carreira vem da propriedade P54 "membro de equipe desportiva", com
 * os qualificadores P580/P582 de início e fim dando a ordem cronológica.
 *
 * LIMITE IMPORTANTE: o Wikidata é incompleto no fim de carreira e em clubes
 * pequenos. "não tem na fonte" significa *não confirmado*, nunca "está errado".
 * Só remova um clube com uma segunda fonte na mão.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JOGADORES } from '../src/dados/jogadores.ts'
import { CLUBE_POR_ID } from '../src/dados/clubes.ts'
import { consultar, buscar, qidDe } from './wikidata.mjs'
import { mesmoClube } from './nomes-clube.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO_CACHE = join(raiz, 'scripts', 'jogadores-wikidata.json')

const argumentos = process.argv.slice(2)
const comoJson = argumentos.includes('--json')
const alvos = argumentos.filter((a) => !a.startsWith('-'))
const lista = alvos.length ? JOGADORES.filter((j) => alvos.includes(j.id)) : JOGADORES

const log = (...a) => { if (!comoJson) console.log(...a) }

// ------------------------------------------------------- resolução de QID
const cache = existsSync(ARQUIVO_CACHE) ? JSON.parse(readFileSync(ARQUIVO_CACHE, 'utf8')) : {}

async function qidDoJogador(jogador) {
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

const relatorio = []
let conferem = 0

for (const j of lista) {
  const local = j.clubes.map((id) => ({ id, nome: CLUBE_POR_ID.get(id)?.nome ?? id }))
  try {
    const qid = await qidDoJogador(j)
    if (!qid) throw new Error('não achei o jogador no Wikidata')

    const fonte = await carreiraDe(qid)
    if (!fonte.length) throw new Error(`sem carreira registrada em ${qid}`)

    // Para cada clube nosso, em que posições da fonte ele aparece. Um clube
    // ao qual o jogador voltou aparece em mais de uma, e é isso que permite
    // conferir a volta na posição certa.
    const posicoes = local.map((l) =>
      fonte.map((f, i) => (mesmoClube(l.nome, f.nome) ? i : -1)).filter((i) => i >= 0),
    )

    const naoConfirmados = local.filter((_, i) => !posicoes[i].length)
    const usadas = new Set(posicoes.flat())
    const ausentes = fonte.filter((_, i) => !usadas.has(i))

    /**
     * A nossa ordem confere quando ela é uma subsequência da ordem da fonte:
     * percorre os clubes confirmados escolhendo sempre a primeira posição
     * ainda à frente. Se algum não cabe, a cronologia diverge ali.
     */
    const conflitos = []
    let anterior = -1
    let posAnterior = null
    for (let i = 0; i < local.length; i++) {
      if (!posicoes[i].length) continue
      const escolha = posicoes[i].find((p) => p > anterior)
      if (escolha === undefined) {
        conflitos.push({ nome: local[i].nome, depoisDe: posAnterior })
        continue
      }
      anterior = escolha
      posAnterior = fonte[escolha]
    }

    /**
     * Empate de ano não é divergência: quando o jogador assina e é emprestado
     * no mesmo ano, as duas fontes ordenam o par como quiserem. Só conta como
     * problema o conflito entre passagens que começam em anos diferentes.
     */
    const conflitosReais = conflitos.filter((c) => {
      if (!c.depoisDe) return true
      const nosso = fonte.find((f) => mesmoClube(c.nome, f.nome))
      return !nosso?.inicio || !c.depoisDe.inicio || nosso.inicio !== c.depoisDe.inicio
    })
    const ordemDiverge = conflitosReais.length > 0
    const ordemEmpatada = !ordemDiverge && conflitos.length > 0

    const item = {
      id: j.id, nome: j.nome, qid,
      local: local.map((l) => l.nome),
      fonte: fonte.map((f) => f.nome + periodo(f)),
      ausentes: ausentes.map((f) => f.nome + periodo(f)),
      naoConfirmados: naoConfirmados.map((l) => l.nome),
      ordemDiverge,
      ordemEmpatada,
      conflitosDeOrdem: conflitosReais.map((c) => c.nome),
    }
    relatorio.push(item)

    if (!ausentes.length && !naoConfirmados.length && !ordemDiverge) {
      conferem++
      log(`ok       ${j.id}  (${qid})`)
    } else {
      log(`DIVERGE  ${j.id}  https://www.wikidata.org/wiki/${qid}`)
      log(`         nosso dado: ${item.local.join(' > ')}`)
      log(`         wikidata:   ${item.fonte.join(' > ')}`)
      if (ausentes.length) log(`         >> falta no nosso dado:  ${item.ausentes.join(', ')}`)
      if (naoConfirmados.length) log(`         >> não confirmado pela fonte: ${item.naoConfirmados.join(', ')}`)
      if (ordemDiverge) log(`         >> fora de ordem: ${item.conflitosDeOrdem.join(', ')}`)
      if (ordemEmpatada) log(`         (ordem difere só em passagens do mesmo ano — provavelmente ok)`)
    }
  } catch (erro) {
    relatorio.push({ id: j.id, nome: j.nome, erro: erro.message, local: local.map((l) => l.nome) })
    log(`ERRO     ${j.id}: ${erro.message}`)
  }
}

writeFileSync(ARQUIVO_CACHE, JSON.stringify(cache, null, 2) + '\n')

if (comoJson) {
  console.log(JSON.stringify(relatorio, null, 2))
} else {
  const comErro = relatorio.filter((r) => r.erro).length
  console.log(`\n${conferem}/${lista.length} conferem  |  ${lista.length - conferem - comErro} divergem  |  ${comErro} com erro`)
  console.log('\nLembre: "não confirmado" é lacuna do Wikidata com frequência, não erro nosso.')
  console.log('Nada foi alterado. As correções são decisão sua, clube a clube.')
}
