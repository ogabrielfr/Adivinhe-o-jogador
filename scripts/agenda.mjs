/**
 * Estende a agenda: quem cai em cada dia, em cada nível.
 *
 *   npm run agenda          # garante os próximos 30 dias
 *   npm run agenda -- 60    # os próximos 60
 *
 * O jogador do dia saía só do sorteio, que embaralha a lista inteira do nível.
 * Qualquer troca na biblioteca — um jogador a mais, um que muda de nível —
 * mudava o jogador de todos os dias, inclusive o de hoje: quem já tinha jogado
 * via "Era ele:" com outro nome. Na semana da revisão, o jogador do dia mudou
 * em dois dos três níveis entre três versões publicadas.
 *
 * A agenda congela o que já foi decidido. Dia que está nela não muda mais; o
 * script só preenche os que faltam, com o mesmo sorteio que o jogo faria, e
 * pula quem saiu nos últimos 90 dias, em qualquer nível. Toda segunda o
 * GitHub roda este script e publica (.github/workflows/deploy.yml), então a
 * agenda está sempre um mês à frente. Rode à mão antes de mexer na lista de
 * um nível, para que o mês congelado seja o da biblioteca publicada.
 *
 * O arquivo é para ser lido e editado: trocar quem cai num dia é trocar um id.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { embaralhar, numeroDoDia, posicaoDoDia, semente, dataDoDia } from '../src/logica/sorteio.ts'
import { lerBiblioteca } from './biblioteca.mjs'
import { ANTES_DA_AGENDA } from './antes-da-agenda.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARQUIVO = join(raiz, 'src/dados/agenda.json')
const DIAS = Number(process.argv[2]) || 30
/** Quem saiu não volta antes disso. É também quanto de passado a agenda guarda. */
const SEM_REPETIR = 90

const NIVEIS = ['facil', 'intermediario', 'dificil']
const jogadores = lerBiblioteca()
const porId = new Map(jogadores.map((j) => [j.id, j]))
// a mesma lista do jogo (src/logica/diario.ts): verificados, na ordem da biblioteca
const porNivel = Object.fromEntries(NIVEIS.map((n) => [n, jogadores.filter((j) => j.nivel === n && j.verificado === true)]))

/** O mesmo sorteio de `sorteado` em src/logica/diario.ts. */
function sorteado(nivel, dia) {
  const lista = porNivel[nivel]
  const { posicao, ciclo } = posicaoDoDia(dia, lista.length)
  return embaralhar(lista, semente(`${nivel}:${ciclo}`))[posicao]
}

const numero = (data) => numeroDoDia(new Date(`${data}T12:00:00`))
const agenda = existsSync(ARQUIVO) ? JSON.parse(readFileSync(ARQUIVO, 'utf8')) : { dias: {} }
const hoje = numeroDoDia()

const dias = {}
for (const [data, dia] of Object.entries(agenda.dias)) {
  if (numero(data) >= hoje - SEM_REPETIR) dias[data] = { ...dia }
}

// agendado que sumiu da biblioteca: o jogo cairia no sorteio naquele dia
for (const [data, dia] of Object.entries(dias)) {
  if (numero(data) < hoje - 1) continue
  for (const [nivel, id] of Object.entries(dia)) {
    if (!porId.has(id)) console.log(`atenção: ${data} ${nivel} agenda "${id}", que não está mais na biblioteca`)
  }
}

// em que dias cada jogador saiu ou vai sair, em qualquer nível: quem mudou de nível também não volta logo
const ocorrencias = new Map()
const marcar = (id, dia) => ocorrencias.set(id, [...(ocorrencias.get(id) ?? []), dia])
for (const [data, ids] of Object.entries(ANTES_DA_AGENDA)) for (const id of ids) marcar(id, numero(data))
for (const [data, d] of Object.entries(dias)) for (const id of Object.values(d)) marcar(id, numero(data))
const distancia = (id, dia) => Math.min(Infinity, ...(ocorrencias.get(id) ?? []).map((outro) => Math.abs(outro - dia)))

/**
 * O sorteio do dia, e, se ele saiu há pouco, o dos dias seguintes. Duas voltas
 * pela lista passam por todo mundo; se ninguém estiver longe o bastante, fica
 * quem saiu há mais tempo.
 */
function descansado(nivel, dia) {
  let escolhido = null
  let maisLonge = -1
  for (let passo = 0; passo < porNivel[nivel].length * 2; passo++) {
    const candidato = sorteado(nivel, dia + passo)
    const longe = distancia(candidato.id, dia)
    if (longe > maisLonge) [escolhido, maisLonge] = [candidato, longe]
    if (longe > SEM_REPETIR) break
  }
  return escolhido
}

let novos = 0
// começa ontem: a meia-noite chega antes aqui que no fuso de quem joga
for (let dia = hoje - 1; dia < hoje + DIAS; dia++) {
  const data = dataDoDia(dia)
  dias[data] ??= {}
  for (const nivel of NIVEIS) {
    if (dias[data][nivel]) continue
    // ontem e hoje fora da agenda já estão no ar pelo sorteio: o que vale é registrar o que saiu
    const escolhido = dia <= hoje ? sorteado(nivel, dia) : descansado(nivel, dia)
    dias[data][nivel] = escolhido.id
    marcar(escolhido.id, dia)
    novos++
  }
}

// um dia por linha: trocar quem cai num dia vira uma linha de diff
const linhas = Object.entries(dias).sort(([a], [b]) => a.localeCompare(b))
  .map(([data, d]) => `    ${JSON.stringify(data)}: ${JSON.stringify(Object.fromEntries(NIVEIS.map((n) => [n, d[n]])))}`)
writeFileSync(ARQUIVO, `{\n  "dias": {\n${linhas.join(',\n')}\n  }\n}\n`)

console.log(`${novos} escolhas novas; a agenda vai até ${dataDoDia(hoje + DIAS - 1)}`)
for (let dia = hoje; dia < hoje + Math.min(DIAS, 7); dia++) {
  const d = dias[dataDoDia(dia)]
  console.log(`  ${dataDoDia(dia)}  ${NIVEIS.map((n) => porId.get(d[n])?.nome ?? d[n]).join(' · ')}`)
}
