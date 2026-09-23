/**
 * Carreira a partir do Transfermarkt, que é a referência de mercado e a fonte
 * mais completa das três em fim de carreira e em passagem curta.
 *
 * Duas decisões que valem explicar:
 *
 * **O id do jogador vem do Wikidata (P2446), não da busca deles.** Além de
 * evitar raspar a busca do site, é mais confiável: "Elkeson" está lá como "Ai
 * Kesen", o nome com que ele se naturalizou chinês, e uma busca por "Elkeson"
 * teria que adivinhar isso.
 *
 * **O 405 é intermitente e se resolve repetindo.** O site fica atrás do AWS
 * WAF, que amostra as requisições e devolve uma página "Human Verification"
 * em vez de 200 — mais ou menos uma em cinco. Repetir devagar resolve; o
 * robots.txt deles declara `Allow: /` para agente genérico. O que este módulo
 * NÃO faz é resolver o desafio do WAF: se a repetição não passar, o jogador
 * fica sem esta fonte e o relatório diz isso.
 *
 * **O pedido sai por `curl`, não pelo `fetch` do Node.** O WAF recusa o fetch
 * quase sempre e aceita o curl quase sempre, com os mesmos cabeçalhos — a
 * diferença está no cliente, não no que se pede. Ambos são cliente HTTP
 * comum; isto não é disfarce, e o ritmo abaixo é deliberadamente lento.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe } from './wikidata.mjs'

const executar = promisify(execFile)

const BASE = 'https://www.transfermarkt.com.br'
const NAVEGADOR = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  Accept: 'application/json, text/plain, */*',
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * O nome do clube no histórico vem abreviado para caber na tabela do site:
 * "Man City", "GZ Evergrande", "Atlético-MG". Abreviação não casa com o nosso
 * nome na comparação e polui o relatório com falso faltante.
 *
 * O `href` de cada clube carrega o id dele no Transfermarkt (`/verein/281`), e
 * o manifesto do catálogo já traz esse id para 1800 clubes, porque é de lá que
 * sai o escudo. Dá para resolver o nome por igualdade de id, sem adivinhar.
 */
const porIdTm = (() => {
  const arquivo = join(dirname(fileURLToPath(import.meta.url)), 'clubes-externos.json')
  const mapa = new Map()
  if (!existsSync(arquivo)) return mapa
  for (const c of JSON.parse(readFileSync(arquivo, 'utf8'))) {
    const id = c.url?.match(/\/wappen\/head\/(\d+)\.png/)?.[1]
    if (id && !mapa.has(id)) mapa.set(id, c.nome)
  }
  return mapa
})()

/** Linhas do histórico que marcam ausência de clube, não um clube. */
export const NAO_E_CLUBE = /^(sem clube|aposentad|fim de carreira|carreira encerrada|unknown|desconhecido|retired|pausa|suspens)/i

/**
 * O histórico traz também o que ainda não aconteceu: o fim de um empréstimo
 * em curso vem com a data de junho do ano que vem e `upcoming`.
 */
export const jaAconteceu = (t, agora = Date.now()) =>
  !t.upcoming && !t.futureTransfer && !(Date.parse(t.dateUnformatted ?? '') > agora)

/**
 * Categoria de base e time reserva, que o histórico lista junto do profissional:
 * "Coritiba U20", "Dunkerque Jgd" (Jugend), "Le Mans UC 72 B", "SD Taishan Res.".
 *
 * O site em português TRADUZ a base: "OB Jugend" vira "OB Juventude", "Newell's
 * Jugend" vira "Newells Jv", "AS Monaco Jugend" vira "As Monaco Juven". A lista
 * só conhecia o alemão e o inglês, e foi assim que o Juventude de Caxias entrou
 * na carreira do Eriksen e que o Messi caiu do gerador. O time reserva também
 * escapava quando não era "B": "Barcelona C", "Real Madrid Castilla", "Jong Ajax".
 *
 * E abrevia: "Real Madrid S19" (sub-19), "Man City For" (formação), "Sevilla Fc
 * Juve", "Albacete F Base" (fútbol base), "Perugia Gio" (giovanili), "West Ham
 * Cj", "Portimonense 15" e "Willem II RKC 17" (a idade sozinha). "Talleres RE"
 * parece reserva e não é: é o Talleres de Remedios de Escalada, onde o Zanetti
 * começou. Todos esses passaram pelo filtro antigo e viraram o escudo do time
 * principal na carreira de alguém.
 *
 * Time de escola também é base: "Seiryo HS" (colegial japonês), "Myongji Uni",
 * "Yukminkwan MS". E time B com nome próprio: "V. Mestalla" (Valencia),
 * "Atl. Madrileño", "Barça Atlètic", "Bilbao Athletic", "Sporting Atl.".
 *
 * "Juniors" e "Jrs" ficam de fora de propósito: Boca Juniors e Argentinos Juniors
 * são clubes, não base. "Juve" só no fim do nome, porque a Juve Stabia é clube.
 */
/**
 * A fronteira de palavra do JavaScript só conhece letra sem acento: para `\b`,
 * o "é" de "Académica" separa palavras, e "Acad" casava com a Académica de
 * Viseu, "Res" com o Céres. A fronteira aqui é de qualquer letra.
 */
const LETRA = String.raw`[\p{L}\p{N}]`
const inteira = (termos) => `(?<!${LETRA})(?:${termos})(?!${LETRA})\\.?`
const CATEGORIA_DE_BASE = new RegExp([
  inteira([
    String.raw`U\d{1,2}|Sub[-\s]?\d{1,2}|S(1[3-9]|2[0-3])`,
    'Youth|Yth|Jugend|Jgd|Jeugd|Jug|Juv|Juven|(?<!Clan )Juveni\\p{L}*|Juniore\\p{L}*|Júniores|Jun|Infantil|Aspirantes',
    'Academy|Acad|Form|Forma(ção|cao)?|Formation|Abi|Amateure?|Aficionados|Res|Reserves?',
    'Castilla|Mestalla|Madrileño|Atlètic|Promesas|Giovanili|Cj|Mł(d|odzi)\\p{L}*',
    String.raw`F\.?\s?Base|F[úu]tb?\.?\s?b(ase)?`,
  ].join('|')),
  // abreviação no fim do nome: "Man City For", "Rio Ave Y", "Seiryo HS", "Newells Jv"
  String.raw`\s(B|C|J|Y|(?<!Willem\s)II|2|Juve|Gio|Frm|For|Fo|Fr|Prom|You|Atl|ES|MS|HS|THS|Uni|Jv|(?<!(Clube|EC|E\.\s?C\.)\s)Primavera|Base)\.?\s*$`,
  // a idade sozinha: "Portimonense 15", "Willem II/RKC-17"; e o "-2" do time reserva
  String.raw`[\s-](1[5-9]|2[0-3])\s*$|-2(\s|$)`,
  String.raw`^Jong\s|^Bilbao Athletic|^Dragon\s?Force`,
].join('|'), 'iu')

/**
 * "Juventude" sozinho é o clube de Caxias; depois do nome de outro clube é a
 * tradução de Jugend. "OB Juventude" é base; "Esporte Clube Juventude" não.
 */
const BASE_JUVENTUDE = /^(?!(esporte clube|sociedade esportiva|e\.?\s?c\.?|s\.?\s?e\.?)\s)\S.*\sJuventude$/i

export const ehCategoriaDeBase = (nome) => CATEGORIA_DE_BASE.test(nome) || BASE_JUVENTUDE.test(nome)

/**
 * Empréstimo e volta.
 *
 * A carreira mostra o clube dono uma vez, no lugar em que o jogador chegou, e
 * os empréstimos depois dele — como o quadro de carreira da Wikipédia. A volta
 * de empréstimo não é passagem nova: muitas vezes só devolve o jogador ao dono
 * para o próximo empréstimo, e contada sempre, o Keirrison voltava ao
 * Barcelona seis vezes.
 *
 * A exceção é o clube que comprou e emprestou na mesma hora. O Coutinho foi
 * vendido à Inter aos 16 anos e emprestado ao Vasco no mesmo dia; os três anos
 * em que jogou na Inter chegam no histórico como volta de empréstimo. A
 * compra que vira empréstimo em até um mês não é passagem (ele não jogou lá),
 * e a volta entra no lugar dela — desde que o jogador fique seis meses, que é
 * o que separa quem jogou de quem estava de passagem para o próximo
 * empréstimo. Quem decide se a volta entra é `montarCarreira`, que sabe se o
 * clube já está na carreira.
 */
const FIM_DE_EMPRESTIMO = /fim do empr[ée]stimo|end of loan|leihe\s*-?\s*ende/i
const IDA_DE_EMPRESTIMO = /empr[ée]stimo|loan|leihe/i
const DIAS_DE_COMPRA_RELAMPAGO = 31
const MESES_PARA_A_VOLTA_CONTAR = 6

/** Busca os ids do Transfermarkt de vários jogadores de uma vez. */
export async function idsDoTransfermarkt(qids) {
  const valores = qids.map((q) => `wd:${q}`).join(' ')
  const linhas = await consultar(`
    SELECT ?j ?tm WHERE {
      VALUES ?j { ${valores} }
      ?j wdt:P2446 ?tm .
    }`)
  return new Map(linhas.map((l) => [qidDe(l.j), l.tm]))
}

/**
 * O histórico de um jogador não muda de uma hora para outra, e cada ida ao
 * site custa caro: o WAF recusa uma parte das requisições e o conjunto todo
 * leva mais de vinte minutos. Guardar em disco deixa o trabalho de iterar
 * sobre os dados — refazer dicas, mudar filtro de clube — em segundos.
 */
const CACHE = join(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'transfermarkt')
mkdirSync(CACHE, { recursive: true })

/** Histórico cru de transferências, do cache quando já foi buscado. */
export async function historicoDoTransfermarkt(tmId, { forcar = false } = {}) {
  const arquivo = join(CACHE, `${tmId}.json`)
  if (!forcar && existsSync(arquivo)) {
    try {
      return JSON.parse(readFileSync(arquivo, 'utf8'))
    } catch {
      // cache corrompido: busca de novo
    }
  }
  const bruto = await pedirComInsistencia(`${BASE}/ceapi/transferHistory/list/${tmId}`)
  if (!bruto) return null
  let dados
  try {
    dados = JSON.parse(bruto)
  } catch {
    return null
  }
  writeFileSync(arquivo, JSON.stringify(dados))
  return dados
}

/** Repete enquanto o WAF responder com a página de verificação. */
async function pedirComInsistencia(url, tentativas = 6) {
  const cabecalhos = Object.entries(NAVEGADOR).flatMap(([k, v]) => ['-H', `${k}: ${v}`])
  for (let i = 0; i < tentativas; i++) {
    try {
      const { stdout } = await executar(
        'curl',
        ['-sL', '--max-time', '25', ...cabecalhos, url],
        { maxBuffer: 20 * 1024 * 1024 },
      )
      if (stdout && !/Human Verification|awsWafCookie/i.test(stdout)) return stdout
    } catch {
      // curl saiu com erro: trata como tentativa perdida
    }
    await espera(2000 + i * 1500)
  }
  return null
}

const idDoClube = (clube) => clube?.href?.match(/\/verein\/(\d+)/)?.[1] ?? null

function nomeDoClube(clube) {
  if (!clube) return null
  const idTm = clube.href?.match(/\/verein\/(\d+)/)?.[1]
  if (idTm && porIdTm.has(idTm)) return porIdTm.get(idTm)

  // sem id conhecido: o slug da URL é mais completo que o rótulo em alguns
  // casos e igualmente abreviado em outros, mas nunca pior
  const slug = clube.href?.match(/^\/([^/]+)\//)?.[1]
  if (slug && !/^\d+$/.test(slug) && slug.includes('-')) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return clube.clubName ?? null
}

/**
 * A sequência de clubes sai do histórico de transferências: o clube de origem
 * da primeira transferência, e depois o destino de cada uma. Empréstimo e
 * retorno viram transferências próprias, então a volta a um clube aparece na
 * posição certa — que é exatamente o que o jogo mostra.
 */
export async function passagensDoTransfermarkt(tmId) {
  const dados = await historicoDoTransfermarkt(tmId)
  if (!dados) return null

  /**
   * A API devolve do mais recente para o mais antigo, e inclui o que ainda
   * não aconteceu: o fim de um empréstimo em curso vem com data de junho do
   * ano que vem e `upcoming`. Contado, o ter Stegen já estaria de volta ao
   * Barcelona e o Gabigol, ao Cruzeiro.
   */
  const transferencias = (dados.transfers ?? []).filter((t) => jaAconteceu(t)).reverse()
  if (!transferencias.length) return []

  /**
   * Cada passagem leva, além do nome e do id, o país do clube (id da bandeira
   * no Transfermarkt) e os anos de chegada e saída. É com eles que o
   * resolvedor de clube recusa homônimo de outro país ou de outra época —
   * o Inter Miami de 2018 na carreira de quem jogou em Miami em 2005.
   */
  const anoDe = (t) => Number(String(t?.dateUnformatted ?? '').slice(0, 4)) || null
  const bandeiraDe = (clube) => clube?.countryFlag?.match(/\/(\d+)\.png/)?.[1] ?? null

  const sequencia = []
  const acrescentar = (clube, ano, volta = false, desde = null) => {
    const nome = nomeDoClube(clube)
    if (!nome || NAO_E_CLUBE.test(nome) || ehCategoriaDeBase(nome)) return
    if (sequencia.at(-1)?.nome === nome) return
    const idTm = idDoClube(clube)
    sequencia.push({
      nome, idTm, bandeira: bandeiraDe(clube), ano, anoSaida: null, desde, saida: null, ...(volta && { volta }),
    })
  }

  const quando = (t) => Date.parse(t?.dateUnformatted ?? '') || null
  const dias = (a, b) => (quando(b) - quando(a)) / (1000 * 60 * 60 * 24)
  const ehIda = (t) => IDA_DE_EMPRESTIMO.test(t?.fee ?? '') && !FIM_DE_EMPRESTIMO.test(t?.fee ?? '')
  const ficouNaVolta = (i) => {
    const proxima = transferencias[i + 1]
    if (!proxima) return true
    return quando(transferencias[i]) && quando(proxima)
      ? dias(transferencias[i], proxima) / 30.44 >= MESES_PARA_A_VOLTA_CONTAR
      : false
  }
  /** Comprado e emprestado pelo mesmo clube em seguida: não jogou lá. */
  const compraRelampago = (i) => {
    const t = transferencias[i]
    const proxima = transferencias[i + 1]
    return Boolean(proxima && ehIda(proxima) && idDoClube(proxima.from) === idDoClube(t.to) &&
      quando(t) && quando(proxima) && dias(t, proxima) <= DIAS_DE_COMPRA_RELAMPAGO)
  }

  acrescentar(transferencias[0]?.from, null)
  for (const [i, t] of transferencias.entries()) {
    const volta = FIM_DE_EMPRESTIMO.test(t.fee ?? '')
    if (volta && !ficouNaVolta(i)) continue
    const ano = anoDe(t)
    // a saída do clube anterior é nesta data, mesmo quando o destino é descartado
    const ultima = sequencia.at(-1)
    if (ultima && !ultima.anoSaida && nomeDoClube(t.to) !== ultima.nome) {
      ultima.anoSaida = ano
      ultima.saida = t.dateUnformatted ?? null
    }
    if (!volta && compraRelampago(i)) continue
    acrescentar(t.to, ano, volta, t.dateUnformatted ?? null)
  }
  return sequencia
}

/** Só os nomes, para quem não precisa do id — é o que a conferência usa. */
export async function carreiraDoTransfermarkt(tmId) {
  const passagens = await passagensDoTransfermarkt(tmId)
  return passagens && passagens.map((p) => p.nome)
}

/**
 * Quantos jogos oficiais o jogador fez por clube, pelo id do clube.
 *
 * O cliente pediu carreira só de jogo profissional, e o histórico de
 * transferências não sabe disso: lista o empréstimo em que o jogador ficou no
 * banco o ano inteiro, a compra de papel por um clube-ponte, o contrato que
 * nunca virou partida. O Transfermarkt guarda também cada partida oficial com
 * a participação do jogador (jogou, no banco, fora da lista, lesionado), e é
 * isso que o widget de desempenho do perfil lê.
 *
 * Volta `{ idDoClube: { registros, jogou } }`. Clube sem registro nenhum não
 * aparece — o Transfermarkt não acompanha partida de toda liga em toda época,
 * então ausência não prova nada. Registro com zero jogos prova.
 */
export async function jogosPorClube(tmId) {
  const arquivo = join(CACHE, `jogos-${tmId}.json`)
  if (existsSync(arquivo)) {
    try {
      const guardado = JSON.parse(readFileSync(arquivo, 'utf8'))
      // registro gravado antes das datas dos jogos: vale buscar de novo
      if (Object.values(guardado).every((r) => Array.isArray(r.datas))) return guardado
    } catch {
      // cache corrompido: busca de novo
    }
  }
  const bruto = await pedirComInsistencia(`https://tmapi.transfermarkt.technology/player/${tmId}/performance-game`)
  if (!bruto) return null
  let dados
  try {
    dados = JSON.parse(bruto)
  } catch {
    return null
  }
  if (!dados?.success) return null

  const porClube = {}
  for (const jogo of dados.data?.performance ?? []) {
    if (jogo.gameInformation?.isNationalGame) continue
    const clube = jogo.clubsInformation?.club?.clubId
    if (!clube) continue
    const estado = jogo.statistics?.generalStatistics?.participationState ?? '?'
    const ano = jogo.gameInformation?.seasonId
    const registro = (porClube[clube] ??= { registros: 0, jogou: 0, estados: {}, de: ano, ate: ano, datas: [] })
    registro.registros++
    registro.estados[estado] = (registro.estados[estado] ?? 0) + 1
    if (estado === 'played' || jogo.statistics?.playingTimeStatistics?.playedMinutes > 0) {
      registro.jogou++
      // o dia de cada jogo em que ele entrou: é o que diz se a volta de um empréstimo teve jogo
      const dia = jogo.gameInformation?.date?.dateTimeUTC?.slice(0, 10)
      if (dia) registro.datas.push(dia)
    }
    if (ano && (!registro.de || ano < registro.de)) registro.de = ano
    if (ano && (!registro.ate || ano > registro.ate)) registro.ate = ano
  }
  for (const registro of Object.values(porClube)) registro.datas.sort()
  writeFileSync(arquivo, JSON.stringify(porClube))
  return porClube
}

/** Um recurso da API do Transfermarkt, que não passa pelo WAF. */
async function apiDoTransfermarkt(caminho) {
  const bruto = await pedirComInsistencia(`https://tmapi.transfermarkt.technology/${caminho}`)
  try {
    const dados = JSON.parse(bruto)
    return dados?.success ? dados.data : null
  } catch {
    return null
  }
}

/**
 * Onde o jogador nasceu e por quais seleções jogou.
 *
 * O número de jogos pela seleção vinha do Wikidata, que atrasa para quem está
 * em atividade: o Vitor Roque aparecia com 1, e já são 2. E a primeira dica
 * usava a nacionalidade como se fosse o lugar de nascimento — o Mário
 * Fernandes, de São Caetano do Sul, saía "nascido na Rússia". A API separa as
 * coisas: país de nascimento, nacionalidades e, por time nacional, jogos e
 * gols, de base inclusive (`clubesDoTransfermarkt` diz qual é qual).
 *
 * Volta `{ nascimento, nacionalidades, selecoes: [{ time, jogos, gols }] }`,
 * com ids de país e de time do Transfermarkt.
 */
export async function selecaoDoTransfermarkt(tmId) {
  const arquivo = join(CACHE, `selecao-${tmId}.json`)
  if (existsSync(arquivo)) {
    try {
      return JSON.parse(readFileSync(arquivo, 'utf8'))
    } catch {
      // cache corrompido: busca de novo
    }
  }
  const perfil = await apiDoTransfermarkt(`player/${tmId}`)
  const carreira = await apiDoTransfermarkt(`player/${tmId}/national-career-history`)
  if (!perfil || !carreira) return null
  const { nationalityId, secondNationalityId } = perfil.nationalityDetails?.nationalities ?? {}
  const saida = {
    nascimento: perfil.birthPlaceDetails?.countryOfBirthId ?? null,
    nacionalidades: [nationalityId, secondNationalityId].filter(Boolean),
    selecoes: (carreira.history ?? []).map((h) => ({
      time: String(h.clubId), jogos: h.gamesPlayed ?? 0, gols: h.goalsScored ?? 0,
    })),
  }
  writeFileSync(arquivo, JSON.stringify(saida))
  return saida
}

/**
 * A edição do torneio de um jogo, que nem sempre é o ano da temporada nem o do
 * jogo.
 *
 * Competição de ano civil — Copa, Libertadores, Copa do Brasil — o
 * Transfermarkt mostra pelo ano ("2020"), e esse é a edição, mesmo quando a
 * final caiu em janeiro de 2021. Competição europeia vem como temporada
 * ("15/16"), e aí vale o ano do jogo: a Champions 14/15 é a de 2015, mas o
 * Mundial de Clubes da temporada 15/16 foi em dezembro de 2015. Tomar o fim da
 * temporada, como antes, dava ao Messi o Mundial de 2016.
 *
 * As edições 2020, 2021 e 2022 do Mundial tiveram a final em fevereiro do ano
 * seguinte; a de 2000, em janeiro do próprio ano.
 */
function edicaoDoJogo(info) {
  const mostrado = String(info.season?.display ?? '')
  if (/^\d{4}$/.test(mostrado)) return Number(mostrado)
  const dia = info.date?.dateTimeUTC ?? ''
  const ano = Number(dia.slice(0, 4))
  if (!ano) return Number(info.season?.cyclicalName) || null
  const adiado = info.competitionId === 'KLUB' && /^(2021|2022|2023)-0[1-3]/.test(dia)
  return adiado ? ano - 1 : ano
}

/** Final em jogo único ("FF") ou em ida ("FFH") e volta ("FFR"). */
const FINAL = /^FF[HR]?$/

/**
 * Torneio de seleção que vale como dica, pelo id do Transfermarkt. A Copa
 * América do centenário, de 2016, tem id próprio.
 */
const TORNEIO_DE_SELECAO = { FIWC: 'copa', COPA: 'america', CA16: 'america', EURO: 'euro', OLYM: 'olimpiada' }

/**
 * O que o jogador fez em campo, para a dica: jogos e gols por clube, e as
 * finais que disputou, com os gols de cada uma.
 *
 * O cliente pediu dica que aproxime do acerto — o gol decisivo, o ídolo de um
 * time — e o registro de partidas do Transfermarkt tem as duas coisas em
 * dado: a partida da final vem marcada, com os gols do jogador nela; os dois
 * do Ronaldo na final de 2002 estão lá. Jogos e gols por clube medem o ídolo:
 * "fez 434 jogos pelo Grêmio".
 *
 * Final de ida e volta é uma final só: os gols das duas partidas somam, e o
 * saldo também. Só marcar o jogo único deixava de fora toda final da Copa do
 * Brasil e dos estaduais, e as Libertadores até 2018.
 *
 * Os torneios de seleção saem daqui também: a Copa, a Copa América, a
 * Eurocopa e a Olimpíada em que ele entrou em campo. O Wikidata, que dava
 * isso antes, esquecia Copa (o Neymar sem a de 2022) e contava a de técnico
 * (o Zagallo com seis).
 *
 * Só conta a partida em que ele entrou. Época sem escalação no site fica de
 * fora sozinha — o número sai menor, nunca maior.
 */
export async function desempenhoDoJogador(tmId) {
  const arquivo = join(CACHE, `desempenho-${tmId}.json`)
  if (existsSync(arquivo)) {
    try {
      const salvo = JSON.parse(readFileSync(arquivo, 'utf8'))
      // os formatos de antes não tinham a data, as finais de ida e volta e os torneios
      if (salvo.versao === 3) return salvo
    } catch {
      // cache corrompido: busca de novo
    }
  }
  const dados = await apiDoTransfermarkt(`player/${tmId}/performance-game`)
  if (!dados) return null
  const porClube = {}
  const porFinal = new Map()
  let jogosDeSelecao = 0
  const torneios = {}
  for (const jogo of dados.performance ?? []) {
    const info = jogo.gameInformation ?? {}
    const estatisticas = jogo.statistics ?? {}
    const entrou = estatisticas.generalStatistics?.participationState === 'played' ||
      estatisticas.playingTimeStatistics?.playedMinutes > 0
    if (!entrou) continue
    const clube = jogo.clubsInformation?.club
    const gols = estatisticas.goalStatistics?.goalsScoredTotal ?? 0
    if (!info.isNationalGame && clube?.clubId) {
      const registro = (porClube[clube.clubId] ??= { jogos: 0, gols: 0 })
      registro.jogos++
      registro.gols += gols
    }
    if (info.isNationalGame) {
      jogosDeSelecao++
      const torneio = TORNEIO_DE_SELECAO[info.competitionId]
      const edicao = torneio && edicaoDoJogo(info)
      if (edicao && !(torneios[torneio] ??= []).includes(edicao)) torneios[torneio].push(edicao)
    }
    if (FINAL.test(info.competitionGroupId ?? '')) {
      const ano = edicaoDoJogo(info)
      const chave = `${info.competitionId}|${ano}|${clube?.clubId}`
      const final = porFinal.get(chave) ?? {
        competicao: info.competitionId,
        ano,
        data: null,
        clubeTm: clube?.clubId ?? null,
        nacional: Boolean(info.isNationalGame),
        gols: 0,
        saldo: 0,
      }
      final.gols += gols
      final.saldo += (clube?.goalsTotal ?? 0) - (clube?.opponentGoalsTotal ?? 0)
      // a data que fica é a do jogo que decidiu: a volta
      const dia = info.date?.dateTimeUTC?.slice(0, 10) ?? null
      if (dia && (!final.data || dia > final.data)) final.data = dia
      porFinal.set(chave, final)
    }
  }
  for (const anos of Object.values(torneios)) anos.sort((a, b) => a - b)
  const saida = { versao: 3, porClube, finais: [...porFinal.values()], jogosDeSelecao, torneios }
  writeFileSync(arquivo, JSON.stringify(saida))
  return saida
}

/** Nome em português de cada competição, pelo id do Transfermarkt ("FIWC" -> "Copa do Mundo"). */
export async function competicoesDoTransfermarkt(ids) {
  const arquivo = join(CACHE, 'competicoes.json')
  let nomes = {}
  try {
    nomes = JSON.parse(readFileSync(arquivo, 'utf8'))
  } catch {
    // sem cache: busca tudo
  }
  const faltando = [...new Set(ids)].filter((id) => id && !nomes[id])
  for (let i = 0; i < faltando.length; i += 40) {
    const lote = faltando.slice(i, i + 40).map((id) => `ids%5B%5D=${encodeURIComponent(id)}`).join('&')
    for (const c of (await apiDoTransfermarkt(`competitions?${lote}`)) ?? []) nomes[c.id] = c.name
  }
  writeFileSync(arquivo, JSON.stringify(nomes))
  return nomes
}

/**
 * Ano de dois dígitos que caiu no futuro é do século passado: "48/49" é a
 * Copa América de 1949, não de 2049. Um corte fixo em 50, como antes, jogava
 * para 2049 tudo que o Ademir e o Zizinho ganharam. A folga cobre título de
 * temporada que ainda termina.
 */
const anoPassado = (ano) => (ano > new Date().getFullYear() + 1 ? ano - 100 : ano)

/**
 * Os títulos do jogador, da página "Títulos" do perfil: cada conquista com o
 * ano e o clube (ou a seleção) pelo qual ela veio.
 *
 * É o fato que o cliente pediu para a dica — "um título que foi decisivo" — e
 * o Transfermarkt o guarda por temporada e clube: "3x Campeão da Copa
 * Libertadores: 20/21 e 19/20 pelo Palmeiras, 12/13 pelo Atlético Mineiro". A
 * temporada vira ano pela segunda metade, que é o ano da final: a
 * Libertadores 12/13 é a de 2013, a Champions 12/13 também.
 *
 * Volta `[{ titulo, conquistas: [{ ano, clubeTm, clube }] }]`, ou `[]` para quem
 * não ganhou nada; `null` quando o site não respondeu.
 */
export async function titulosDoTransfermarkt(tmId) {
  const arquivo = join(CACHE, `titulos-${tmId}.json`)
  if (existsSync(arquivo)) {
    try {
      // o cache de antes tinha a Copa América de 1949 como 2049
      return JSON.parse(readFileSync(arquivo, 'utf8')).map((t) => ({
        ...t, conquistas: t.conquistas.map((q) => ({ ...q, ano: anoPassado(q.ano) })),
      }))
    } catch {
      // cache corrompido: busca de novo
    }
  }
  const html = await pedirComInsistencia(`${BASE}/-/erfolge/spieler/${tmId}`)
  if (!html || html.length < 20_000) return null

  const limpar = (t) => t.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
  // "12/13" é 2013, "99/00" é 2000 e "48/49" é 1949: o ano da final é o seguinte ao do início
  const ano = (temporada) => {
    const [a, b] = temporada.split('/')
    if (!b) return Number(a) || null
    return anoPassado(2000 + Number(a) + 1)
  }
  const titulos = []
  const blocos = html.split(/<h2[^>]*class="content-box-headline[^"]*"[^>]*>/).slice(1)
  for (const bloco of blocos) {
    const cabecalho = limpar(bloco.slice(0, bloco.indexOf('</h2>')))
    // "Todos os títulos" repete os outros blocos
    const m = cabecalho.match(/^(\d+)x\s+(.+)$/)
    if (!m) continue
    const conquistas = []
    for (const linha of bloco.split('<tr').slice(1)) {
      const temporada = linha.match(/erfolg_table_saison[^>]*>([^<]+)</)?.[1]?.trim()
      const clube = linha.match(/<a title="([^"]+)" href="[^"]*\/verein\/(\d+)/)
      if (temporada) conquistas.push({ ano: ano(temporada), clubeTm: clube?.[2] ?? null, clube: clube?.[1] ?? null })
    }
    titulos.push({ titulo: m[2], conquistas })
  }
  writeFileSync(arquivo, JSON.stringify(titulos))
  return titulos
}

/**
 * O nome em português de cada país, pelo id do Transfermarkt.
 *
 * A API dá o país de nascimento e a nacionalidade só pelo id. O nome sai de
 * duas fontes do próprio site: o nome da seleção principal do país, que a API
 * devolve em português, e, para o país sem seleção entre os times nacionais
 * que já conhecemos, o título da bandeira no perfil de um jogador de lá.
 *
 * `quem` diz, para cada id que faltar, o jogador em cujo perfil procurar.
 */
export async function paisesDoTransfermarkt(times, quem = new Map()) {
  const arquivo = join(CACHE, 'paises.json')
  let nomes = {}
  try {
    nomes = JSON.parse(readFileSync(arquivo, 'utf8'))
  } catch {
    // sem cache: monta de novo
  }
  for (const time of Object.values(times)) {
    if (time?.principal && time.pais && !nomes[time.pais]) nomes[time.pais] = time.nome
  }
  for (const [pais, tmId] of quem) {
    if (nomes[pais]) continue
    const html = await pedirComInsistencia(`${BASE}/-/profil/spieler/${tmId}`)
    const titulo = html?.match(new RegExp(`/flagge/[a-z]+/${pais}\\.png[^>]*?title="([^"]+)"`))?.[1]
    if (titulo) nomes[pais] = titulo
  }
  writeFileSync(arquivo, JSON.stringify(nomes))
  return nomes
}

/**
 * Nome, nome curto e país de cada clube pelo id, como o próprio Transfermarkt os
 * registra. Serve para duas coisas:
 *
 * - conferir o mapa de clubes: o nome que o Transfermarkt dá ao id tem que
 *   bater com o do clube do catálogo. Foi assim que o CRB do Marcos Rocha
 *   apareceu ligado ao Brasil de Pelotas;
 * - dizer de que país é cada time nacional e se é a seleção principal: o
 *   sub-20 do Brasil aponta a seleção brasileira como o time principal dele.
 */
export async function clubesDoTransfermarkt(ids) {
  const arquivo = join(CACHE, 'clubes-tm.json')
  let guardado = {}
  try {
    // id que a API não devolveu fica de fora, para ser pedido de novo
    guardado = Object.fromEntries(Object.entries(JSON.parse(readFileSync(arquivo, 'utf8'))).filter(([, c]) => c))
  } catch {
    // sem cache: busca tudo
  }
  const faltando = [...new Set(ids.map(String))].filter((id) => !guardado[id] || !('principal' in guardado[id]))
  for (let i = 0; i < faltando.length; i += 40) {
    const lote = faltando.slice(i, i + 40)
    for (const clube of (await apiDoTransfermarkt(`clubs?${lote.map((id) => `ids%5B%5D=${id}`).join('&')}`)) ?? []) {
      const base = clube.baseDetails ?? {}
      guardado[clube.id] = {
        nome: clube.name,
        curto: base.shortName ?? null,
        pais: base.countryId ?? null,
        principal: base.isNationalTeam === true && String(base.mainClubId) === String(clube.id),
      }
    }
  }
  writeFileSync(arquivo, JSON.stringify(guardado))
  return guardado
}

/**
 * Posição e nacionalidade do perfil.
 *
 * Vêm daqui e não do Wikidata porque lá as duas propriedades aceitam vários
 * valores e a escolha do primeiro saía errada: o Zico aparecia como "nascido
 * em Portugal" na mesma frase que citava a seleção brasileira. O Transfermarkt
 * guarda um valor só, que é o que o jogo precisa.
 */
export async function perfilDoTransfermarkt(tmId) {
  const arquivo = join(CACHE, `perfil-${tmId}.json`)
  if (existsSync(arquivo)) {
    try {
      const guardado = JSON.parse(readFileSync(arquivo, 'utf8'))
      // perfil gravado antes de naturalidade e pé existirem: vale rebuscar
      if ('naturalidade' in guardado) return guardado
    } catch {
      // cache corrompido: busca de novo
    }
  }

  const html = await pedirComInsistencia(`${BASE}/-/profil/spieler/${tmId}`)
  if (!html || html.length < 20_000) return null

  const posicao =
    html.match(/Posi[çc][ãa]o:?\s*<\/span>\s*<span[^>]*>([^<]+)/i)?.[1]?.trim() ??
    html.match(/data-header__label"[^>]*>\s*Posição[\s\S]{0,120}?content"[^>]*>([^<]+)/i)?.[1]?.trim() ??
    null

  const nacionalidade =
    html.match(/Naci?onalidade:?[\s\S]{0,300}?title="([^"]+)"/i)?.[1]?.trim() ?? null

  /**
   * O nome do cabeçalho é o nome pelo qual o jogador é conhecido — o da
   * camisa. O rótulo do Wikidata costuma trazer o nome de registro, e
   * "Paulo Henrique Sampaio Filho" não é palpite que alguém digite.
   */
  const nome = html
    .match(/<h1[^>]*data-header__headline-wrapper[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/#\d+\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim() ?? null

  /**
   * Naturalidade e pé vêm da tabela lateral do perfil. Entraram porque a
   * dica de quem tem carreira magra não entregava nada: o Ademilson não tem
   * jogo de seleção nem torneio, e sobravam dois números de dinheiro. "Nasceu
   * em Cubatão" é específico, verificável e o mural de escudos não mostra.
   */
  const campo = (rotulo) => {
    const re = new RegExp(
      `${rotulo}:?\\s*</span>\\s*<span[^>]*info-table__content--bold[^>]*>([\\s\\S]*?)</span>`, 'i')
    const bruto = html.match(re)?.[1]
    if (!bruto) return null
    const limpo = bruto.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    return limpo || null
  }

  const perfil = {
    nome, posicao, nacionalidade,
    naturalidade: campo('Local de nascimento'),
    pe: campo('P[ée]'),
  }
  writeFileSync(arquivo, JSON.stringify(perfil))
  return perfil
}
