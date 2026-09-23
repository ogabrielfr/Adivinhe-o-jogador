/**
 * Carreira corrigida à mão, que vence o Transfermarkt.
 *
 * As carreiras saem do Transfermarkt, que é a fonte mais completa das três —
 * e erra. O cliente jogou o difícil do dia e viu: o Fabão aparecia com uma
 * passagem pelo Inter de Lages que **nenhuma outra fonte tem**, e sem os dois
 * clubes em que ele de fato terminou.
 *
 * `npm run verificar` compara cada carreira com Wikidata, infobox da
 * Wikipédia e Transfermarkt, e conta quantas fontes confirmam cada clube. O
 * que aparece só no Transfermarkt, e ainda por cima com um vão de anos no
 * meio, é candidato a erro deles. Quando duas fontes concordam contra a
 * terceira, escreva aqui.
 *
 * Duas formas:
 *
 *   'id-do-jogador': { clubes: [...], porque: 'o que as fontes dizem' }
 *   'id-do-jogador': { sem: ['id-do-clube'], porque: '...' }
 *
 * `clubes` substitui a carreira inteira: o que está escrito aqui é o que o
 * jogo mostra, sem depender de o Transfermarkt não mudar de ideia. Serve
 * quando o Transfermarkt erra a carreira.
 *
 * `sem` tira clubes da carreira que o Transfermarkt dá, e o resto continua
 * vindo de lá. Serve para a passagem que existiu mas não conta: o cliente
 * pediu carreira só de jogo profissional, e o histórico de transferências
 * lista também o clube que só teve o jogador na base ou emprestou sem ele
 * jogar.
 */
export const CARREIRA_FIXA = {
  /**
   * O Transfermarkt lista Comercial-SP (11/12) -> Inter de Lages (17/18) ->
   * fim de carreira, com seis anos de buraco no meio. Wikidata e a infobox da
   * Wikipédia não têm Inter de Lages em lugar nenhum, e as duas continuam a
   * carreira por outro caminho: Sobradinho em 2013, e a Wikipédia ainda
   * acrescenta o Goianésia em 2014, onde ele parou.
   */
  fabao: {
    clubes: [
      'bahia', 'flamengo', 'real-betis', 'cordoba', 'goias', 'sao-paulo',
      'kashima-antlers', 'santos', 'guarani-futebol-clube',
      'henan-songshan-longmen-football-club', 'comercial-futebol-clube-ribeirao-preto',
      'sobradinho-esporte-clube', 'goianesia-esporte-clube',
    ],
    porque: 'Inter de Lages só o Transfermarkt tem; Sobradinho e Goianésia vêm do Wikidata e da Wikipédia',
  },

  /**
   * Clube de base que o Transfermarkt lista como passagem. O filtro de idade
   * pega quem saiu antes dos 17; estes saíram com 17 a 21, idade em que no
   * Brasil ainda se joga na base. A Wikipédia em inglês separa base de
   * profissional no quadro de carreira e põe estes clubes na base, e o
   * registro de partidas do Transfermarkt não tem jogo nenhum deles lá.
   */
  'thiago-motta': { sem: ['clube-atletico-juventus'], porque: 'base do Juventus-SP até ir para o Barcelona, aos 17' },
  'mario-fernandes': { sem: ['associacao-desportiva-sao-caetano'], porque: 'base do São Caetano de 2006 a 2009' },
  elano: { sem: ['associacao-atletica-internacional-limeira'], porque: 'base da Inter de Limeira em 2000; estreou no Santos' },
  'allan-marques-loureiro': { sem: ['madureira-esporte-clube'], porque: 'base do Madureira; estreou no Vasco' },
  'gabriel-paulista': { sem: ['clube-atletico-taboao-da-serra'], porque: 'base do Taboão da Serra; estreou no Vitória' },
  'sonny-anderson': { sem: ['esporte-clube-xv-de-novembro-jau'], porque: 'base do XV de Jaú; estreou no Vasco' },
  'fabricio-de-souza': { sem: ['uniao-sao-joao-esporte-clube'], porque: 'base do União São João; estreou no Corinthians' },
  ronaldao: { sem: ['rio-preto-esporte-clube'], porque: 'base do Rio Preto; estreou no São Paulo' },
  /**
   * Clube-ponte: o Paulínia tinha os direitos, e ele jogava na base do
   * Fluminense até ser vendido ao Rio Ave. Nenhuma fonte tem jogo dele lá.
   */
  fabinho: { sem: ['paulinia-futebol-clube'], porque: 'clube-ponte; a base foi no Fluminense' },
  /**
   * Cedido ao Cumbernauld United, time júnior escocês, aos 16, quando já era do
   * Celtic. O Transfermarkt lista como transferência, e o clube não está no
   * catálogo — a carreira travava e ficava com o escudo do United FC, dos
   * Emirados, que era o homônimo que o nome casava.
   */
  'kenny-dalglish': { clubes: ['celtic-football-club', 'liverpool'], porque: 'Cumbernauld United foi empréstimo de base' },
  /**
   * Assinou com o Ravenna, da quarta divisão italiana, aos 46 anos, e não
   * entrou em campo. O cliente pediu carreira só de jogo profissional.
   */
  'ronaldinho-gaucho': { sem: ['ravenna-calcio'], porque: 'contrato com o Ravenna em 2026, sem jogo' },
}

/**
 * A carreira com a correção à mão aplicada, ou null quando não há correção.
 * Tirar um clube pode deixar duas passagens seguidas no mesmo lugar (ida e
 * volta de um empréstimo que não conta), e elas viram uma.
 */
export function carreiraCorrigida(id, clubes) {
  const c = CARREIRA_FIXA[id]
  if (!c) return null
  if (c.clubes) return c.clubes
  const sem = new Set(c.sem ?? [])
  return clubes.filter((x) => !sem.has(x)).filter((x, i, a) => x !== a[i - 1])
}
