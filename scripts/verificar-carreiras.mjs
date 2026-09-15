/**
 * Confere a carreira de cada jogador contra uma fonte externa e aponta as
 * divergências. Não altera os dados — quem decide é você, olhando o relatório.
 *
 *   npm run verificar                 # todos
 *   npm run verificar -- dzeko pato   # só esses
 *
 * AVISO: este script nunca chegou a rodar. O ambiente onde foi escrito bloqueia
 * ogol.com.br, transfermarkt, zerozero e wikipedia no proxy de saída (403), então
 * o parser abaixo foi escrito a partir da estrutura pública do Ogol e ainda não
 * viu uma resposta real. Trate a primeira execução como parte do trabalho:
 * é esperado ajustar os seletores.
 */
import { JOGADORES } from '../src/dados/jogadores.ts'
import { CLUBE_POR_ID } from '../src/dados/clubes.ts'

const BASE = 'https://www.ogol.com.br'
const alvos = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const lista = alvos.length ? JOGADORES.filter((j) => alvos.includes(j.id)) : JOGADORES

const normalizar = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

async function buscar(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'acerte-o-jogador/1.0 (verificacao de dados)' } })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.text()
}

/** Acha a página do jogador: usa `fonte` quando o dado já traz a URL. */
async function paginaDo(jogador) {
  if (jogador.fonte?.startsWith('http')) return { url: jogador.fonte, html: await buscar(jogador.fonte) }
  const busca = `${BASE}/pesquisa.php?search_txt=${encodeURIComponent(jogador.nome)}`
  const html = await buscar(busca)
  const m = html.match(/href="(\/jogador\/[^"]+)"/)
  if (!m) throw new Error('jogador não encontrado na busca')
  const url = BASE + m[1]
  return { url, html: await buscar(url) }
}

/**
 * Extrai os clubes da tabela de carreira. O Ogol lista cada passagem numa
 * linha com link para /equipe/<slug>.
 */
function clubesDaPagina(html) {
  const bloco = html.split(/carreira|Carreira/)[1] ?? html
  const nomes = []
  for (const m of bloco.matchAll(/href="\/equipa\/([^"]+)"[^>]*>([^<]{2,60})</g)) {
    const nome = m[2].trim()
    if (nome && !nomes.includes(nome)) nomes.push(nome)
  }
  return nomes
}

let divergentes = 0
for (const j of lista) {
  const local = j.clubes.map((id) => CLUBE_POR_ID.get(id)?.nome ?? id)
  try {
    const { url, html } = await paginaDo(j)
    const fonte = clubesDaPagina(html)
    const faltando = fonte.filter((f) => !local.some((l) => normalizar(l) === normalizar(f)))
    const sobrando = local.filter((l) => !fonte.some((f) => normalizar(l) === normalizar(f)))

    if (!faltando.length && !sobrando.length) {
      console.log(`ok       ${j.id}`)
    } else {
      divergentes++
      console.log(`DIVERGE  ${j.id}  ${url}`)
      console.log(`         local:  ${local.join(' > ')}`)
      console.log(`         fonte:  ${fonte.join(' > ')}`)
      if (faltando.length) console.log(`         falta no dado:  ${faltando.join(', ')}`)
      if (sobrando.length) console.log(`         não tem na fonte: ${sobrando.join(', ')}`)
    }
  } catch (erro) {
    divergentes++
    console.log(`ERRO     ${j.id}: ${erro.message}`)
    if (/fetch failed|403|ENOTFOUND/i.test(erro.message)) {
      console.log('         (rede bloqueada para esta fonte — libere o domínio no ambiente)')
    }
  }
  await new Promise((r) => setTimeout(r, 1500)) // não martelar a fonte
}

console.log(`\n${lista.length - divergentes}/${lista.length} conferem`)
