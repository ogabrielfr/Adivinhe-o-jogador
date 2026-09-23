/**
 * Conserta a carreira de cada jogador no lugar, sem gerar um elenco novo.
 *
 *   npm run reparar                # grava
 *   npm run reparar -- --simular   # só mostra o que mudaria
 *
 * Refazer os trezentos não é opção: cada geração depende do WAF do
 * Transfermarkt liberar e devolve um conjunto diferente. Este script refaz só
 * a carreira, a partir do histórico em cache, pelo resolvedor único de
 * `resolver-clube.mjs` — o mesmo que o gerador e a reposição usam. Corrigido
 * o resolvedor, uma rodada daqui leva a correção a todos.
 *
 * Toda carreira que muda aparece no relatório, clube por clube. Foi assim que
 * o Western United no lugar do West Ham, o Juventude na base do Eriksen e o
 * Inter Miami de 2018 numa passagem de 2005 passaram despercebidos: o reparo
 * trocava em silêncio e contava só quantas.
 *
 * **O nível não é recalculado aqui.** A régua de visualizações da Wikipédia
 * foi recusada; até a nova ser decidida, o nível é o que está na biblioteca,
 * e `niveis-fixos.mjs` guarda as decisões tomadas à mão.
 */
import { lerBiblioteca, gravarBiblioteca, idTmDe } from './biblioteca.mjs'
import { criarResolvedor } from './resolver-clube.mjs'
import { passagensDoTransfermarkt, jogosPorClube } from './transfermarkt.mjs'
import { NIVEL_FIXO } from './niveis-fixos.mjs'
import { carreiraCorrigida, CARREIRA_FIXA } from './carreiras-corrigidas.mjs'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIMULAR = process.argv.includes('--simular')

const meta = JSON.parse(readFileSync(join(raiz, 'scripts/meta-jogadores.json'), 'utf8'))
const tmPorQid = JSON.parse(readFileSync(join(raiz, 'scripts/tm-jogadores.json'), 'utf8'))
const qidPorTm = new Map(Object.entries(tmPorQid).map(([qid, tm]) => [String(tm), qid]))

const jogadores = lerBiblioteca()
console.log(`jogadores na biblioteca: ${jogadores.length}`)

const resolvedor = criarResolvedor()
const nome = (id) => resolvedor.nomeDoClube(id) ?? id

// o histórico de todos antes de resolver o primeiro: a checagem de país
// aprende as bandeiras com as passagens que têm id, e não pode depender da ordem
const passagensDe = new Map()
const jogosDe = new Map()
for (const j of jogadores) {
  const tm = idTmDe(j)
  passagensDe.set(j.id, tm ? await passagensDoTransfermarkt(tm) : null)
  jogosDe.set(j.id, tm ? await jogosPorClube(tm) : null)
}
resolvedor.aquecer([...passagensDe.values()])

const mudancas = []
/**
 * Passagem que não resolveu, agrupada pelo nome do clube no Transfermarkt.
 *
 * Carreira com trava fica como estava, e isso precisa aparecer: enquanto
 * ficava em silêncio, o Chicharito passou semanas com o escudo do Western
 * United porque a carreira dele estava congelada por outro clube e nunca era
 * reescrita. Uma resolução que falha calada é pior que uma que falha alto.
 */
const travas = new Map()
/** Carreira que ficaria com um clube só: não é charada, e fica como estava até alguém decidir. */
const umClubeSo = []
let nivelMudado = 0

for (const j of jogadores) {
  const antes = j.clubes
  const passagens = passagensDe.get(j.id)
  const nasc = meta[qidPorTm.get(idTmDe(j))]?.nasc

  let novos = null
  let motivo = ''
  if (passagens) {
    const r = resolvedor.montarCarreira(passagens, { nasc, jogos: jogosDe.get(j.id) })
    // carreira escrita inteira à mão não depende do que travou
    if (r.travas.length && !CARREIRA_FIXA[j.id]?.clubes) {
      for (const t of r.travas) {
        const chave = `${t.nome}${t.idTm ? ` (TM ${t.idTm})` : ''}`
        if (!travas.has(chave)) travas.set(chave, { motivo: t.motivo, quem: [] })
        travas.get(chave).quem.push(j.id)
      }
    } else if (r.travas.length) {
      // corrigida à mão, logo abaixo
    } else if (r.clubes.length < 2) {
      umClubeSo.push(`${j.nome} (${r.clubes.map(nome).join('') || 'nenhum'})`)
    } else {
      novos = r.clubes
      motivo = [
        r.formacao.length && `formação fora: ${r.formacao.join(', ')}`,
        r.semJogo.length && `sem jogo oficial: ${r.semJogo.join(', ')}`,
      ].filter(Boolean).join('; ')
    }
  }

  // correção à mão vence o Transfermarkt — inclusive quando ele trava
  const corrigida = carreiraCorrigida(j.id, novos ?? antes)
  if (corrigida) novos = corrigida

  if (novos && novos.join() !== antes.join()) {
    mudancas.push({ j, antes, novos, motivo })
    j.clubes = novos
  }

  const nivel = NIVEL_FIXO[j.id] ?? j.nivel
  if (nivel !== j.nivel) { nivelMudado++; j.nivel = nivel }
}

// ------------------------------------------------------------------ relatório
console.log(`\n${mudancas.length} carreiras mudam`)
for (const { j, antes, novos, motivo } of mudancas) {
  console.log(`\n  ${j.nome} (${j.nivel})${motivo ? ` — ${motivo}` : ''}`)
  console.log(`    antes: ${antes.map(nome).join(' · ')}`)
  console.log(`    agora: ${novos.map(nome).join(' · ')}`)
}

if (travas.size) {
  const total = new Set([...travas.values()].flatMap((t) => t.quem)).size
  console.log(`\n${total} carreiras ficam como estavam: alguma passagem não resolveu`)
  for (const [clube, t] of [...travas].sort((a, b) => b[1].quem.length - a[1].quem.length)) {
    console.log(`  ${clube}: ${t.motivo}`)
    console.log(`      ${t.quem.join(', ')}`)
  }
  console.log('  conserto: o par id-do-Transfermarkt -> clube em scripts/clubes-transfermarkt.json,')
  console.log('  ou a carreira inteira em scripts/carreiras-corrigidas.mjs')
}

if (umClubeSo.length) {
  console.log(`\n${umClubeSo.length} carreiras ficariam com um clube só e ficam como estavam: ${umClubeSo.join(', ')}`)
  console.log('  um escudo não é charada: troque o jogador ou corrija a carreira à mão')
}

if (nivelMudado) console.log(`\n${nivelMudado} jogadores mudaram de nível por niveis-fixos.mjs`)

if (SIMULAR) console.log('\n(simulação: nada gravado)')
else gravarBiblioteca(jogadores)
