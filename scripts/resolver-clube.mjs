/**
 * Liga cada passagem do Transfermarkt a um clube do catálogo. Um lugar só.
 *
 * Esta função existia copiada em três scripts — o gerador, o reparo e a
 * reposição —, e cada correção precisava ser feita três vezes. Foi numa
 * dessas cópias que o West Ham do Mascherano virou o Western United.
 *
 * A ordem de confiança:
 *
 * 1. **Pelo id do clube no Transfermarkt**, quando o mapa conhece. É o único
 *    caminho sem ambiguidade, e depois de `npm run mapa-tm` é por onde passa
 *    quase toda passagem.
 * 2. **Pelo nome**, quando só um clube do catálogo serve — o que diz exatamente
 *    o mesmo nome vem antes do que só o contém, e havendo vários, vale o curado
 *    em CANONICOS. Era por aqui que os homônimos entravam: o Campinas de Mato
 *    Grosso no lugar do de Campinas-SP, o Belenenses SAD de 2018 numa passagem
 *    de 1991.
 *
 * Por isso o casamento por nome agora precisa passar por três provas antes de
 * valer: **o nome do Transfermarkt cabe no do clube** (ele abrevia, mas não
 * acrescenta: "Quick Boys" não é o "Sport Boys"), **o país** do clube tem que
 * bater com a bandeira que o Transfermarkt mostra, e **o clube tem que
 * existir** no ano da passagem. Falhando uma, a passagem trava e aparece no
 * relatório do `reparar`, em vez de escolher um clube errado em silêncio.
 * Travar é recuperável; escudo trocado, não.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mesmoClube, cabeNoNome, mesmasPalavras, tokensDoNome } from './nomes-clube.mjs'
import { CANONICOS } from './clubes-canonicos.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ler = (arquivo, padrao) => {
  const caminho = join(raiz, 'scripts', arquivo)
  return existsSync(caminho) ? JSON.parse(readFileSync(caminho, 'utf8')) : padrao
}

/**
 * Idade mínima de saída para a passagem contar como profissional. O cliente
 * pediu carreira só de jogo profissional; o Transfermarkt lista o clube onde o
 * jogador foi formado como se fosse passagem, e quem saiu dele com 16 anos não
 * jogou no time de cima. Com só o ano de nascimento a idade tem folga de um
 * ano para cada lado, e por isso o corte é conservador.
 */
const IDADE_PROFISSIONAL = 17

/**
 * O jogador esteve no clube e não entrou em campo em partida oficial nenhuma.
 *
 * `jogos` é o que `jogosPorClube` do Transfermarkt devolve. Só conta como prova
 * a partida em que o site sabe onde o jogador estava: no banco ou lesionado.
 * "Fora da lista" em todas não prova nada, porque é assim que o site marca a
 * temporada que ele não tem a escalação — o Zanetti aparece com zero jogos no
 * Banfield de 1993, onde jogou 66, e o Gérson, no São Paulo de 1971. Clube sem
 * registro nenhum também fica. E o clube atual fica sempre: quem chegou há
 * pouco ainda não estreou, e é lá que ele está.
 */
/**
 * A volta de um empréstimo a clube que já está na carreira entra quando o
 * jogador jogou por ele depois de voltar — conta o jogo entre a data da volta
 * e a da saída seguinte.
 *
 * Antes ela nunca entrava, para o Keirrison não voltar ao Barcelona seis vezes
 * sem jogar; e com isso sumiam os quatro anos do Marcos Rocha no Atlético-MG
 * depois do empréstimo ao América, o tempo da Libertadores de 2013. Sem
 * registro de partidas do clube, fica como antes: a volta não entra.
 */
function jogouNaVolta(passagem, jogos) {
  const datas = jogos?.[passagem.idTm]?.datas
  if (!datas?.length || !passagem.desde) return false
  const ate = passagem.saida ?? '9999'
  return datas.some((dia) => dia >= passagem.desde && dia < ate)
}

function naoJogou(passagem, jogos, ultima) {
  const registro = jogos?.[passagem.idTm]
  if (!registro || registro.jogou > 0) return false
  const estados = registro.estados ?? {}
  const sabeOnde = (estados['in squad'] ?? 0) + (estados.injured ?? 0)
  if (!sabeOnde) return false
  const recente = (passagem.ano ?? 0) >= new Date().getFullYear() - 1
  return !(ultima && recente)
}

export function criarResolvedor() {
  const catalogo = ler('catalogo-completo.json', [])
  /** Ano de fundação por clube do catálogo; sai de `npm run mapa-tm`. */
  const fundacao = ler('fundacao-clubes.json', {})
  const porId = new Map(catalogo.map((c) => [c.id, c]))

  // ---- 1. id do Transfermarkt -> id do catálogo, conferido por `npm run mapa-tm`
  // par que aponta clube que o catálogo não tem mais (fundido numa reconstrução) não vale
  const idPorTm = new Map(Object.entries(ler('clubes-transfermarkt.json', {})).filter(([, id]) => porId.has(id)))

  // ---- 2. índice por palavra, para não comparar cada nome com cinco mil
  const porToken = new Map()
  for (const c of catalogo) {
    for (const t of tokensDoNome(c.nome)) {
      if (t.length < 3) continue
      if (!porToken.has(t)) porToken.set(t, [])
      porToken.get(t).push(c)
    }
  }

  /**
   * Bandeira do Transfermarkt -> país do catálogo, aprendido com o próprio
   * dado: toda passagem resolvida pelo id diz, de graça, que aquela bandeira
   * corresponde àquele país. Vale a maioria.
   */
  const votos = new Map()
  const aprender = (bandeira, idClube) => {
    const pais = porId.get(idClube)?.pais
    if (!bandeira || !pais) return
    if (!votos.has(bandeira)) votos.set(bandeira, new Map())
    const v = votos.get(bandeira)
    v.set(pais, (v.get(pais) ?? 0) + 1)
  }
  const paisDaBandeira = (bandeira) => {
    const v = votos.get(bandeira)
    if (!v) return null
    return [...v].sort((a, b) => b[1] - a[1])[0][0]
  }

  function candidatosPorNome(nome) {
    const ids = new Set()
    const vistos = new Set()
    for (const t of tokensDoNome(nome)) {
      for (const c of porToken.get(t) ?? []) {
        if (vistos.has(c.id)) continue
        vistos.add(c.id)
        if (mesmoClube(c.nome, nome) && cabeNoNome(nome, c.nome)) ids.add(c.id)
      }
    }
    return [...ids]
  }

  /**
   * Uma passagem: `{ id, via }` quando resolve, `{ id: null, motivo }` quando
   * trava. `via` diz se veio pelo id ('id') ou pelo nome ('nome').
   */
  function resolver(passagem) {
    if (passagem.idTm && idPorTm.has(String(passagem.idTm))) {
      const id = idPorTm.get(String(passagem.idTm))
      aprender(passagem.bandeira, id)
      return { id, via: 'id' }
    }

    const todos = candidatosPorNome(passagem.nome)
    // quem diz exatamente o mesmo nome vem antes de quem só o contém: "F.C. Tokyo" é o FC Tokyo, não o Tokyo Verdy
    const exatos = todos.filter((id) => mesmasPalavras(passagem.nome, porId.get(id).nome))
    const ids = exatos.length ? exatos : todos
    let escolhido = ids.length === 1 ? ids[0] : null
    if (!escolhido && ids.length > 1) {
      const curados = ids.filter((id) => id in CANONICOS)
      if (curados.length === 1) escolhido = curados[0]
    }
    if (!escolhido) {
      return { id: null, motivo: ids.length ? `${ids.length} clubes com esse nome` : 'nenhum clube com esse nome' }
    }

    const clube = porId.get(escolhido)
    const pais = paisDaBandeira(passagem.bandeira)
    if (pais && clube?.pais && pais !== clube.pais) {
      return { id: null, motivo: `o Transfermarkt diz ${pais}, o catálogo tem ${clube.nome} (${clube.pais})` }
    }
    const fundado = fundacao[escolhido]
    const ano = passagem.ano ?? passagem.anoSaida
    if (fundado && ano && ano < fundado - 1) {
      return { id: null, motivo: `${clube.nome} foi fundado em ${fundado}, a passagem é de ${ano}` }
    }
    return { id: escolhido, via: 'nome' }
  }

  /**
   * A carreira inteira de um jogador. Tira a formação (clube de onde saiu
   * antes da idade profissional), resolve cada passagem e junta passagens
   * seguidas no mesmo clube. `travas` lista o que não resolveu, com o motivo;
   * se houver alguma, quem chama decide o que fazer com a carreira.
   *
   * A volta de empréstimo (`volta`) só entra quando o clube ainda não está na
   * carreira: é o caso de quem foi comprado e emprestado no mesmo dia, e cuja
   * passagem de verdade pelo clube começa na volta. Nos outros, o clube dono
   * já aparece, no lugar em que o jogador chegou.
   *
   * Com `jogos`, sai também a passagem sem jogo oficial nenhum (`semJogo`): a
   * carreira mostra só onde o jogador jogou como profissional.
   */
  function montarCarreira(passagens, { nasc, jogos } = {}) {
    let inicio = 0
    const nascimento = Number(nasc) || 0
    while (
      nascimento && inicio < passagens.length - 1 &&
      passagens[inicio].anoSaida && passagens[inicio].anoSaida - nascimento < IDADE_PROFISSIONAL
    ) inicio++

    const clubes = []
    const travas = []
    const resolvidas = []
    const semJogo = []
    const depoisDaFormacao = passagens.slice(inicio)
    for (const [i, p] of depoisDaFormacao.entries()) {
      if (naoJogou(p, jogos, i === depoisDaFormacao.length - 1)) { semJogo.push(p.nome); continue }
      const r = resolver(p)
      resolvidas.push({ ...p, ...r })
      if (!r.id) { travas.push({ nome: p.nome, idTm: p.idTm, motivo: r.motivo }); continue }
      if (p.volta && clubes.includes(r.id) && !jogouNaVolta(p, jogos)) continue
      if (clubes.at(-1) !== r.id) clubes.push(r.id)
    }
    return { clubes, travas, resolvidas, semJogo, formacao: passagens.slice(0, inicio).map((p) => p.nome) }
  }

  /**
   * Aprende as bandeiras antes de resolver por nome: sem isso a checagem de
   * país depende da ordem em que os jogadores são processados.
   */
  function aquecer(listasDePassagens) {
    for (const ps of listasDePassagens) for (const p of ps ?? []) {
      if (p.idTm && idPorTm.has(String(p.idTm))) aprender(p.bandeira, idPorTm.get(String(p.idTm)))
    }
  }

  return {
    resolver, montarCarreira, aquecer, catalogo,
    nomeDoClube: (id) => porId.get(id)?.nome ?? null,
    paisDoClube: (id) => porId.get(id)?.pais ?? null,
    idPorTm,
  }
}
