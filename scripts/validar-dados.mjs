// Confere a integridade da biblioteca antes de qualquer build ou publicação.
import { readdirSync, existsSync } from 'node:fs'
import { JOGADORES } from '../src/dados/jogadores.ts'
import { CLUBES } from '../src/dados/clubes.ts'
import { formasDerivadas } from '../src/logica/texto.ts'

const erros = []
const avisos = []

const idsClube = new Set(CLUBES.map((c) => c.id))
const usados = new Set()

for (const j of JOGADORES) {
  if (j.clubes.length < 2) erros.push(`${j.id}: menos de 2 clubes`)
  // clube repetido é válido (o jogador voltou), mas repetir em seguida não é
  for (let i = 1; i < j.clubes.length; i++) {
    if (j.clubes[i] === j.clubes[i - 1]) erros.push(`${j.id}: "${j.clubes[i]}" repetido em sequência`)
  }
  for (const c of j.clubes) {
    usados.add(c)
    if (!idsClube.has(c)) erros.push(`${j.id}: clube desconhecido "${c}"`)
  }
  if (!Array.isArray(j.dicas) || j.dicas.length !== 2) erros.push(`${j.id}: precisa de duas dicas`)
  else if (j.dicas.some((d) => !d?.trim())) erros.push(`${j.id}: dica vazia`)

  // nenhuma das duas pode entregar o nome do jogador nem o de um clube exibido
  for (const [i, bruta] of (j.dicas ?? []).entries()) {
    const dica = normalizar(bruta ?? '')
    const qual = i === 0 ? '1ª dica' : '2ª dica'
    for (const parte of normalizar(j.nome).split(' ')) {
      if (parte.length > 3 && dica.includes(parte)) {
        erros.push(`${j.id}: a ${qual} contém "${parte}" do próprio nome`)
      }
    }
    /**
     * Citar clube é proibido, com UMA exceção: a frase de tempo de casa.
     * "Ficou 6 anos seguidos no São Paulo" nomeia qual dos escudos à mostra
     * foi a casa dele, que é informação nova — foi pedido do cliente, e o
     * clube citado é sempre um que já está na tela. Fora dessa frase, citar
     * clube continua sendo repetir o mural.
     */
    const semTempoDeCasa = dica.replace(/ficou \d+ anos seguidos n[ao] [^.]*/g, '')
    for (const c of j.clubes) {
      const nome = normalizar(CLUBES.find((x) => x.id === c)?.nome ?? '')
      if (nome.length > 4 && semTempoDeCasa.includes(nome)) {
        erros.push(`${j.id}: a ${qual} cita o clube "${nome}"`)
      }
    }
  }
}

/**
 * Pedaço de nome servindo a dois jogadores pede desempate no jogo. O nome
 * canônico, não: existem dois Paulinhos, e quem digita "Paulinho" no dia de um
 * deles não tem como ser mais específico. Só os pedaços entram no aviso.
 */
const porPedaco = new Map()
for (const j of JOGADORES) {
  for (const p of formasDerivadas(j.nome, j.apelidos)) {
    if (!porPedaco.has(p)) porPedaco.set(p, new Set())
    porPedaco.get(p).add(j.id)
  }
}
for (const [k, lista] of porPedaco) {
  if (lista.size > 1) avisos.push(`pedaço de nome ambíguo "${k}" → ${[...lista].join(', ')}`)
}

// o catálogo é propositalmente maior que o uso: serve de biblioteca para novos jogadores
const naoVerificados = JOGADORES.filter((j) => !j.verificado)

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
console.log(
  naoVerificados.length
    ? `  CARREIRAS NÃO CONFERIDAS: ${naoVerificados.length}/${JOGADORES.length} — ${naoVerificados.map((j) => j.id).join(', ')}`
    : '  todas as carreiras conferidas contra fonte externa',
)
for (const a of avisos) console.log(`  aviso  ${a}`)
for (const e of erros) console.log(`  ERRO   ${e}`)
if (erros.length) {
  console.error(`\n${erros.length} erro(s).`)
  process.exit(1)
}
console.log('\nBiblioteca íntegra.')
