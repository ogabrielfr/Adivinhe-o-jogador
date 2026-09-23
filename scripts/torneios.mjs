/**
 * Copas do Mundo, Copa América, Eurocopa e Olimpíadas de cada jogador.
 *
 * Vem do P1344 do Wikidata ("participou de"). É o fato mais forte que a
 * biblioteca tem para a segunda dica: "três Copas seguidas, 1974, 1978 e
 * 1982" leva a um jogador; "custou 500 mil" não leva a lugar nenhum.
 *
 * Cobre 229 dos 300 — mas só 40 dos 100 do difícil, que é justamente onde a
 * dica mais faz falta. Por isso ele complementa os outros fatos em vez de
 * substituí-los.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe } from './wikidata.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO = join(raiz, 'scripts/torneios-jogadores.json')

/**
 * Uma consulta que falha calada vira dado errado — um lote perdido faz 60
 * jogadores parecerem que nunca jogaram torneio. Foi assim que a cobertura
 * apareceu como 184 de 300 na primeira medição, quando era 229.
 */
async function comInsistencia(consulta, tentativas = 4) {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await consultar(consulta)
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
    }
  }
  return null
}

/** Busca e guarda em disco os torneios dos QIDs que ainda não estão lá. */
export async function torneiosDe(qids) {
  const guardado = existsSync(ARQUIVO) ? JSON.parse(readFileSync(ARQUIVO, 'utf8')) : {}
  const faltando = [...new Set(qids)].filter((q) => q && !(q in guardado))

  if (faltando.length) {
    for (let i = 0; i < faltando.length; i += 40) {
      const fatia = faltando.slice(i, i + 40)
      const linhas = await comInsistencia(`
        SELECT ?j ?evLabel WHERE { VALUES ?j { ${fatia.map((q) => `wd:${q}`).join(' ')} }
          ?j wdt:P1344 ?ev .
          SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,mul,en". } }`)
      // lote perdido não vira "não jogou torneio": fica sem resposta para tentar depois
      if (!linhas) continue
      const por = new Map()
      for (const l of linhas) {
        const q = qidDe(l.j)
        if (!por.has(q)) por.set(q, new Set())
        por.get(q).add(l.evLabel)
      }
      for (const q of fatia) guardado[q] = [...(por.get(q) ?? [])]
    }
    writeFileSync(ARQUIVO, JSON.stringify(guardado) + '\n')
  }

  return guardado
}

const ANO_DA_COPA = /^Copa do Mundo FIFA de (\d{4})$/
const OUTROS = [
  [/^Copa Am[ée]rica de (\d{4})$/, 'Copa América'],
  [/^(?:Campeonato Europeu de Futebol|Eurocopa) de (\d{4})$/, 'Eurocopa'],
  [/^Jogos Ol[íi]mpicos de Ver[ãa]o de (\d{4})$/, 'Olimpíada'],
]

/**
 * Separa o que dá dica do que não dá. Amistoso, torneio de base e competição
 * de clube ficam de fora: o que interessa é o torneio que o torcedor
 * brasileiro situa no tempo sem pensar.
 */
export function torneiosQueContam(rotulos = []) {
  const copas = []
  const demais = []
  for (const r of rotulos) {
    const copa = ANO_DA_COPA.exec(r)
    if (copa) { copas.push(Number(copa[1])); continue }
    for (const [re, nome] of OUTROS) {
      const m = re.exec(r)
      if (m) { demais.push({ nome, ano: Number(m[1]) }); break }
    }
  }
  copas.sort((a, b) => a - b)
  demais.sort((a, b) => a.ano - b.ano)
  return { copas, demais }
}
