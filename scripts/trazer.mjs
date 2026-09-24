/**
 * Traz para a biblioteca jogadores escolhidos à mão, com o nível decidido.
 *
 *   npm run trazer -- Q615:facil:messi Q180642:intermediario
 *
 * Cada argumento é `QID:nível` ou `QID:nível:id`. O id explícito serve para
 * quem já saiu no jogo com outro id: a agenda reconhece quem não pode voltar
 * logo pelo id (`scripts/antes-da-agenda.mjs`), e o Messi saiu em setembro
 * como `messi`.
 *
 * O gerador e o `repor` escolhem sozinhos, pela procura; este comando é para
 * o nome que o cliente pediu. O caminho de aceitação é o mesmo: carreira do
 * histórico do Transfermarkt, só jogo profissional, cada passagem ligada a um
 * clube do catálogo pelo resolvedor. Passagem que trava ou carreira de um
 * clube só não entra — o comando diz por quê, e o conserto vai para
 * `scripts/carreiras-corrigidas.mjs` ou `scripts/clubes-canonicos.mjs`.
 *
 * Rode `npm run agenda` antes, com a biblioteca publicada, e depois deste:
 * `npm run catalogo` (os clubes novos entram no pacote) e `npm run dicas`.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consultar, qidDe } from './wikidata.mjs'
import { idsDoTransfermarkt, passagensDoTransfermarkt, perfilDoTransfermarkt, jogosPorClube } from './transfermarkt.mjs'
import { lerBiblioteca, gravarBiblioteca, idTmDe } from './biblioteca.mjs'
import { criarResolvedor } from './resolver-clube.mjs'
import { carreiraCorrigida, CARREIRA_FIXA } from './carreiras-corrigidas.mjs'
import { NOME_FIXO } from './nomes-fixos.mjs'
import { latinizar } from '../src/logica/texto.ts'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ler = (arquivo) => JSON.parse(readFileSync(join(raiz, 'scripts', arquivo), 'utf8'))
const NIVEIS = ['facil', 'intermediario', 'dificil']

const pedidos = process.argv.slice(2).map((arg) => {
  const [qid, nivel, id] = arg.split(':')
  if (!/^Q\d+$/.test(qid ?? '') || !NIVEIS.includes(nivel)) {
    console.error(`argumento inválido: "${arg}" (use QID:nível ou QID:nível:id, nível em ${NIVEIS.join('/')})`)
    process.exit(1)
  }
  return { qid, nivel, id }
})
if (!pedidos.length) {
  console.error('uso: npm run trazer -- Q615:facil:messi Q180642:intermediario')
  process.exit(1)
}

const jogadores = lerBiblioteca()
const tmPorQid = ler('tm-jogadores.json')
const meta = ler('meta-jogadores.json')

// ------------------------------------ id do Transfermarkt e dados do Wikidata
const semTm = pedidos.map((p) => p.qid).filter((q) => !tmPorQid[q])
if (semTm.length) for (const [q, tm] of await idsDoTransfermarkt(semTm)) tmPorQid[q] = tm
// rótulo que veio como o próprio QID é consulta que falhou na época, não nome
const semMeta = pedidos.map((p) => p.qid).filter((q) => !meta[q]?.nome || /^Q\d+$/.test(meta[q].nome))
if (semMeta.length) {
  const linhas = await consultar(`
    SELECT ?j ?jLabel ?nasc WHERE {
      VALUES ?j { ${semMeta.map((q) => `wd:${q}`).join(' ')} }
      OPTIONAL { ?j wdt:P569 ?nasc }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,mul,en". }
    }`)
  for (const l of linhas) {
    const q = qidDe(l.j)
    meta[q] = { ...meta[q], nome: l.jLabel, nasc: meta[q]?.nasc ?? (l.nasc && String(l.nasc).slice(0, 4)) }
  }
}
writeFileSync(join(raiz, 'scripts/tm-jogadores.json'), JSON.stringify(tmPorQid) + '\n')
writeFileSync(join(raiz, 'scripts/meta-jogadores.json'), JSON.stringify(meta) + '\n')

// ------------------------------------------------------------- montagem
const resolvedor = criarResolvedor()
const passagensDe = new Map()
for (const p of pedidos) passagensDe.set(p.qid, await passagensDoTransfermarkt(tmPorQid[p.qid]))
const daBiblioteca = []
for (const j of jogadores) daBiblioteca.push(await passagensDoTransfermarkt(idTmDe(j)))
// as bandeiras antes de resolver por nome, como no `reparar`
resolvedor.aquecer([...daBiblioteca, ...passagensDe.values()])

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const idsUsados = new Set(jogadores.map((j) => j.id))
const tmsUsados = new Set(jogadores.map((j) => idTmDe(j)))
const nomeDoClube = (id) => resolvedor.nomeDoClube(id) ?? id

let entraram = 0
for (const { qid, nivel, id: idPedido } of pedidos) {
  const tm = tmPorQid[qid]
  const dados = meta[qid] ?? {}
  // o Wikidata passou a guardar muito nome só em "mul"; sem ele o rótulo volta como o QID
  const rotulo = dados.nome && !/^Q\d+$/.test(dados.nome) ? dados.nome : qid
  if (!tm) { console.log(`  ✗ ${rotulo}: sem id do Transfermarkt no Wikidata`); continue }
  if (tmsUsados.has(String(tm))) { console.log(`  ✗ ${rotulo}: já está na biblioteca`); continue }
  // carreira dos anos 1940 para trás tem registro demais com erro (o validar-dados também recusa)
  if (Number(dados.nasc) < 1930) { console.log(`  ✗ ${rotulo}: nasceu em ${dados.nasc}, antes de 1930`); continue }

  const passagens = passagensDe.get(qid)
  if (!passagens) { console.log(`  ✗ ${rotulo}: o Transfermarkt não devolveu o histórico — tente de novo`); continue }

  const perfil = await perfilDoTransfermarkt(tm)
  // o nome da camisa quando é mais curto que o de registro, como no gerador
  const nome = latinizar(
    perfil?.nome && (rotulo === qid || perfil.nome.split(' ').length <= rotulo.split(' ').length) ? perfil.nome : rotulo,
  )
  const id = idPedido ?? slug(nome)
  if (idsUsados.has(id)) { console.log(`  ✗ ${nome}: o id "${id}" já é de outro jogador — passe um id`); continue }
  const nomeNaTela = NOME_FIXO[id] ?? nome

  const montada = resolvedor.montarCarreira(passagens, { nasc: dados.nasc, jogos: await jogosPorClube(tm) })
  const fixa = CARREIRA_FIXA[id]?.clubes
  if (montada.travas.length && !fixa) {
    console.log(`  ✗ ${nome}: ${montada.travas.map((t) => `"${t.nome}" (${t.motivo})`).join('; ')}`)
    continue
  }
  const clubes = carreiraCorrigida(id, montada.clubes) ?? montada.clubes
  if (clubes.length < 2) {
    console.log(`  ✗ ${nome}: ${clubes.length ? `um clube só (${nomeDoClube(clubes[0])})` : 'nenhum clube'} — um escudo não é charada`)
    continue
  }

  jogadores.push({
    id,
    nome: nomeNaTela,
    apelidos: [...new Set([nomeNaTela, nome, rotulo].filter((n) => n !== qid).map((n) => n.toLowerCase()))],
    nivel,
    clubes,
    // `npm run dicas` escreve as duas: a dica de um depende do que os outros têm
    dicas: ['', ''],
    verificado: true,
    fonte: `https://www.transfermarkt.com.br/-/transfers/spieler/${tm}`,
  })
  idsUsados.add(id)
  tmsUsados.add(String(tm))
  entraram++
  const fora = [...montada.formacao.map((n) => `${n} (base)`), ...montada.semJogo.map((n) => `${n} (sem jogo)`)]
  console.log(`  ✓ ${nomeNaTela} [${id}, ${nivel}] ${clubes.length} clubes: ${clubes.map(nomeDoClube).join(' · ')}` +
    (fora.length ? `\n      fora: ${fora.join(', ')}` : ''))
}

gravarBiblioteca(jogadores)
console.log(`\n${entraram} de ${pedidos.length} entraram; a biblioteca tem ${jogadores.length}.`)
if (entraram) console.log('Rode: npm run catalogo && npm run dicas')
