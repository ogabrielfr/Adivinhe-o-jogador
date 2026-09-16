/**
 * Carreira a partir do infobox do artigo na Wikipédia.
 *
 * Por que existe, além do Wikidata: o Wikidata guarda carreira na propriedade
 * P54, que é preenchida à mão e fica para trás. O infobox do artigo costuma
 * estar mais completo — o Grêmio do Elkeson e o do Diego Tardelli existem no
 * artigo e não existem no P54. Como o jogo depende de a carreira estar certa,
 * vale ler as duas.
 *
 * O campo `clubes` do infobox lista as passagens em ordem, numa mistura de
 * três formatos que convivem no mesmo artigo:
 *
 *   [[Grêmio Foot-Ball Porto Alegrense|Grêmio]]   link com rótulo
 *   {{Futebol Grêmio}}                            template de clube
 *   Chengdu Rongcheng Football Club               texto solto
 */
import { pedir } from './wikidata.mjs'

const API = (idioma) => `https://${idioma}.wikipedia.org/w/api.php`

/** Marcas do infobox que não são clube: empréstimo, seta, formatação. */
const RUIDO = /^(seta fut|emp fut|small|nowrap|0|·|—|-)$/i

/** Um template `{{...}}` vira nome de clube, ou null se for marcação. */
function doTemplate(conteudo) {
  const corpo = conteudo.replace(/^\{\{|\}\}$/g, '').split('|')[0].trim()
  const comPrefixo = corpo.match(/^(?:Futebol|Football|Fut)\s+(.+)$/i)
  if (comPrefixo) return comPrefixo[1].trim()
  return RUIDO.test(corpo) ? null : null // template sem prefixo conhecido não é clube
}

/** Um link `[[A|B]]` vira o rótulo B, que é o nome usual do clube. */
function doLink(conteudo) {
  const m = conteudo.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/)
  if (!m) return null
  const nome = (m[2] ?? m[1]).trim()
  return RUIDO.test(nome) ? null : nome
}

/**
 * O primeiro clube de uma linha do infobox. Uma linha mistura marcação e
 * clube — `{{seta fut}} {{Futebol Real Betis}} {{emp fut}}` é uma só — então
 * percorre os tokens na ordem e devolve o primeiro que nomeia um clube.
 */
function primeiroClube(linha) {
  for (const m of linha.matchAll(/\{\{[^{}]*\}\}|\[\[[^\]]*\]\]/g)) {
    const token = m[0]
    const nome = token.startsWith('{{') ? doTemplate(token) : doLink(token)
    if (nome) return nome
  }
  // sem template nem link: texto solto ("Chengdu Rongcheng Football Club")
  const solto = linha.replace(/\{\{[^{}]*\}\}|<[^>]+>/g, '').trim()
  return !solto || RUIDO.test(solto) ? null : solto
}

/**
 * Lê o wikitexto e devolve os clubes do infobox, em ordem, sem repetir em
 * sequência (empréstimo costuma render a mesma linha duas vezes).
 *
 * Devolve lista vazia quando o artigo não tem o campo — acontece, e aí a
 * carreira está só na prosa. Não é erro; é fonte sem cobertura para aquele
 * jogador.
 */
export function clubesDoInfobox(wikitexto) {
  const campo = wikitexto.match(
    /\|\s*clubes\s*=([\s\S]*?)\n\s*\|\s*(?:jogos|anoselecao|selecaonacional|ano|atualizado|treinador)/i,
  )
  if (!campo) return []

  const clubes = []
  for (const linha of campo[1].split(/<br\s*\/?>/i)) {
    const nome = primeiroClube(linha)
    if (nome && clubes[clubes.length - 1] !== nome) clubes.push(nome)
  }
  return clubes
}

/** Busca o wikitexto de um artigo. */
export async function carreiraDaWikipedia(titulo, idioma = 'pt') {
  const url = `${API(idioma)}?action=query&format=json&prop=revisions&rvprop=content` +
    `&rvslots=main&titles=${encodeURIComponent(titulo)}`
  const json = await (await pedir(url)).json()
  const paginas = Object.values(json.query?.pages ?? {})
  const texto = paginas[0]?.revisions?.[0]?.slots?.main?.['*']
  return texto ? clubesDoInfobox(texto) : []
}
