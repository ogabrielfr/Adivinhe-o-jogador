/**
 * O SVG de escudo que o navegador recusa.
 *
 * Editor de vetor (Inkscape, Illustrator, Sketch) grava elementos e atributos
 * com prefixo próprio — `<sodipodi:namedview>`, `inkscape:label` — e às vezes
 * o arquivo sai sem a declaração `xmlns:` do prefixo. Para o navegador isso é
 * XML malformado: a imagem inteira não carrega, e o jogo cai no brasão
 * desenhado. Foi o que aconteceu com o Elche. O svgo também não lê o arquivo,
 * então ele passava pelo catálogo do jeito que veio.
 */
import { optimize } from 'svgo'

/** O endereço de verdade dos prefixos de editor mais comuns. */
const CONHECIDOS = {
  sodipodi: 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
  inkscape: 'http://www.inkscape.org/namespaces/inkscape',
  xlink: 'http://www.w3.org/1999/xlink',
  sketch: 'http://www.bohemiancoding.com/sketch/ns',
  serif: 'http://www.serif.com/',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  cc: 'http://creativecommons.org/ns#',
  dc: 'http://purl.org/dc/elements/1.1/',
  i: 'http://ns.adobe.com/AdobeIllustrator/10.0/',
}

/** Prefixos usados em elemento ou atributo sem a declaração `xmlns:` correspondente. */
export function prefixosSemDeclaracao(svg) {
  const usados = new Set()
  for (const m of svg.matchAll(/<\/?([A-Za-z_][\w.-]*):[A-Za-z_]/g)) usados.add(m[1])
  for (const m of svg.matchAll(/\s([A-Za-z_][\w.-]*):[A-Za-z_][\w.-]*\s*=/g)) usados.add(m[1])
  usados.delete('xmlns')
  usados.delete('xml')
  return [...usados].filter((p) => !new RegExp(`xmlns:${p}\\s*=`).test(svg))
}

/** O mesmo SVG, com os prefixos que faltavam declarados na raiz. */
export function declararPrefixos(svg) {
  const faltam = prefixosSemDeclaracao(svg)
  if (!faltam.length) return svg
  const declaracoes = faltam.map((p) => ` xmlns:${p}="${CONHECIDOS[p] ?? `urn:x-prefixo:${p}`}"`).join('')
  return svg.replace(/<svg\b/, `<svg${declaracoes}`)
}

/** O motivo pelo qual o navegador recusaria o SVG, ou null quando ele lê. */
export function defeitoDoSvg(svg) {
  const faltam = prefixosSemDeclaracao(svg)
  if (faltam.length) return `prefixo sem declaração: ${faltam.join(', ')}`
  try {
    optimize(svg, { plugins: [] })
    return null
  } catch (e) {
    return `XML malformado: ${String(e.message ?? e).split('\n')[0]}`
  }
}
