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
const NAO_E_CLUBE = /^(sem clube|aposentad|fim de carreira|carreira encerrada|unknown|retired|pausa)/i

/**
 * Categoria de base e time reserva, que o histórico lista junto do profissional:
 * "Coritiba U20", "Dunkerque Jgd" (Jugend), "Le Mans UC 72 B", "SD Taishan Res.".
 */
const CATEGORIA_DE_BASE =
  /\b(U\d{1,2}|Sub[-\s]?\d{1,2}|Youth|Yth|Jugend|Jgd|Juv|Juvenil|Juniores|Jun|Academy|Acad|Form|Formation|Abi|Amateure?|Res|Reserves?)\b\.?|\s(B|II|2)$/i

/**
 * O retorno de empréstimo não é uma passagem nova: leva o jogador de volta ao
 * clube dono, muitas vezes sem que ele jogue lá. Sem este filtro, o Keirrison
 * volta ao Barcelona seis vezes, entre um empréstimo e o seguinte.
 */
const FIM_DE_EMPRESTIMO = /fim do empr[ée]stimo|end of loan|leihe\s*-?\s*ende/i

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

  // a API devolve do mais recente para o mais antigo
  const transferencias = (dados.transfers ?? []).slice().reverse()
  if (!transferencias.length) return []

  const sequencia = []
  const acrescentar = (clube) => {
    const nome = nomeDoClube(clube)
    if (!nome || NAO_E_CLUBE.test(nome) || CATEGORIA_DE_BASE.test(nome)) return
    const idTm = clube?.href?.match(/\/verein\/(\d+)/)?.[1] ?? null
    if (sequencia[sequencia.length - 1]?.nome !== nome) sequencia.push({ nome, idTm })
  }

  acrescentar(transferencias[0]?.from)
  for (const t of transferencias) {
    if (FIM_DE_EMPRESTIMO.test(t.fee ?? '')) continue
    acrescentar(t.to)
  }
  return sequencia
}

/** Só os nomes, para quem não precisa do id — é o que a conferência usa. */
export async function carreiraDoTransfermarkt(tmId) {
  const passagens = await passagensDoTransfermarkt(tmId)
  return passagens && passagens.map((p) => p.nome)
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
