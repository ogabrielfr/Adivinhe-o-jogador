/**
 * Monta a biblioteca (src/dados/jogadores.json) com a carreira vinda do Transfermarkt.
 *
 *   npm run biblioteca              # 100 por nível
 *   npm run biblioteca -- 20        # menos, para testar rápido
 *
 * A carreira NÃO é escrita de memória: cada clube sai do histórico de
 * transferências do Transfermarkt, na ordem em que aconteceu. Foi o erro que
 * originou todo o trabalho de conferência — carreira de memória do modelo tem
 * erro, e multiplicar por trezentos multiplicaria o erro.
 *
 * ## Como um clube do Transfermarkt vira um id do nosso catálogo
 *
 * Pelo resolvedor de `resolver-clube.mjs`, o mesmo do reparo e da reposição:
 * por id do Transfermarkt quando o mapa conhece, e por nome só com país e
 * época conferidos. Jogador com qualquer passagem travada fica de fora — o
 * escudo é a informação principal do jogo, e carreira com buraco não serve.
 *
 * ## A dica
 *
 * Sai de atributo estruturado — posição, nacionalidade, década de estreia,
 * quantos países — e nunca de texto gerado. Uma dica inventada é a mesma
 * classe de erro que a carreira inventada, só que mais difícil de conferir.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe } from './wikidata.mjs'
import { montarDicas, fatosDoHistorico, naturalidadeSegura } from './dicas.mjs'
import { torneiosDe, torneiosQueContam } from './torneios.mjs'
import {
  passagensDoTransfermarkt, idsDoTransfermarkt,
  historicoDoTransfermarkt, perfilDoTransfermarkt, jogosPorClube,
} from './transfermarkt.mjs'
import { gravarBiblioteca, lerBiblioteca, idTmDe } from './biblioteca.mjs'
import { criarResolvedor } from './resolver-clube.mjs'
import { numeroDoDia, origemDaPosicao, posicaoDoDia, semente } from '../src/logica/sorteio.ts'
import { latinizar } from '../src/logica/texto.ts'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const POR_NIVEL = Number(process.argv[2]) || 100

const resolvedor = criarResolvedor()
// as bandeiras conhecidas antes de resolver por nome: as da biblioteca atual, que estão em cache
const atuais = []
for (const j of lerBiblioteca()) atuais.push(await passagensDoTransfermarkt(idTmDe(j)))
resolvedor.aquecer(atuais)
const paisDoClube = (id) => resolvedor.paisDoClube(id)
const nomeDoClube = (id) => resolvedor.nomeDoClube(id)

// ------------------------------------------------------------- candidatos
/**
 * Duas piscinas de candidatos: os mais conhecidos do mundo e quem passou pelo
 * futebol brasileiro. A segunda existe porque o jogo é para o torcedor
 * brasileiro, e um ranking global de fama não traz Keirrison nem Lucas Lima.
 *
 * O resultado fica em cache no repositório porque as duas consultas são
 * pesadas — varrem todo jogador de futebol do Wikidata — e o endpoint público
 * responde 502 quando insiste. Apague o arquivo para refazer.
 */
const ARQUIVO_CANDIDATOS = join(raiz, 'scripts/candidatos-jogadores.json')
const CONSULTA = (filtro, minimo, limite) => `
  SELECT DISTINCT ?j ?n WHERE {
    ?j wdt:P2446 ?tm ; wikibase:sitelinks ?n .
    ${filtro}
    FILTER(?n >= ${minimo})
  } ORDER BY DESC(?n) LIMIT ${limite}`

const fama = new Map()
if (existsSync(ARQUIVO_CANDIDATOS)) {
  for (const [q, n] of Object.entries(JSON.parse(readFileSync(ARQUIVO_CANDIDATOS, 'utf8')))) {
    fama.set(q, Number(n))
  }
  console.log(`candidatos do cache: ${fama.size}`)
} else {
  console.log('buscando candidatos no Wikidata (demora; fica em cache depois)...')
  // em série: as duas juntas derrubam o endpoint com 502
  const mundo = await consultar(CONSULTA('?j wdt:P106 wd:Q937857 .', 40, 900))
  const brasil = await consultar(CONSULTA('?j wdt:P54 ?clube . ?clube wdt:P17 wd:Q155 .', 12, 900))
  for (const l of [...mundo, ...brasil]) {
    fama.set(qidDe(l.j), Math.max(Number(l.n), fama.get(qidDe(l.j)) ?? 0))
  }
  writeFileSync(ARQUIVO_CANDIDATOS, JSON.stringify(Object.fromEntries(fama), null, 0) + '\n')
}

/**
 * Jogadores que entram na biblioteca independentemente de fama. O corte por
 * número de links de Wikipédia é bom para ordenar, mas deixa de fora nomes que
 * o torcedor brasileiro reconhece na hora — e são justamente os que o cliente
 * quer ver no jogo. Vão na frente da fila para não dependerem de sobrar vaga.
 */
const OBRIGATORIOS = {
  Q15207061: 'Lucas Lima',
  // ídolos que o corte por fama global deixava de fora, e que o WAF do
  // Transfermarkt às vezes derruba por azar de requisição — indo na frente da
  // fila, são tentados antes de o limite apertar
  Q12897: 'Pelé',
  Q178649: 'Romário',
  Q483577: 'Rivaldo',
  Q47526: 'Zico',
  Q204825: 'Bebeto',
  Q312895: 'Raí',
}
const LUCAS_LIMA = 'Q15207061'

/**
 * Número de links de Wikipédia mede fama global, e o jogo é para o torcedor
 * brasileiro — sem correção, o nível fácil enche de nome que o mundo conhece e
 * o Brasil não. O peso empurra brasileiro e quem passou pelo futebol
 * brasileiro para cima; continua sendo aproximação, não julgamento editorial.
 */
const PESO_BRASILEIRO = 2.5
const PESO_JOGOU_NO_BRASIL = 1.8

const famaCorrigida = (qid, jogouNoBrasil = false) => {
  const base = fama.get(qid) ?? 0
  if (meta.get(qid)?.pais === 'Brasil') return base * PESO_BRASILEIRO
  return jogouNoBrasil ? base * PESO_JOGOU_NO_BRASIL : base
}

// ------------------------------------------------- metadados para nome e dica
/** Lista crua, só para saber de quem buscar dado; a ordem vem depois. */
const todosQids = [...new Set([...Object.keys(OBRIGATORIOS), ...fama.keys()])]

const ARQUIVO_META = join(raiz, 'scripts/meta-jogadores.json')
const meta = new Map()
if (existsSync(ARQUIVO_META)) {
  for (const [q, m] of Object.entries(JSON.parse(readFileSync(ARQUIVO_META, 'utf8')))) meta.set(q, m)
  console.log(`metadados do cache: ${meta.size}`)
}

const faltaMeta = todosQids.filter((q) => !meta.has(q))
if (faltaMeta.length) console.log(`buscando nome, posição e nacionalidade de ${faltaMeta.length}...`)
for (let i = 0; i < faltaMeta.length; i += 150) {
  const lote = faltaMeta.slice(i, i + 150).map((q) => `wd:${q}`).join(' ')
  const linhas = await consultar(`
    SELECT ?j ?jLabel ?posLabel ?paisLabel ?nasc WHERE {
      VALUES ?j { ${lote} }
      OPTIONAL { ?j wdt:P413 ?pos }
      OPTIONAL { ?j wdt:P27 ?pais }
      OPTIONAL { ?j wdt:P569 ?nasc }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en". }
    }`).catch(() => [])
  for (const l of linhas) {
    const q = qidDe(l.j)
    const m = meta.get(q) ?? {}
    m.nome ??= l.jLabel
    m.posicao ??= l.posLabel
    m.pais ??= l.paisLabel
    m.nasc ??= l.nasc?.slice(0, 4)
    meta.set(q, m)
  }
}
if (faltaMeta.length) writeFileSync(ARQUIVO_META, JSON.stringify(Object.fromEntries(meta)) + '\n')

// ---------------------------------------------------------------- dica
/** Apelidos previsíveis; o jogo já aceita a primeira e a última palavra do nome. */
function apelidosDe(nome) {
  const limpo = nome.replace(/\s+/g, ' ').trim()
  const partes = limpo.split(' ')
  const saida = new Set([limpo.toLowerCase()])
  if (partes.length > 2) saida.add(`${partes[0]} ${partes[partes.length - 1]}`.toLowerCase())
  return [...saida]
}

const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// ------------------------------------------------------------- montagem
const ARQUIVO_TM = join(raiz, 'scripts/tm-jogadores.json')
const tmPorQid = new Map()
if (existsSync(ARQUIVO_TM)) {
  for (const [q, tm] of Object.entries(JSON.parse(readFileSync(ARQUIVO_TM, 'utf8')))) tmPorQid.set(q, tm)
}
const faltaTm = todosQids.filter((q) => !tmPorQid.has(q))
if (faltaTm.length) {
  console.log(`buscando o id do Transfermarkt de ${faltaTm.length}...`)
  for (let i = 0; i < faltaTm.length; i += 200) {
    const m = await idsDoTransfermarkt(faltaTm.slice(i, i + 200)).catch(() => new Map())
    for (const [q, tm] of m) tmPorQid.set(q, tm)
  }
  writeFileSync(ARQUIVO_TM, JSON.stringify(Object.fromEntries(tmPorQid)) + '\n')
}
console.log(`  ${tmPorQid.size} com id do Transfermarkt`)

/**
 * Só agora dá para ordenar: o peso depende da nacionalidade, que vem dos
 * metadados. Obrigatórios vão na frente da fila, fora do ranking.
 */
const candidatos = [
  ...Object.keys(OBRIGATORIOS),
  ...todosQids
    .filter((q) => !(q in OBRIGATORIOS))
    .sort((a, b) => famaCorrigida(b) - famaCorrigida(a)),
]
console.log(`  ${candidatos.length} candidatos, ordenados por reconhecimento no Brasil`)

const NIVEIS = ['facil', 'intermediario', 'dificil']
const ALVO = POR_NIVEL * 3
const recusas = { semTm: 0, semNome: 0, semCarreira: 0, tamanho: 0, clubeNaoResolvido: 0, repetido: 0 }
/** Quais clubes derrubam mais jogadores — é por onde vale melhorar o catálogo. */
const naoResolvidos = new Map()
const aceitos = []
const idsUsados = new Set()

/**
 * Cada jogador custa uma ida ao Transfermarkt, e a maioria dos candidatos é
 * recusada — sem id, com clube que não dá para resolver, com carreira curta
 * demais. Em série isso levaria horas para trezentos aceitos. Seis por vez é o
 * que o WAF tolera sem começar a devolver a página de verificação.
 */
const PARALELOS = 6
let proximo = 0

console.log(`\nmontando ${ALVO} jogadores a partir do Transfermarkt...`)

async function trabalhador() {
  while (aceitos.length < ALVO && proximo < candidatos.length) {
    const qid = candidatos[proximo++]

    const tm = tmPorQid.get(qid)
    if (!tm) { recusas.semTm++; continue }

    const dados = meta.get(qid) ?? {}
    if (!dados.nome || /^Q\d+$/.test(dados.nome)) { recusas.semNome++; continue }

    const passagens = await passagensDoTransfermarkt(tm)
    if (!passagens) { recusas.semCarreira++; continue }

    const { clubes, travas } = resolvedor.montarCarreira(passagens, { nasc: dados.nasc, jogos: await jogosPorClube(tm) })
    if (travas.length) {
      for (const t of travas) naoResolvidos.set(t.nome, (naoResolvidos.get(t.nome) ?? 0) + 1)
      recusas.clubeNaoResolvido++
      continue
    }

    /**
     * Um escudo só não é charada. Não há teto: o cliente pediu todos os
     * escudos, porque carreira longa e confusa é a graça do jogo — o de doze
     * deixava Romário, Rivaldo e Bebeto de fora.
     */
    if (clubes.length < 2) { recusas.tamanho++; continue }

    /**
     * O nome da camisa vem do Transfermarkt e vale mais que o rótulo do
     * Wikidata, que costuma ser o nome de registro: ninguém digita "Paulo
     * Henrique Sampaio Filho". O de registro continua valendo como palpite.
     */
    const perfil = await perfilDoTransfermarkt(tm)
    // o Transfermarkt já mandou "Arda Güler" com alfa grego no lugar do A
    const nome = latinizar(
      perfil?.nome && perfil.nome.split(' ').length < dados.nome.split(' ').length
        ? perfil.nome
        : dados.nome,
    )

    const id = slug(nome)
    if (idsUsados.has(id)) { recusas.repetido++; continue }
    idsUsados.add(id)

    const historico = await historicoDoTransfermarkt(tm)
    const paises = new Set(clubes.map((c) => paisDoClube(c))).size

    aceitos.push({
      id,
      nome,
      apelidos: [...new Set([nome, dados.nome, ...apelidosDe(dados.nome)].map((n) => n.toLowerCase()))],
      clubes,
      dicas: montarDicas({
        ...dados,
        posicao: perfil?.posicao ?? dados.posicao,
        pais: perfil?.nacionalidade ?? dados.pais,
        fatos: fatosDoHistorico(historico?.transfers ?? []),
        paises,
        naturalidade: naturalidadeSegura(
          perfil?.naturalidade,
          clubes.map((c) => nomeDoClube(c)).filter(Boolean),
          nome,
        ),
        torneios: torneiosQueContam((await torneiosDe([qid]))[qid] ?? []),
      }),
      fama: famaCorrigida(qid, clubes.some((c) => paisDoClube(c) === 'BR')),
      qid, tm, obrigatorio: qid in OBRIGATORIOS,
    })
    if (aceitos.length % 25 === 0) console.log(`  ${aceitos.length}/${ALVO}`)
  }
}

await Promise.all(Array.from({ length: PARALELOS }, trabalhador))

// ------------------------------------------------------------- níveis
/**
 * O nível sai do número de links de Wikipédia, que é o melhor proxy de
 * reconhecimento que dá para calcular. É aproximação, não julgamento
 * editorial: quem for revisar deve mexer à mão onde discordar.
 */
aceitos.sort((a, b) => b.fama - a.fama)
const porNivel = { facil: [], intermediario: [], dificil: [] }
aceitos.forEach((j, i) => porNivel[NIVEIS[Math.min(2, Math.floor(i / POR_NIVEL))]].push(j))

/**
 * Põe um jogador no sorteio de hoje, para dar como testar sem esperar a data
 * chegar. O sorteio embaralha a lista do nível com semente fixa, e essa
 * permutação não depende do conteúdo — então basta descobrir qual posição da
 * lista de origem sai hoje e colocar o jogador ali.
 */
function escalarParaHoje(qidAlvo) {
  const dia = numeroDoDia()
  for (const nivel of NIVEIS) {
    const lista = porNivel[nivel]
    const i = lista.findIndex((j) => j.qid === qidAlvo)
    if (i < 0) continue

    const { posicao, ciclo } = posicaoDoDia(dia, lista.length)
    const origem = origemDaPosicao(lista.length, semente(`${nivel}:${ciclo}`), posicao)
    ;[lista[i], lista[origem]] = [lista[origem], lista[i]]
    console.log(`  "${lista[origem].nome}" escalado para hoje no ${nivel}`)
    return true
  }
  console.log(`  aviso: ${qidAlvo} não entrou na biblioteca; não dá para escalar`)
  return false
}

escalarParaHoje(LUCAS_LIMA)

// ------------------------------------------------------------- gravação
gravarBiblioteca(NIVEIS.flatMap((nivel) => porNivel[nivel].map((j) => ({
  id: j.id,
  nome: j.nome,
  apelidos: j.apelidos,
  nivel,
  clubes: j.clubes,
  dicas: j.dicas,
  verificado: true,
  fonte: `https://www.transfermarkt.com.br/-/transfers/spieler/${j.tm}`,
}))))

console.log(`\n${aceitos.length} jogadores: ` +
  NIVEIS.map((n) => `${n} ${porNivel[n].length}`).join(' | '))
console.log('recusados:', recusas)
const piores = [...naoResolvidos].sort((a, b) => b[1] - a[1]).slice(0, 25)
if (piores.length) {
  console.log('\nclubes que mais derrubaram jogador (nome do Transfermarkt):')
  for (const [nome, n] of piores) console.log(`  ${String(n).padStart(3)}x  ${nome}`)
}
