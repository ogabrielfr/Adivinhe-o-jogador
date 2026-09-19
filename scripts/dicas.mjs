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
const EMPRESTIMO = /empr[eé]stimo/i
const FIM_DE_EMPRESTIMO = /fim do empr[eé]stimo/i
const ANO = 365.25 * 24 * 60 * 60 * 1000

/**
 * O id do clube sai do link: /vasco-da-gama/transfers/verein/978/saison_id/2025
 * -> "978". O link inteiro não serve de chave: ele carrega a temporada, que
 * muda entre a transferência que levou o jogador ao clube e a que o tirou.
 */
const clubeDo = (href) => String(href ?? '').match(/\/verein\/(\d+)/)?.[1] ?? null

/** O id do país sai da bandeira: .../flagge/verysmall/26.png -> "26" */
const paisDaBandeira = (url) => String(url ?? '').match(/\/(\d+)\.png/)?.[1] ?? null

/**
 * Extrai do histórico cru os números que valem uma dica.
 *
 * O que entra aqui é o que o mural de escudos NÃO mostra. Quantos clubes o
 * jogador teve, quais e em que ordem já estão na tela; dizer isso de novo não
 * é dica. Tempo de casa, empréstimo e idade da mudança de país, não: são
 * forma de carreira invisível no escudo.
 */
export function fatosDoHistorico(transferencias = []) {
  let maiorTaxa = null
  let maiorTaxaAno = null
  let valorPico = null
  let emprestimos = 0
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

    // a volta do empréstimo é a mesma cessão contada de novo
    const taxaCrua = String(t.fee ?? '')
    if (EMPRESTIMO.test(taxaCrua) && !FIM_DE_EMPRESTIMO.test(taxaCrua)) emprestimos++
  }

  const encerrou = transferencias.some((t) => /fim de carreira/i.test(t.to?.clubName ?? ''))

  const linha = transferencias
    .map((t) => ({ t, quando: Date.parse(t.dateUnformatted ?? '') }))
    .filter((x) => Number.isFinite(x.quando))
    .sort((a, b) => a.quando - b.quando)

  /**
   * Tempo de casa: da transferência que levou o jogador ao clube até a que o
   * tirou de lá. O par só vale quando o destino de uma é a origem da outra —
   * sem isso, uma lacuna no histórico viraria uma década de fidelidade.
   */
  let maiorPermanencia = 0
  for (let i = 0; i < linha.length - 1; i++) {
    const chegou = clubeDo(linha[i].t.to?.href)
    if (!chegou || chegou !== clubeDo(linha[i + 1].t.from?.href)) continue
    const dentro = (linha[i + 1].quando - linha[i].quando) / ANO
    if (dentro > maiorPermanencia) maiorPermanencia = dentro
  }
  // quem ainda está em campo segue somando no clube atual
  const ultima = linha.at(-1)
  if (ultima && !encerrou && !/fim de carreira/i.test(ultima.t.to?.clubName ?? '')) {
    const ateHoje = (Date.now() - ultima.quando) / ANO
    if (ateHoje > maiorPermanencia) maiorPermanencia = ateHoje
  }

  /** O ano em que saiu pela primeira vez do país onde começou. */
  let anoDoExterior = null
  const berco = paisDaBandeira(linha[0]?.t.from?.countryFlag)
  if (berco) {
    for (const { t, quando } of linha) {
      const destino = paisDaBandeira(t.to?.countryFlag)
      if (destino && destino !== berco && !/fim de carreira/i.test(t.to?.clubName ?? '')) {
        anoDoExterior = new Date(quando).getUTCFullYear()
        break
      }
    }
  }

  return {
    maiorTaxa, maiorTaxaAno, valorPico, emprestimos, anoDoExterior,
    permanencia: Math.floor(maiorPermanencia),
    estreia: anos.length ? Math.min(...anos) : null,
    ultimo: anos.length ? Math.max(...anos) : null,
    encerrou,
  }
}

/** "Seleção Brasileira de Futebol" -> "brasileira" */
function adjetivoDaSelecao(rotulo) {
  const m = String(rotulo ?? '').match(/Sele[çc][ãa]o\s+(.+?)(?:\s+de\s+Futebol)?$/i)
  return m ? m[1].toLowerCase() : null
}

/**
 * Os pedaços de dica que este jogador tem. Cada um é uma oração que encaixa
 * depois do sujeito, com o número cru ao lado para o desempate de `escolher`.
 */
function orações({ jogosSelecao, selecao, fatos, paises, nasc }) {
  const saida = []
  const por = (tipo, valor, texto) => saida.push({ tipo, valor, texto })

  if (jogosSelecao >= 1) {
    const adj = adjetivoDaSelecao(selecao)
    por('selecao', jogosSelecao,
      `vestiu a camisa da seleção${adj ? ` ${adj}` : ''} ${jogosSelecao} ${jogosSelecao === 1 ? 'vez' : 'vezes'}`)
  }
  if (fatos.maiorTaxa >= 500_000) {
    por('taxa', fatos.maiorTaxa,
      `custou ${dinheiro(fatos.maiorTaxa)} na transferência mais cara` +
        (fatos.maiorTaxaAno ? ` (${fatos.maiorTaxaAno})` : ''))
  }
  if (fatos.emprestimos >= 3) {
    por('emprestimo', fatos.emprestimos, `saiu por empréstimo ${fatos.emprestimos} vezes`)
  }
  if (fatos.permanencia >= 6) {
    por('permanencia', fatos.permanencia, `ficou ${fatos.permanencia} anos seguidos num mesmo clube`)
  }
  if (fatos.estreia && fatos.ultimo && fatos.ultimo - fatos.estreia >= 8) {
    por('estrada', fatos.ultimo - fatos.estreia,
      fatos.encerrou
        ? `rodou o profissionalismo de ${fatos.estreia} a ${fatos.ultimo}`
        // sem "e" no meio: a frase já é ligada por "e" à outra oração
        : `já soma ${fatos.ultimo - fatos.estreia} anos de estrada desde ${fatos.estreia}`)
  }
  if (fatos.anoDoExterior && nasc) {
    const idade = fatos.anoDoExterior - Number(nasc)
    // idade fora de 15 a 40 é data errada em algum dos dois lados
    if (idade >= 15 && idade <= 40) por('exterior', -idade, `foi jogar fora do país aos ${idade} anos`)
  }
  if (paises > 2) por('paises', paises, `defendeu clubes de ${paises} países`)

  /**
   * Valor de mercado é o fato mais fraco que existe aqui: não diz nada da
   * carreira e quase todo mundo tem um. Fica como último recurso.
   */
  if (fatos.valorPico >= 1_000_000) {
    por('valor', fatos.valorPico, `chegou a valer ${dinheiro(fatos.valorPico)}`)
  }

  return saida
}

/**
 * A ordem em que os fatos entram na dica quando não há com que comparar.
 * Vale para o gerador, que monta um jogador por vez.
 */
const PESO = {
  selecao: 8, emprestimo: 7, permanencia: 6, exterior: 5,
  estrada: 4, taxa: 3, paises: 2, valor: 1,
}

/**
 * Escolhe os fatos que fazem ESTE jogador diferente dos outros.
 *
 * A ordem fixa não servia. Com ela, 237 dos 300 abriam com "custou € X na
 * transferência mais cara" e 240 citavam jogos de seleção: os fatos mudavam de
 * número mas a dica tinha sempre a mesma cara, que é a repetição de que o
 * cliente reclamou. Uma taxa de € 3 milhões é a taxa de todo mundo; 18 anos no
 * mesmo clube não é.
 *
 * `escala` traz, por tipo de fato, os valores de todos os jogadores em ordem.
 * O destaque de um número é a distância dele até a mediana do próprio tipo, de
 * 0 (é a mediana) a 1 (é o extremo). Assim o Pelé é lembrado pelos 18 anos de
 * Santos e o Fagner pelos quatro empréstimos, cada um pelo que tem de raro.
 */
function destaque(tipo, valor, escala) {
  const valores = escala?.[tipo]
  if (!valores?.length) return 0
  const abaixo = valores.filter((v) => v < valor).length
  const iguais = valores.filter((v) => v === valor).length
  const posicao = (abaixo + iguais / 2) / valores.length
  return Math.abs(posicao - 0.5) * 2
}

/**
 * A dica final: sujeito + até dois fatos. `quantosFatos` sobe quando duas
 * dicas saem iguais e é preciso separar uma da outra.
 */
export function montarDica(dados, quantosFatos = 2, escala = null) {
  const { posicao, pais, nasc } = dados
  const papel = papelDe(posicao)
  const origem = pais ? (pais === 'Brasil' ? 'brasileiro' : `nascido ${ondeNasceu(pais)}`) : null

  const sujeito = papel
    ? `${papel}${origem ? ` ${origem}` : ''}`
    : origem ? `Jogador ${origem}` : 'Jogador'

  const candidatos = orações(dados)
  const nota = (c) => (escala ? destaque(c.tipo, c.valor, escala) * 10 : 0) + PESO[c.tipo]
  const escolhidos = [...candidatos]
    .sort((a, b) => nota(b) - nota(a))
    .slice(0, Math.max(1, quantosFatos))

  // dentro da dica os fatos voltam à ordem natural: quem é, depois o resto
  escolhidos.sort((a, b) => PESO[b.tipo] - PESO[a.tipo])

  const partes = escolhidos.map((c) => c.texto)
  if (!partes.length) {
    const decada = nasc ? ` dos anos ${String(Math.floor(Number(nasc) / 10) * 10).slice(2)}` : ''
    return `${sujeito}${decada}.`
  }

  const corpo = partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}`
  return `${sujeito}, ${corpo}.`
}

/** Os valores de cada tipo de fato em toda a biblioteca, para `montarDica`. */
export function escalaDosFatos(todos) {
  const escala = {}
  for (const dados of todos) {
    for (const { tipo, valor } of orações(dados)) (escala[tipo] ??= []).push(valor)
  }
  return escala
}

/** O mapa conhece esta posição? Serve para o gerador avisar o que falta. */
export const papelConhecido = (bruto) => papelDe(bruto) !== null
