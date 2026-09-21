/**
 * Conserta a biblioteca no lugar, sem gerar um elenco novo.
 *
 *   npm run reparar
 *
 * Faz duas coisas que não deveriam exigir refazer os trezentos, já que cada
 * geração depende do WAF do Transfermarkt liberar e devolve um conjunto
 * diferente:
 *
 * 1. **Re-resolve os clubes de cada carreira** a partir do histórico em cache.
 *    O comparador de nomes já aceitou "West Ham United" como "Western United",
 *    um clube australiano, e o erro ficou gravado na carreira do Mascherano.
 *    Corrigido o comparador, este passo reescreve todas as carreiras.
 *
 * 2. **Recalcula o nível.** O critério anterior era só o número de links de
 *    Wikipédia, que mede fama global e premia quem está em alta agora — foi
 *    assim que Vitor Roque, com pouca seleção e carreira curta, caiu no fácil
 *    ao lado de Pelé. Agora entram também jogos de seleção e tempo de carreira,
 *    que medem estatura e não hype.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mesmoClube, tokensDoNome } from './nomes-clube.mjs'
import { CANONICOS } from './clubes-canonicos.mjs'
import { passagensDoTransfermarkt } from './transfermarkt.mjs'
import { consultar, qidDe } from './wikidata.mjs'
import { visualizacoesDe } from './visualizacoes.mjs'
import { NIVEL_FIXO } from './niveis-fixos.mjs'
import { CARREIRA_FIXA } from './carreiras-corrigidas.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO = join(raiz, 'src/dados/jogadores.ts')

const catalogo = JSON.parse(readFileSync(join(raiz, 'scripts/catalogo-completo.json'), 'utf8'))
const externos = JSON.parse(readFileSync(join(raiz, 'scripts/clubes-externos.json'), 'utf8'))
const fama = JSON.parse(readFileSync(join(raiz, 'scripts/candidatos-jogadores.json'), 'utf8'))
const meta = JSON.parse(readFileSync(join(raiz, 'scripts/meta-jogadores.json'), 'utf8'))
const tmPorQid = JSON.parse(readFileSync(join(raiz, 'scripts/tm-jogadores.json'), 'utf8'))
const selecoes = existsSync(join(raiz, 'scripts/selecoes-jogadores.json'))
  ? JSON.parse(readFileSync(join(raiz, 'scripts/selecoes-jogadores.json'), 'utf8'))
  : {}

const qidPorTm = new Map(Object.entries(tmPorQid).map(([qid, tm]) => [String(tm), qid]))

// ------------------------------------------- visualizações em português
const ARQUIVO_VIEWS = join(raiz, 'scripts/visualizacoes-jogadores.json')
const views = existsSync(ARQUIVO_VIEWS)
  ? JSON.parse(readFileSync(ARQUIVO_VIEWS, 'utf8'))
  : {}

// --------------------------------------------------- resolução de clube
const idPorQid = new Map(catalogo.filter((c) => c.qid).map((c) => [c.qid, c.id]))
const idPorTm = new Map(
  Object.entries(JSON.parse(readFileSync(join(raiz, 'scripts/clubes-transfermarkt.json'), 'utf8'))),
)
for (const c of externos) {
  const tm = c.url?.match(/\/wappen\/head\/(\d+)\.png/)?.[1]
  const nosso = idPorQid.get(c.qid)
  if (tm && nosso && !idPorTm.has(tm)) idPorTm.set(tm, nosso)
}

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

// ------------------------------------------------------------ estatura
/**
 * Quanto o torcedor brasileiro reconhece. Links de Wikipédia medem alcance,
 * mas sozinhos premiam quem está em alta: um garoto de vinte anos em alta
 * acumula links rápido e vira "fácil" ao lado de Pelé. Jogos de seleção e
 * anos de carreira corrigem isso — são estatura acumulada, não hype.
 */
/**
 * Quanto o torcedor brasileiro reconhece o jogador.
 *
 * O peso é quase todo da **mediana de visualizações do artigo em português**,
 * porque é a única medida direta da pergunta do jogo: quanta gente procura
 * esse jogador em português.
 *
 * As versões anteriores erraram sempre do mesmo jeito — somando algo que
 * parecia "mérito" e que acabava punindo quem o torcedor conhece hoje:
 *
 * - número de links de Wikipédia mede alcance global, e o fácil abria com
 *   Darijo Srna e Granit Xhaka;
 * - valor de mercado subiu jovem em evidência junto com jovem consolidado;
 * - jogos de seleção e anos de carreira, com peso alto, empurraram veterano
 *   para cima e derrubaram Vitor Roque e Rodrygo para fora do fácil, embora
 *   sejam o 23º e o 33º em procura entre os trezentos.
 *
 * Jogo de seleção e alcance ficam como desempate de peso pequeno: só decidem
 * entre jogadores de procura parecida, nunca invertem a ordem.
 */
function estatura(qid, artigo) {
  const procura = Number(views[artigo] ?? 0)
  const jogos = Number(selecoes[qid]?.jogos ?? 0)
  const alcance = Number(fama[qid] ?? 0)

  return procura + jogos * 30 + alcance * 5
}

// --------------------------------------------------------------- arquivo
const fonte = readFileSync(ARQUIVO, 'utf8')
const blocos = [...fonte.matchAll(/\{\s*\n\s*id: '([^']+)',[\s\S]*?\n  \},/g)]
console.log(`jogadores no arquivo: ${blocos.length}`)

// título do artigo em português de cada um, para pedir as visualizações
const qidsDoArquivo = [...new Set(blocos.map((b) => qidPorTm.get(b[0].match(/spieler\/(\d+)/)?.[1])).filter(Boolean))]
const artigoPorQid = new Map()
for (let i = 0; i < qidsDoArquivo.length; i += 150) {
  const lote = qidsDoArquivo.slice(i, i + 150).map((q) => `wd:${q}`).join(' ')
  const linhas = await consultar(`
    SELECT ?j ?artigo WHERE {
      VALUES ?j { ${lote} }
      ?artigo schema:about ?j ; schema:isPartOf <https://pt.wikipedia.org/> .
    }`).catch(() => [])
  for (const l of linhas) {
    artigoPorQid.set(qidDe(l.j), decodeURIComponent(l.artigo.split('/wiki/')[1] ?? '').replace(/_/g, ' '))
  }
}

const faltamViews = [...artigoPorQid.values()].filter((a) => !(a in views))
if (faltamViews.length) {
  console.log(`buscando visualizações de ${faltamViews.length} artigos (devagar, a API limita)...`)
  for (const [a, v] of await visualizacoesDe(faltamViews)) views[a] = v
  writeFileSync(ARQUIVO_VIEWS, JSON.stringify(views) + '\n')
}

const jogadores = []
let carreirasMudadas = 0
const trocas = []
/**
 * Carreira que não pôde ser reresolvida porque um clube não tem id.
 *
 * Precisa aparecer no relatório. Enquanto ficava em silêncio, o Chicharito
 * passou semanas com o escudo do Western United, da Austrália, no lugar do
 * West Ham: a correção do mapa existia, mas a carreira dele estava congelada
 * por outro clube irresolúvel e nunca era reescrita. Uma resolução que falha
 * calada é pior que uma que falha alto.
 */
const congeladas = new Map()

for (const b of blocos) {
  const texto = b[0]
  const tm = texto.match(/spieler\/(\d+)/)?.[1] ?? null
  const qid = qidPorTm.get(tm)
  const antes = [...(texto.match(/clubes: \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1])

  const passagens = tm ? await passagensDoTransfermarkt(tm) : null
  let clubes = antes

  /**
   * Correção à mão vence o Transfermarkt e encerra o assunto: o resto do
   * laço nem roda para esse jogador. O Fabão tinha uma passagem que só o
   * Transfermarkt registra, e reresolver a carreira dele a partir de lá
   * traria o erro de volta toda vez.
   */
  const corrigida = CARREIRA_FIXA[b[1]]
  if (corrigida) {
    if (corrigida.clubes.join() !== antes.join()) carreirasMudadas++
    jogadores.push({
      texto, clubes: corrigida.clubes, id: b[1],
      pontos: estatura(qid, artigoPorQid.get(qid) ?? ''),
    })
    continue
  }

  if (passagens) {
    const novos = []
    let falhou = false
    for (const p of passagens) {
      const id = resolverClube(p)
      if (!id) {
        falhou = true
        congeladas.set(p.nome, (congeladas.get(p.nome) ?? 0) + 1)
        break
      }
      if (novos[novos.length - 1] !== id) novos.push(id)
    }
    // só troca quando a resolução nova está completa; carreira com buraco fica como está
    if (!falhou && novos.length >= 2) {
      if (novos.join() !== antes.join()) {
        carreirasMudadas++
        for (const [i, id] of novos.entries()) {
          if (antes[i] && antes[i] !== id) trocas.push(`${antes[i]} -> ${id}`)
        }
      }
      clubes = novos
    }
  }

  const id = b[1]
  jogadores.push({ texto, clubes, id, pontos: estatura(qid, artigoPorQid.get(qid) ?? '') })
}

// ----------------------------------------------------------------- níveis
const NIVEIS = ['facil', 'intermediario', 'dificil']
const porNivel = Math.ceil(jogadores.length / 3)
jogadores.sort((a, b) => b.pontos - a.pontos)

let novoTexto = fonte
let nivelMudado = 0

for (const [i, j] of jogadores.entries()) {
  // o cálculo propõe; NIVEL_FIXO dispõe
  const nivel = NIVEL_FIXO[j.id] ?? NIVEIS[Math.min(2, Math.floor(i / porNivel))]
  const nivelAntigo = j.texto.match(/nivel: '([^']+)'/)?.[1]
  if (nivel !== nivelAntigo) nivelMudado++

  const atualizado = j.texto
    .replace(/nivel: '[^']+'/, `nivel: '${nivel}'`)
    .replace(/clubes: \[[^\]]*\]/, `clubes: [${j.clubes.map((c) => `'${c}'`).join(', ')}]`)

  novoTexto = novoTexto.replace(j.texto, atualizado)
}

writeFileSync(ARQUIVO, novoTexto)

console.log(`\n${carreirasMudadas} carreiras tiveram clube corrigido`)
const contagem = new Map()
for (const t of trocas) contagem.set(t, (contagem.get(t) ?? 0) + 1)
for (const [t, n] of [...contagem].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
  console.log(`  ${String(n).padStart(3)}x  ${t}`)
}
/**
 * Carreira congelada não é ruído: é dado velho que o reparo não alcança.
 * O conserto é acrescentar o par `id do Transfermarkt -> id do catálogo` em
 * scripts/clubes-transfermarkt.json e rodar de novo.
 */
if (congeladas.size) {
  const total = [...congeladas.values()].reduce((a, b) => a + b, 0)
  console.log(`\n${total} carreiras NÃO foram reresolvidas: um clube sem id trava a carreira inteira`)
  for (const [nome, n] of [...congeladas].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}x  ${nome}`)
  }
  console.log('  conserto: acrescente o par em scripts/clubes-transfermarkt.json')
}

console.log(`\n${nivelMudado} jogadores mudaram de nível`)
const fixados = jogadores.filter((j) => j.id in NIVEL_FIXO).length
if (fixados) console.log(`  ${fixados} com nível decidido à mão em niveis-fixos.mjs`)
