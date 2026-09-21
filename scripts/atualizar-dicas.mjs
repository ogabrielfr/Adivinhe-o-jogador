/**
 * Refaz a dica de todos os jogadores sem mexer no elenco.
 *
 *   npm run dicas
 *
 * Existe separado do gerador porque trocar a dica não deveria custar um elenco
 * novo: a montagem depende do WAF do Transfermarkt liberar, e cada execução
 * devolve um conjunto de jogadores um pouco diferente. Aqui os trezentos ficam
 * como estão e só o texto muda.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe } from './wikidata.mjs'
import { historicoDoTransfermarkt, perfilDoTransfermarkt } from './transfermarkt.mjs'
import { montarDicas, fatosDoHistorico, papelConhecido, escalaDosFatos, naturalidadeSegura } from './dicas.mjs'
import { torneiosDe, torneiosQueContam } from './torneios.mjs'
import { latinizar } from '../src/logica/texto.ts'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO = join(raiz, 'src/dados/jogadores.ts')
const ARQUIVO_SELECAO = join(raiz, 'scripts/selecoes-jogadores.json')

// ------------------------------------------------- jogadores do arquivo atual
const fonte = readFileSync(ARQUIVO, 'utf8')
const blocos = [...fonte.matchAll(/\{\s*\n\s*id: '([^']+)',[\s\S]*?\n  \},/g)]
console.log(`jogadores no arquivo: ${blocos.length}`)

const tmDoBloco = (b) => b[0].match(/spieler\/(\d+)/)?.[1] ?? null
const paisesDoBloco = (b) => b[0].match(/clubes: \[([^\]]*)\]/)?.[1] ?? ''
const clubesDoBloco = (b) => [...paisesDoBloco(b).matchAll(/'([^']+)'/g)].map((m) => m[1])

// ------------------------------------------------------ do id do TM ao QID
const tmPorQid = JSON.parse(readFileSync(join(raiz, 'scripts/tm-jogadores.json'), 'utf8'))
const qidPorTm = new Map(Object.entries(tmPorQid).map(([qid, tm]) => [String(tm), qid]))

const meta = JSON.parse(readFileSync(join(raiz, 'scripts/meta-jogadores.json'), 'utf8'))
const catalogo = JSON.parse(readFileSync(join(raiz, 'scripts/catalogo-completo.json'), 'utf8'))
const paisDoClube = new Map(catalogo.map((c) => [c.id, c.pais]))
const nomeDoClube = new Map(catalogo.map((c) => [c.id, c.nome]))

// --------------------------------------------- jogos pela seleção principal
/**
 * Categoria de base não conta: o interesse está na seleção principal, e
 * "7 jogos pelo sub-20" não leva ninguém a lugar nenhum.
 */
const selecoes = existsSync(ARQUIVO_SELECAO)
  ? JSON.parse(readFileSync(ARQUIVO_SELECAO, 'utf8'))
  : {}

const qidsFaltando = [...new Set(blocos.map((b) => qidPorTm.get(tmDoBloco(b))).filter(Boolean))]
  .filter((q) => !(q in selecoes))

if (qidsFaltando.length) {
  console.log(`buscando jogos de seleção de ${qidsFaltando.length}...`)
  for (let i = 0; i < qidsFaltando.length; i += 120) {
    const lote = qidsFaltando.slice(i, i + 120).map((q) => `wd:${q}`).join(' ')
    const linhas = await consultar(`
      SELECT ?j ?selLabel ?jogos WHERE {
        VALUES ?j { ${lote} }
        ?j p:P54 ?s . ?s ps:P54 ?sel .
        ?sel wdt:P31/wdt:P279* wd:Q6979593 .
        OPTIONAL { ?s pq:P1350 ?jogos }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en". }
      }`).catch(() => [])
    for (const l of linhas) {
      const q = qidDe(l.j)
      if (/sub-?\d|u-?\d\d|olímpic|olimpic|feminin/i.test(l.selLabel)) continue
      const jogos = Number(l.jogos ?? 0)
      const atual = selecoes[q]
      if (!atual || jogos > atual.jogos) selecoes[q] = { selecao: l.selLabel, jogos }
    }
    for (const q of qidsFaltando.slice(i, i + 120)) selecoes[q] ??= { selecao: null, jogos: 0 }
  }
  writeFileSync(ARQUIVO_SELECAO, JSON.stringify(selecoes) + '\n')
}

// ------------------------------------------------------- torneios disputados
/**
 * Copa do Mundo é o fato mais forte da biblioteca para a segunda dica. Vem do
 * Wikidata e fica em cache, porque consulta perdida faria o jogador parecer
 * que nunca jogou torneio nenhum.
 */
const torneios = await torneiosDe(blocos.map((b) => qidPorTm.get(tmDoBloco(b))).filter(Boolean))

// --------------------------------------------------------------- montagem
let novoTexto = fonte
let semFato = 0
let semPerfil = 0
let renomeados = 0
/** Posições que o mapa não conhece; é por onde ampliá-lo. */
const posicoesSoltas = new Map()
const dicas = new Map()

/**
 * Primeira passada: os dados de todo mundo. A dica de um jogador depende do
 * que os outros 299 têm — um fato só vale a pena quando o número dele é raro
 * na biblioteca —, então nada pode ser escrito antes de ler todos.
 */
const coletado = []
for (const b of blocos) {
  const tm = tmDoBloco(b)
  const qid = qidPorTm.get(tm)
  const m = meta[qid] ?? {}
  const sel = selecoes[qid] ?? { selecao: null, jogos: 0 }

  /**
   * Posição e nacionalidade saem do Transfermarkt, que guarda um valor só.
   * O Wikidata aceita vários e escolher o primeiro dava erro visível: o Zico
   * saía "nascido em Portugal" na mesma frase que citava a seleção brasileira.
   */
  const perfil = tm ? await perfilDoTransfermarkt(tm) : null
  if (!perfil?.posicao) semPerfil++
  const historico = tm ? await historicoDoTransfermarkt(tm) : null
  const fatos = fatosDoHistorico(historico?.transfers ?? [])
  const idsDeClube = clubesDoBloco(b)
  const paises = new Set(idsDeClube.map((x) => paisDoClube.get(x))).size

  coletado.push({
    bloco: b,
    perfil,
    dados: {
      ...m,
      posicao: perfil?.posicao ?? m.posicao,
      pais: perfil?.nacionalidade ?? m.pais,
      jogosSelecao: sel.jogos, selecao: sel.selecao, fatos, paises,
      naturalidade: naturalidadeSegura(
        perfil?.naturalidade,
        idsDeClube.map((id) => nomeDoClube.get(id)).filter(Boolean),
        b[0].match(/nome: "((?:[^"\\]|\\.)*)"/)?.[1] ?? '',
      ),
      torneios: torneiosQueContam(torneios[qid] ?? []),
    },
  })
}

const escala = escalaDosFatos(coletado.map((c) => c.dados))

// ------------------------------------- segunda passada: escrever cada dica
for (const { bloco: b, perfil, dados } of coletado) {
  const id = b[1]

  const par = montarDicas(dados, escala)
  // dica repetida não é dica; a segunda é a que precisa distinguir
  if (dicas.has(par[1])) semFato++
  dicas.set(par[1], id)

  if (perfil?.posicao && !papelConhecido(perfil.posicao)) {
    posicoesSoltas.set(perfil.posicao, (posicoesSoltas.get(perfil.posicao) ?? 0) + 1)
  }

  const antigo = b[0]
  const escritas = `dicas: [${par.map((d) => JSON.stringify(d)).join(', ')}]`
  let atualizado = antigo.replace(/dicas?: (?:\[[^\]]*\]|"(?:[^"\\]|\\.)*")/, escritas)

  /**
   * O nome da camisa vira o nome canônico quando é mais curto que o de
   * registro: ninguém digita "Paulo Henrique Sampaio Filho". O nome antigo
   * continua valendo como palpite, porque quem souber o nome completo também
   * tem que acertar.
   */
  const nomeAtual = antigo.match(/nome: "((?:[^"\\]|\\.)*)"/)?.[1]
  // sósia grego ou cirílico vira letra latina antes de virar nome na tela
  const nomeTm = perfil?.nome ? latinizar(perfil.nome) : null
  if (nomeTm && nomeAtual && nomeTm !== nomeAtual &&
      nomeTm.split(' ').length < nomeAtual.split(' ').length) {
    const apelidos = new Set([nomeAtual.toLowerCase(), nomeTm.toLowerCase()])
    atualizado = atualizado
      .replace(/nome: "(?:[^"\\]|\\.)*"/, `nome: ${JSON.stringify(nomeTm)}`)
      .replace(/apelidos: \[[^\]]*\]/, `apelidos: [${[...apelidos].map((a) => JSON.stringify(a)).join(', ')}]`)
    renomeados++
  }

  novoTexto = novoTexto.replace(antigo, atualizado)
}

writeFileSync(ARQUIVO, novoTexto)

const distintas = new Set(dicas.keys()).size
console.log(`\n${distintas} segundas dicas distintas para ${blocos.length} jogadores`)
if (semFato) console.log(`  ${semFato} continuam repetidas: faltam fatos para separá-las`)
if (semPerfil) console.log(`  ${semPerfil} sem posição no Transfermarkt`)
console.log(`${renomeados} passaram a usar o nome da camisa em vez do de registro`)
if (posicoesSoltas.size) {
  console.log('\nposições que o mapa não conhece:')
  for (const [pos, n] of [...posicoesSoltas].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}x  ${pos}`)
  }
}
