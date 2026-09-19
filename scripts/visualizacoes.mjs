/**
 * Visualizações mensais do artigo na Wikipédia em português.
 *
 * É a melhor medida disponível de "o torcedor brasileiro reconhece": mede
 * quanta gente procura o jogador em português, não fama global. Substitui o
 * número de links de Wikipédia, que contava alcance no mundo e enchia o nível
 * fácil de nome que o Brasil não conhece.
 *
 * Usa a **mediana** e não a soma porque transferência e polêmica produzem pico
 * de um ou dois meses que a soma premia e a mediana ignora — a pergunta é quem
 * o torcedor conhece sempre, não quem esteve no noticiário em março.
 */
import { pedir } from './wikidata.mjs'

const API = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article'

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

/** Mediana das visualizações mensais dos últimos dois anos. */
export async function visualizacoesMensais(artigo, { de = '2024090100', ate = '2026083100' } = {}) {
  const titulo = encodeURIComponent(artigo.replace(/ /g, '_'))
  const url = `${API}/pt.wikipedia/all-access/all-agents/${titulo}/monthly/${de}/${ate}`
  try {
    const json = await (await pedir(url)).json()
    const v = (json.items ?? []).map((x) => x.views).sort((a, b) => a - b)
    if (!v.length) return 0
    return Math.round(v[Math.floor(v.length / 2)])
  } catch {
    // artigo sem dado de visualização: vale zero e os outros critérios decidem
    return 0
  }
}

/** Em lote, devagar: a API responde 429 quando se insiste. */
export async function visualizacoesDe(artigos, { pausa = 350 } = {}) {
  const saida = new Map()
  for (const [i, a] of artigos.entries()) {
    saida.set(a, await visualizacoesMensais(a))
    if (i % 50 === 49) console.log(`  ${i + 1}/${artigos.length}`)
    await espera(pausa)
  }
  return saida
}
