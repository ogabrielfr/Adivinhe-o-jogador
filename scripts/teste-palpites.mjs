/**
 * Casos reais de palpite que o jogo precisa aceitar e recusar.
 * Cada um destes apareceu jogando ou é do mesmo formato de quem apareceu.
 */
import { formasAceitas, pareceIgual, normalizar } from '../src/logica/texto.ts'

const aceita = (nome, apelidos, palpite) =>
  formasAceitas(nome, apelidos).some((a) => pareceIgual(normalizar(palpite), a))

const DEVE_ACEITAR = [
  ['Marc-André ter Stegen', [], 'ter stegen'],
  ['Marc-André ter Stegen', [], 'Ter Stegen'],
  ['Marc-André ter Stegen', [], 'marc andre ter stegen'],
  ['Marc-André ter Stegen', [], 'stegen'],
  ['Virgil van Dijk', [], 'van dijk'],
  ['Virgil van Dijk', [], 'virgil van dijk'],
  ['Ronaldo Fenômeno', ['ronaldo'], 'ronaldo'],
  ['Lucas Lima', [], 'lucas lima'],
  ['Lucas Lima', [], 'lima'],
  ['Roberto Firmino', [], 'firmino'],
  ['Alisson Becker', [], 'alisson'],
  ['Marc-André ter Stegen', [], 'ter stegem'],
  ['Zlatan Ibrahimović', [], 'ibrahimovic'],
  ['Andrés Iniesta', [], 'iniesta'],
  ['Kevin De Bruyne', [], 'de bruyne'],
  ['Kevin De Bruyne', [], 'bruyne'],
  ['Ángel Di María', [], 'di maria'],
  ['Thiago Silva', [], 'thiago silva'],
  ['Éder Militão', [], 'militao'],
]

const DEVE_RECUSAR = [
  ['Marc-André ter Stegen', [], 'ter'],
  ['Marc-André ter Stegen', [], 'marc andre ter stegem oliveira'],
  ['Virgil van Dijk', [], 'van'],
  ['Kevin De Bruyne', [], 'de'],
  ['Lucas Lima', [], 'lucas moura'],
  ['Roberto Firmino', [], 'roberto carlos'],
]

let falhas = 0
for (const [n, a, p] of DEVE_ACEITAR) {
  if (!aceita(n, a, p)) { console.log(`RECUSOU (devia aceitar)  ${n}  <-  "${p}"`); falhas++ }
}
for (const [n, a, p] of DEVE_RECUSAR) {
  if (aceita(n, a, p)) { console.log(`ACEITOU (devia recusar)  ${n}  <-  "${p}"`); falhas++ }
}
const total = DEVE_ACEITAR.length + DEVE_RECUSAR.length
console.log(falhas ? `\n${falhas} de ${total} falharam` : `\ntodos os ${total} palpites conferem`)

// ------------------------------------------------ nome canônico x ambiguidade
/**
 * Existem dois Paulinhos e dois Evertons na biblioteca. Quem digita o nome
 * pelo qual o jogador é conhecido tem que acertar: não há como ser mais
 * específico sem saber o nome de registro.
 */
const { JOGADORES } = await import('../src/dados/jogadores.ts')
const { formasExatas, formasDerivadas } = await import('../src/logica/texto.ts')

// mesma conta que diario.ts faz; refeita aqui porque ele importa sem extensão
const donos = new Map()
for (const j of JOGADORES) {
  for (const f of formasDerivadas(j.nome, j.apelidos)) {
    if (!donos.has(f)) donos.set(f, new Set())
    donos.get(f).add(j.id)
  }
}
const PALPITES_AMBIGUOS = new Set([...donos].filter(([, ids]) => ids.size > 1).map(([f]) => f))

/** A mesma decisão que App.tsx toma, para o teste medir o comportamento real. */
function jogoAceita(jogador, palpite) {
  const p = normalizar(palpite)
  const exato = formasExatas(jogador.nome, jogador.apelidos).some((a) => pareceIgual(p, a))
  if (exato) return true
  if (PALPITES_AMBIGUOS.has(p)) return false
  return formasDerivadas(jogador.nome, jogador.apelidos).some((a) => pareceIgual(p, a))
}

let bloqueados = 0
for (const j of JOGADORES) {
  if (!jogoAceita(j, j.nome)) {
    console.log(`o jogo recusaria o próprio nome de ${j.nome}`)
    bloqueados++
  }
}
console.log(bloqueados
  ? `\n${bloqueados} jogadores recusariam o próprio nome`
  : `\nos ${JOGADORES.length} jogadores aceitam o próprio nome`)

// o deploy roda este teste; sem código de saída, uma falha passava calada
if (falhas || bloqueados) process.exitCode = 1

// e um pedaço ambíguo continua pedindo desempate
const doisHenriques = JOGADORES.filter((j) => normalizar(j.nome) === 'henrique')
if (doisHenriques.length > 1) {
  console.log(`"Henrique" é nome de ${doisHenriques.length} jogadores e cada um o aceita no seu dia`)
}
