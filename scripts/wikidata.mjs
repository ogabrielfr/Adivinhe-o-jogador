/**
 * Acesso ao Wikidata — fonte de conferência e de catálogo.
 *
 * Por que Wikidata e não Ogol: o Ogol e o zerozero estão atrás do bot
 * management do Cloudflare e devolvem 403 `cf-mitigated: challenge` para
 * qualquer cliente automatizado, inclusive Chromium real (a interstitial "Um
 * momento…" não resolve). Isso é controle de acesso do próprio site, não do
 * egresso do ambiente — `tmssl.akamaized.net` e a Wikipédia respondem 200 da
 * mesma máquina. O Wikidata expõe carreira como dado estruturado (P54 com
 * qualificadores de período), tem API pública e é auditável por QID.
 */

const SPARQL = 'https://query.wikidata.org/sparql'
const API = 'https://www.wikidata.org/w/api.php'

/** A etiqueta pede identificação; sem ela o endpoint limita mais cedo. */
const AGENTE = 'acerte-o-jogador/1.0 (https://github.com/ogabrielfr/Adivinhe-o-jogador)'

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

/** Repete em 429/503, que o endpoint usa para pedir ritmo menor. */
export async function pedir(url, opcoes = {}, tentativas = 4) {
  for (let i = 0; i < tentativas; i++) {
    const r = await fetch(url, { ...opcoes, headers: { 'User-Agent': AGENTE, ...opcoes.headers } })
    if (r.ok) return r
    if (r.status === 429 || r.status === 503) {
      const pausa = Number(r.headers.get('retry-after')) * 1000 || 2000 * 2 ** i
      await espera(Math.min(pausa, 30000))
      continue
    }
    throw new Error(`HTTP ${r.status} em ${url.split('?')[0]}`)
  }
  throw new Error(`desistiu após ${tentativas} tentativas`)
}

/** Roda SPARQL e devolve as linhas já achatadas para valores simples. */
export async function consultar(query) {
  const r = await pedir(`${SPARQL}?format=json&query=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/sparql-results+json' },
  })
  const json = await r.json()
  return json.results.bindings.map((linha) =>
    Object.fromEntries(Object.entries(linha).map(([k, v]) => [k, v.value])),
  )
}

/** Procura uma entidade pelo nome e devolve os primeiros candidatos. */
export async function buscar(termo, { idioma = 'pt', limite = 5 } = {}) {
  const url = `${API}?action=wbsearchentities&search=${encodeURIComponent(termo)}` +
    `&language=${idioma}&uselang=${idioma}&type=item&limit=${limite}&format=json&origin=*`
  const json = await (await pedir(url)).json()
  return (json.search ?? []).map((x) => ({
    qid: x.id,
    rotulo: x.label,
    descricao: x.description ?? '',
  }))
}

/** Extrai o QID de uma URI do Wikidata. */
export const qidDe = (uri) => uri.split('/').pop()

/**
 * A imagem de topo de um artigo de clube costuma ser o escudo, mas nem sempre:
 * em clube pequeno ela é foto da sede ou do campo. Escudo errado é pior que
 * escudo ausente — o jogo desenha um brasão de reserva quando falta, e uma
 * foto de arquibancada no lugar do brasão destrói a partida.
 *
 * O formato separa bem os dois casos: brasão é SVG ou PNG, foto é JPG. Os JPG
 * só passam quando o nome do arquivo se assume como logo.
 */
const NOME_DE_ESCUDO = /logo|logotipo|escudo|brasao|bras[aã]o|crest|badge|emblem|shield|distintivo/i

export function pareceEscudo(url) {
  const arquivo = decodeURIComponent(url.split('?')[0].split('/').pop() ?? '')
  if (/\.(svg|png|gif)$/i.test(arquivo)) return true
  if (/\.(jpe?g|webp)$/i.test(arquivo)) return NOME_DE_ESCUDO.test(arquivo)
  return false
}

/**
 * Imagem de topo dos artigos, em lote. `pilicense=free` restringe ao que está
 * sob licença livre — muito escudo está no Commons sem estar ligado ao item do
 * Wikidata, e é assim que ele aparece.
 *
 * Devolve Map<título, url>. Títulos sem imagem simplesmente não entram.
 */
export async function imagensDeArtigos(idioma, titulos, { lote = 50 } = {}) {
  const achados = new Map()
  for (let i = 0; i < titulos.length; i += lote) {
    const parte = titulos.slice(i, i + lote)
    const url = `https://${idioma}.wikipedia.org/w/api.php?action=query&format=json` +
      `&prop=pageimages&piprop=original&pilicense=free&titles=${encodeURIComponent(parte.join('|'))}`
    try {
      const json = await (await pedir(url)).json()
      for (const p of Object.values(json.query?.pages ?? {})) {
        // ?utm_source vem grudado e quebra a extensão na hora de salvar
        const url = p.original?.source?.split('?')[0]
        if (url && pareceEscudo(url)) achados.set(p.title, url)
      }
    } catch (erro) {
      console.warn(`  lote de imagens falhou (${idioma}, ${i}): ${erro.message}`)
    }
    await espera(800)
  }
  return achados
}
