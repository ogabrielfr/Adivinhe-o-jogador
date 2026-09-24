/**
 * A régua de nível: quanto o torcedor brasileiro reconhece cada jogador.
 *
 *   npm run regua              mostra o que mudaria, sem gravar
 *   npm run regua -- --gravar  grava o nível de cada um na biblioteca
 *
 * A régua anterior, de visualizações da Wikipédia, o cliente recusou. Esta sai
 * da opinião dele: ele marcou uma amostra (`scripts/amostra-nivel.json`) e os
 * pesos de cada dado são os que melhor reproduzem essas marcações. Assim a
 * régua vale também para quem entrar depois, sem ninguém marcar de novo.
 *
 * Os dados, todos do Transfermarkt e do Wikidata:
 *   - jogos pela seleção brasileira e pela seleção principal de qualquer país;
 *   - Copas do Mundo em que entrou em campo;
 *   - se nasceu no Brasil;
 *   - jogos pelos clubes das cinco ligas grandes da Europa;
 *   - quão recente é a carreira (o último ano com jogo);
 *   - em quantos idiomas a Wikipédia tem artigo sobre ele.
 *
 * O modelo é ordinal — fácil < intermediário < difícil < tirar — e os pesos
 * saem por máxima verossimilhança com um freio (L2) contra a amostra pequena.
 * Deixando cada jogador da amostra de fora do ajuste e prevendo o dele, a
 * régua acerta 50 das 66 marcações (76%), contra 38 (58%) dos níveis da régua
 * antiga — "tirar" conta como acerto quando cai no difícil, já que o jogo não
 * tem nível abaixo dele.
 *
 * O cliente quer o mesmo número de jogadores por nível. A régua então ordena, e
 * o corte fica onde cada nível fecha com um terço da biblioteca. Quem o
 * cliente marcou fica exatamente como ele marcou; `scripts/niveis-fixos.mjs`
 * também vence o cálculo, e `EM_DUVIDA` e `PROVISORIO`, abaixo, seguram quem
 * espera a segunda rodada de marcações.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lerBiblioteca, gravarBiblioteca, idTmDe } from './biblioteca.mjs'
import { NIVEL_FIXO } from './niveis-fixos.mjs'
import {
  desempenhoDoJogador, jogosPorClube, selecaoDoTransfermarkt, clubesDoTransfermarkt,
} from './transfermarkt.mjs'
import { consultar, qidDe } from './wikidata.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ler = (arquivo) => JSON.parse(readFileSync(join(raiz, 'scripts', arquivo), 'utf8'))
const NIVEIS = ['facil', 'intermediario', 'dificil', 'tirar']
const ORDEM = Object.fromEntries(NIVEIS.map((n, i) => [n, i]))

/** Países do Transfermarkt: Brasil, e as cinco ligas grandes da Europa. */
const BRASIL = 26
const EUROPA = new Set([189, 157, 75, 40, 50])
/** O time principal da seleção brasileira no Transfermarkt. */
const SELECAO_BRASILEIRA = '3439'

// ------------------------------------------------------------- idiomas
/**
 * Em quantos idiomas a Wikipédia tem artigo sobre o jogador (os "sitelinks"
 * do Wikidata). Muda devagar, então fica guardado no repositório; só quem
 * falta vai ao Wikidata.
 */
async function idiomasDe(qids) {
  const arquivo = join(raiz, 'scripts/idiomas-jogadores.json')
  const guardado = existsSync(arquivo) ? JSON.parse(readFileSync(arquivo, 'utf8')) : {}
  const faltando = [...new Set(qids)].filter((q) => q && !(q in guardado))
  for (let i = 0; i < faltando.length; i += 100) {
    const fatia = faltando.slice(i, i + 100)
    const linhas = await consultar(`SELECT ?j ?n WHERE { VALUES ?j { ${fatia.map((q) => `wd:${q}`).join(' ')} } ?j wikibase:sitelinks ?n . }`)
    for (const l of linhas) guardado[qidDe(l.j)] = Number(l.n)
  }
  if (faltando.length) {
    const ordenado = Object.fromEntries(Object.entries(guardado).sort(([a], [b]) => a.localeCompare(b)))
    writeFileSync(arquivo, JSON.stringify(ordenado, null, 1) + '\n')
  }
  return guardado
}

// -------------------------------------------------------------- fatores
/** Os dados de cada jogador que entram na régua, já na escala do ajuste. */
export async function fatoresDe(jogadores) {
  const tmPorQid = ler('tm-jogadores.json')
  const qidPorTm = new Map(Object.entries(tmPorQid).map(([q, t]) => [String(t), q]))
  const meta = ler('meta-jogadores.json')
  const idiomas = await idiomasDe(jogadores.map((j) => qidPorTm.get(idTmDe(j))))

  const brutos = []
  for (const j of jogadores) {
    const tm = idTmDe(j)
    const qid = qidPorTm.get(tm)
    const desempenho = await desempenhoDoJogador(tm)
    const jogos = (await jogosPorClube(tm)) ?? {}
    const selecao = await selecaoDoTransfermarkt(tm)
    brutos.push({ j, qid, desempenho, jogos, selecao, nasc: Number(meta[qid]?.nasc) || null })
  }
  const clubes = await clubesDoTransfermarkt(
    brutos.flatMap((b) => Object.keys(b.desempenho?.porClube ?? {})),
  )

  return brutos.map(({ j, qid, desempenho, jogos, selecao, nasc }) => {
    let europa = 0
    for (const [clube, r] of Object.entries(desempenho?.porClube ?? {})) {
      if (EUROPA.has(clubes[clube]?.pais)) europa += r.jogos
    }
    const anos = Object.values(jogos).flatMap((r) => [r.de, r.ate]).filter(Boolean)
    // sem registro de partidas, a carreira termina por volta dos 33 anos
    const ultimo = anos.length ? Math.max(...anos) : (nasc ?? 1970) + 33
    return {
      id: j.id,
      nasc,
      valores: {
        selecaoBrasil: Math.log1p(selecao?.selecoes?.find((s) => s.time === SELECAO_BRASILEIRA)?.jogos ?? 0),
        selecao: Math.log1p(Math.max(0, ...(selecao?.selecoes ?? []).map((s) => s.jogos))),
        copas: desempenho?.torneios?.copa?.length ?? 0,
        brasileiro: selecao?.nascimento === BRASIL ? 1 : 0,
        europa: Math.log1p(europa),
        recente: (ultimo - 2000) / 10,
        idiomas: Math.log(Math.max(idiomas[qid] ?? 1, 1)),
      },
    }
  })
}

// --------------------------------------------------------------- modelo
const sig = (t) => 1 / (1 + Math.exp(-t))

/**
 * Chances proporcionais: P(nível <= k) = sig(corte_k - w·x). Gradiente
 * determinístico — o mesmo ajuste sai igual toda vez que roda.
 */
function ajustar(X, y, { lambda = 0.05, passos = 4000, taxa = 0.05 } = {}) {
  const p = X[0].length
  const K = NIVEIS.length
  const w = Array(p).fill(0)
  const cortes = Array.from({ length: K - 1 }, (_, k) => k - (K - 2) / 2)
  for (let passo = 0; passo < passos; passo++) {
    const gw = Array(p).fill(0)
    const gc = Array(K - 1).fill(0)
    for (let i = 0; i < X.length; i++) {
      const s = X[i].reduce((a, v, j) => a + v * w[j], 0)
      const k = y[i]
      const cima = k < K - 1 ? sig(cortes[k] - s) : 1
      const baixo = k > 0 ? sig(cortes[k - 1] - s) : 0
      const pr = Math.max(cima - baixo, 1e-9)
      const dc = k < K - 1 ? cima * (1 - cima) : 0
      const db = k > 0 ? baixo * (1 - baixo) : 0
      for (let j = 0; j < p; j++) gw[j] += ((db - dc) / pr) * X[i][j]
      if (k < K - 1) gc[k] += dc / pr
      if (k > 0) gc[k - 1] -= db / pr
    }
    for (let j = 0; j < p; j++) w[j] += taxa * (gw[j] / X.length - lambda * w[j])
    for (let k = 0; k < K - 1; k++) cortes[k] += taxa * (gc[k] / X.length)
    for (let k = 1; k < K - 1; k++) cortes[k] = Math.max(cortes[k], cortes[k - 1] + 1e-3)
  }
  return { w, cortes }
}

/** Padroniza cada dado pela média e o desvio da biblioteca inteira. */
function padronizador(fatores) {
  const nomes = Object.keys(fatores[0].valores)
  const media = {}
  const desvio = {}
  for (const n of nomes) {
    const xs = fatores.map((f) => f.valores[n])
    media[n] = xs.reduce((s, x) => s + x, 0) / xs.length
    desvio[n] = Math.sqrt(xs.reduce((s, x) => s + (x - media[n]) ** 2, 0) / xs.length) || 1
  }
  return { nomes, z: (f) => nomes.map((n) => (f.valores[n] - media[n]) / desvio[n]) }
}

/**
 * O nível de cada jogador. Marcado pelo cliente ou fixado à mão, fica; o resto
 * entra na ordem da régua, até cada nível ter um terço da biblioteca.
 *
 * `fora` são os marcados que já saíram da biblioteca: entram só no ajuste. O
 * "tirar" do cliente é o que ensina à régua onde fica o obscuro demais.
 */
export function niveisPelaRegua(fatores, marcacoes, fixos = {}, fora = []) {
  const { nomes, z } = padronizador(fatores)
  const amostra = [...fatores, ...fora].filter((f) => marcacoes[f.id])
  const modelo = ajustar(amostra.map(z), amostra.map((f) => ORDEM[marcacoes[f.id]]))
  const nota = (f) => z(f).reduce((a, v, j) => a + v * modelo.w[j], 0)

  const decidido = new Map()
  for (const f of fatores) {
    const d = marcacoes[f.id] ?? fixos[f.id]
    if (d && d !== 'tirar') decidido.set(f.id, d)
  }
  const ficam = fatores.filter((f) => marcacoes[f.id] !== 'tirar')
  const porNivel = Math.floor(ficam.length / 3)
  const vagas = { facil: porNivel, intermediario: ficam.length - 2 * porNivel, dificil: porNivel }
  for (const n of decidido.values()) vagas[n]--

  const nivel = new Map(decidido)
  const livres = ficam.filter((f) => !decidido.has(f.id)).sort((a, b) => nota(a) - nota(b))
  let i = 0
  for (const n of ['facil', 'intermediario', 'dificil']) {
    for (let k = 0; k < vagas[n] && i < livres.length; k++, i++) nivel.set(livres[i].id, n)
  }
  for (; i < livres.length; i++) nivel.set(livres[i].id, 'dificil')

  return { nivel, modelo, nomes, nota, porNivel, vagas }
}

/**
 * Jogadores em que a régua mudaria o nível com pouca certeza, em três grupos:
 * craques que ela joga para baixo, porque a amostra do cliente tinha poucos
 * (aplicada direto, punha o Bale e o Figo no difícil); brasileiros que ela
 * subiria do difícil direto para o fácil (Maxwell, Neto, Gomes); e
 * estrangeiros de muitas Copas que ela punha no fácil (Shaqiri, Cahill,
 * Xhaka). Até o cliente marcar estes na segunda rodada, ficam no nível que já
 * tinham.
 */
export const EM_DUVIDA = [
  'maxwell', 'allan-marques-loureiro', 'josue-anunciado-de-oliveira',
  'anderson-futebolista', 'rafael-pereira-da-silva', 'neto', 'gomes', 'estevao',
  'gareth-bale', 'luis-enrique-martinez-garcia', 'thiago-alcantara',
  'radamel-falcao-garcia', 'luis-figo', 'zagallo', 'marco-van-basten', 'zinedine-zidane',
  'zlatan-ibrahimovic', 'mohamed-salah', 'robert-lewandowski', 'erling-haaland',
  'arjen-robben', 'rogerio-ceni', 'paulo-roberto-falcao', 'carlos-tevez', 'diego-forlan',
  'garrincha', 'hugo-lloris', 'jordan-henderson', 'xherdan-shaqiri', 'raheem-sterling',
  'raphael-varane', 'adriano-correia-claro', 'alex-rodrigo-dias-da-costa',
  'tim-cahill', 'granit-xhaka',
]

/**
 * Estrangeiros que foram ídolos no Brasil. A régua não enxerga fama feita num
 * clube brasileiro — os dados dela são seleção, Copa, Europa e Wikipédia —, e
 * mandava os quatro para o difícil. Entraram na reposição de setembro e ficam
 * no intermediário até o cliente marcar.
 */
export const PROVISORIO = {
  'paolo-guerrero': 'intermediario',
  'andres-d-alessandro': 'intermediario',
  'diego-lugano': 'intermediario',
  'clarence-seedorf': 'intermediario',
}

// ------------------------------------------------------------ execução
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const gravar = process.argv.includes('--gravar')
  const jogadores = lerBiblioteca()
  const { marcacoes, foraDaBiblioteca = {} } = ler('amostra-nivel.json')
  const fatores = await fatoresDe(jogadores)
  const fora = await fatoresDe(Object.entries(foraDaBiblioteca)
    .map(([id, tm]) => ({ id, fonte: `https://www.transfermarkt.com.br/-/profil/spieler/${tm}` })))
  // em dúvida fica onde estava e o provisório no intermediário; o fixado à mão
  // vence os dois, e a marcação do cliente vence tudo
  const mantidos = Object.fromEntries(jogadores.filter((j) => EM_DUVIDA.includes(j.id)).map((j) => [j.id, j.nivel]))
  const { nivel, modelo, nomes } = niveisPelaRegua(fatores, marcacoes, { ...mantidos, ...PROVISORIO, ...NIVEL_FIXO }, fora)

  console.log('pesos (negativo = mais fácil):')
  for (const [i, n] of nomes.entries()) console.log(`  ${n.padEnd(14)} ${modelo.w[i].toFixed(2)}`)
  console.log(`  cortes         ${modelo.cortes.map((c) => c.toFixed(2)).join('  ')}`)

  const mudancas = jogadores.filter((j) => nivel.has(j.id) && nivel.get(j.id) !== j.nivel)
  const contagem = { facil: 0, intermediario: 0, dificil: 0 }
  for (const n of nivel.values()) contagem[n]++
  console.log(`\npor nível: ${Object.entries(contagem).map(([n, c]) => `${n} ${c}`).join(' · ')}`)
  console.log(`${mudancas.length} mudam de nível`)
  for (const de of ['facil', 'intermediario', 'dificil']) {
    for (const para of ['facil', 'intermediario', 'dificil']) {
      const l = mudancas.filter((j) => j.nivel === de && nivel.get(j.id) === para)
      if (l.length) console.log(`  ${de} → ${para} (${l.length}): ${l.map((j) => j.nome).join(', ')}`)
    }
  }
  const aTirar = jogadores.filter((j) => marcacoes[j.id] === 'tirar')
  if (aTirar.length) console.log(`\nmarcados para tirar (a régua não tira sozinha): ${aTirar.map((j) => j.nome).join(', ')}`)

  if (gravar) {
    for (const j of jogadores) if (nivel.has(j.id)) j.nivel = nivel.get(j.id)
    gravarBiblioteca(jogadores)
    console.log('\nnível gravado na biblioteca. Rode `npm run agenda` para os dias ainda não agendados.')
  }
}
