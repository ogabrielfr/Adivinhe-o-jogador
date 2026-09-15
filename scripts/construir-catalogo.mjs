/**
 * Varre os repositórios de logos e monta, de uma vez:
 *   - public/escudos/            todos os escudos disponíveis
 *   - src/dados/clubes.ts        o catálogo completo de clubes
 *
 * Um clube presente em mais de uma fonte fica com a de melhor qualidade
 * (SVG vetorial > PNG transparente > GIF/JPG legado).
 *
 *   npm run catalogo
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { optimize } from 'svgo'
import { FONTES } from './fontes-escudos.mjs'
import { mesmoClube } from './nomes-clube.mjs'
import { pareceEscudo } from './wikidata.mjs'
import { FEDERACAO_PAIS, LIGA_PAIS, DB_PAIS } from './paises.mjs'
import { JOGADORES } from '../src/dados/jogadores.ts'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const cache = join(raiz, '.cache')
const saida = join(raiz, 'public', 'escudos')

mkdirSync(cache, { recursive: true })
rmSync(saida, { recursive: true, force: true })
mkdirSync(saida, { recursive: true })

function clonar(chave, url) {
  const destino = join(cache, chave)
  if (existsSync(join(destino, '.git'))) return destino
  console.log(`clonando ${chave}...`)
  execFileSync('git', ['clone', '--depth', '1', '--quiet', url, destino], { stdio: 'inherit' })
  return destino
}
const repo = Object.fromEntries(Object.entries(FONTES.REPOS).map(([k, u]) => [k, clonar(k, u)]))

// ------------------------------------------------------------------- auxiliar
const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** tira prefixos/sufixos que só existem no nome oficial e atrapalham o reconhecimento */
function limparNome(nome) {
  return nome
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/^\d+[-_ ]*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function andar(dir, filtro, saida = []) {
  if (!existsSync(dir)) return saida
  for (const nome of readdirSync(dir)) {
    if (nome === '.git') continue
    const p = join(dir, nome)
    if (statSync(p).isDirectory()) andar(p, filtro, saida)
    else if (filtro(p)) saida.push(p)
  }
  return saida
}

// qualidade da fonte: menor é melhor
const QUALIDADE = { br: 0, fc: 1, eu: 2, db: 3, wd: 4 }

/** @type {Map<string, {id, nome, pais, origem, fonte, qualidade, svgInline?}>} */
const candidatos = new Map()

/**
 * Os repositórios escrevem o mesmo clube de formas diferentes: "vasco" e
 * "vascodagama", "arouca" e "fc-arouca", "fiorentina" e "acf-fiorentina".
 * A chave joga fora hífens e as siglas societárias que não distinguem clube.
 */
const SIGLAS = /^(fc|cf|ac|acf|sc|afc|ca|cd|ud|rcd|as|ss|ssc|bk|sk|if|fk|nk|hk|jk|sv|vfl|vfb|tsg|sl|bv|rc|us|ogc|psv|club|clube)$/
const chaveDedup = (c) =>
  `${c.pais}:${c.id.split('-').filter((t) => !SIGLAS.test(t)).join('')}`

function registrar(c) {
  const chave = chaveDedup(c)
  const atual = candidatos.get(chave)
  if (!atual || c.qualidade < atual.qualidade) candidatos.set(chave, c)
}

// ------------------------------------------------------ 1. brasileiros (SVG)
let sprite = ''
for (const f of ['serie-a.svg', 'serie-b.svg']) {
  const p = join(repo.br, f)
  if (existsSync(p)) sprite += readFileSync(p, 'utf8')
}
for (const m of sprite.matchAll(/<symbol([^>]*)>([\s\S]*?)<\/symbol>/g)) {
  const id = m[1].match(/id="([^"]+)"/)?.[1]
  const viewBox = m[1].match(/viewBox="([^"]+)"/)?.[1]
  if (!id || !viewBox) continue
  const corpo = m[2].replace(/<title>[\s\S]*?<\/title>/gi, '').trim()
  registrar({
    id,
    nome: id.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' '),
    pais: 'BR',
    fonte: 'br',
    qualidade: QUALIDADE.br,
    svgInline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${corpo}</svg>\n`,
  })
}

// ------------------------------------------------------------- 2. FCLOGO (SVG)
for (const fed of readdirSync(join(repo.fc, 'src/data/logos'))) {
  const dirClubes = join(repo.fc, 'src/data/logos', fed, 'clubs')
  if (!existsSync(dirClubes)) continue
  const pais = FEDERACAO_PAIS[fed]
  if (!pais) continue
  for (const pasta of readdirSync(dirClubes)) {
    const dirSvg = join(dirClubes, pasta, 'svg')
    if (!existsSync(dirSvg)) continue
    const arquivos = readdirSync(dirSvg).filter((f) => f.endsWith('.svg'))
    const principais = arquivos.filter((f) => !/-mono|-graph/i.test(f))
    const escolhido = (principais.length ? principais : arquivos).sort().pop()
    if (!escolhido) continue
    const nome = limparNome(pasta.replace(/^\d+[-_]?\s*/, ''))
    registrar({ id: slug(nome), nome, pais, fonte: 'fc', qualidade: QUALIDADE.fc, origem: join(dirSvg, escolhido) })
  }
}

// --------------------------------------------- 3. Europa (PNG transparente)
// logos/ é a temporada atual; history/ traz quem caiu de divisão
for (const base of ['logos', 'history']) {
  for (const p of andar(join(repo.eu, base), (f) => f.endsWith('.png'))) {
    const partes = p.split('/')
    const pastaLiga = partes[partes.length - 2]
    const pais = LIGA_PAIS[pastaLiga.split(' - ')[0]]
    if (!pais) continue
    const nome = limparNome(basename(p, '.png'))
    registrar({ id: slug(nome), nome, pais, fonte: 'eu', qualidade: QUALIDADE.eu, origem: p })
  }
}

// ------------------------------------------------- 4. football.db (legado)
for (const p of andar(repo.db, (f) => /\.(png|gif|jpe?g)$/i.test(f))) {
  const partes = p.split('/')
  const pastaPais = partes[partes.length - 2]
  const pais = DB_PAIS[pastaPais]
  if (!pais) continue
  const bruto = basename(p, extname(p))
  registrar({ id: slug(bruto), nome: limparNome(bruto), pais, fonte: 'db', qualidade: QUALIDADE.db, origem: p })
}

// ------------- 4.5 Wikidata: estaduais brasileiros, Ásia, Golfo, Américas
/**
 * Os quatro repositórios acima cobrem as ligas grandes da Europa e a Série A/B
 * brasileira. Faltava o resto: os estaduais, a Ásia, o Golfo. Esta fonte vem
 * de scripts/coletar-clubes.mjs, que já resolveu a URL do escudo de cada um.
 *
 * Dois cuidados que o resto do script não precisa ter:
 *
 * - **Não passa pela chave de deduplicação.** Ela junta clube com o mesmo nome
 *   normalizado no mesmo país, o que é certo para "vasco"/"vascodagama" e
 *   desastroso aqui: existem dez Guaranis e cinco Botafogos, clubes diferentes
 *   de cidades diferentes. Externo é chaveado pelo QID, que é único.
 * - **Só entra quem o catálogo ainda não tem.** Quando o nome bate com um
 *   clube já vindo de repositório, o repositório ganha: o id dele é curado e
 *   os jogadores já apontam para ele.
 */
const ARQ_EXTERNOS = join(raiz, 'scripts', 'clubes-externos.json')
const cacheExternos = join(cache, 'externos')
mkdirSync(cacheExternos, { recursive: true })

const AGENTE = 'acerte-o-jogador/1.0 (https://github.com/ogabrielfr/Adivinhe-o-jogador)'
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const TETO_ESCUDO = 3 * 1024 * 1024

async function baixar(url, destino) {
  if (existsSync(destino) && statSync(destino).size > 0) return true
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': AGENTE }, redirect: 'follow' })
      if (r.status === 429 || r.status === 503) {
        const pedido = Number(r.headers.get('retry-after')) * 1000
        await espera(Math.min(pedido || 1500 * 2 ** tentativa, 20000))
        continue
      }
      if (!r.ok) return false
      // brasão não pesa megabytes; o que pesa é foto entrando por engano
      const anunciado = Number(r.headers.get('content-length'))
      if (anunciado > TETO_ESCUDO) return false
      const dados = Buffer.from(await r.arrayBuffer())
      if (!dados.length || dados.length > TETO_ESCUDO) return false
      writeFileSync(destino, dados)
      return true
    } catch {
      await espera(1000 * 2 ** tentativa)
    }
  }
  return false
}

/** O nome bom é o do artigo quando ele desambigua ("... (Ribeirão Preto)"). */
function nomeExterno(c) {
  if (c.artigo?.includes('(') && !c.nome.includes('(')) return c.artigo
  return c.nome
}

if (existsSync(ARQ_EXTERNOS)) {
  const externos = JSON.parse(readFileSync(ARQ_EXTERNOS, 'utf8'))
  const idsUsados = new Set([...candidatos.values()].map((c) => c.id))

  // comparar cada externo com o catálogo inteiro seria milhões de chamadas;
  // clube só colide com clube do mesmo país
  const porPais = new Map()
  for (const a of candidatos.values()) {
    if (!porPais.has(a.pais)) porPais.set(a.pais, [])
    porPais.get(a.pais).push(a.nome)
  }

  // 1. decide id e destino de cada um, em ordem, para o resultado não depender
  //    de quem terminar de baixar primeiro
  const fila = []
  let repetidos = 0, naoEhEscudo = 0
  for (const c of externos) {
    // a imagem de topo do artigo às vezes é foto da sede, não o brasão
    if (!pareceEscudo(c.url)) { naoEhEscudo++; continue }

    const nome = limparNome(nomeExterno(c))

    // Clube que já veio de repositório fica com a versão de lá: o id é curado
    // e os jogadores já apontam para ele. Nome com parêntese é desambiguado
    // ("... (Ribeirão Preto)"), logo não é o clube famoso de mesmo nome.
    const desambiguado = nome.includes('(')
    if (!desambiguado && (porPais.get(c.pais) ?? []).some((n) => mesmoClube(n, nome))) {
      repetidos++
      continue
    }

    // nome repetido entre externos: desempata pela cidade, depois pelo QID
    let id = slug(nome)
    if (idsUsados.has(id)) id = slug(`${nome} ${c.local ?? ''}`.trim())
    if (idsUsados.has(id)) id = `${slug(nome)}-${c.qid.toLowerCase()}`
    idsUsados.add(id)

    const ext = (c.url.match(/\.(svg|png|gif|jpe?g)(?:$|\?)/i)?.[1] ?? 'png').toLowerCase()
    fila.push({ ...c, id, nome, arquivo: join(cacheExternos, `${c.qid}.${ext}`) })
  }

  /**
   * 2. baixa em paralelo. Uma requisição leva mais de um segundo, quase toda
   *    em latência, então em série isto passaria de uma hora. Com oito o
   *    Wikimedia começou a devolver 429; cinco passa limpo.
   */
  /**
   * Duas filas, uma por host, porque os limites são muito diferentes. O
   * Wikimedia devolve 429 cedo — dividimos o IP de saída com outros — e o CDN
   * do Transfermarkt não reclama. Numa fila só, todos os workers ficavam
   * presos no backoff do Wikimedia e os mil e oitocentos do Transfermarkt,
   * que saem em minutos, esperavam junto.
   */
  const ehWikimedia = (u) => u.includes('wikimedia.org') || u.includes('wikipedia.org')
  const filas = [
    { itens: fila.filter((c) => ehWikimedia(c.url)), paralelas: 2, i: 0 },
    { itens: fila.filter((c) => !ehWikimedia(c.url)), paralelas: 6, i: 0 },
  ]

  let baixados = 0, falhas = 0
  console.log(`\nbaixando escudos do Wikidata (${fila.length} clubes, ${repetidos} já no catálogo)`)
  console.log(`  ${filas[0].itens.length} no Wikimedia (2 por vez) | ${filas[1].itens.length} no Transfermarkt (6 por vez)`)

  await Promise.all(
    filas.flatMap((f) =>
      Array.from({ length: f.paralelas }, async () => {
        while (f.i < f.itens.length) {
          const c = f.itens[f.i++]
          if (await baixar(c.url, c.arquivo)) {
            c.ok = true
            if (++baixados % 400 === 0) console.log(`  ${baixados}/${fila.length}`)
          } else {
            falhas++
          }
        }
      }),
    ),
  )

  // 3. registra na ordem original, fora da chave de deduplicação
  for (const c of fila) {
    if (!c.ok) continue
    candidatos.set(`wd:${c.qid}`, {
      id: c.id, nome: c.nome, pais: c.pais, fonte: 'wd', qualidade: QUALIDADE.wd, origem: c.arquivo,
    })
  }
  console.log(`  +${baixados} novos | ${repetidos} já no catálogo | ${naoEhEscudo} imagem que não é escudo | ${falhas} falharam`)
} else {
  console.warn('  scripts/clubes-externos.json não existe — rode `npm run coletar` antes')
}

// ------------------------------- 5. ids e nomes fixados dos clubes em uso
// FIXOS aponta id canônico -> caminho na fonte; garante que "flamengo",
// "barcelona" etc. mantenham o id que os jogadores já referenciam.
import { CANONICOS, SEM_ESCUDO, DESCARTAR } from './clubes-canonicos.mjs'
for (const [id, dados] of Object.entries(CANONICOS)) {
  const entrada = [...candidatos.entries()].find(([, c]) => c.id === dados.de)
  if (!entrada) {
    console.warn(`  canônico sem fonte: ${id} (procurava "${dados.de}")`)
    continue
  }
  const [chave, achado] = entrada
  candidatos.delete(chave)
  const atualizado = { ...achado, id, nome: dados.nome, pais: dados.pais ?? achado.pais }
  candidatos.set(chaveDedup(atualizado), atualizado)
}

for (const id of DESCARTAR) {
  const entrada = [...candidatos.entries()].find(([, c]) => c.id === id)
  if (entrada) candidatos.delete(entrada[0])
}

// clubes que nenhuma fonte cobre entram sem arquivo: o jogo desenha o brasão de
// reserva. Só entram se continuarem descobertos — com o Wikidata vários deles
// passaram a ter escudo de verdade, e o de reserva viraria um id duplicado.
for (const [id, dados] of Object.entries(SEM_ESCUDO)) {
  if ([...candidatos.values()].some((c) => c.id === id)) continue
  const c = { id, nome: dados.nome, pais: dados.pais, cores: dados.cores, fonte: 'reserva', qualidade: 9 }
  candidatos.set(chaveDedup(c), c)
}

/**
 * O id vira nome de arquivo do escudo e chave do `CLUBE_POR_ID`, então dois
 * clubes com o mesmo id significam um escudo sobrescrevendo o outro. Isso já
 * acontecia com "santos": o Santos brasileiro e o Santos Laguna mexicano
 * apontavam para o mesmo arquivo. A chave de deduplicação não pega porque ela
 * separa por país, e o id não.
 *
 * O clube fixado em CANONICOS fica com o id — é o que os jogadores usam. Os
 * outros ganham o sufixo do país.
 */
const porId = new Map()
for (const c of candidatos.values()) {
  if (!porId.has(c.id)) porId.set(c.id, [])
  porId.get(c.id).push(c)
}
for (const [id, grupo] of porId) {
  if (grupo.length < 2) continue
  const canonico = CANONICOS[id]
  const fica = grupo.find((c) => canonico && c.pais === canonico.pais) ?? grupo[0]
  for (const c of grupo) {
    if (c === fica) continue
    let novo = `${c.id}-${c.pais.toLowerCase()}`
    let n = 2
    while (porId.has(novo) || [...candidatos.values()].some((o) => o.id === novo)) novo = `${c.id}-${c.pais.toLowerCase()}-${n++}`
    console.log(`  id repetido "${id}": ${c.nome} [${c.pais}] vira "${novo}"`)
    c.id = novo
  }
}

// ----------------------------------------------------------- 6. otimização
/**
 * A interface nunca desenha um escudo maior que 104 CSS px, então 256 px cobre
 * telas 2x com folga. Sem esta etapa o catálogo passa de 40 MB.
 */
const LADO = 256
const LIMITE_SVG = 16 * 1024

const CONFIG_SVGO = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        // removeViewBox saiu do preset-default no svgo 4: declarar aqui só
        // gerava um aviso por arquivo, milhares deles. O viewBox é preservado
        // por padrão, que é o que o escudo precisa para escalar.
        overrides: {
          convertPathData: { floatPrecision: 1 },
          cleanupNumericValues: { floatPrecision: 1 },
        },
      },
    },
  ],
}

async function gravarEscudo(c, destinoSemExt) {
  const svgBruto = c.svgInline ?? (extname(c.origem ?? '').toLowerCase() === '.svg' ? readFileSync(c.origem, 'utf8') : null)

  if (svgBruto) {
    let texto = svgBruto
    try {
      texto = optimize(svgBruto, CONFIG_SVGO).data
    } catch {
      // svg fora do padrão: fica como veio
    }
    if (Buffer.byteLength(texto) <= LIMITE_SVG) {
      writeFileSync(`${destinoSemExt}.svg`, texto)
      return `${basename(destinoSemExt)}.svg`
    }
    // vetor pesado demais para valer a pena: vira bitmap no tamanho de uso
    try {
      const png = await sharp(Buffer.from(texto), { density: 300 })
        .resize(LADO, LADO, { fit: 'inside', withoutEnlargement: true, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer()
      writeFileSync(`${destinoSemExt}.png`, png)
      return `${basename(destinoSemExt)}.png`
    } catch {
      // svg que o rasterizador recusa: guardar o vetor grande é melhor que perder o clube
      writeFileSync(`${destinoSemExt}.svg`, texto)
      return `${basename(destinoSemExt)}.svg`
    }
  }

  const png = await sharp(readFileSync(c.origem))
    .resize(LADO, LADO, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
  writeFileSync(`${destinoSemExt}.png`, png)
  return `${basename(destinoSemExt)}.png`
}

// -------------------------------------------------------------- 7. gravação
const clubes = [...candidatos.values()].sort((a, b) => a.id.localeCompare(b.id))
const arquivoDe = {}
let feitos = 0
for (const c of clubes) {
  if (c.fonte === 'reserva') continue
  try {
    arquivoDe[c.id] = await gravarEscudo(c, join(saida, c.id))
  } catch (erro) {
    console.warn(`  falhou: ${c.id} (${erro.message})`)
    continue
  }
  if (++feitos % 200 === 0) console.log(`  ${feitos}/${clubes.length}`)
}

const comEscudo = clubes.filter((c) => arquivoDe[c.id] || c.cores)

/**
 * O catálogo completo é uma biblioteca de autoria, não dado de execução: o
 * jogo mostra uns dez escudos por dia. Mandar os milhares para o navegador
 * seria quase tudo peso morto, então `clubes.ts` leva só os clubes que algum
 * jogador usa e o resto fica no índice JSON, que o app não importa.
 *
 * Ao acrescentar um jogador, rode `npm run catalogo` de novo para que os
 * clubes novos dele entrem no pacote.
 */
const emUso = new Set(JOGADORES.flatMap((j) => j.clubes))
const doJogo = comEscudo.filter((c) => emUso.has(c.id))

const faltando = [...emUso].filter((id) => !comEscudo.some((c) => c.id === id))
if (faltando.length) {
  console.warn(`\n  ATENÇÃO: jogador aponta para clube que o catálogo não tem: ${faltando.join(', ')}`)
}

const linhas = doJogo.map((c) => {
  const campos = [`id: '${c.id}'`, `nome: ${JSON.stringify(c.nome)}`, `pais: '${c.pais}'`]
  if (arquivoDe[c.id]) campos.push(`escudo: '${arquivoDe[c.id]}'`)
  if (c.cores) campos.push(`cores: ['${c.cores[0]}', '${c.cores[1]}']`)
  return `  { ${campos.join(', ')} },`
})
writeFileSync(
  join(raiz, 'src/dados/clubes.ts'),
  `// GERADO POR scripts/construir-catalogo.mjs — não edite à mão.\n` +
    `// Só os clubes em uso pelos jogadores; o catálogo completo, para consultar\n` +
    `// ao escrever uma carreira nova, está em scripts/catalogo-completo.json.\n` +
    `// Nome e id dos clubes usados pelos jogadores vivem em scripts/clubes-canonicos.mjs.\n` +
    `import type { Clube } from './tipos'\n\n` +
    `export const CLUBES: Clube[] = [\n${linhas.join('\n')}\n]\n\n` +
    `export const CLUBE_POR_ID = new Map(CLUBES.map((c) => [c.id, c]))\n`,
)

writeFileSync(
  join(raiz, 'scripts/catalogo-completo.json'),
  JSON.stringify(
    comEscudo.map((c) => ({ id: c.id, nome: c.nome, pais: c.pais, escudo: arquivoDe[c.id] ?? null })),
    null, 1,
  ) + '\n',
)

const porFonte = {}
for (const c of comEscudo) porFonte[c.fonte] = (porFonte[c.fonte] ?? 0) + 1
const porPais = {}
for (const c of comEscudo) porPais[c.pais] = (porPais[c.pais] ?? 0) + 1

console.log(`\nclubes no catálogo: ${comEscudo.length}  (${doJogo.length} no pacote do jogo)`)
console.log('por fonte:', porFonte)
console.log('Brasil:', porPais.BR ?? 0, '| países cobertos:', Object.keys(porPais).length)
