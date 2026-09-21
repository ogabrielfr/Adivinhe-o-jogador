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
 * A lista substitui a carreira inteira, não corrige pedaço: assim o que está
 * escrito aqui é o que o jogo mostra, sem depender de o Transfermarkt não
 * mudar de ideia.
 *
 *   'id-do-jogador': { clubes: [...], porque: 'o que as fontes dizem' }
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
}
