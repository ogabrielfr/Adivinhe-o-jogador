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
 *
 * A janela é a dos **últimos doze meses fechados**, e anda com o calendário.
 * Eram dois anos fixos, e a mediana de dois anos atrasava para quem subiu: o
 * Estevão, que quase ninguém procurava em 2024, ficava no difícil com 803
 * visualizações por mês. Doze meses ainda são o bastante para a mediana
 * ignorar o pico de um mês.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { pedir } from './wikidata.mjs'

const API = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article'

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

/** Os últimos doze meses fechados: em setembro de 2026, de setembro de 2025 a agosto de 2026. */
export function ultimosDozeMeses(hoje = new Date()) {
  const fim = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 0))
  const inicio = new Date(Date.UTC(fim.getUTCFullYear(), fim.getUTCMonth() - 11, 1))
  const dia = (d) => `${d.toISOString().slice(0, 10).replace(/-/g, '')}00`
  return { de: dia(inicio), ate: dia(fim) }
}

/** Mediana das visualizações mensais na janela, por padrão os últimos doze meses. */
export async function visualizacoesMensais(artigo, { de, ate } = ultimosDozeMeses()) {
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

/**
 * O arquivo de visualizações guarda a janela junto: número medido em outra
 * janela não se compara com o de agora, então cache de outra janela é
 * descartado e medido de novo.
 */
export function lerVisualizacoes(arquivo) {
  const { de, ate } = ultimosDozeMeses()
  const janela = `${de}-${ate}`
  if (!existsSync(arquivo)) return {}
  const salvo = JSON.parse(readFileSync(arquivo, 'utf8'))
  return salvo.janela === janela ? salvo.views : {}
}

export function gravarVisualizacoes(arquivo, views) {
  const { de, ate } = ultimosDozeMeses()
  writeFileSync(arquivo, JSON.stringify({ janela: `${de}-${ate}`, views }) + '\n')
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
