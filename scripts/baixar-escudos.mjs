/**
 * Monta public/escudos a partir de quatro repositórios públicos de logos e
 * gera src/dados/escudos.ts com o mapa clube -> arquivo.
 *
 * Os repositórios ficam em cache em .cache/ para não clonar a cada execução.
 * Clube sem escudo em nenhuma fonte não quebra o build: o jogo desenha um
 * brasão de reserva com as cores do clube.
 *
 *   npm run escudos            # só o que falta
 *   npm run escudos -- --forcar  # refaz tudo
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CLUBES } from '../src/dados/clubes.ts'
import { FONTES } from './fontes-escudos.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const cache = join(raiz, '.cache')
const saida = join(raiz, 'public', 'escudos')
const forcar = process.argv.includes('--forcar')

mkdirSync(cache, { recursive: true })
mkdirSync(saida, { recursive: true })

// ------------------------------------------------------------------ clonagem
function clonar(chave, url) {
  const destino = join(cache, chave)
  if (existsSync(join(destino, '.git'))) return destino
  console.log(`clonando ${chave}...`)
  execFileSync('git', ['clone', '--depth', '1', '--quiet', url, destino], { stdio: 'inherit' })
  return destino
}

const repo = Object.fromEntries(Object.entries(FONTES.REPOS).map(([k, url]) => [k, clonar(k, url)]))

// ------------------------------------------------------------------- índices
const normalizar = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

/** palavras que aparecem em quase todo nome de clube e não ajudam a distinguir */
const RUIDO = new Set(['fc', 'cf', 'sc', 'ac', 'afc', 'ca', 'cd', 'ud', 'rcd', 'as', 'ss', 'bk', 'sk', 'if',
  'club', 'clube', 'de', 'do', 'da', 'del', 'the', 'futbol', 'football', 'calcio', 'sv', 'vfl', 'vfb', 'tsg', 'sl', 'bv'])

const tokens = (s) => normalizar(s).split(' ').filter((t) => t && !RUIDO.has(t))

function listarArquivos(dir, filtro) {
  const saida = []
  const andar = (d) => {
    for (const nome of readdirSync(d)) {
      const p = join(d, nome)
      if (nome === '.git') continue
      if (statSync(p).isDirectory()) andar(p)
      else if (filtro(p)) saida.push(p)
    }
  }
  if (existsSync(dir)) andar(dir)
  return saida
}

// índice europeu: prefere a pasta logos/ (temporada atual) sobre history/
const indiceEu = []
for (const base of ['logos', 'history']) {
  for (const p of listarArquivos(join(repo.eu, base), (f) => f.endsWith('.png'))) {
    indiceEu.push({ caminho: p, nome: basename(p, '.png'), atual: base === 'logos' })
  }
}
indiceEu.sort((a, b) => Number(b.atual) - Number(a.atual))

// ------------------------------------------------------- resolução automática
function melhorEuropeu(clube) {
  const alvo = tokens(FONTES.ALIASES[clube.id] ?? clube.nome)
  if (!alvo.length) return null
  let melhor = null
  for (const item of indiceEu) {
    const cand = tokens(item.nome)
    const comuns = alvo.filter((t) => cand.includes(t)).length
    if (!comuns) continue
    // exige que todos os tokens do alvo apareçam — evita casar "Inter" com "Inter Turku"
    if (comuns < alvo.length) continue
    const score = comuns * 10 - Math.abs(cand.length - alvo.length) + (item.atual ? 1 : 0)
    if (!melhor || score > melhor.score) melhor = { ...item, score }
  }
  return melhor
}

// ------------------------------------------------------------- extração de br
let spriteBr = null
function svgDoSprite(idSimbolo) {
  if (!spriteBr) {
    spriteBr = ''
    for (const f of ['serie-a.svg', 'serie-b.svg']) {
      const p = join(repo.br, f)
      if (existsSync(p)) spriteBr += readFileSync(p, 'utf8')
    }
  }
  const re = new RegExp(`<symbol([^>]*\\bid="${idSimbolo}"[^>]*)>([\\s\\S]*?)</symbol>`, 'i')
  const m = spriteBr.match(re)
  if (!m) return null
  const viewBox = m[1].match(/viewBox="([^"]+)"/)?.[1]
  if (!viewBox) return null
  const corpo = m[2].replace(/<title>[\s\S]*?<\/title>/gi, '').trim()
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${corpo}</svg>\n`
}

// ------------------------------------------------------------- escolha no fc
function svgDoFclogo(pasta) {
  const dir = join(repo.fc, 'src/data/logos', pasta, 'svg')
  if (!existsSync(dir)) return null
  const arquivos = readdirSync(dir).filter((f) => f.endsWith('.svg'))
  // descarta variantes monocromáticas e de traçado; fica com a versão mais recente
  const principais = arquivos.filter((f) => !/-mono|-graph/i.test(f))
  const escolhido = (principais.length ? principais : arquivos).sort().pop()
  return escolhido ? join(dir, escolhido) : null
}

// ------------------------------------------------------------------- execução
const mapa = {}
const faltando = []
const relatorio = []

for (const clube of CLUBES) {
  const jaTem = ['svg', 'png', 'gif', 'jpg'].map((e) => `${clube.id}.${e}`).find((f) => existsSync(join(saida, f)))
  if (jaTem && !forcar) {
    mapa[clube.id] = jaTem
    continue
  }

  const fixo = FONTES.FIXOS[clube.id]
  let origem = null

  if (fixo?.startsWith('br:')) {
    const svg = svgDoSprite(fixo.slice(3))
    if (svg) {
      writeFileSync(join(saida, `${clube.id}.svg`), svg)
      mapa[clube.id] = `${clube.id}.svg`
      relatorio.push(`  br  ${clube.id}`)
      continue
    }
  } else if (fixo?.startsWith('fc:')) {
    origem = svgDoFclogo(fixo.slice(3))
  } else if (fixo?.startsWith('db:')) {
    const p = join(repo.db, fixo.slice(3))
    origem = existsSync(p) ? p : null
  } else if (fixo?.startsWith('eu:')) {
    const p = join(repo.eu, fixo.slice(3))
    origem = existsSync(p) ? p : null
  }

  if (!origem) {
    const achado = melhorEuropeu(clube)
    if (achado) origem = achado.caminho
  }

  if (!origem || !existsSync(origem)) {
    faltando.push(clube.id)
    continue
  }

  const ext = extname(origem).toLowerCase()
  const destino = join(saida, `${clube.id}${ext}`)
  writeFileSync(destino, readFileSync(origem))
  mapa[clube.id] = `${clube.id}${ext}`
  relatorio.push(`  ${fixo ? fixo.slice(0, 2) : 'eu'}  ${clube.id}  <-  ${basename(origem)}`)
}

// remove arquivos de clubes que saíram do catálogo
for (const f of readdirSync(saida)) {
  if (!Object.values(mapa).includes(f)) rmSync(join(saida, f))
}

// ------------------------------------------------------------------ manifesto
const linhas = Object.keys(mapa).sort().map((id) => `  '${id}': '${mapa[id]}',`)
writeFileSync(
  join(raiz, 'src/dados/escudos.ts'),
  `// GERADO POR scripts/baixar-escudos.mjs — não edite à mão.\n` +
    `// Clube ausente deste mapa é desenhado com o brasão de reserva.\n` +
    `export const ESCUDOS: Record<string, string> = {\n${linhas.join('\n')}\n}\n`,
)

console.log(relatorio.join('\n'))
console.log(`\nescudos resolvidos: ${Object.keys(mapa).length}/${CLUBES.length}`)
if (faltando.length) console.log(`sem escudo (brasão de reserva): ${faltando.join(', ')}`)
