/**
 * Refaz a dica de todos os jogadores sem mexer no elenco.
 *
 *   npm run dicas
 *
 * Existe separado do gerador porque trocar a dica não deveria custar um elenco
 * novo: a montagem depende do WAF do Transfermarkt liberar, e cada execução
 * devolve um conjunto de jogadores um pouco diferente. Aqui os trezentos ficam
 * como estão e só o texto muda.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  historicoDoTransfermarkt, passagensDoTransfermarkt, perfilDoTransfermarkt,
  selecaoDoTransfermarkt, clubesDoTransfermarkt, paisesDoTransfermarkt,
} from './transfermarkt.mjs'
import { montarDicas, fatosDoHistorico, papelConhecido, escalaDosFatos, naturalidadeSegura, nomeDoPais } from './dicas.mjs'
import { torneiosDe, torneiosQueContam } from './torneios.mjs'
import { CARREIRA_FIXA } from './carreiras-corrigidas.mjs'
import { lerBiblioteca, gravarBiblioteca, idTmDe } from './biblioteca.mjs'
import { criarResolvedor } from './resolver-clube.mjs'
import { nomeCurto } from './nomes-curtos.mjs'
import { NOME_FIXO } from './nomes-fixos.mjs'
import { latinizar } from '../src/logica/texto.ts'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

const jogadores = lerBiblioteca()
console.log(`jogadores na biblioteca: ${jogadores.length}`)

// ------------------------------------------------------ do id do TM ao QID
const tmPorQid = JSON.parse(readFileSync(join(raiz, 'scripts/tm-jogadores.json'), 'utf8'))
const qidPorTm = new Map(Object.entries(tmPorQid).map(([qid, tm]) => [String(tm), qid]))
const qidDoJogador = (j) => qidPorTm.get(idTmDe(j))

const meta = JSON.parse(readFileSync(join(raiz, 'scripts/meta-jogadores.json'), 'utf8'))
const resolvedor = criarResolvedor()
const paisDoClube = (id) => resolvedor.paisDoClube(id)
// o nome que o jogador vê embaixo do escudo, que é o que a dica de tempo de casa tem que repetir
const nomeDoClube = (id) => nomeCurto(id, resolvedor.nomeDoClube(id))

/**
 * id do clube no Transfermarkt -> nome que o jogo mostra, para a dica de tempo
 * de casa. Vem do mesmo mapa que resolve as carreiras, e o que ele não cobre
 * é aprendido com as próprias carreiras mais abaixo: sem o Manchester United
 * no mapa, a dica caía no nome abreviado do Transfermarkt e saía "no Man Utd".
 */
const nomePorTm = new Map(
  [...resolvedor.idPorTm].map(([tm, id]) => [String(tm), nomeDoClube(id)]).filter(([, nome]) => nome),
)
const passagensDe = new Map()
for (const j of jogadores) {
  const tm = idTmDe(j)
  passagensDe.set(j.id, tm ? await passagensDoTransfermarkt(tm) : null)
}
// as bandeiras antes de resolver por nome, como no `reparar`
resolvedor.aquecer([...passagensDe.values()])

// ------------------------------------- seleção e país de nascimento
/**
 * Pela API do Transfermarkt. O número de jogos pela seleção vinha do Wikidata,
 * que atrasa para quem está em atividade (o Vitor Roque aparecia com 1, e já
 * são 2). E o país da primeira dica era a nacionalidade, que dizia "nascido na
 * Rússia" do Mário Fernandes, de São Caetano do Sul. Aqui os dois vêm
 * separados: onde nasceu e por qual seleção principal jogou mais.
 *
 * Categoria de base não conta: "7 jogos pelo sub-20" não leva ninguém a lugar
 * nenhum, e o sub-20 do Brasil aponta a seleção brasileira como a principal.
 */
const selecaoDe = new Map()
for (const j of jogadores) {
  const tm = idTmDe(j)
  if (tm) selecaoDe.set(j.id, await selecaoDoTransfermarkt(tm))
}
const times = await clubesDoTransfermarkt([...selecaoDe.values()].flatMap((s) => s?.selecoes.map((x) => x.time) ?? []))
const ondePedir = new Map()
for (const j of jogadores) {
  const s = selecaoDe.get(j.id)
  for (const pais of [s?.nascimento, ...(s?.nacionalidades ?? [])]) {
    if (pais && !ondePedir.has(String(pais))) ondePedir.set(String(pais), idTmDe(j))
  }
}
const paises = await paisesDoTransfermarkt(times, ondePedir)
const paisPorId = (id) => (id ? nomeDoPais(paises[id]) : null)

/** A seleção principal em que o jogador mais jogou: país e jogos. */
function selecaoPrincipal(s) {
  const [maior] = (s?.selecoes ?? [])
    .filter((x) => times[x.time]?.principal && x.jogos > 0)
    .sort((a, b) => b.jogos - a.jogos)
  return maior ? { pais: paisPorId(times[maior.time].pais), jogos: maior.jogos } : { pais: null, jogos: 0 }
}

// ------------------------------------------------------- torneios disputados
/**
 * Copa do Mundo é o fato mais forte da biblioteca para a segunda dica. Vem do
 * Wikidata e fica em cache, porque consulta perdida faria o jogador parecer
 * que nunca jogou torneio nenhum.
 */
const torneios = await torneiosDe(jogadores.map(qidDoJogador).filter(Boolean))

// --------------------------------------------------------------- montagem
let semFato = 0
let semPerfil = 0
let renomeados = 0
/** Posições que o mapa não conhece; é por onde ampliá-lo. */
const posicoesSoltas = new Map()
const dicas = new Map()

/**
 * Primeira passada: os dados de todo mundo. A dica de um jogador depende do
 * que os outros 299 têm — um fato só vale a pena quando o número dele é raro
 * na biblioteca —, então nada pode ser escrito antes de ler todos.
 */
const coletado = []
for (const j of jogadores) {
  const tm = idTmDe(j)
  const qid = qidPorTm.get(tm)
  const m = meta[qid] ?? {}
  const sel = selecaoPrincipal(selecaoDe.get(j.id))

  /**
   * Posição e país saem do Transfermarkt, que guarda um valor só. O Wikidata
   * aceita vários e escolher o primeiro dava erro visível: o Zico saía
   * "nascido em Portugal" na mesma frase que citava a seleção brasileira.
   */
  const perfil = tm ? await perfilDoTransfermarkt(tm) : null
  if (!perfil?.posicao) semPerfil++
  const historico = tm ? await historicoDoTransfermarkt(tm) : null
  const passagens = passagensDe.get(j.id)
  const fatos = fatosDoHistorico(historico?.transfers ?? [])
  const idsDeClube = j.clubes
  const paises = new Set(idsDeClube.map((x) => paisDoClube(x))).size

  // o clube de cada passagem que resolveu por nome também dá nome ao id dela
  for (const p of passagens ? resolvedor.montarCarreira(passagens).resolvidas : []) {
    const nome = p.id && nomeDoClube(p.id)
    if (p.idTm && nome && !nomePorTm.has(String(p.idTm))) nomePorTm.set(String(p.idTm), nome)
  }

  coletado.push({
    jogador: j,
    perfil,
    dados: {
      ...m,
      posicao: perfil?.posicao ?? m.posicao,
      pais: paisPorId(selecaoDe.get(j.id)?.nascimento) ?? nomeDoPais(perfil?.nacionalidade) ?? m.pais,
      jogosSelecao: sel.jogos, selecao: sel.pais, fatos, paises,
      naturalidade: naturalidadeSegura(
        perfil?.naturalidade,
        // o nome inteiro também: "Limeira" está no escudo da Inter de Limeira, com ou sem o nome curto
        idsDeClube.flatMap((id) => [nomeDoClube(id), resolvedor.nomeDoClube(id)]).filter(Boolean),
        j.nome,
      ),
      torneios: torneiosQueContam(torneios[qid] ?? []),
      /**
       * O nome do clube onde ele ficou mais tempo. O mapa curado só tem os
       * clubes que precisaram de entrada manual — o São Paulo resolve por
       * nome e nunca entrou nele —, então o nome do próprio histórico do
       * Transfermarkt é o que cobre todo mundo.
       */
      clubeDaCasa: nomePorTm.get(String(fatos.clubeDaPermanencia)) ?? fatos.nomeDaPermanencia ?? null,
      // carreira corrigida à mão: a linha do tempo do Transfermarkt não vale
      historicoSuspeito: j.id in CARREIRA_FIXA,
    },
  })
}

const escala = escalaDosFatos(coletado.map((c) => c.dados))

// ------------------------------------- segunda passada: escrever cada dica
for (const { jogador: j, perfil, dados } of coletado) {
  const id = j.id

  const par = montarDicas(dados, escala)
  // dica repetida não é dica; a segunda é a que precisa distinguir
  if (dicas.has(par[1])) semFato++
  dicas.set(par[1], id)

  if (perfil?.posicao && !papelConhecido(perfil.posicao)) {
    posicoesSoltas.set(perfil.posicao, (posicoesSoltas.get(perfil.posicao) ?? 0) + 1)
  }

  j.dicas = par

  /**
   * O nome da camisa vira o nome canônico quando é mais curto que o de
   * registro: ninguém digita "Paulo Henrique Sampaio Filho". O nome antigo
   * continua valendo como palpite, porque quem souber o nome completo também
   * tem que acertar.
   */
  // sósia grego ou cirílico vira letra latina antes de virar nome na tela
  const nomeTm = perfil?.nome ? latinizar(perfil.nome) : null
  if (NOME_FIXO[j.id]) {
    j.nome = NOME_FIXO[j.id]
  } else if (nomeTm && nomeTm !== j.nome && nomeTm.split(' ').length < j.nome.split(' ').length) {
    j.apelidos = [...new Set([j.nome.toLowerCase(), nomeTm.toLowerCase()])]
    j.nome = nomeTm
    renomeados++
  }
}

gravarBiblioteca(jogadores)

const distintas = new Set(dicas.keys()).size
console.log(`\n${distintas} segundas dicas distintas para ${jogadores.length} jogadores`)
if (semFato) console.log(`  ${semFato} continuam repetidas: faltam fatos para separá-las`)
if (semPerfil) console.log(`  ${semPerfil} sem posição no Transfermarkt`)
console.log(`${renomeados} passaram a usar o nome da camisa em vez do de registro`)
if (posicoesSoltas.size) {
  console.log('\nposições que o mapa não conhece:')
  for (const [pos, n] of [...posicoesSoltas].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}x  ${pos}`)
  }
}
