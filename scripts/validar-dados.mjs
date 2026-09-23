// Confere a integridade da biblioteca antes de qualquer build ou publicação.
import { readdirSync, existsSync, readFileSync } from 'node:fs'
import { JOGADORES } from '../src/dados/jogadores.ts'
import { CLUBES } from '../src/dados/clubes.ts'
import { formasDerivadas, formasExatas } from '../src/logica/texto.ts'
import { dataDoDia, numeroDoDia } from '../src/logica/sorteio.ts'
import { NIVEIS } from '../src/dados/tipos.ts'

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
      // por palavra inteira: "marco" do Van Basten está dentro de "marcou"
      if (parte.length > 3 && new RegExp(`\\b${parte}\\b`).test(dica)) {
        erros.push(`${j.id}: a ${qual} contém "${parte}" do próprio nome`)
      }
    }
    /**
     * Citar clube é proibido, com exceção das frases que dizem o que ele fez
     * num dos escudos à mostra — foi pedido do cliente, e o clube citado é
     * sempre um que já está na tela: tempo de casa ("Ficou 6 anos seguidos no
     * São Paulo"), título ("Campeão da Libertadores de 2013 pelo
     * Atlético-MG"), jogos pelo clube ("Fez 434 jogos pelo Grêmio") e final.
     * Fora delas, citar clube continua sendo repetir o mural. O corte é por
     * frase no texto original, porque a normalização tira os pontos.
     */
    const semTempoDeCasa = normalizar((bruta ?? '').split('.')
      .filter((frase) => !/^\s*(ficou \d+ anos seguidos|campeã?o|fez |marcou)/i.test(frase))
      .join('.'))
    for (const c of j.clubes) {
      const nome = normalizar(CLUBES.find((x) => x.id === c)?.nome ?? '')
      if (nome.length > 4 && semTempoDeCasa.includes(nome)) {
        erros.push(`${j.id}: a ${qual} cita o clube "${nome}"`)
      }
    }
  }
}

/**
 * Pedaço de nome servindo a dois jogadores pede desempate no jogo — também
 * quando é o nome inteiro do outro: "ronaldo" é pedaço do Cristiano e nome do
 * Fenômeno. O nome canônico repetido, não: existem dois Paulinhos, e quem
 * digita "Paulinho" no dia de um deles não tem como ser mais específico. Só o
 * que é pedaço de alguém entra no aviso.
 */
const porPedaco = new Map()
const pedacos = new Set()
const anotar = (p, id) => (porPedaco.get(p) ?? porPedaco.set(p, new Set()).get(p)).add(id)
for (const j of JOGADORES) {
  for (const p of formasDerivadas(j.nome, j.apelidos)) { pedacos.add(p); anotar(p, j.id) }
  for (const p of formasExatas(j.nome, j.apelidos)) anotar(p, j.id)
}
for (const [k, lista] of porPedaco) {
  if (pedacos.has(k) && lista.size > 1) avisos.push(`pedaço de nome ambíguo "${k}" → ${[...lista].join(', ')}`)
}

/**
 * Dois jogadores com o mesmo nome se distinguem na revelação pela linha de
 * complemento. Sem ela, ou com a mesma nos dois, "ADRIANO" não diz qual era.
 */
const mesmoNome = new Map()
for (const j of JOGADORES) {
  const chave = normalizar(j.nome)
  mesmoNome.set(chave, [...(mesmoNome.get(chave) ?? []), j])
}
for (const lista of mesmoNome.values()) {
  if (lista.length < 2) continue
  const sem = lista.filter((j) => !j.complemento)
  if (sem.length) erros.push(`${sem.map((j) => j.id).join(', ')}: dividem o nome "${lista[0].nome}" e não têm complemento`)
  else if (new Set(lista.map((j) => j.complemento)).size < lista.length) {
    erros.push(`${lista.map((j) => j.id).join(', ')}: dividem o nome e o complemento "${lista[0].complemento}"`)
  }
}

/**
 * A agenda só aponta quem está na biblioteca e pode ser sorteado. Um id que
 * sumiu faria o jogo cair no sorteio naquele dia — trocando o jogador de quem
 * já jogou, que é exatamente o que a agenda existe para impedir. O passado
 * fica de fora: é registro, e pode citar quem já saiu da biblioteca.
 *
 * E ela precisa estar à frente. A publicação semanal a estende; se ela parou,
 * o dia que sair da agenda volta ao sorteio, que muda com qualquer troca na
 * biblioteca.
 */
const AGENDA = JSON.parse(readFileSync(new URL('../src/dados/agenda.json', import.meta.url), 'utf8')).dias
const MINIMO_A_FRENTE = 7
const hoje = numeroDoDia()
const porId = new Map(JOGADORES.map((j) => [j.id, j]))
for (const [data, dia] of Object.entries(AGENDA)) {
  if (data < dataDoDia(hoje - 1)) continue
  for (const [nivel, id] of Object.entries(dia)) {
    const j = porId.get(id)
    if (!j) erros.push(`agenda ${data}: "${id}" (${nivel}) não está na biblioteca`)
    else if (!j.verificado) erros.push(`agenda ${data}: "${id}" (${nivel}) não pode ser sorteado`)
  }
}
for (let dia = hoje; dia <= hoje + MINIMO_A_FRENTE; dia++) {
  if (NIVEIS.some((n) => !AGENDA[dataDoDia(dia)]?.[n])) {
    erros.push(`a agenda não cobre ${dataDoDia(dia)}: rode \`npm run agenda\` com a biblioteca publicada`)
    break
  }
}

/**
 * O nome embaixo do escudo: dois clubes com o mesmo nome deixariam o jogador
 * sem saber qual é qual, e nome comprido quebra em quatro linhas num escudo de
 * 80 pixels. O curto mora em scripts/nomes-curtos.mjs.
 */
const clubePorNome = new Map()
for (const c of CLUBES.filter((x) => usados.has(x.id))) {
  if (clubePorNome.has(c.nome)) erros.push(`dois clubes em uso se chamam "${c.nome}": ${clubePorNome.get(c.nome)} e ${c.id}`)
  clubePorNome.set(c.nome, c.id)
  if (c.nome.length > 20) avisos.push(`nome longo embaixo do escudo: "${c.nome}" (${c.id}); encurte em scripts/nomes-curtos.mjs`)
  // "penarol" embaixo do escudo do Suárez: a fonte deu o id no lugar do nome
  if (c.nome === c.nome.toLowerCase()) erros.push(`nome em minúscula embaixo do escudo: "${c.nome}" (${c.id}); dê o nome em scripts/nomes-curtos.mjs`)
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
