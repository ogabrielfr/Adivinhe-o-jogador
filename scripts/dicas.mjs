/**
 * Monta a dica de cada jogador.
 *
 * A versão anterior descrevia o jogador por posição, país e número de países —
 * atributos que centenas de jogadores compartilham. O resultado: 177 dos 300
 * repetiam a dica de outro, e duas partidas seguidas mostravam a frase
 * idêntica. Uma dica que serve para qualquer um não é dica.
 *
 * Aqui a dica é feita de **números que mudam de jogador para jogador**: quantas
 * vezes vestiu a camisa da seleção, quanto custou a transferência mais cara,
 * quanto chegou a valer, em que ano estreou e até quando jogou. São fatos
 * verificáveis — vêm do histórico do Transfermarkt e do Wikidata, nunca de
 * texto gerado — e é o número que leva o jogador a algum lugar: "207 jogos de
 * seleção" é um caminho, "passou por clubes de 3 países" não é.
 *
 * A dica nunca cita o nome do jogador nem um clube que está à mostra; quem
 * garante isso é `npm run validar-dados`.
 */

/**
 * O rótulo de posição vem do Wikidata numa mistura de português de Portugal e
 * inglês — "avançado", "guarda-redes", "defesa central", "wing half" — e o
 * jogo é brasileiro. Sem este mapa, quase todo jogador virava só "Jogador":
 * era o caso do goleiro do Barcelona aparecer sem posição nenhuma na dica.
 */
const POSICAO = {
  // português do Brasil
  goleiro: 'Goleiro', zagueiro: 'Zagueiro', lateral: 'Lateral',
  volante: 'Volante', 'meio-campista': 'Meio-campista', meia: 'Meia',
  'meia-atacante': 'Meia', 'meio-armador': 'Meia', ponta: 'Ponta',
  atacante: 'Atacante', centroavante: 'Centroavante', libero: 'Zagueiro',
  'lateral-direito': 'Lateral', 'lateral-esquerdo': 'Lateral',
  'ponta-direita': 'Ponta', 'ponta-esquerda': 'Ponta',

  // português de Portugal
  'guarda-redes': 'Goleiro', 'defesa central': 'Zagueiro', defesa: 'Zagueiro',
  avancado: 'Atacante', extremo: 'Ponta', trinco: 'Volante',
  'medio centro': 'Meio-campista', 'medio ofensivo': 'Meia',
  'defesa esquerdo': 'Lateral', 'defesa direito': 'Lateral',

  // inglês
  goalkeeper: 'Goleiro', defender: 'Zagueiro', 'centre-back': 'Zagueiro',
  'center-back': 'Zagueiro', centerhalf: 'Zagueiro', 'centre half': 'Zagueiro',
  sweeper: 'Zagueiro', 'full-back': 'Lateral', fullback: 'Lateral',
  'left-back': 'Lateral', 'right-back': 'Lateral', 'wing back': 'Lateral',
  midfielder: 'Meio-campista', 'wing half': 'Meio-campista',
  'defensive midfielder': 'Volante', 'holding midfielder': 'Volante',
  'attacking midfielder': 'Meia', playmaker: 'Meia',
  'central midfielder': 'Meio-campista', winger: 'Ponta',
  'left winger': 'Ponta', 'right winger': 'Ponta', 'outside left': 'Ponta',
  'outside right': 'Ponta', forward: 'Atacante', striker: 'Centroavante',
  'centre-forward': 'Centroavante', 'inside forward': 'Atacante',
  'second striker': 'Atacante',
}

/**
 * O Transfermarkt detalha a posição ("Meio-Campo - Meia Ofensivo"); o que
 * interessa é a segunda parte, que é a posição de verdade.
 */
const POSICAO_TM = {
  goleiro: 'Goleiro', zagueiro: 'Zagueiro', 'lateral direito': 'Lateral',
  'lateral esquerdo': 'Lateral', volante: 'Volante', 'meia central': 'Meio-campista',
  'meio-campo': 'Meio-campista', 'meia ofensivo': 'Meia', 'meia atacante': 'Meia',
  'ponta direita': 'Ponta', 'ponta esquerda': 'Ponta', centroavante: 'Centroavante',
  'segundo atacante': 'Atacante', ataque: 'Atacante', defesa: 'Zagueiro',
  // o site abrevia: "Defensor - Lateral Dir.", "Atacante - Seg. Atacante"
  'lateral dir.': 'Lateral', 'lateral esq.': 'Lateral',
  'seg. atacante': 'Atacante', 'meia direita': 'Ponta', 'meia esquerda': 'Ponta',
  'meia central': 'Meio-campista', defensor: 'Zagueiro',
}

/** "Lateral (futebol)" e "Avançado" chegam assim; a chave do mapa é limpa. */
function papelDe(bruto) {
  if (!bruto) return null

  // "Meio-Campo - Meia Ofensivo": o detalhe depois do traço é a posição
  const detalhe = String(bruto).split(' - ').pop().trim()
  const chaveTm = detalhe.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (POSICAO_TM[chaveTm]) return POSICAO_TM[chaveTm]

  const chave = String(bruto)
    .replace(/\s*\([^)]*\)/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
  return POSICAO[chave] ?? null
}

/** Países que não levam artigo: "em Portugal", não "no Portugal". */
const SEM_ARTIGO = new Set([
  'Portugal', 'Israel', 'Angola', 'Moçambique', 'Cuba', 'Cabo Verde', 'Andorra',
  'Malta', 'Chipre', 'Omã', 'Gana', 'Marrocos', 'Trinidad e Tobago',
])

const ondeNasceu = (pais) =>
  SEM_ARTIGO.has(pais) ? `em ${pais}` : /a$/i.test(pais) ? `na ${pais}` : `no ${pais}`

// --------------------------------------------------------------- dinheiro
/**
 * O Transfermarkt escreve valor como texto: "€ 12.00 mi.", "€ 650 mil",
 * "custo zero", "Empréstimo", "?". Só os dois primeiros viram número.
 */
export function emEuros(texto) {
  if (!texto) return null
  const m = String(texto).match(/([\d.,]+)\s*(mi|mil|bi)\b/i)
  if (!m) return null
  const n = Number(m[1].replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'))
  if (!Number.isFinite(n)) return null
  const escala = { mi: 1e6, mil: 1e3, bi: 1e9 }[m[2].toLowerCase()]
  return n * escala
}

/** "€ 12 milhões", "€ 650 mil" — arredondado, que é como se fala. */
function dinheiro(v) {
  if (v >= 1e6) {
    const mi = v / 1e6
    const n = mi >= 10 ? Math.round(mi) : Math.round(mi * 10) / 10
    return `€ ${String(n).replace('.', ',')} ${n === 1 ? 'milhão' : 'milhões'}`
  }
  return `€ ${Math.round(v / 1e3)} mil`
}

/**
 * "14/15" -> 2014. O Transfermarkt usa temporada, não ano.
 *
 * O corte entre 1900 e 2000 não pode ser um número fixo: com 50, a temporada
 * 50/51 do Pelé virava 2050; com o ano corrente mais folga, a 31/32 de
 * Domingos da Guia virava 2031. Qualquer corte fixo tem uma borda.
 *
 * A regra sem borda: um ano que ainda não chegou é do século passado. A folga
 * de três anos cobre contrato já assinado para temporada futura, que o site
 * lista.
 */
export function anoDaTemporada(t) {
  const m = String(t ?? '').match(/^(\d{2})\/(\d{2})$/)
  if (!m) return null
  const ano = 2000 + Number(m[1])
  return ano > new Date().getFullYear() + 3 ? ano - 100 : ano
}

// ------------------------------------------------------------------ fatos
/** Extrai do histórico cru os números que valem uma dica. */
export function fatosDoHistorico(transferencias = []) {
  let maiorTaxa = null
  let maiorTaxaAno = null
  let valorPico = null
  const anos = []

  for (const t of transferencias) {
    const ano = anoDaTemporada(t.season)
    if (ano) anos.push(ano)

    const taxa = emEuros(t.fee)
    if (taxa && (!maiorTaxa || taxa > maiorTaxa)) {
      maiorTaxa = taxa
      maiorTaxaAno = ano
    }
    const vm = emEuros(t.marketValue)
    if (vm && (!valorPico || vm > valorPico)) valorPico = vm
  }

  return {
    maiorTaxa, maiorTaxaAno, valorPico,
    estreia: anos.length ? Math.min(...anos) : null,
    ultimo: anos.length ? Math.max(...anos) : null,
    encerrou: transferencias.some((t) => /fim de carreira/i.test(t.to?.clubName ?? '')),
  }
}

/** "Seleção Brasileira de Futebol" -> "brasileira" */
function adjetivoDaSelecao(rotulo) {
  const m = String(rotulo ?? '').match(/Sele[çc][ãa]o\s+(.+?)(?:\s+de\s+Futebol)?$/i)
  return m ? m[1].toLowerCase() : null
}

/**
 * Os pedaços de dica que este jogador tem, do mais distintivo para o menos.
 * Cada um é uma oração que encaixa depois do sujeito.
 */
function orações({ jogosSelecao, selecao, fatos, paises }) {
  const saida = []

  if (jogosSelecao >= 1) {
    const adj = adjetivoDaSelecao(selecao)
    saida.push(
      `vestiu a camisa da seleção${adj ? ` ${adj}` : ''} ${jogosSelecao} ${jogosSelecao === 1 ? 'vez' : 'vezes'}`,
    )
  }
  if (fatos.maiorTaxa >= 500_000) {
    saida.push(
      `custou ${dinheiro(fatos.maiorTaxa)} na transferência mais cara` +
        (fatos.maiorTaxaAno ? ` (${fatos.maiorTaxaAno})` : ''),
    )
  }
  if (fatos.valorPico >= 1_000_000) {
    saida.push(`chegou a valer ${dinheiro(fatos.valorPico)}`)
  }
  if (fatos.estreia && fatos.ultimo && fatos.ultimo - fatos.estreia >= 8) {
    saida.push(
      fatos.encerrou
        ? `rodou o profissionalismo de ${fatos.estreia} a ${fatos.ultimo}`
        : `começou a rodar em ${fatos.estreia} e seguia em campo ${fatos.ultimo - fatos.estreia} anos depois`,
    )
  }
  if (paises > 2) saida.push(`defendeu clubes de ${paises} países`)

  return saida
}

/**
 * A dica final: sujeito + até dois fatos. `quantosFatos` sobe quando duas
 * dicas saem iguais e é preciso separar uma da outra.
 */
export function montarDica(dados, quantosFatos = 2) {
  const { posicao, pais, nasc } = dados
  const papel = papelDe(posicao)
  const origem = pais ? (pais === 'Brasil' ? 'brasileiro' : `nascido ${ondeNasceu(pais)}`) : null

  const sujeito = papel
    ? `${papel}${origem ? ` ${origem}` : ''}`
    : origem ? `Jogador ${origem}` : 'Jogador'

  const partes = orações(dados).slice(0, Math.max(1, quantosFatos))
  if (!partes.length) {
    const decada = nasc ? ` dos anos ${String(Math.floor(Number(nasc) / 10) * 10).slice(2)}` : ''
    return `${sujeito}${decada}.`
  }

  const corpo = partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}`
  return `${sujeito}, ${corpo}.`
}

/** O mapa conhece esta posição? Serve para o gerador avisar o que falta. */
export const papelConhecido = (bruto) => papelDe(bruto) !== null
