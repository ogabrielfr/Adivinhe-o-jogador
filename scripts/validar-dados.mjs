// Confere a integridade da biblioteca antes de qualquer build ou publicação.
import { readdirSync, existsSync } from 'node:fs'
import { JOGADORES } from '../src/dados/jogadores.ts'
import { CLUBES } from '../src/dados/clubes.ts'

const erros = []
const avisos = []

const idsClube = new Set(CLUBES.map((c) => c.id))
const usados = new Set()

for (const j of JOGADORES) {
  if (j.clubes.length < 2) erros.push(`${j.id}: menos de 2 clubes`)
  if (new Set(j.clubes).size !== j.clubes.length) erros.push(`${j.id}: clube repetido`)
  for (const c of j.clubes) {
    usados.add(c)
    if (!idsClube.has(c)) erros.push(`${j.id}: clube desconhecido "${c}"`)
  }
  if (!j.dica?.trim()) erros.push(`${j.id}: sem dica`)

  // a dica não pode entregar o nome do jogador nem o de um clube exibido
  const dica = normalizar(j.dica)
  for (const parte of normalizar(j.nome).split(' ')) {
    if (parte.length > 3 && dica.includes(parte)) erros.push(`${j.id}: a dica contém "${parte}" do próprio nome`)
  }
  for (const c of j.clubes) {
    const nome = normalizar(CLUBES.find((x) => x.id === c)?.nome ?? '')
    if (nome.length > 4 && dica.includes(nome)) erros.push(`${j.id}: a dica cita o clube "${nome}"`)
  }
}

// palpites que casariam com mais de um jogador precisam ser tratados como ambíguos
const porPalpite = new Map()
for (const j of JOGADORES) {
  for (const p of [j.nome, ...j.apelidos]) {
    const k = normalizar(p)
    if (!porPalpite.has(k)) porPalpite.set(k, new Set())
    porPalpite.get(k).add(j.id)
  }
}
for (const [k, lista] of porPalpite) {
  if (lista.size > 1) avisos.push(`palpite ambíguo "${k}" → ${[...lista].join(', ')}`)
}

const orfaos = CLUBES.filter((c) => !usados.has(c.id)).map((c) => c.id)
if (orfaos.length) avisos.push(`clubes no catálogo sem nenhum jogador: ${orfaos.join(', ')}`)

// escudos presentes em disco
const dir = new URL('../public/escudos/', import.meta.url)
const presentes = existsSync(dir)
  ? new Set(readdirSync(dir).map((f) => f.replace(/\.(svg|png|gif|jpe?g)$/, '')))
  : new Set()
const semEscudo = [...usados].filter((c) => !presentes.has(c))
if (semEscudo.length) avisos.push(`sem arquivo de escudo (usam brasão de reserva): ${semEscudo.join(', ')}`)

function normalizar(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}

console.log(`jogadores: ${JOGADORES.length} | clubes no catálogo: ${CLUBES.length} | clubes em uso: ${usados.size}`)
for (const a of avisos) console.log(`  aviso  ${a}`)
for (const e of erros) console.log(`  ERRO   ${e}`)
if (erros.length) {
  console.error(`\n${erros.length} erro(s).`)
  process.exit(1)
}
console.log('\nBiblioteca íntegra.')
