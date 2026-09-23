/**
 * Monta a dica de cada jogador.
 *
 * A versão anterior descrevia o jogador por posição, país e número de países —
 * atributos que centenas de jogadores compartilham. O resultado: 177 dos 300
 * repetiam a dica de outro, e duas partidas seguidas mostravam a frase
 * idêntica. Uma dica que serve para qualquer um não é dica.
 *
 * Aqui a dica é feita de **fatos que só aquele jogador tem**. Primeiro os que o
 * cliente pediu por nome — o gol em final, o título com ano e clube, o clube de
 * que ele foi ídolo, medido em jogos —, depois naturalidade, Copa disputada,
 * seleção, tempo de casa e, por último, dinheiro. São fatos verificáveis — vêm
 * do Transfermarkt (página de títulos, registro de partidas, histórico) e do
 * Wikidata, nunca de texto gerado.
 *
 * A dica nunca cita o nome do jogador, e só cita um clube à mostra para dizer
 * o que ele fez ali — título, jogos, tempo de casa; quem garante isso é
 * `npm run validar-dados`.
 */
import { NAO_E_CLUBE, jaAconteceu } from './transfermarkt.mjs'

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
export function papelDe(bruto) {
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
  'Malta', 'Chipre', 'Omã', 'Gana', 'Marrocos', 'Trinidad e Tobago', 'Mônaco',
  'Guadalupe', 'Serra Leoa', 'Barbados', 'Samoa',
])
/** Femininos que não terminam em "a". */
const FEMININO = /^(Sérvia e Montenegro|União Soviética|Guiné-Bissau|Guiné|Guiné Equatorial)$/

const artigo = (pais) => (FEMININO.test(pais) || /a$/i.test(pais) ? 'a' : 'o')
const ondeNasceu = (pais) => (SEM_ARTIGO.has(pais) ? `em ${pais}` : `n${artigo(pais)} ${pais}`)
const doPais = (pais) => (SEM_ARTIGO.has(pais) ? `de ${pais}` : `d${artigo(pais)} ${pais}`)

/**
 * O Transfermarkt em português escreve alguns países à moda de Portugal, e
 * guarda a URSS pela sigla.
 */
const NO_BRASIL = {
  'Mónaco': 'Mônaco', 'Polónia': 'Polônia', 'Jugoslávia (República)': 'Iugoslávia',
  'Guiné Bissau': 'Guiné-Bissau', 'Suiça': 'Suíça', URSS: 'União Soviética',
}
export const nomeDoPais = (bruto) => (bruto ? NO_BRASIL[bruto] ?? bruto : null)

/** "seleção russa"; a seleção sem adjetivo corrente vira "seleção de Sérvia e Montenegro". */
const ADJETIVO_DA_SELECAO = {
  Brasil: 'brasileira', Alemanha: 'alemã', Inglaterra: 'inglesa', Portugal: 'portuguesa',
  Espanha: 'espanhola', Itália: 'italiana', França: 'francesa', Holanda: 'holandesa',
  Escócia: 'escocesa', Turquia: 'turca', Bélgica: 'belga', Suíça: 'suíça', Bulgária: 'búlgara',
  Austrália: 'australiana', Dinamarca: 'dinamarquesa', Argentina: 'argentina', Sérvia: 'sérvia',
  Rússia: 'russa', Uruguai: 'uruguaia', 'República da Irlanda': 'irlandesa', Croácia: 'croata',
  Suécia: 'sueca', Chile: 'chilena', Colômbia: 'colombiana', 'País de Gales': 'galesa',
  Equador: 'equatoriana', México: 'mexicana', Iugoslávia: 'iugoslava', Paraguai: 'paraguaia',
  Peru: 'peruana', Venezuela: 'venezuelana', Polônia: 'polonesa', Japão: 'japonesa',
  Nigéria: 'nigeriana', Camarões: 'camaronesa', 'Costa do Marfim': 'marfinense',
  'Estados Unidos': 'americana', Grécia: 'grega', Áustria: 'austríaca', Noruega: 'norueguesa',
}
const nomeDaSelecao = (pais) =>
  ADJETIVO_DA_SELECAO[pais] ? `seleção ${ADJETIVO_DA_SELECAO[pais]}` : `seleção ${doPais(pais)}`

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
export function fatosDoHistorico(todas = []) {
  // o fim de um empréstimo em curso vem com data futura e não é fato ainda
  const transferencias = todas.filter((t) => jaAconteceu(t))
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
  /** Em qual clube foi essa permanência: id do Transfermarkt e nome dele. */
  let clubeDaPermanencia = null
  let nomeDaPermanencia = null
  for (let i = 0; i < linha.length - 1; i++) {
    const chegou = clubeDo(linha[i].t.to?.href)
    if (!chegou || chegou !== clubeDo(linha[i + 1].t.from?.href)) continue
    if (NAO_E_CLUBE.test(linha[i].t.to?.clubName ?? '')) continue
    const dentro = (linha[i + 1].quando - linha[i].quando) / ANO
    if (dentro > maiorPermanencia) {
      maiorPermanencia = dentro
      clubeDaPermanencia = chegou
      nomeDaPermanencia = linha[i].t.to?.clubName ?? null
    }
  }
  // quem ainda está em campo segue somando no clube atual
  const ultima = linha.at(-1)
  if (ultima && !encerrou && !NAO_E_CLUBE.test(ultima.t.to?.clubName ?? '')) {
    const ateHoje = (Date.now() - ultima.quando) / ANO
    if (ateHoje > maiorPermanencia) {
      maiorPermanencia = ateHoje
      clubeDaPermanencia = clubeDo(ultima.t.to?.href)
      nomeDaPermanencia = ultima.t.to?.clubName ?? null
    }
  }

  /** O ano em que saiu pela primeira vez do país onde começou. */
  let anoDoExterior = null
  const berco = paisDaBandeira(linha[0]?.t.from?.countryFlag)
  if (berco) {
    for (const { t, quando } of linha) {
      const destino = paisDaBandeira(t.to?.countryFlag)
      if (destino && destino !== berco && !NAO_E_CLUBE.test(t.to?.clubName ?? '')) {
        anoDoExterior = new Date(quando).getUTCFullYear()
        break
      }
    }
  }

  return {
    maiorTaxa, maiorTaxaAno, valorPico, emprestimos, anoDoExterior,
    permanencia: Math.floor(maiorPermanencia),
    clubeDaPermanencia,
    nomeDaPermanencia,
    /**
     * Todos os anos com transferência, do mais antigo ao mais novo. Quem
     * souber a data de nascimento usa isto para achar o começo de verdade:
     * o Transfermarkt registra mudança de categoria de base, e a primeira
     * transferência do Çalhanoğlu é de 2001, quando ele tinha sete anos.
     */
    anos: [...new Set(anos)].sort((a, b) => a - b),
    estreia: anos.length ? Math.min(...anos) : null,
    ultimo: anos.length ? Math.max(...anos) : null,
    encerrou,
  }
}

/**
 * Clube que leva artigo feminino: "na Portuguesa", não "no Portuguesa".
 *
 * A maioria é masculina ("no Santos", "no Flamengo", "no Real Madrid"), então
 * o padrão é "no" e a lista guarda as exceções. Boa parte é clube italiano,
 * que no Brasil se fala no feminino — a Roma, a Lazio, a Juventus — e o resto
 * é nome de palavra feminina, como Portuguesa e Ponte Preta. O Internacional
 * é "o Inter"; já a Inter de Milão e a Inter de Limeira são femininas.
 */
const CLUBE_FEMININO = new Set([
  'portuguesa', 'ponte preta', 'chapecoense', 'inter de limeira',
  'juventude', 'macae', 'cabofriense', 'desportiva', 'ferroviaria',
  'roma', 'lazio', 'juventus', 'fiorentina', 'sampdoria', 'atalanta',
  'udinese', 'inter de milao', 'reggina', 'reggina 1914', 'reggiana',
  'salernitana', 'cremonese', 'real sociedad', 'real sociedade',
])

/** "São Paulo" -> "no São Paulo"; "Portuguesa" -> "na Portuguesa" */
function noClube(nome) {
  const limpo = String(nome).replace(/\s*\([^)]*\)\s*$/, '').trim()
  const chave = limpo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return CLUBE_FEMININO.has(chave) ? `na ${limpo}` : `no ${limpo}`
}

/**
 * Lugares que pedem artigo: "é do Rio de Janeiro", não "é de Rio de Janeiro".
 * A maioria das cidades não pede, então a lista é curta de propósito.
 */
const COM_ARTIGO = /^(Rio de Janeiro|Porto|Recife|Cairo|Havre|Haia|Guarujá)$/i

/**
 * Grafia em português de lugar que o Transfermarkt manda em outra língua ou
 * sem acento. São os que aparecem nos perfis hoje; o resto já vem certo.
 */
const EM_PORTUGUES = {
  'Sao Paulo': 'São Paulo',
  Montevideo: 'Montevidéu',
  London: 'Londres',
  Marseille: 'Marselha',
}

/** "Araraquara (SP)" -> "de Araraquara"; "Rio de Janeiro" -> "do Rio de Janeiro" */
function deOnde(lugar) {
  // o Transfermarkt às vezes anexa a sigla do estado, que não entra na frase
  const semSigla = String(lugar).replace(/\s*\([^)]*\)\s*$/, '').trim()
  const limpo = EM_PORTUGUES[semSigla] ?? semSigla
  return COM_ARTIGO.test(limpo) ? `do ${limpo}` : `de ${limpo}`
}

// ------------------------------------------------------- títulos e finais
/**
 * O que cada título do Transfermarkt vale como dica, e como se diz.
 *
 * O cliente pediu dica que aproxime do acerto — "um título que foi decisivo".
 * A página de títulos do Transfermarkt tem cada conquista com ano e clube, mas
 * escreve à moda de Portugal ("Taça", "Supertaça") e às vezes em inglês; aqui
 * vira o que o torcedor brasileiro fala. O peso ordena: Copa do Mundo e
 * Libertadores entregam mais que estadual. Supercopa nacional, prêmio vago
 * ("Futebolista do ano") e título de base ficam de fora — não levam a ninguém.
 * A exceção é o Mundial Sub-20, que passa na TV aberta e marca geração.
 *
 * `[peso, de quem, como começa a frase]`: de quem é "selecao" (a frase não cita
 * clube), "premio" (individual) ou "clube" (cita o clube de cada conquista).
 */
const TITULOS = {
  'Campeão do Mundo': [100, 'selecao', 'campeão do mundo em'],
  "Vencedor Ballon d'Or": [96, 'premio', 'ganhou a Bola de Ouro em'],
  'Melhor jogador do mundo': [96, 'premio', 'eleito o melhor jogador do mundo em'],
  'UEFA Champions League winner': [92, 'clube', 'campeão da Champions League de'],
  'Vencedor Taça dos Campeões Europeus': [92, 'clube', 'campeão da Copa dos Campeões da Europa de'],
  'Campeão da Copa Libertadores': [92, 'clube', 'campeão da Libertadores de'],
  'Vencedor Copa América': [88, 'selecao', 'campeão da Copa América de'],
  'Campeão da Europa': [88, 'selecao', 'campeão da Eurocopa de'],
  'Vencedor olímpico': [84, 'selecao', 'campeão olímpico em'],
  'Campeão da Copa do Mundo de Clubes da FIFA': [80, 'clube', 'campeão mundial de clubes de'],
  // a Intercontinental, que a Fifa reconhece como título mundial
  'Vencedor da Taça do Mundo': [80, 'clube', 'campeão mundial de clubes de'],
  'O melhor jogador da Europa': [76, 'premio', 'eleito o melhor jogador da Europa em'],
  'Vencedor da Bota de Ouro (Europe)': [76, 'premio', 'ganhou a Chuteira de Ouro em'],
  'Vencedor da Liga Europa': [70, 'clube', 'campeão da Liga Europa de'],
  'Vencedor Uefa-Cup': [70, 'clube', 'campeão da Copa da Uefa de'],
  'Vencedor Copa Sudamericana': [68, 'clube', 'campeão da Sul-Americana de'],
  'Campeão Brasileiro': [66, 'clube', 'campeão brasileiro de'],
  // a Copa Intercontinental nova, de 2024 em diante
  'FIFA Intercontinental Cup Winner': [64, 'clube', 'campeão da Copa Intercontinental de'],
  'Campeão de Espanha': [62, 'clube', 'campeão espanhol de'],
  'Campeão de Itália': [62, 'clube', 'campeão italiano de'],
  'Campeão da Inglaterra': [62, 'clube', 'campeão inglês de'],
  'Campeão da Ásia': [60, 'selecao', 'campeão da Copa da Ásia de'],
  'Campeão da Alemanha': [60, 'clube', 'campeão alemão de'],
  // a Recopa Europeia, dos vencedores de copa
  'Vencedor da Taça Europa': [60, 'clube', 'campeão da Recopa Europeia de'],
  'Campeão de França': [58, 'clube', 'campeão francês de'],
  'Campeão da Copa do Brasil': [58, 'clube', 'campeão da Copa do Brasil de'],
  'Campeão de Portugal': [56, 'clube', 'campeão português de'],
  'Campeão da Argentina': [56, 'clube', 'campeão argentino de'],
  'Campeón Liga Profesional': [56, 'clube', 'campeão argentino de'],
  'Vencedor Gold Cup': [56, 'selecao', 'campeão da Copa Ouro de'],
  'Vencedor Confederations-Cup': [55, 'selecao', 'campeão da Copa das Confederações de'],
  'Campeão dos Países Baixos': [54, 'clube', 'campeão holandês de'],
  'Vencedor UEFA Nations League': [52, 'selecao', 'campeão da Liga das Nações de'],
  'Winner Copa Mercosur': [52, 'clube', 'campeão da Copa Mercosul de'],
  'Golden Boy': [50, 'premio', 'ganhou o Golden Boy em'],
  'Campeão do Uruguai': [50, 'clube', 'campeão uruguaio de'],
  'Campeão da Copa CONMEBOL': [50, 'clube', 'campeão da Copa Conmebol de'],
  'Supercopa Sudamericana winner': [50, 'clube', 'campeão da Supercopa Libertadores de'],
  'Conference League winner': [50, 'clube', 'campeão da Conference League de'],
  'Vencedor dos jogos pan-americanos': [50, 'selecao', 'campeão pan-americano em'],
  'Vencedor AFC Champions-League': [48, 'clube', 'campeão da Champions da Ásia de'],
  'Vencedor da Taça de Espanha': [48, 'clube', 'campeão da Copa do Rei de'],
  'Vencedor da Taça de Inglaterra': [48, 'clube', 'campeão da Copa da Inglaterra de'],
  'Campeão da Turquia': [48, 'clube', 'campeão turco de'],
  'Campeão da Rússia': [48, 'clube', 'campeão russo de'],
  'Vencedor da Taça de Itália': [46, 'clube', 'campeão da Copa da Itália de'],
  'Campeão da Ucrânia': [46, 'clube', 'campeão ucraniano de'],
  'Campeão da Escócia': [46, 'clube', 'campeão escocês de'],
  'Vencedor Recopa Sudamericana': [44, 'clube', 'campeão da Recopa Sul-Americana de'],
  'Vencedor Uefa-Supercup': [44, 'clube', 'campeão da Supercopa da Uefa de'],
  'Vencedor da Taça da Alemanha': [44, 'clube', 'campeão da Copa da Alemanha de'],
  'Campeão da Grécia': [44, 'clube', 'campeão grego de'],
  'Campeão da Bélgica': [44, 'clube', 'campeão belga de'],
  'Campeão do Japão': [44, 'clube', 'campeão japonês de'],
  'Campeão da Colômbia': [44, 'clube', 'campeão colombiano de'],
  'Campeão do Chile': [44, 'clube', 'campeão chileno de'],
  'Mexican Champion Apertura': [44, 'clube', 'campeão mexicano de'],
  'Campeão do México Clausura': [44, 'clube', 'campeão mexicano de'],
  'MLS Cup Champion': [44, 'clube', 'campeão da MLS de'],
  'Vencedor da Taça de França': [42, 'clube', 'campeão da Copa da França de'],
  'Vencedor da Taça de Portugal': [42, 'clube', 'campeão da Taça de Portugal de'],
  'Campeão do Equador': [42, 'clube', 'campeão equatoriano de'],
  'Campeão da China': [42, 'clube', 'campeão chinês de'],
  'Vencedor da Taça dos Países Baixos': [40, 'clube', 'campeão da Copa da Holanda de'],
  'Argentinian Cup Winner': [40, 'clube', 'campeão da Copa Argentina de'],
  'Campeão da Arábia Saudita': [40, 'clube', 'campeão saudita de'],
  'Campeão da Suíça': [40, 'clube', 'campeão suíço de'],
  'Campeão da Croácia': [40, 'clube', 'campeão croata de'],
  'Campeão da Sérvia': [40, 'clube', 'campeão sérvio de'],
  'Campeão da Áustria': [40, 'clube', 'campeão austríaco de'],
  'Vencedor da Taça da Liga de Inglaterra': [38, 'clube', 'campeão da Copa da Liga Inglesa de'],
  'Campeão da Polónia': [38, 'clube', 'campeão polonês de'],
  'Campeão da Suécia': [38, 'clube', 'campeão sueco de'],
  'Campeão do Catar': [38, 'clube', 'campeão catariano de'],
  'Campeão Paulista': [36, 'clube', 'campeão paulista de'],
  'Campeão Carioca': [36, 'clube', 'campeão carioca de'],
  'Campeão Gaúcho': [36, 'clube', 'campeão gaúcho de'],
  'Campeão Mineiro': [36, 'clube', 'campeão mineiro de'],
  'Vencedor da Taça da Turquia': [36, 'clube', 'campeão da Copa da Turquia de'],
  'Vencedor da Taça da Escócia': [36, 'clube', 'campeão da Copa da Escócia de'],
  'Campeão do Campeonato Brasileiro Série B': [34, 'clube', 'campeão da Série B de'],
  'Campeão da Copa do Nordeste': [34, 'clube', 'campeão da Copa do Nordeste de'],
  'Campeão do Mundo Sub20': [30, 'selecao', 'campeão mundial sub-20 em'],
  'Italienischer Zweitligameister': [28, 'clube', 'campeão da Série B italiana de'],
  'English 2nd tier champion': [28, 'clube', 'campeão da segunda divisão inglesa de'],
}

/**
 * O torneio de cada título, no mesmo nome que `FINAIS` dá à final dele: com a
 * final daquele ano na dica, o título do mesmo torneio e ano repete a
 * história ("marcou 2 gols na final da Copa de 2002. Campeão do mundo em
 * 2002"), mas o de outro torneio no mesmo ano, não — o Leonardo marcou na
 * final da Recopa de 1994 e foi campeão do mundo naquele ano.
 */
const EVENTO_DO_TITULO = {
  'Campeão do Mundo': 'copa',
  'UEFA Champions League winner': 'champions',
  'Vencedor Taça dos Campeões Europeus': 'champions',
  'Campeão da Copa Libertadores': 'libertadores',
  'Vencedor Copa América': 'america',
  'Campeão da Europa': 'euro',
  'Campeão da Copa do Mundo de Clubes da FIFA': 'mundial',
  'Vencedor da Taça do Mundo': 'mundial',
  'Vencedor olímpico': 'olimpiada',
  'Vencedor da Liga Europa': 'liga-europa',
  'Vencedor Uefa-Cup': 'copa-uefa',
  'Vencedor Copa Sudamericana': 'sul-americana',
  'FIFA Intercontinental Cup Winner': 'intercontinental',
  'Campeão da Copa do Brasil': 'copa-do-brasil',
  'Vencedor Confederations-Cup': 'confederacoes',
  'Vencedor da Taça Europa': 'recopa-europeia',
  'Vencedor da Taça de Espanha': 'copa-do-rei',
  'Vencedor da Taça de Inglaterra': 'copa-inglaterra',
  'Vencedor da Taça de Itália': 'copa-italia',
  'Vencedor da Taça da Alemanha': 'copa-alemanha',
  'Vencedor da Taça de França': 'copa-franca',
  'Vencedor da Taça de Portugal': 'taca-portugal',
  'Vencedor Recopa Sudamericana': 'recopa',
  'Campeão Paulista': 'estadual-paulista',
  'Campeão Carioca': 'estadual-carioca',
  'Campeão Gaúcho': 'estadual-gaúcho',
  'Campeão Mineiro': 'estadual-mineiro',
  'Campeão do Mundo Sub20': 'sub-20',
}

/**
 * Título de um jogo só — Mundial, Intercontinental, Supercopa da Uefa — o
 * Transfermarkt data sem critério na página de títulos: o Mundial de dezembro
 * de 2007 do Milan está como 2007 no perfil do Emerson e como 2008 no do Kaká,
 * e o Messi aparece com os de 2010, 2012 e 2016, que são os de 2009, 2011 e
 * 2015. O ano certo sai da final, que tem data: a conquista vale com o ano da
 * final que ele jogou e não perdeu, desde que seja o ano do site ou o anterior.
 * Sem essa final, fica de fora da dica — melhor calar que errar o ano.
 *
 * A Intercontinental antiga, que acabou em 2004, confere com a história em
 * toda a biblioteca, e boa parte é de antes do registro de partidas (o Santos
 * do Pelé): vale como está. O que o site chama pelo mesmo nome depois de 2004
 * é a Copa Intercontinental nova, e vai para o título dela.
 */
const TITULO_DE_FINAL = {
  'Campeão da Copa do Mundo de Clubes da FIFA': ['KLUB'],
  'Vencedor da Taça do Mundo': ['WEPO', 'FIC1'],
  'FIFA Intercontinental Cup Winner': ['FIC1'],
  'Vencedor Uefa-Supercup': ['USC'],
}
const FIM_DA_INTERCONTINENTAL = 2004

/**
 * Os títulos com o ano conferido. `titulos` é o da página do Transfermarkt
 * (`clubeTm` em cada conquista) e `finais` o do registro de partidas, ainda
 * com o id da competição.
 */
export function titulosConferidos(titulos, finais) {
  const saida = new Map()
  const juntar = (titulo, conquista) => {
    const lista = saida.get(titulo) ?? saida.set(titulo, []).get(titulo)
    if (!lista.some((q) => q.ano === conquista.ano && q.clubeTm === conquista.clubeTm)) lista.push(conquista)
  }
  for (const t of titulos ?? []) {
    const competicoes = TITULO_DE_FINAL[t.titulo]
    if (!competicoes) {
      for (const q of t.conquistas) juntar(t.titulo, q)
      continue
    }
    const usadas = new Set()
    for (const q of [...t.conquistas].sort((a, b) => a.ano - b.ano)) {
      if (t.titulo === 'Vencedor da Taça do Mundo' && q.ano <= FIM_DA_INTERCONTINENTAL) {
        juntar(t.titulo, q)
        continue
      }
      const [final] = (finais ?? [])
        .filter((f) => competicoes.includes(f.competicao) && !usadas.has(f) &&
          String(f.clubeTm) === String(q.clubeTm) && f.saldo >= 0 &&
          (f.ano === q.ano || f.ano === q.ano - 1))
        .sort((a, b) => a.ano - b.ano)
      if (!final) continue
      usadas.add(final)
      juntar(final.competicao === 'FIC1' ? 'FIFA Intercontinental Cup Winner' : t.titulo, { ...q, ano: final.ano })
    }
  }
  return [...saida].map(([titulo, conquistas]) => ({ titulo, conquistas }))
}

/**
 * O ano que dá nome à edição. A Eurocopa de 2020 foi jogada em 2021 e manteve
 * o nome; o Transfermarkt a data pelo ano do jogo, e "campeão da Eurocopa de
 * 2021" não é como ninguém a chama. A Copa América de 2021, ao contrário,
 * mudou de nome junto com a data, e a Olimpíada de Tóquio se diz pelo ano.
 */
export const anoDaEdicao = (evento, ano) => (evento === 'euro' && ano === 2021 ? 2020 : ano)

/** "2013"; "2020 e 2021"; "1994, 2002 e 2006" */
const anosPorExtenso = (anos) =>
  anos.length > 1 ? `${anos.slice(0, -1).join(', ')} e ${anos.at(-1)}` : String(anos[0])

/** "Atlético-MG" -> "pelo Atlético-MG"; "Roma" -> "pela Roma" */
function peloClube(nome) {
  return noClube(nome).replace(/^no /, 'pelo ').replace(/^na /, 'pela ')
}

/**
 * O título que mais entrega, como frase: "campeão da Libertadores de 2013
 * pelo Atlético-MG e de 2020 e 2021 pelo Palmeiras".
 *
 * `titulos` vem do Transfermarkt com o clube de cada conquista já no nome que
 * o jogo mostra (ou `null` quando é seleção ou clube fora do catálogo).
 */
function fatoDeTitulo(titulos) {
  const conhecidos = (titulos ?? [])
    .filter((t) => TITULOS[t.titulo] && t.conquistas?.some((c) => c.ano))
    .map((t) => ({ ...t, peso: TITULOS[t.titulo][0], quem: TITULOS[t.titulo][1], abre: TITULOS[t.titulo][2] }))
    // o mais importante; empate, o que ele ganhou mais vezes
    .sort((a, b) => b.peso - a.peso || b.conquistas.length - a.conquistas.length)
  // o que não dá para dizer direito cede a vez ao título seguinte
  for (const titulo of conhecidos) {
    const texto = frasesDoTitulo(titulo)
    if (!texto) continue
    const evento = EVENTO_DO_TITULO[titulo.titulo] ?? null
    const anos = titulo.conquistas.map((c) => anoDaEdicao(evento, c.ano)).filter(Boolean)
    return {
      peso: titulo.peso, texto, anos, evento,
      // a Copa ganha, para a Copa disputada não repetir o ano
      copas: titulo.titulo === 'Campeão do Mundo' ? anos : [],
    }
  }
  return null
}

function frasesDoTitulo(melhor) {
  const evento = EVENTO_DO_TITULO[melhor.titulo]
  const conquistas = melhor.conquistas
    .filter((c) => c.ano)
    .map((c) => ({ ...c, ano: anoDaEdicao(evento, c.ano) }))
    .sort((a, b) => a.ano - b.ano)
  if (melhor.quem !== 'clube') return `${melhor.abre} ${anosPorExtenso([...new Set(conquistas.map((c) => c.ano))])}`

  // título de clube sem o nome do clube não se diz direito
  if (conquistas.some((c) => !c.clube)) return null
  const porClube = []
  for (const c of conquistas) {
    const grupo = porClube.find((g) => g.clube === c.clube)
    if (grupo) grupo.anos.push(c.ano)
    else porClube.push({ clube: c.clube, anos: [c.ano] })
  }
  const semConector = melhor.abre.replace(/ (de|em)$/, '')
  // cinco brasileiros pelo mesmo clube: o número diz mais que a lista de anos
  if (porClube.length === 1 && conquistas.length > 3) {
    return `${semConector} ${conquistas.length} vezes ${peloClube(porClube[0].clube)}`
  }
  // campeão por quatro clubes: a lista cansaria, e o número já é o fato
  if (porClube.length > 3) return `${semConector} por ${porClube.length} clubes diferentes`
  // "de 2013 pelo Atlético-MG, de 2016 pelo Palmeiras e de 2020 pelo Flamengo"
  const conector = melhor.abre.split(' ').at(-1)
  const partes = porClube.map((g, i) =>
    `${i ? `${conector} ` : ''}${anosPorExtenso(g.anos)} ${peloClube(g.clube)}`)
  const lista = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}` : partes[0]
  return `${melhor.abre} ${lista}`
}

/**
 * As finais que contam como dica, com o peso e o nome que o torcedor fala. O
 * registro do Transfermarkt marca final de tudo — supercopa, sub-20, copa da
 * liga cipriota — e "marcou na final da Supercopa da Turquia" não aproxima
 * ninguém do acerto. Fica só o que o torcedor brasileiro reconhece.
 */
const FINAIS = [
  [/^Copa do Mundo$/, 98, 'da Copa do Mundo', 'copa'],
  [/^(Liga dos Campeões|Taça dos Campeões Europeus)$/, 94, 'da Champions League', 'champions'],
  [/^Copa Libertadores$/, 94, 'da Libertadores', 'libertadores'],
  [/^Copa América/, 88, 'da Copa América', 'america'],
  [/^Eurocopa$/, 88, 'da Eurocopa', 'euro'],
  // a Intercontinental antiga, que a Fifa reconhece como título mundial
  [/^(Mundial de Clubes|Copa Intercontinental)$/, 82, 'do Mundial de Clubes', 'mundial'],
  [/^Jogos Olímpicos$/, 80, 'dos Jogos Olímpicos', 'olimpiada'],
  [/^Liga Europa$/, 70, 'da Liga Europa', 'liga-europa'],
  [/^Copa UEFA/, 70, 'da Copa da Uefa', 'copa-uefa'],
  [/^Copa Sul-Americana$/, 70, 'da Sul-Americana', 'sul-americana'],
  [/^Copa Intercontinental da FIFA$/, 64, 'da Copa Intercontinental', 'intercontinental'],
  [/^Copa do Brasil$/, 64, 'da Copa do Brasil', 'copa-do-brasil'],
  [/^Copa das Confederações$/, 62, 'da Copa das Confederações', 'confederacoes'],
  [/^Taça Europeia dos Clubes Vencedores de Taças/, 60, 'da Recopa Europeia', 'recopa-europeia'],
  [/^Copa do Rei$/, 55, 'da Copa do Rei', 'copa-do-rei'],
  [/^Copa da Inglaterra$/, 55, 'da Copa da Inglaterra', 'copa-inglaterra'],
  [/^Copa da Itália$/, 55, 'da Copa da Itália', 'copa-italia'],
  [/^Copa da Alemanha$/, 55, 'da Copa da Alemanha', 'copa-alemanha'],
  [/^Copa da França$/, 50, 'da Copa da França', 'copa-franca'],
  [/^Taça de Portugal$/, 50, 'da Taça de Portugal', 'taca-portugal'],
  [/^Recopa Sul-Americana$/, 44, 'da Recopa Sul-Americana', 'recopa'],
  /**
   * Estadual só com a final do campeonato. O "Campeonato Carioca" do site
   * marca como final a da Taça Guanabara, que é de turno: o Vinícius Júnior
   * sairia como autor de gol na final do Carioca de 2018, que o Flamengo nem
   * disputou. Do Rio vale só a "Fase Final"; dos outros, também o nome puro,
   * que é o campeonato sem turno.
   */
  [/^Campeonato Carioca - Fase Final$/, 45, null, 'estadual'],
  [/^Campeonato (Paulista|Mineiro|Gaúcho|Baiano|Paranaense|Pernambucano|Cearense)(( - Série A1)? - Fase [Ff]inal| - Final)?$/, 45, null, 'estadual'],
  [/^Mundial Sub-20$/, 40, 'do Mundial Sub-20', 'sub-20'],
]

/**
 * A final em que ele marcou, a mais importante: "marcou 2 gols na final da
 * Copa do Mundo de 2002". É o gol decisivo que o cliente pediu, em dado —
 * o registro de partidas do Transfermarkt marca a final e guarda os gols.
 */
function fatoDeFinal(finais) {
  const achadas = []
  for (const f of finais ?? []) {
    if (!(f.gols > 0) || !f.competicao || !f.ano) continue
    const regra = FINAIS.find(([padrao]) => padrao.test(f.competicao))
    if (!regra) continue
    const [, peso, nome, evento] = regra
    // estadual decidido em janeiro ou fevereiro é final de turno, não do campeonato
    if (!nome && /-0[12]-/.test(f.data ?? '')) continue
    // estadual: "do Campeonato Paulista", sem a divisão nem a fase
    const campeonato = f.competicao.replace(/ - .*$/, '')
    const ano = anoDaEdicao(evento, f.ano)
    achadas.push({
      peso,
      texto: `marcou${f.gols > 1 ? ` ${f.gols} gols` : ''} na final ${nome ?? `do ${campeonato}`} de ${ano}`,
      gols: f.gols,
      venceu: f.saldo > 0,
      // "estadual-paulista", para casar com o título de campeão paulista
      evento: evento === 'estadual' ? `estadual-${campeonato.split(' ').at(-1).toLowerCase()}` : evento,
      ano,
    })
  }
  if (!achadas.length) return null
  /**
   * A mais importante; no empate, a de mais gols — os três do Mbappé na final
   * de 2022 valem mais que o gol do título de 2018 —, e aí a que ele ganhou:
   * o Havertz decidiu a Champions de 2021.
   */
  const [melhor] = achadas.sort((a, b) => b.peso - a.peso || b.gols - a.gols || b.venceu - a.venceu)
  return {
    peso: melhor.peso, texto: melhor.texto, evento: melhor.evento, ano: melhor.ano,
    copas: melhor.evento === 'copa' ? [melhor.ano] : [],
  }
}

/**
 * O número por baixo: "mais de 750". O registro do Transfermarkt só conta a
 * partida com escalação no site, então o número dele é sempre menor ou igual
 * ao de verdade — o Pelé aparece com 18 jogos pelo Santos. Dito como "mais
 * de", arredondado para baixo, a frase é sempre verdadeira.
 */
const maisDe = (n) => `mais de ${n >= 100 ? Math.floor(n / 50) * 50 : Math.floor(n / 10) * 10}`

/**
 * O clube de que ele foi ídolo, medido em jogos: "fez mais de 400 jogos pelo
 * Grêmio". O cliente pediu o número de partidas por clube "quando muito
 * relevante" — daí o piso de 150. Gols entram junto a partir de 50.
 */
function fatoDeIdolo(idolo) {
  if (!idolo?.clube || idolo.jogos < 150) return null
  const gols = idolo.gols >= 50 ? ` e ${maisDe(idolo.gols)} gols` : ''
  return { valor: idolo.jogos, texto: `fez ${maisDe(idolo.jogos)} jogos${gols} ${peloClube(idolo.clube)}` }
}

/**
 * "disputou a Copa do Mundo de 1994"; "disputou também as Copas do Mundo de
 * 1990 e 1998" quando a frase vizinha já contou a Copa que ele ganhou.
 */
function textoDaCopa(anos, tambem = false) {
  const lista = anos.length > 3
    // quatro Copas já é o fato; listar os anos só alonga a frase
    ? `${anos.length} Copas do Mundo`
    : anos.length > 1 ? `as Copas do Mundo de ${anosPorExtenso(anos)}` : `a Copa do Mundo de ${anos[0]}`
  return `disputou ${tambem ? 'também ' : ''}${lista}`
}

/**
 * Os pedaços de dica que este jogador tem. Cada um é uma oração que encaixa
 * depois do sujeito, com o número cru ao lado para o desempate de `escolher`.
 */
function orações({
  jogosSelecao, selecao, pais, fatos, paises, nasc, naturalidade, torneios, clubeDaCasa,
  historicoSuspeito, titulos, finais, idolo,
}) {
  const saida = []
  const por = (tipo, valor, texto, extra = {}) => saida.push({ tipo, valor, texto, ...extra })

  // o que mais aproxima do acerto: a final em que marcou, o título, o clube de que foi ídolo
  const final = fatoDeFinal(finais)
  if (final) por('final', final.peso, final.texto, { copas: final.copas, evento: final.evento, ano: final.ano })
  const titulo = fatoDeTitulo(titulos)
  if (titulo) por('titulo', titulo.peso, titulo.texto, { copas: titulo.copas, evento: titulo.evento, anos: titulo.anos })
  const casa = fatoDeIdolo(idolo)
  if (casa) por('idolo', casa.valor, casa.texto)

  /**
   * Naturalidade é o fato mais específico que existe para quem tem carreira
   * magra. O Ademilson não tem jogo de seleção nem torneio, e sobravam dois
   * números de dinheiro; "é de Cubatão" localiza a pessoa. O valor é 1 porque
   * não há escala — ou tem ou não tem —, e o peso alto põe na frente.
   */
  if (naturalidade) por('naturalidade', 1, `é ${deOnde(naturalidade)}`)

  /**
   * A Copa que ele ganhou não entra como Copa disputada: o título diz mais, e
   * "disputou a Copa do Mundo de 2014" do Höwedes, que a ganhou jogando todos
   * os minutos, dizia menos do que é.
   */
  const ganhas = new Set((titulos ?? []).find((t) => t.titulo === 'Campeão do Mundo')?.conquistas.map((c) => c.ano) ?? [])
  const copas = torneios?.copas ?? []
  const disputadas = copas.filter((a) => !ganhas.has(a))
  if (disputadas.length) {
    por('copa', disputadas.length, textoDaCopa(disputadas), { anos: disputadas })
  } else if (copas.length) {
    // ganhou todas as que disputou: o título já conta
  } else {
    // sem Copa, o torneio menor ainda situa no tempo
    const outro = torneios?.demais?.[0]
    if (outro) por('torneio', 1, `disputou a ${outro.nome} de ${outro.ano}`)
  }

  // a seleção de outro país já está na primeira dica; aqui repetiria o time e só somaria o número
  if (jogosSelecao >= 1 && !(selecao && pais && selecao !== pais)) {
    por('selecao', jogosSelecao,
      `vestiu a camisa da ${selecao ? nomeDaSelecao(selecao) : 'seleção'} ${jogosSelecao} ${jogosSelecao === 1 ? 'vez' : 'vezes'}`)
  }
  if (fatos.maiorTaxa >= 500_000) {
    por('taxa', fatos.maiorTaxa,
      `custou ${dinheiro(fatos.maiorTaxa)} na transferência mais cara` +
        (fatos.maiorTaxaAno ? ` (${fatos.maiorTaxaAno})` : ''))
  }
  /**
   * Quando a carreira veio corrigida à mão, a linha do tempo do Transfermarkt
   * é a que foi rejeitada — e tudo que se calcula dela vai junto. O Fabão
   * ganhava "ficou 6 anos seguidos no Comercial-SP", que é justamente o vão
   * aberto pela transferência falsa que tiramos. Sobram os fatos que não
   * dependem de data: naturalidade, seleção, torneio e valor.
   */
  if (!historicoSuspeito) {
  if (fatos.emprestimos >= 3) {
    por('emprestimo', fatos.emprestimos, `saiu por empréstimo ${fatos.emprestimos} vezes`)
  }
  /**
   * Nomear o clube foi pedido do cliente: "ficou 6 anos seguidos num mesmo
   * clube" não diz nada que o mural já não diga, enquanto "ficou 6 anos
   * seguidos no São Paulo" diz QUAL dos escudos foi a casa dele — e isso o
   * mural não mostra. Como o clube é sempre um dos que estão à mostra, citar
   * não entrega nada de graça.
   */
  if (fatos.permanencia >= 6) {
    por('permanencia', fatos.permanencia,
      clubeDaCasa
        ? `ficou ${fatos.permanencia} anos seguidos ${noClube(clubeDaCasa)}`
        : `ficou ${fatos.permanencia} anos seguidos num mesmo clube`)
  }
  /**
   * O começo da carreira conta dos 15 anos para cima. Sem esse corte a dica
   * do Çalhanoğlu dizia "20 anos de estrada desde 2001", ano em que ele tinha
   * sete: a primeira transferência dele no Transfermarkt é de categoria de
   * base. Sem data de nascimento não dá para corrigir, e aí vale o que tem.
   */
  const comecou = nasc
    ? (fatos.anos ?? []).find((a) => a - Number(nasc) >= 15) ?? null
    : fatos.estreia
  // quem segue jogando soma até este ano, não até a última transferência
  const ate = fatos.encerrou ? fatos.ultimo : new Date().getFullYear()
  if (comecou && ate && ate - comecou >= 8) {
    por('estrada', ate - comecou,
      fatos.encerrou
        ? `rodou o profissionalismo de ${comecou} a ${ate}`
        : `já soma ${ate - comecou} anos de estrada desde ${comecou}`)
  }
  if (fatos.anoDoExterior && nasc) {
    const idade = fatos.anoDoExterior - Number(nasc)
    // idade fora de 15 a 40 é data errada em algum dos dois lados
    if (idade >= 15 && idade <= 40) por('exterior', -idade, `foi jogar fora do país aos ${idade} anos`)
  }
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
  final: 30, titulo: 24, idolo: 18,
  copa: 12, naturalidade: 11, selecao: 8, torneio: 7.5, emprestimo: 7,
  permanencia: 6, exterior: 5, estrada: 4, taxa: 3, paises: 2, valor: 1,
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
 * As duas dicas do jogador.
 *
 * O cliente escolheu o modelo de duas: **a primeira situa, a segunda
 * entrega**, e quem joga decide até onde quer ajuda. Isso muda o que cada uma
 * precisa fazer.
 *
 * A primeira é de propósito pobre — posição, país e ano de nascimento. Não
 * identifica ninguém sozinha; serve para quem olhou o mural e não faz ideia
 * de que década está vendo.
 *
 * A segunda é a que tem que resolver. Leva os dois fatos mais raros do
 * jogador e nenhuma apresentação: quem pediu a segunda já leu a primeira.
 */
export function montarDicas(dados, escala = null, evitar = null) {
  return [primeiraDica(dados), segundaDica(dados, escala, evitar)]
}

/**
 * Posição, país e ano: o mínimo para situar sem entregar.
 *
 * O país é o de nascimento, não a nacionalidade. Usar a nacionalidade pôs o
 * Mário Fernandes, de São Caetano do Sul, como "nascido na Rússia" — na mesma
 * partida em que a segunda dica dizia de onde ele é. Quando a seleção que o
 * jogador defendeu é de outro país, isso entra: "brasileiro que defendeu a
 * seleção russa" situa muito mais que qualquer um dos dois fatos sozinho.
 */
function primeiraDica({ posicao, pais, nasc, selecao }) {
  const papel = papelDe(posicao)
  const origem = pais ? (pais === 'Brasil' ? 'brasileiro' : `nascido ${ondeNasceu(pais)}`) : null
  const sujeito = papel
    ? `${papel}${origem ? ` ${origem}` : ''}`
    : origem ? `Jogador ${origem}` : 'Jogador'

  // "nascido na Escócia nascido em 1951" teria dois "nascido"; com o país
  // dentro da mesma oração sai "nascido na Escócia em 1951"
  const frase = !nasc ? sujeito
    : origem && origem.startsWith('nascido') ? `${sujeito} em ${nasc}`
    : `${sujeito} nascido em ${nasc}`
  const outraSelecao = selecao && pais && selecao !== pais
  return outraSelecao ? `${frase}, que defendeu a ${nomeDaSelecao(selecao)}.` : `${frase}.`
}

/**
 * Dois fatos, sem apresentação: os que mais aproximam do acerto.
 *
 * O cliente pediu fato específico — o gol decisivo, o título, o ídolo de um
 * time — no lugar do genérico, e é nessa ordem que eles entram: final em que
 * marcou, título, jogos pelo clube de que foi ídolo. A naturalidade vem logo
 * depois: para quem não tem nada disso, "é de Cubatão" ainda localiza, e foi
 * o que resolveu o Ademilson. Número de seleção, empréstimo e dinheiro ficam
 * para quem não tem nada acima.
 */
function segundaDica(dados, escala, evitar) {
  const candidatos = orações(dados)
  if (!candidatos.length) return 'Não temos outro fato desse jogador.'

  const nota = (c) => (escala ? destaque(c.tipo, c.valor, escala) * 10 : 0) + PESO[c.tipo]
  /**
   * A final e o título do mesmo torneio e ano contam a mesma história:
   * "marcou 3 gols na final da Copa de 2022. Campeão do mundo em 2022" gasta a
   * segunda frase. Com a final escolhida, o título que não diz mais nada cede a
   * vaga ao fato seguinte; o que traz outro ano fica ("campeão do mundo em
   * 1994 e 2002", ao lado da final de 2002).
   */
  const final = candidatos.find((c) => c.tipo === 'final')
  const mesmaHistoria = (c) => c.tipo === 'titulo' && final && c.evento === final.evento &&
    c.anos.every((a) => a === final.ano)
  const ordenados = [...candidatos]
    .filter((c) => !mesmaHistoria(c))
    .sort((a, b) => nota(b) - nota(a))

  /**
   * Os dois melhores, em ordem de preferência. Quando a frase já é a de outro
   * jogador (`evitar`), troca o segundo fato, depois o primeiro: o Ademir e o
   * Zizinho ganharam a mesma Copa América e jogaram a mesma Copa, e dica que
   * serve para dois não é dica.
   */
  let primeira = null
  for (let i = 0; i < ordenados.length; i++) {
    for (let k = i + 1; k <= ordenados.length; k++) {
      const texto = frase([ordenados[i], ordenados[k]].filter(Boolean))
      if (!texto) continue
      primeira ??= texto
      if (!evitar?.has(texto)) return texto
    }
  }
  return primeira ?? 'Não temos outro fato desse jogador.'
}

/**
 * Cada fato vira uma frase sua. Ligados por "e" saía "Disputou as Copas de
 * 1974, 1978 e 1982 e vestiu a camisa...", com dois "e" disputando o mesmo
 * lugar; separados, cada um se lê inteiro. A ordem é a de `PESO`.
 *
 * A Copa disputada não repete a que a outra frase já contou: "Campeão do
 * mundo em 1994. Disputou a Copa do Mundo de 1994" dizia a mesma coisa duas
 * vezes. Sobra a Copa que ele não ganhou, com "também"; se não sobra nenhuma,
 * o par não serve.
 */
function frase(par) {
  const ditas = new Set(par.flatMap((c) => c.copas ?? []))
  const fatos = []
  for (const c of par) {
    if (c.tipo === 'copa' && ditas.size) {
      const resto = c.anos.filter((a) => !ditas.has(a))
      if (!resto.length) return null
      fatos.push({ ...c, texto: textoDaCopa(resto, true) })
    } else {
      fatos.push(c)
    }
  }
  return fatos
    .sort((a, b) => PESO[b.tipo] - PESO[a.tipo])
    .map((c) => `${c.texto.charAt(0).toUpperCase()}${c.texto.slice(1)}.`)
    .join(' ')
}

/** Os fatos da segunda dica, com a nota de cada um: para conferir por que um jogador saiu como saiu. */
export function candidatosDaSegunda(dados, escala) {
  return orações(dados).map((c) => ({
    tipo: c.tipo, nota: Math.round(((escala ? destaque(c.tipo, c.valor, escala) * 10 : 0) + PESO[c.tipo]) * 10) / 10, texto: c.texto,
  })).sort((a, b) => b.nota - a.nota)
}

/** Os valores de cada tipo de fato em toda a biblioteca, para a segunda dica. */
export function escalaDosFatos(todos) {
  const escala = {}
  for (const dados of todos) {
    for (const { tipo, valor } of orações(dados)) (escala[tipo] ??= []).push(valor)
  }
  return escala
}

/**
 * A naturalidade não pode entregar nem clube visível nem o próprio nome.
 *
 * "É de Santos" com o escudo do Santos à mostra é repetição, não dica. E o
 * Alexandre Pato nasceu em **Pato Branco**: a dica entregava metade do nome
 * dele. Os dois casos o `validar-dados` recusa, e é melhor não produzir.
 */
export function naturalidadeSegura(naturalidade, nomesDeClube = [], nomeDoJogador = '') {
  if (!naturalidade) return null
  const simples = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const limpa = simples(naturalidade)

  for (const nome of nomesDeClube) {
    const c = simples(nome)
    if (c.includes(limpa) || limpa.includes(c)) return null
  }
  // pedaço de nome com mais de três letras dentro do lugar já entrega
  for (const parte of simples(nomeDoJogador).split(/\s+/)) {
    if (parte.length > 3 && limpa.includes(parte)) return null
  }
  return naturalidade
}

/** O mapa conhece esta posição? Serve para o gerador avisar o que falta. */
export const papelConhecido = (bruto) => papelDe(bruto) !== null
